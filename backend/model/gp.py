import gpytorch
import numpy as np
import torch


class GaussianProcess(gpytorch.models.ExactGP):
    def __init__(self, train_x, train_y, likelihood, params, kernel_name):
        super(GaussianProcess, self).__init__(train_x, train_y, likelihood)
        self.train_x = train_x
        self.train_y = train_y
        self.mean_module = gpytorch.means.ConstantMean()
        self.covar_module = self.parse_kernel(kernel_name, params)
        
    def parse_kernel(self, kernel_name, params):
        self.kernel_name = kernel_name
        if kernel_name == 'spectral_mixture_kernel':
            n_mixtures = params.get('n_mixtures')
            covar_module = gpytorch.kernels.ScaleKernel(
                gpytorch.kernels.SpectralMixtureKernel(
                    num_mixtures=n_mixtures))
            covar_module.initialize_from_data(self.train_x, self.train_y)
        elif kernel_name == 'periodic_kernel':
            covar_module = gpytorch.kernels.ScaleKernel(
                gpytorch.kernels.PeriodicKernel())
            lengthscale = params.get('lengthscale')
            amplitude = params.get('amplitude')
            period = params.get('period')
            covar_module.base_kernel.lengthscale = lengthscale
            covar_module.base_kernel.period_length = period
            covar_module.outputscale = amplitude

        elif kernel_name == 'exponentiated_quadratic_kernel':
            covar_module = gpytorch.kernels.ScaleKernel(
                gpytorch.kernels.RBFKernel())
            lengthscale = params.get('lengthscale')
            amplitude = params.get('amplitude')
            covar_module.base_kernel.lengthscale = lengthscale
            covar_module.outputscale = amplitude
        elif kernel_name == 'rational_quadratic_kernel':
            alpha = params.get('alpha')
            covar_module = gpytorch.kernels.ScaleKernel(
                gpytorch.kernels.RQKernel(alpha_constraint=alpha))
            lengthscale = params.get('lengthscale')
            amplitude = params.get('amplitude')
            covar_module.base_kernel.lengthscale = lengthscale
            covar_module.outputscale = amplitude
        else:
            return None
        
        return covar_module
    
    def forward(self, x):
        mean_x = self.mean_module(x)
        covar_x = self.covar_module(x)
        return gpytorch.distributions.MultivariateNormal(
            mean_x, covar_x)

    def retrieve_trained_params(self):

        params = {}
        
        if self.kernel_name == 'spectral_mixture_kernel':
            params['lengthscale'] = self.covar_module.base_kernel.lengthscale

        elif self.kernel_name == 'periodic_kernel':
            params['lengthscale'] = self.covar_module.base_kernel.lengthscale
            params['outputscale'] = self.covar_module.outputscale
            params['period_length'] = self.covar_module.base_kernel.period_length 

        elif self.kernel_name == 'exponentiated_quadratic_kernel':
            params['lengthscale'] = self.covar_module.base_kernel.lengthscale
            params['outputscale'] = self.covar_module.outputscale

        elif self.kernel_name == 'rational_quadratic_kernel':
            params['lengthscale'] = self.covar_module.base_kernel.lengthscale
            params['outputscale'] = self.covar_module.outputscale

        else:
            return None

        return params
        
        
class GPSoundGenerator:
    def __init__(self, sample_rate=50000):
        self.sample_rate = sample_rate
        self.liklelihood = gpytorch.likelihoods.GaussianLikelihood() 

        self.train_x = np.array([])
        self.train_y = np.array([])

    def update_train_data(self, train_x, train_y, params, kernel_name, 
                          n_datapoints):
        self.train_x = torch.from_numpy(
            np.array(train_x, dtype=np.float32).reshape(-1, 1))
        self.train_y = torch.from_numpy(
            np.array(train_y, dtype=np.float32))
        self.model = GaussianProcess(
            self.train_x, self.train_y, self.liklelihood, params, kernel_name)
        self.sample_rate = n_datapoints

    # Train GP model to find right hyperparameter
    def fit(self, train_iter=50, lr=0.1, verbose=0, update_every=5):

        # Set model to train mode
        self.model.train()
        self.liklelihood.train()
        
        # Adam Optimizer
        optimizer = torch.optim.Adam(self.model.parameters(), lr)
        # Loss function
        mll = gpytorch.mlls.ExactMarginalLogLikelihood(
            self.liklelihood, self.model)

        for i in range(train_iter):
            
            optimizer.zero_grad()
            output = self.model(self.train_x)
            loss = -mll(output, self.train_y)
            loss.backward()

            if verbose != 0:
                print(f'Iter{(i+1)}/{train_iter} - Loss: {loss.item()}')
                
            optimizer.step()

        return self.model.retrieve_trained_params()

    def sample_from_posterior(self, test_x_range):
        # Set to eval mode
        self.model.eval()
        self.liklelihood.eval()
        
        start, end = test_x_range
        x_range = (end - start)
        
        test_x = torch.linspace(start, end, self.sample_rate * x_range)

        with torch.no_grad(), gpytorch.settings.fast_pred_var():
            f_preds = self.liklelihood(self.model(test_x))
            f_samples = f_preds.sample().numpy()

        return f_samples

import numpy as np
import tensorflow as tf
from gpflow import kernels, optimizers
from gpflow.config import default_float as floatx
from gpflow_sampling.models import PathwiseGPR
from gpflow_sampling.sampling.updates import cg as cg_update


class GPSoundGenerator:
    def __init__(self, sample_rate=44000):
        self.sample_rate = sample_rate
        
        self.train_x = np.array([])
        self.train_y = np.array([])
        self.model = None

    def update_train_data(self, train_x, train_y, params, kernel_name,
                          sample_rate):
        self.train_x = train_x.reshape(-1, 1)
        self.train_y = train_y.reshape(-1, 1)
        self.sample_rate = sample_rate
        
        #kernel = self.get_kernel(kernel_name, params)
        self.kernel_name = 'exponentiated_quadratic_kernel' 
        kernel = kernels.SquaredExponential()         

        self.model = PathwiseGPR(
            data=(self.train_x, self.train_y),
            kernel=kernel,
            noise_variance=2e-6
            )

        paths = self.model.generate_paths(num_samples=1, num_bases=512)
        print(paths)
        self.model.set_paths(paths)

    def fit(self, train_iter=50, lr=0.1, verbose=0):
        # train model to return optimal parameters
        opt = optimizers.Scipy()
        opt_logs = opt.minimize(
            self.model.training_loss, self.model.trainable_variables, 
            options=dict(maxiter=train_iter))

        return self.get_hyperparameters()
 
    def sample_from_posterior(self, timeframe):
        # timeframe: the duration of the generated sound in seconds
        
        test_x = np.linspace(
            0, timeframe, num=timeframe * self.sample_rate)[:, None]

        with self.model.temporary_paths(
            num_samples=1, num_bases=512, update_rule=cg_update):
            f_plot = tf.squeeze(self.model.predict_f_samples(test_x))

            return f_plot.numpy()

    def get_kernel(self, kernel_name, params):
        
        self.kernel_name = kernel_name
        
        lengthscale = params.get('lengthscale')
        variance = params.get('amplitude')

        if kernel_name == 'spectral_mixture_kernel':
            n_mixtures = params.get('n_mixtures')
            #TODO: implement spectral mixture kernel
            covariance = kernels.Matern52(variance=variance,
                                          lengthscales=lengthscale)
        elif kernel_name == 'periodic_kernel':
            period = params.get('period')
            base_kernel = kernels.SquaredExponential(variance=variance,
                                                     lengthscales=lengthscale)
            covariance = kernels.Periodic(base_kernel=base_kernel,
                                          period=period)
        elif kernel_name == 'exponentiated_quadratic_kernel':
            covariance = kernels.SquaredExponential(variance=variance,
                                                    lengthscales=lengthscale)
        elif kernel_name == 'rational_quadratic_kernel':
            alpha = params.get('alpha')
            covariance = kernels.RationalQuadratic(variance=variance,
                                                   lengthscales=lengthscale,
                                                   alpha=alpha)
        else:
            print("Such kernel does not exist. Please double check.")
            return None

        return covariance

    def get_hyperparameters(self):
        hyperparameters = []

        if self.kernel_name == 'spectral_mixture_kernel':
            hyperparameters.append(
                {'name': 'lengthscale',
                 'value': self.model.kernel.lengthscales.numpy().item()})

        elif self.kernel_name == 'periodic_kernel':
            hyperparameters.append(
                {'name': 'lengthscale',
                 'value': self.model.kernel.lengthscales.numpy().item()})
            hyperparameters.append(
                {'name': 'amplitude',
                 'value': self.model.kernel.variance.numpy().item()})
            hyperparameters.append(
                {'name': 'period',
                 'value': self.model.kernel.variance.numpy().item()})
        elif self.kernel_name == 'exponentiated_quadratic_kernel':
            hyperparameters.append(
                {'name': 'lengthscale',
                 'value': self.model.kernel.lengthscales.numpy().item()})
            hyperparameters.append(
                {'name': 'amplitude',
                 'value': self.model.kernel.variance.numpy().item()})
        elif self.kernel_name == 'rational_quadratic_kernel':
            hyperparameters.append(
                {'name': 'lengthscale',
                 'value': self.model.kernel.lengthscales.numpy().item()})
            hyperparameters.append(
                {'name': 'amplitude',
                 'value': self.model.kernel.variance.numpy().item()})
            hyperparameters.append(
                {'name': 'alpha',
                 'value': self.model.kernel.alpha.numpy().item()})
        else:
            return None 

        return hyperparameters

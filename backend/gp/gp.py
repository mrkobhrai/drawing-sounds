import numpy as np

from kernels import negative_exponential_kernel


class GaussianProcess:
    def __init__(self, x_range: tuple[float, float], n_datapoints: int,
                 kernel: function=negative_exponential_kernel):
        self.x_range = x_range        
        self.n_datapoints = n_datapoints
        self.kernel = kernel
        self.get_test_points()
        
        self.X = []
        self.Y = []

    def get_test_points(self):
        self.X_test = \
            np.linspace(self.x_range[0], self.x_range[1], self.n_datapoints) 

    def add_data(self, x, y):
        assert x not in self.X and y not in self.Y
        self.X.append(x)
        self.Y.append(y)
        # Recalculate gaussian distribution
        self.gaussian_dist()

    def delete_data(self, x, y):
        assert x in self.X and y in self.Y

        self.X.remove(x)
        self.Y.remove(y)
        # Recalculate gaussian distribution
        self.gaussian_dist()

    def N(self):
        return len(self.X)

    def update_n_datapoints(self, n_datapoints):
        self.n_datapoints = n_datapoints
        self.get_test_points()
    
    def gaussian_dist(self):

        s = 0.00005 # noise
        K = self.kernel(self.X, self.X)
        L = np.linalg.cholesky(K + s * np.eye(self.N))

        # Compute the mean
        self.Lk = np.linalg.solve(L, self.kernel(self.X, self.X_test))
        self.mu = np.dot(self.Lk.T, np.linalg.solve(L, self.Y))

        # compute the variance at our test points
        self.K_ = self.kernel(self.X_test, self.X_test)
        s2 = np.diag(self.K_) - np.sum(self.Lk**2, axis=0)
        self.sigma = np.sqrt(s2)

    def sample_from_prior(self, n_samples=1):
        L = np.linalg.cholesky(self.K_ + 1e-6 * np.eye(self.n_datapoints))
        f_prior = np.dot(
            L, np.random.normal(size=(self.n_datapoints, n_samples)))

        return f_prior

    def sample_from_posterior(self, n_samples=1):
        L = np.linalg.cholesky(
            self.K_ + 1e-6*np.eye(self.n_datapoints) - np.dot(
                self.Lk.T, self.Lk))

        f_posterior = self.mu.reshape(-1, 1) + np.dot(
            L, np.random.normal(size=(self.n_datapoints, n_samples)))

        return f_posterior
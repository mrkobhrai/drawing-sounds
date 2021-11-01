from typing import Callable

import numpy as np

from .kernels import exponentiated_quadratic_kernel, periodic_kernel

class GaussianProcess:
    def __init__(self, x_range, n_datapoints, kernel=periodic_kernel):
        self.x_range = x_range        
        self.n_datapoints = n_datapoints
        self.kernel = kernel
        self.get_test_points()

        self.xs = np.array([])
        self.ys = np.array([])

    def get_test_points(self):
        self.xs_test = np.linspace(
            self.x_range[0], self.x_range[1], self.n_datapoints).reshape(-1, 1)

    def update_data(self, xs, ys):
        self.xs = np.array(xs).reshape(-1, 1)
        self.ys = np.array(ys)
        self.N = len(self.xs)
        self.gaussian_dist()

    def update_n_datapoints(self, n_datapoints):
        self.n_datapoints = n_datapoints
        self.get_test_points()
    
    def gaussian_dist(self):

        s = 0.00005 # noise
        K = self.kernel(self.xs, self.xs)
        L = np.linalg.cholesky(K + s * np.eye(self.N))

        # Compute the mean
        self.Lk = np.linalg.solve(L, self.kernel(self.xs, self.xs_test))
        self.mu = np.dot(self.Lk.T, np.linalg.solve(L, self.ys))

        # compute the variance at our test points
        self.K_ = self.kernel(self.xs_test, self.xs_test)
        s2 = np.diag(self.K_) - np.sum(self.Lk**2, axis=0)
        self.sigma = np.sqrt(s2)

    def sample_from_prior(self, n_samples=1):
        L = np.linalg.cholesky(self.K_ + 1e-6 * np.eye(self.n_datapoints))
        f_prior = np.dot(
            L, np.random.normal(size=(self.n_datapoints, n_samples))).reshape(-1)

        return f_prior

    def sample_from_posterior(self, n_samples=1):
        L = np.linalg.cholesky(
            self.K_ + 1e-6*np.eye(self.n_datapoints) - np.dot(
                self.Lk.T, self.Lk))

        f_posterior = self.mu.reshape(-1, 1) + np.dot(
            L, np.random.normal(size=(self.n_datapoints, n_samples)))

        return f_posterior

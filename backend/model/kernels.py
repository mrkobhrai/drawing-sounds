import numpy as np


def exponentiated_quadratic_kernel(a, b, lengthscale=1., amplitude=1.):
    
    sqdist = np.sum(a**2, 1).reshape(-1, 1) + \
        np.sum(b**2, 1) - 2 * np.dot(a, b.T)
    return (amplitude ** 2) * np.exp(-.5 * (1 / lengthscale) * sqdist)


def rational_quadratic_kernel(a, b, lengthscale=1., alpha=1., amplitude=1.):
    sqdist = np.sum(a**2, 1).reshape(-1, 1) + \
        np.sum(b**2, 1) - 2 * np.dot(a, b.T)
    
    dist = np.float_power(
        1. + (1 / (2 * alpha * (lengthscale ** 2))) * sqdist, -alpha)
    
    return (amplitude ** 2) * dist


def periodic_kernel(a, b, lengthscale=0.1, period=0.1, amplitude=1.):
    a = a.reshape(-1)
    b = b.reshape(-1)
    dist = np.array([[np.pi * np.abs(a_i - b_j) / period for b_j in b] for a_i in a])

    return (amplitude ** 2) * np.exp(
        (-2 / (lengthscale**2)) * (np.sin(dist) ** 2))


def local_periodic_kernel(a, b, periodic_lengthscale=1., period=1., 
                          local_lengthscale=1., amplitude=1.):
    periodic = periodic_kernel(a, b, periodic_lengthscale, period, amplitude)
    local = exponentiated_quadratic_kernel(a, b, local_lengthscale, amplitude)

    return periodic * local


def spectral_mixture_kernel(a, b, l=0.1):
    pass
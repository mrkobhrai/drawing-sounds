import numpy as np


def negative_exponential_kernel(a, b, l=0.1):
    
    sqdist = np.sum(a**2, 1).reshape(-1, 1) + \
        np.sum(b**2, 1) - 2 * np.dot(a, b.T)
    return np.exp(-.5 * (1 / l) * sqdist)
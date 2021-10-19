import numpy as np
import pytest

from gp.gp import GaussianProcess
from gp.kernels import negative_exponential_kernel




@pytest.mark.parametrize("seed", [10, 20, 30])
def test_negative_exponential_kernel(seed):
    np.random.seed(seed)

    kernel = negative_exponential_kernel

    # dummy data
    x = np.random.rand(10)
    
    assert np.isclose(kernel(x, x), 1.0)


def test_initialize_gp():
    gp = GaussianProcess((0, 5), 1000)
    assert len(gp.X) == 0
    assert len(gp.Y) == 0


def test_add_data():
    gp = GaussianProcess((0, 5), 1000)
    gp.add_data(0, 1)
    assert len(gp.X) == 1
    assert len(gp.Y) == 1

    gp.add_data(1, 2)
    assert len(gp.X) == 2
    assert len(gp.Y) == 2


def test_delete_data():
    gp = GaussianProcess((0, 5), 1000)
    gp.add_data(0, 1)
    assert len(gp.X) == 1
    assert len(gp.Y) == 1

    gp.delete_data(0, 1)
    assert len(gp.X) == 0
    assert len(gp.Y) == 0
    

def test_gaussian_process():
    gp = GaussianProcess((0, 5), 1000)
    gp.add_data(0, 1)
    gp.add_data(1, 2)
    gp.add_data(2, 5.5)

    assert gp.mu == 0
    assert gp.Lk == 0
    assert gp.K_ == 0
    assert gp.sigma == 0

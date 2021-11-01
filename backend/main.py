from flask import Flask, request

from model import GaussianProcess, periodic_kernel
from flask_cors import CORS


app = Flask(__name__)
cors = CORS(app, resources={r"/": {"origins": "http://localhost:3000"}})
# TODO: Change the constant args to a modifiable parameter.
gaussian_process = GaussianProcess(x_range=(0, 5), n_datapoints=1000)


@app.route('/', methods=['POST'])
def generate_handler():
    # Process input points
    request_body = request.get_json()
    points = request_body['points']
    points = [(point[0], point[1]) for point in points]
    xs, ys = map(list, zip(*points))

    print(gaussian_process.kernel)

    # Perform Gaussian process
    gaussian_process.update_data(xs, ys)
    points_gp = gaussian_process.sample_from_posterior()

    # Process input
    response = {}
    response["samples"] = [points_gp.tolist()]
    return response


if __name__ == '__main__':
    app.run()

"""
REQ format: array of (array of [x, y] points)
{
   "points": [
      [1, 2],
      [3, 4]
   ]
}

RES format: array of [y-points] for each sample
{
   "samples": [
      [1, 2, 3, 4, 5, 6],
      [2, 3, 4, 5, 6, 7]
   ]
}
"""

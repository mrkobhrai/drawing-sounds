from flask import Flask, request

from model import GaussianProcess, parse_kernel
from flask_cors import CORS
from flask_sock import Sock
import json

app = Flask(__name__)
sock = Sock(app)
cors = CORS(app, resources={r"/": {"origins": "http://localhost:3000"}})
# TODO: Change the constant args to a modifiable parameter.
gaussian_process = GaussianProcess(x_range=(0, 5), n_datapoints=1000)

def handleRequest(request_body):
      points = request_body['points']
      points = [(point[0], point[1]) for point in points]
      xs, ys = map(list, zip(*points))

      # # Set kernel and its parameters
      kernel_name = request_body['kernel']
      if kernel_name is None:
         kernel_name = 'periodic_kernel'
      params = request_body
      kernel = parse_kernel(kernel_name, params)
      gaussian_process.kernel = kernel
      # # Perform Gaussian process
      gaussian_process.update_data(xs, ys)
      points_gp = gaussian_process.sample_from_posterior()
      return points_gp.tolist()

@sock.route('/gaussian')
def socket_handler(ws):
   while True:
      raw_data = ws.receive()
      request_body = json.loads(raw_data)
      data = handleRequest(request_body)
      data_json = json.dumps(data)
      ws.send(data_json)    

@app.route('/', methods=['POST'])
def generate_handler():
    request_body = request.get_json()
    data = handleRequest(request_body)
    # Process input
    response = {}
    response["samples"] = [data]
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

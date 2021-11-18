from flask import Flask, request
import gpytorch

from model import GaussianProcess, GPSoundGenerator
from flask_cors import CORS
from flask_sock import Sock
import json

app = Flask(__name__)
sock = Sock(app)
cors = CORS(app, resources={r"/": {"origins": "http://localhost:3000"}})


sound_generator = GPSoundGenerator(sample_rate=1000)


def handleRequest(request_body, n_datapoints=1000):
    points = request_body['points']
    points = [(point[0], point[1]) for point in points]
    xs, ys = map(list, zip(*points))

    # Set kernel and its parameters
    kernel_name = request_body['kernel']
    if kernel_name is None:
        kernel_name = 'exponentiated_quadratic_kernel'
    params = request_body
    sound_generator.update_train_data(xs, ys, params, kernel_name, n_datapoints)

    if request_body['optimiseParams']:
       trained_params = sound_generator.fit()    
    else:
       trained_params = None
    
    points_gp = sound_generator.sample_from_posterior((0, 5))
    print(points_gp)
    print(trained_params)

    response = {}
    response["data"] = points_gp.tolist()
    response["params"] = trained_params

    return response


@sock.route('/gaussian')
def socket_handler(ws):
   while True:
      raw_data = ws.receive()
      request_body = json.loads(raw_data)

      response = handleRequest(request_body, 200)
      data_json = json.dumps(response)
      ws.send(data_json)    
      response = handleRequest(request_body, 2000)
      data_json = json.dumps(response)
      ws.send(data_json) 
      

@app.route('/', methods=['POST'])
def generate_handler():
    request_body = request.get_json()
    data, updated_params = handleRequest(request_body)
    # Process input
    response = {}
    response["data"] =[data]
    response["params"] = updated_params

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

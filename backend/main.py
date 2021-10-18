from flask import Flask, request
app = Flask(__name__)

@app.route('/', methods=['POST'])
def generate_handler():
   request_body = request.get_json()
   points = request_body['points']
   
   # TODO: Add implementation for Gaussian process
   points = [[1, 2], [3, 4], [5, 6]]
   
   # Only extract y values from the result.
   sample = [point[1] for point in points]

   response = {}
   response["samples"] = [sample]
   return response


if __name__ == '__main__':
   app.run() 

"""
REQ format
{
   "points": [
      [1, 2],
      [3, 4]
   ]
}

RES format
{
   "samples": [
      [1, 2, 3, 4, 5, 6],
      [2, 3, 4, 5, 6, 7]
   ]
}
"""
#!/bin/bash

source sound/bin/activate
export FLASK_APP=main.py
export FLASK_ENV=development
python -m flask run --port=5000
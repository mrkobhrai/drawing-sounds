#!/bin/sh

sh -c "cd backend; ./venv.sh; ./run.sh" & sh -c "cd frontend; yarn install; yarn start" ; fg

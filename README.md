# VIP/DECO Spark Dashboard Backend

Hello world.

## Getting Started
- Make sure you have a working internet connection and [Docker >= v23.0.5](https://docs.docker.com/get-docker) installed. Also check to see whether you need `sudo` permissions to run Docker commands on your system. If so, you will need to add `sudo` at the beginning of each `docker` command listed below, or login as a superuser first before running them.
- Pull the python image with pymongo package installed by using `docker pull fvmutlu/python:mongo`. Retag this image as just `python:mongo` by running `docker image tag fvmutlu/python:mongo python:mongo`.
- Navigate to the root folder of your local copy of this repository (e.g. `cd /path/to/spark-dash`) then run `docker compose up -d`. On the first run, this will pull the `mongo:5` image.
- Make sure all the healthchecks pass and your containers are running.
- Run the following command: `docker exec -it mongo1 /bin/bash /scripts/rs-init.sh`. Make sure the command has run successfully by observing an output that states `{ ok : 1}` at the end. This will initialize the MongoDB instances and set them up in a replica set of two containers.
- Run the following command `docker exec -it loader python /scripts/mongo-load.py`. This will insert some data from the mock dataset into the MongoDB instances.
- You should now be ready to run queries against the MongoDB instance running in the `mongo1` container. Alternatively you should be able to run them against the `mongo2` container as well, assuming the replica set was successfully initialized. The ideal way to run queries would be to use the `loader` container or another python container on the same docker network `spark-net` and use the `pymongo` API.

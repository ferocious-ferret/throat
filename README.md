# Throat

https://phuks.co/

A phoxy link and discussion aggregator with snek (python3)

## Dependencies:

 - A database server, MySQL, MariaDB and Postres have been tested. Sqlite should work for messing locally
 - Redis
 - Python >= 3.7
 - A recent node/npm
 - libmagic and gobject

## Setup:

We recommend using a virtualenv or Pyenv

1. Install Python dependencies with `pip install -r requirements.txt`
2. Install Node dependencies with `npm install`
3. Build the bundles with `npm run build`
4. Copy `example.config.yml` to `config.yml` and edit it
5. Set up the database by executing `./scripts/migrate.py`

And you're done! You can run a test server by executing `./throat.py`. For production instances we recommend setting up `gunicorn`

## Develop on Docker
If you prefer to develop on docker
 - The provided Docker resources only support Postgres
 - You still must copy `example.config.yaml` to `config.yaml` and make any changes you want
 - In addition, configs are overridden by environment variables set in docker-compose.yml
   which reference the redis and postgres services created by docker-compose.

`make up` will bring the containerized site up and mount your current working directory
inside the container for dev. `make down` will spin down the containerized services.

## Chat

If you have any questions, you can reach us on #throat:phuks.co on [Matrix](https://chat.phoxy.win/#/login)

---

You can manage default subs by using 

 - $ ./scripts/defaults.py

To add/remove administrators use

 - $ ./scripts/admins.py

# topcon

Todo List microservice API


# Setup

Copy the `.env.example` file to create `.env`. Fill it out with the required values.

Example `.env`:  
```
HTTP_PORT=9000
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=postgres
```


# Run

Start Docker cluster:

```bash
docker-compose up
```


# Script

We include an example of using a script to access the API.

```bash
yarn ts-node scripts/get-todo-all.ts
```


# Test

Run one test:

```bash
yarn test --grep "Hello World"

yarn test --grep "should create, retrieve, update, and delete a todo item"
```

Run all tests:

```bash
yarn test
```


# Notes

* Logging is on a per-file basis. A logger is created within a file and adds the filepath at the end of every logged line.

* This microservice is written in Typescript and runs on NodeJS.

* We use a PostgreSQL database and the Sequelize ORM.

* We use Docker Compose to set up a `db` container and an `api` container in a bridge network.

* There is a Request middleware that logs each request and response.

* We use the Controller pattern. The TodoController handles all the requests for the `todo` items.

* This project uses the AGPL-3.0 license.

* Endpoints always return an object with an `error` key (which is null if the request is successful), so that a client can easily check for an error before doing anything else.

* We use `nodemon` for speed of development.

* Restarting the app will wipe the database. This is due to the use of `sequelize.sync({force:true})`.

# Courses-service

## Run

`docker compose up` install dependencies, run the API and the database

## See database content

mysql -u root -p

USE courses_db;

SHOW TABLES;

SELECT * FROM Course;

## Explanation

When using docker `compose up --build` it builds the image of the container of the app, and the volume for the database. If we use `docker compose down` the containers will be stopped but the database will remain in memory, on the other hand, if we use `docker compose down -v` the containers and the volumes will be deleted (including the db volume).

## Using prisma studio with docker

Run in terminal:
`docker exec -it cursos-app sh`

`npx prisma studio --hostname 0.0.0.0 --port 5555`

Open in a browser:
`localhost:5555`
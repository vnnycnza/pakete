# pakete
A package directory application

## Application
The app has two components:
- fetcher
- api

## Fetcher
This component resides in `fetcher` folder. This is a collection of scripts intented to be run in order.
```
npm run fetcher
```
- [Specs](doc/fetcher.md)

## API
This component resides in `api` folder. By default, the server runs at `http://localhost:3001/`
```
npm start
```
- [API Doc](doc/api.md)

## Database

### Schema
- [Database Schema](doc/schema.png)

#### Create database
- Creates database based on config (`knexfile.js`)
```
npm run db:init
```

#### Run Migrations
- Creates tables in database
- Ensure that db is already created to avoid errors
```
npm run db:migrate
```

#### Run Rollback
- Drop tables in database
- Ensure that db is already created to avoid errors
```
npm run db:rollback
```

## Running the application

### Prerequisites
- MySQL v5.7
- Node.js v12.15

### Configuration

| key                        | description                        | default                |
| ---------------------------| -----------------------------------| -----------------------|
| DB_HOST                    | Database Host                      | `localhost`            |
| DB_USER                    | Database User                      | `pakete`               |
| DB_PW                      | Database Password                  | `pakete`               |
| DB_NAME                    | Database Name                      | `pakete`               |
| CRAN_PACKAGE_LIST_MAX      | Number of packages to retrieve     | 50                     |
| NODE_ENV                   | Node Environment                   | `development`          |
| URL                        | Server URL                         | `http://localhost:3001`|
| PORT                       | Server Port                        | `3001`                 |

### Running on your local
- Ensure prerequisites are installed
- Create database user
```
CREATE USER 'pakete'@'localhost' IDENTIFIED BY 'pakete';
GRANT ALL PRIVILEGES ON *.* TO 'pakete'@'localhost';
```
- Run initializing db
```
npm run db:init
```
- Run fetcher
```
npm run fetch
```
- Run server
```
npm start
``` 
- Can also run tests
```
npm test
npm run test:integration
```

### Running using Docker
- Build and start service. This will start mysql & api server.
```
docker-compose up --build -d
```
- Run fetcher
```
docker-compose run --rm app npm run fetch
```
- Can also run tests
```
docker-compose run --rm --no-deps app npm test
```
- Can also run mini integration test, but add grants to `pakete_test` table
```
docker exec -it <mysql container id> mysql -uroot
> GRANT ALL PRIVILEGES ON *.* TO 'pakete'@'%';
> exit
```
```
docker-compose run --rm app npm run test:integration
```


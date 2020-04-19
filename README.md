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
npm run server
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
- MySQL
- Node.js

### Configuration
Update `.env` file to overwrite defaults

| key                        | description                        | default                |
| ---------------------------| -----------------------------------| -----------------------|
| DB_HOST                    | Database Host                      | `localhost`            |
| DB_USER                    | Database User                      | `root`                 |
| DB_PW                      | Database Password                  | -                      |
| DB_NAME                    | Database Name                      | `pakete`               |
| CRAN_PACKAGE_DOWNLOAD_URL  | Cran Server url                    | `http://cran.....`     |
| CRAN_PACKAGE_LIST_URL      | Cran Server download url           | `http://cran.....`     |
| CRAN_PACKAGE_LIST_MAX      | Number of packages to retrieve     | 50                     |
| NODE_ENV                   | Node Environment                   | `development`          |
| URL                        | Server URL                         | `http://localhost:3001`|
| PORT                       | Server Port                        | `3001`                 |

### Commands
1. Create database 
```
npm run db:init
```
2. Create tables 
```
npm run db:migrate
```
3. Run fetcher 
```
npm run fetcher
```
4. Start server
```
npm run server
```
# pakete
A package directory application

## Application
The app has two components:
- fetcher
- api

## Fetcher
This component resides in `fetcher` folder. This is a collection of scripts intented to be run in order.
Below are the responsibilities of each script:

#### 1_loader.js
1. Retrieves list of packages from CRAN Server
2. Saves package name and version in database

#### 2_downloader.js
1. Downloads the packages from CRAN Server based on the list saved in db

#### 3_parser.js
1. Reads the DESCRIPTION file from every package downloaded
2. Parses the DESCRIPTION file
3. Saves package information in database
4. Deletes local copy of packages

The command below runs the whole process. Do note that it starts by clearing up the database.
Hence, every run is a fresh load to the database.
```
npm run fetcher
```

## API
This component resides in `api` folder.
```
npm run server
```
By default, the server runs at `http://localhost:3001/`
- [API Doc](doc/api.md)

## Database

#### Create database
- Creates database based on config `knexfile.js`
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
```
npm run db:rollback
```

### Schema
- [Database Schema](doc/schema.png)

## Running the application

### Prerequisites
- MySQL
- Node.js

### Configuration
Update .env file to overwrite defaults

| key                      | description                        | default                |
| -------------------------| -----------------------------------| -----------------------|
| DB_HOST                  | Database Host                      | `localhost`            |
| DB_USER                  | Database User                      | `root`                 |
| DB_PW                    | Database Password                  | -                      |
| DB_NAME                  | Database Name                      | `pakete`               |
| CRAN_PACKAGE_DOWNLOAD_URL| Cran Server url                    | `http://cran.....`     |
| CRAN_PACKAGE_LIST_URL    | Cran Server download url           | `http://cran.....`     |
| CRAN_PACKAGE_LIST_MAX    | Number of packages to retrieve     | 50                     |
| NODE_ENV                 | Node Environment                   | `development`          |
| URL                      | Server URL                         | `http://localhost:3001`|
| PORT                     | Server Port                        | `3001`                 |

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
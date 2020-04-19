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
- MySQL v5.7
- Node.js v12.15

### Configuration
- See [.env](.env)

### Running on your local
- Ensure prerequisites are installed
- Create database user
```
CREATE USER 'pakete'@'localhost' IDENTIFIED BY 'pakete';
GRANT ALL PRIVILEGES ON pakete.* TO 'pakete'@'localhost';
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


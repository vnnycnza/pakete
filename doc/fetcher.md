# pakete fetcher

## Scripts

Below are the responsibilities of each script:

#### 1_loader.js
1. Retrieves list of packages from CRAN Server
2. Parses the response text from CRAN Server to retrieve necessary data
3. Saves `package`, `search_name`, `version` and `download_link` in database

#### 2_downloader.js
1. Retrieves list of packages from database
1. Downloads the packages from CRAN Server based on the `package.download_link` saved in db

#### 3_parser.js
1. Retrieves list of packages from database
2. Reads and parses the `DESCRIPTION` file from every package downloaded
3. Saves necessary package information in database
4. Deletes local copy of downloaded packages

## Commands

```
npm run fetch
```

- The command above runs the 3 scripts in order. 
- Do note that it starts by clearing up the database.
- Hence, every run is a fresh load to the database.
- When running for the first time, run `npm run db:init` first to create db
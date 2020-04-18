# pakete api

## GET api/search

- `/api/search?q=[keyword]`
- Retrieves list of all packages with package name matching the keyword

#### Response Body

| key                | type   | description              |
| ------------------ | ------ | ------------------------ |
| packages           | array  | array of objs (`result`) |
| result.id          | string | id of package            |
| result.package     | string | name of package          |
| result.version     | string | version of package       |
| result.description | string | description of package   |
| result.publication | string | publication of package   |
| result.authors     | array  | array of objs (`author`) |
| result.maintainers | array  | array of objs (`author`) |
| author.name        | string | name of author           |
| author.email       | string | email of author          |

#### Sample Request

```
GET /api/search?q='quer' HTTP/1.1
Host: localhost:3001
Content-Type: application/json
```

#### Sample Response

```
{
  packages: [
    {
      id: 1
      package: 'albuquerque',
      version: '1.0.1',
      description: 'sample package',
      publication: '2020-04-19T23:05:52.000Z',
      authors: [
        {
          name: 'Saul Goodman',
          email: 'saul@speedyjustice.com'
        },
      ]
      maintainers: [
        {
          name: 'Saul Goodman',
          email: 'saul@speedyjustice.com'
        },
        {
          name: 'Kim Wexler',
          email: 'kim@wexler.com'
        },
      ]
    }
  ]
}
```

## GET api/packages

- `/api/packages`
- Retrieves list of all packages

#### Response Body

| key                | type   | description              |
| ------------------ | ------ | ------------------------ |
| packages           | array  | array of objs (`result`) |
| result.id          | string | id of package            |
| result.package     | string | name of package          |
| result.version     | string | version of package       |
| result.description | string | description of package   |
| result.publication | string | publication of package   |
| result.authors     | array  | array of objs (`author`) |
| result.maintainers | array  | array of objs (`author`) |
| author.name        | string | name of author           |
| author.email       | string | email of author          |

#### Sample Request

```
GET /api/packages HTTP/1.1
Host: localhost:3001
Content-Type: application/json
```

#### Sample Response

```
{
  packages: [
    {
      id: 1
      package: 'abc',
      version: '1.0.1',
      description: 'sample package',
      publication: '2020-04-19T23:05:52.000Z',
      authors: [
        {
          name: 'Saul Goodman',
          email: 'saul@speedyjustice.com'
        },
      ]
      maintainers: [
        {
          name: 'Saul Goodman',
          email: 'saul@speedyjustice.com'
        },
        {
          name: 'Kim Wexler',
          email: 'kim@wexler.com'
        },
      ]
    }
  ]
}
```

## GET api/authors

- `/api/authors`
- Retrieves list of all authors

#### Response Body

| key          | type   | description              |
| ------------ | ------ | ------------------------ |
| authors      | array  | array of objs (`author`) |
| author.name  | string | name of author           |
| author.email | string | email of author          |

#### Sample Request
```
GET /api/authors HTTP/1.1
Host: localhost:3001
Content-Type: application/json
```

#### Sample Response
```
{
  authors: [
    {
      name: 'Saul Goodman',
      email: 'saul@speedyjustice.com'
    },
    {
      name: 'Kim Wexler',
      email: 'kim@wexler.com'
    },
  ]
}
```

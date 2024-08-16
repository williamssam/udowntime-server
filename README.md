# Udowntime (Backend code)
Udowntime is an automated downtime monitoring application with alerts and uptime reports.

## Notes
- Currently I am using simple cronjob which run every thirty (30) minutes to check every website which last running time is (i.e 5 mins ago) in database.
- User PostgreSQL triggers to update website table and insert new column to website_history table after cron job runs

## Requirements
- Register and Login (authentication and authorization)
- Add new website to monitor
- Monitor all websites at the same time
- Status of website is checked at regular intervals
- Website for users to view uptime reports for each website (frontend app)

## Tech Stack
- Node js
- Typescript
- Express js
- Node cron
- Postgresql (Database)
- Pg - Non-blocking PostgreSQL client for Node.js
- Zod - for validation

## Installation
- Install libraries
```bash
pnpm i
```

- Start dev server
```bash
pnpm dev
```

## Usage

### Base URL
http://localhost/api/v1/


### Authentication endpoints
|  Name 	|  Path 	|  Method 	|  Query 	|   	|
|---	|---	|---	|---	|---	|
| Register  	|  **/auth/signup** 	|  POST 	|  - 	|   	|
| Login 	|  **/auth/login** 	|  POST 	|  - 	|   	|
| Me 	|  **/me** 	|  GET 	|  - 	|   	|
| Logout 	|  **/auth/logout** 	|  POST 	|  - 	|   	|

### Websites endpoints
|  Name 	|  Path 	|  Method 	|  Query 	|   	|
|---	|---	|---	|---	|---	|
| Get all website  	|  **/websites** 	|  GET 	|  page, status 	|   	|
| Add new website 	|  **/website** 	|  POST 	|  - 	|   	|
| Update website 	|  **/website/:id** 	|  PUT 	|  - 	|   	|
| Get website by id 	|  **/website/:id** 	|  GET 	|  - 	|   	|
| Update website status 	|  **/website/status/:id** 	|  PATCH 	|  - 	|   	|
| Get website history 	|  **/website/history/:id** 	|  GET 	|  - 	|  page, status 	|
| Delete website		|  **/website/:id** 	|  DELETE 	|  - 	|   	|

### Website reporting endpoints
|  Name 	|  Path 	|  Method 	|  Query 	|   	|
|---	|---	|---	|---	|---	|
| Get all website report  	|  **/websites/report** 	|  GET 	|  	|   	|
| Get website report 	|  **/website/history/report/:id** 	|  GET 	|  - 	|  	|


## Todo
- Add pagination to both websites and website history query

## Miscellaneous
- run <code>node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"</code> in your terminal to generate key for either access token
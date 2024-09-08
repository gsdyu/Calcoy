## to run express server that can store into a local Postgre server:

install necessary packages

```
npm install
```

have a running local Postgre server.
1. download and configure Postgre (maybe from the website)
2. create a db (this backend currently does not set up a database for you)
3. change the env variable (.env) DATABASE_URL to your correspoding database name. (if you look at the URL in .env it should be intuitive on what to change)

set up your .env variable:
- have an "DATABASE_URL" environment variable. (DATABASE_URL=postgres://postgres:test@localhost:5432/mydatabase8)
	- configure port number and database name appropriately
- have "JWT_SECRET" environment variable and set it to my_key. (JWT_SECRET=my_key)


run the server

```
node index.js
```

note: 

- you can create/login an account (not with third party logins) and add events associated with an account once login
- currently the code does not have a way to drop tables; you must do so manually through Postgre directly (pgadmin/psql)
 



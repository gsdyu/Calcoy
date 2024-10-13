# README to run backend express server (note: need to update readme for vectors):
## install necessary packages
```
  npm install
```
## env file
- by default, env name is .env
- .env file should be in root directory of backend; timewise/backend/.
- env file location might be different for everyone; just make sure the program access the env location relative to where you have your own env

## have a running local Postgre server.
1. download and configure Postgre (maybe from the website)
2. create a db (this backend currently does not set up a database for you)
3. change the env variable (.env) DATABASE_URL to your correspoding database name. (if you look at the URL in .env it should be intuitive on what to change)

## Postgre Server, adding pgvector.
- install pgvector for postgre from their github

		https://github.com/pgvector/pgvector

- remember to recreate your tables to add the embedding column to events: alter or recreate table
- work in progress...

## set up your .env variable:
- have an "DATABASE_URL" environment variable. (DATABASE_URL=postgres://postgres:test@localhost:5432/mydatabase8)
	- configure port number and database name appropriately
	- the part that says "test", should be your postgre password that you set up
- have "JWT_SECRET" environment variable and set it to my_key. (JWT_SECRET=my_key)

## to get access to chatbot you need an api_key
- current chatbot being used is groq 
	- website: https://console.groq.com/playground 
	- "GROQ_API_KEY" will be the environment variable; assign your key in env folder

## run the server

```
node index.js
```

## script
- theres a script folder intended for personal development automation. 
	- ex. theres a script/drop.js to automatically drop all the tables so that you do not need to manually drop each.

- a boilerplate code can be made to automatically create a user and insert events so that you  do not need to manually through the client for possibly quicker testing

## note: 

- you can create/login an account (not with third party logins) and add events associated with an account once login
- currently the code does not have a way to drop tables; you must do so manually through Postgre directly (pgadmin/psql)
- whenever you make a structure change to the table, you may need to alter the table, or you can drop the table and recreate it by running index.js again. warning you will lose all your data if you drop
- for the postgre password in the database url, where you change "test", you can also change the postgre config so that you do not need a password/always trust a certain ip
  
  https://stackoverflow.com/questions/55038942/fatal-password-authentication-failed-for-user-postgres-postgresql-11-with-pg
  



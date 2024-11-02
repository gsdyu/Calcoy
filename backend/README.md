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

## Vector Database for RAG.

- Pgvector
  - install pgvector for postgre from their github
      - https://github.com/pgvector/pgvector
  - the main importance is just getting the vector extension for your database
  - depend on os, installing will be different for everyone
    - i had a windows; couldnt get pgvector install on windows -- i kept getting a 'case 4' is already use error or something
    - i had to move my database to wsl with psql interface. if you have a mac or linux os it should be easier
  - remember to recreate your tables to add the embedding column to events: alter or recreate table

- Embedding Model
  - new key variable for embedding model in .env
    - using jina ai as embedding model. they provide free tokens
        - https://jina.ai/embeddings/
    - "JINA_API_KEY"=[key]


## set up your .env variable:
- have an "DATABASE_URL" environment variable. (DATABASE_URL=postgres://postgres:test@localhost:5432/mydatabase8)
	- configure port number and database name appropriately
	- the part that says "test", should be your postgre password that you set up
- have "JWT_SECRET" environment variable and set it to my_key. (JWT_SECRET=my_key)

## to get access to chatbot you need an api_key
- current chatbot being used is gemini 
  - website: https://aistudio.google.com/app/apikey
  - "GEMINI_API_KEY" will be the enviroment variable
- groq is also set up
	- website: https://console.groq.com/playground 
	- "GROQ_API_KEY" will be the environment variable

## run the server

```
node index.js
```

## script
- theres a script folder intended for personal development automation. 
	- ex. theres a script/drop.js to automatically drop all the tables so that you do not need to manually drop each.
- also script for adding some boilerplate events and their embeddings.
    - need to register an account first for events to work
      - no script for a boilerplate account or admin

## note: 

- you can create/login an account (not with third party logins) and add events associated with an account once login
- whenever you make a structure change to the table, you may need to alter the table, or you can drop the table and recreate it by running index.js again. warning you will lose all your data if you drop
- for the postgre password in the database url, where you change "test", you can also change the postgre config so that you do not need a password/always trust a certain ip

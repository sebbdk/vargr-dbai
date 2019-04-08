# Koida

This turned into a  much more of a common database interface for now.
So i might split this library once i am done with that part and start the web part.

The common idea, is a bunch of tests that allows us to create classes to interact with the different



#old description
Koa api databases hydra storage abstration.

Returns a configured koa instance with a Restfull CRUD API configured.
Can be configured to use Sequalize, MongoDB, in memmory database, lowdb or all three together.

Features a Restfull and websocket based API with validation and data change events and clock syncronization.

This project is made with rapid develoment in mind, so is supposed to work with as little configuration as possible.
Keeping it self open for later changes of database types, adding of validation etc. as the implementing project matures.

## random notes
Consider naming the orm, something like 'just give me data' or 'careless data', 'database unaware orm', etc.

# Todo
Everything, this project is currently in speccing phase..

# The epic
I would like to store data in arbitrary databases and access said data via websockets and a Restfull API.

## Stories
- I would would like to be able to optionally add validation to my models
- I would like to be able to specify database per model
- I would like to be able to use the follwing integrations:
    - lowdb
    - memory only database (candidates: lokijs, pouchdb, ...redis?)
    - mongodb
    - Sequalise
- I would like to access my data through a Restfull API
- I would like to access my data through a Websocket interface

## Performance stories
- I would like to be able to optionally memoise the query methods, and invalidate them with create/update
- I would like to share db requests, so if 2 equal requests are requested at the same time, then only one db request will be made

Extending stories, might be better off as some type of extensions to keep the repo focused
- I would like to be able to syncronise clocks with the application
- I would like to be able to subscribe to model CRUD change events (Websocket and RestFull)
- I would like to set up a callback url for CRUD change events that calls a url with the change set




// Structural notes
 - API Testing with async jest https://jestjs.io/docs/en/tutorial-async


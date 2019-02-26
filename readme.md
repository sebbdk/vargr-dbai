# Koida
Koa api data storage abstration.

Returns a configured koa instance with a Restfull CRUD API configured.
Can be configured to use Sequalize, MongoDB, in memmory database, lowdb or all three together.

Features a Restfull and websocket based API with validation and data change events and clock syncronization.

This project is made with rapid develoment in mind, so is supposed to work with as little configuration as possible.
Keeping it self open for later changes of database types, adding of validation etc. as the implementing project matures.

# Todo
Everything, this project is currently in speccing phase..

# The epic
I would like to store data in arbitrary databases and access said data via websockets and a Restfull API.

# Stories
- I would would like to be able to optionally add validation to my models
- I would like to be able to specify database per model
- I would like to be able to use the folling integrations:
    - lowdb
    - memory only database
    - couchdb
    - Sequalise
- I would like to access my data through a Restfull API
- I would like to access my data through a Websocket interface

Extending stories that build on top of base stories
- I would like to be able to syncronise clocks with the application
- I would like to be able to subscribe to model CRUD change events (Websocket and RestFull)
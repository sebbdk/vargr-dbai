# Vargr Debai

**This is still very much in alpha**

This is a library of DB abstration interfaces written to quickly prototype CRUD API applications.
All interfaces are written with a common test suite, so have the same API regardless of what DB is behind it.

# Why?
There are other database abstractions out there, knex/objection, sequalize, bookshelf.
They only support SQL based databases however.

I would lgike a library that will let me prototype common CRUD applications and use any storage.

*Usecases:*
* Prototype using database type A and then switch database type B when things get serious.
* Change you database later from SQL based to a NoSQL like Elasticsearch for fx. search performance.
* Have one database type for local development, fx. in memory, and another on live.
* Easy query duplication since the interface is the same across databases.

*Things to consider before using this library*
* Some specilized queries are not possible, since not all features are shared across database types.
* There is a slight performance-overhead in translating queries to fit the shared test requirements.

## Supported storage / databases
* LowDB
* MongoDB
* Sequalize (Postgres, MySQL, MariaDB, SQLite and Microsoft SQL Server)

## Todo:
* Knex integration (Sequalize requires a large amount of config, which we might be able to avoid using knex)
* Sort find....
* Use symbols instead of strings for query operations ($or, $like, et..)
* Documentation
* Test suite refactor
* More tests
* Pick new integrations, Redis, CouchDB..??
   * https://insights.stackoverflow.com/survey/2019?utm_source=so-owned&utm_medium=announcement-banner&utm_campaign=dev-survey-2019#technology-_-most-loved-dreaded-and-wanted-databases
* Are there any common missing use cases?
    * Nested document support or save/update related table row
    * Transaction support

## Architectural vision

All interfaces are normalized with a single test suite to keep the same API.
The reasoning is to keep this project small and modular.

The shared test suite will ensure sensible defaults for all interfaces.
These defaults are to keep configuration to a minimum, and allow more rapid development.


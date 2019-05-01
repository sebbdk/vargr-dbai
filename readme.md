# Vargr DBai

**One API, all the databases.**

This is a simplified API that allows one to do all common CRUD methods on a variaty of databases using the same API.
This is not and ORM, or a query builder, but has features from both.

The gain is the abillity to write generic layers for Auth, Rest, Validation etc. will work across databases.
The price, is an overhead in translating queries and results, as well as not being able to do complex queries.

## Storage integrations
* LowDB
* MongoDB
* Sequalize (Postgres, MySQL, MariaDB, SQLite and Microsoft SQL Server)
  - This might get deprecated as Knex does the same, but simpler.
* Knex (Postgres, MySQL, MariaDB, SQLite and Microsoft SQL Server)

## Todo:
* Add optional soft delete (on by default)
* Use symbols instead of strings for query operations ($or, $like, et..)
* Documentation
* Consider adding support for immutable documents/rows
* Test suite refactor
* More testing...
* Performance comparison and improvements
* Pick new integrations, Redis, CouchDB..??
   * https://insights.stackoverflow.com/survey/2019?utm_source=so-owned&utm_medium=announcement-banner&utm_campaign=dev-survey-2019#technology-_-most-loved-dreaded-and-wanted-databases
* Are there any common missing use cases?
    * Nested document support on document update (update included related)
    * Transaction support

## Architectural vision

All interfaces are normalized with a single test suite to keep the same API.
The reasoning is to keep this project small and modular.

The shared test suite will ensure sensible defaults for all interfaces.
These defaults are to keep configuration to a minimum, and allow more rapid development.


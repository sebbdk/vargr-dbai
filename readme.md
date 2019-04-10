# Vargr Debai

**This is still very much in alpha**

This is a library of DB abstration interfaces written to quickly prototype CRUD API applications.
All interfaces are written with a common test suite, so have the same API regardless of what DB is behind it.

## Supported storage / databases
* LowDB
* MongoDB

## Todo:
* Sequalize integration
* Documentation
* Test suite refactor

## Architectural vision

All interfaces are normalized with a single test suite to keep the same API.
The reasoning is to keep this project small and modular.

The shared test suite will ensure sensible defaults for all interfaces.
These defaults are to keep configuration to a minimum and allow more rapid development.


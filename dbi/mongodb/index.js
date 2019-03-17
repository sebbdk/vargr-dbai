const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const Memory = require('lowdb/adapters/Memory')

const { getListsForDB } = require('../index');
module.exports = class {
    constructor() {}

    async init(name, config) {
        const dbConfig = config.dbs[name];
    }

    async create({ data }, list) {}

    async find(query) {}
    async findOne(query) {}
    async update(query) {}
    async delete(query) {}
}
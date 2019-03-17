const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const Memory = require('lowdb/adapters/Memory')

module.exports = class {
    async init(lists, config = {}) {
        this.db = low(
            config.file === undefined
                ? new Memory()
                : new FileSync('db.json')
        );

        const preppedLists = Object.keys(lists)
            .reduce((acc, list) => ({...acc, [list]: []}), {});

        this.db.defaults(preppedLists).write();
    }

    async create(list, { data }) {
        return this.db
            .get(list)
            .push(data)
            .write();
    }

    async find(list, query) {
        return this.db.get(list).filter(query.where).value();
    }

    async findOne(list, query) {
        return this.db.get(list).find(query.where).value();
    }

    async update(list, query) {
        return await this.db.get(list)
            .find(query.where)
            .assign(query.data)
            .write();
    }

    async delete(list, query) {
        return this.db.get(list).remove(query.where).write();
    }
}
const { MongoClient } = require('mongodb');

function convertWhereToMongo(where) {

}

module.exports = class {
    constructor() {}

    async init(name, { port = 27017, dbname = 'test' }) {
        return new Promise((resolve) => {
            const url = `mongodb://localhost:${port}/${dbname}`;

            MongoClient.connect(url, (err, db) => {
                if (err) throw err;
                this.db = db.db(dbname);
                resolve();
            });
        })
    }

    async createCollection(name) {
        return await this.db.createCollection(name);
    }

    async removeCollection(listName) {
        return new Promise((resolve) => {
            this.db.collection(listName).drop((err, delOK) => {
                if (err) throw err;
                resolve(delOK);
            });
        });
    }

    async create(listName, { data }) {
        if (Array.isArray(data)) {
            const res = await this.db.collection(listName).insertMany(data);
            return res.result.ok;
        } else {
            const res = await this.db.collection(listName).insertOne(data);
            return res.result.ok;
        }
    }

    async find(listName, { where = {}, limit, offset } = {}) {
        let res = await this.db
            .collection(listName)
            .find(where)

        if(limit !== undefined) {
            res = await res.limit(limit);
        }

        if(offset !== undefined) {
            res = await res.skip(offset);
        }

        return await res.toArray();
    }

    async findOne(listName, { where = {} } = {}) {
        return await this.db
            .collection(listName)
            .findOne(where)
    }

    async update(listName, { data = {}, where = {} } = {}) {
        return await this.db
            .collection(listName)
            .update(where, { $set: data }, { multi: true });
    }

    async delete(listName, { where = {} } = {}) {
        return await this.db
            .collection(listName)
            .deleteMany(where)
    }
}
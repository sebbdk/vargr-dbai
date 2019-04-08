const { MongoClient } = require('mongodb');

const formatters = {
    "$notLike": (res, key) => {
        return { $not: new RegExp('.*' + res[key] + '.*') };
    },
    "$like": (res, key) => {
        return new RegExp('.*' + res[key] + '.*');
    }
}

function convertWhereToMongo(query) {
    let res = query;

    Object.keys(query).forEach(key => {
        if(Array.isArray(res[key])) {
            res[key].map(i => convertWhereToMongo(i));
        } else if(typeof(res[key]) === 'object') {
            res[key] = convertWhereToMongo(query[key]);
        } else if(formatters[key] !== undefined) {
            res = formatters[key](res, key);
        }
    });

    return res;
}

function formatJoinAgregate(listName, aggregateOptions = [], include = {}) {
    Object.keys(include).forEach((collectionName) => {
        let localField = 'id'
        let foreignField = listName + '_id'
        const cond = include[collectionName].on;

        if (cond) {
            localField = Object.keys(cond).pop()
            foreignField = Object.values(cond).pop()
        }

        aggregateOptions.push({
            $lookup: {
                from: collectionName,
                localField,
                foreignField,
                as: collectionName
              }
        });

        // Handle right joins
        if(include[collectionName].required) {
            aggregateOptions.push({
                $match: {
                    [collectionName]: { $exists: true, $ne: [] }
                }
            });
        }
    })

    return aggregateOptions;
}

module.exports = class {
    constructor() {}

    async init(name, { port = 27017, dbname = 'test' }) {
        return new Promise((resolve) => {
            const url = `mongodb://127.0.0.1:${port}/${dbname}`;

            MongoClient.connect(url, { useNewUrlParser: true }, (err, db) => {
                if (err) throw err;
                this.db = db.db(dbname);
                resolve();
            });
        })
    }

    async close() {
        // @TODO
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

    async find(listName, { where = {}, limit, offset, include =  false } = {}) {
        const fixedWhere = convertWhereToMongo(where);
        const aggregateOptions = [
            { $match: fixedWhere },
        ];

        if (include) {
            formatJoinAgregate(listName, aggregateOptions, include);
        }

        let res = await this.db
            .collection(listName)
            .aggregate(aggregateOptions);

        if(limit !== undefined) {
            res = await res.limit(limit);
        }

        if(offset !== undefined) {
            res = await res.skip(offset);
        }

        const result = await res.toArray();

        return await res.toArray();
    }

    async findOne(listName, { where = {}, include = false } = {}) {
        const fixedWhere = convertWhereToMongo(where);

        const aggregateOptions = [
            { $match: fixedWhere },
            { $limit: 1 }
        ];

        if (include) {
            formatJoinAgregate(listName, aggregateOptions, include);
        }

        const res = await this.db
            .collection(listName)
            .aggregate(aggregateOptions)
            .toArray();

        return res.pop();
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
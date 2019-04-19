const knex = require('knex');

module.exports = class {

    constructor() {
        this.collections = {};
        this.collectionDefs = {};
    }

    async init({ unsafe = false, lists = {}, connection = {}, collectionDefs = {}} = {}) {
        this.collectionDefs = collectionDefs;
        this.db = knex({ ...connection });
    }
    async close() {
        const res = await this.db.destroy();
        return true;
    }

    async createCollection(collectionName, { initialItems = [], modelDef }) {
        return new Promise(async (resolve, reject) => {
            const exists = await this.db.schema.hasTable(collectionName);
            if(!exists) {
                await this.db.schema.createTable(collectionName, async (table) => {
                    Object.keys(modelDef).forEach(key => {
                        if (typeof(modelDef[key]) === 'string') {
                            table[modelDef[key]](key);
                        } else {
                            const col = table[modelDef[key].type](key);

                            if(modelDef[key].primary) {
                                col.primary();
                            }
                        }
                    });
                });
            }

            this.create(collectionName, { data: initialItems });

            resolve(true);
        });
    }

    async removeCollection(collectionName) {
        return await this.db.schema.dropTable(collectionName)
    }

    async find(listName, { where = {}, limit, offset, include =  false } = {}) {
        let res = this.db
                .select()
                .from(listName)
                .where(where);

        if(limit) {
           res.limit(limit);
        }

        await res.where(where);

        const objectMap = res.map((row) => {
            return Object.keys(row).reduce((acc, val) => {
                return { ...acc, [val]:row[val] }
            }, {});
        });

        return objectMap;
    };

    async create(listName, { data }) {
        return await this
            .db(listName)
            .insert(data)
    }

    async findOne(listName, { where = {}, limit, offset, include =  false } = {})  {
        const res = await this.find(listName, { where, limit: 1, offset, include});
        return res.pop();
    };

    async updateOne(listName, { data = {}, where = {}} = {})  { console.log('missing updateOne method') };
    async updateMany(listName, { data = {}, where = {}} = {})  { console.log('missing updateMany method') };
    async delete(listName, { where })  { console.log('missing delete method') };
};
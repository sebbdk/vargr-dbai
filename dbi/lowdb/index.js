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
        let results = this.db.get(list).filter(query.where).value();

        if (query.include !== undefined) {
            await Promise.all(Object.keys(query.include).map(async (IncludeList) => {
                await Promise.all(results.filter(async (result) => {
                    // Build subQuery from input
                    const subQuery = Object.keys(query.include[IncludeList].on).reduce((acc, ruleKey) => {
                        return {
                            ...acc,
                            [query.include[IncludeList].on[ruleKey]]: result[ruleKey]
                        };
                    }, {});

                    // Assume query based on naming conventions
                    // @TODO

                    result[IncludeList] = await this.find(IncludeList, { where: subQuery });
                }));

                // Handle required: true, basically right joins the results.
                if (query.include[IncludeList].required) {
                    results = results.filter(res => res[IncludeList].length > 0);
                }
            }));
        }

        return results;
    }

    // Should be a find all with limit????
    async findOne(list, query) {
        const results = await this.find(list, query);
        return results.length > 0 ? results.shift() : null;
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
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

    async find(listName, query = {}) {
        let results = this.db.get(listName).filter(query.where).value();

        if (query.include !== undefined) {
            await Promise.all(Object.keys(query.include).map(async (subListName) => {
                const subList = query.include[subListName];

                await Promise.all(results.filter(async (result) => {
                    let subQuery = null;

                    if (Object.keys(subList).length === 0) {
                        // Assume subListQuery based on rational naming
                        if (result[`${subListName}_id`]) {
                            subQuery = { 'id' : result[`${subListName}_id`] };
                        } else {
                            subQuery = { [`${listName}_id`] : result.id };
                        }
                    } else {
                        // Build subQuery from input
                        subQuery = Object.keys(subList.on).reduce((acc, ruleKey) => {
                            return {
                                ...acc,
                                [subList.on[ruleKey]]: result[ruleKey]
                            };
                        }, {});
                    }

                    result[subListName] = await this.find(subListName, { where: subQuery });
                }));

                // Handle required: true, basically right joins the results.
                if (subList.required) {
                    results = results.filter(res => res[subListName].length > 0);
                }
            }));
        }

        return results;
    }

    async findOne(list, query = {}) {
        const results = await this.find(list, query);
        return results.length > 0 ? results.shift() : null;
    }

    async update(list, query = {}) {
        return await this.db.get(list)
            .find(query.where)
            .assign(query.data)
            .write();
    }

    async delete(list, query) {
        return this.db.get(list).remove(query.where).write();
    }
}
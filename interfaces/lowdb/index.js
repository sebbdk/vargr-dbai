const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const Memory = require('lowdb/adapters/Memory')

const lookTypes = {
    '$like': (field, lookValue) => {
        const reg = lookValue.replace(new RegExp('%', 'g'), '.*');
        return field.match(reg) !== null;
    },
    '$notLike': (field, lookValue) => {
        const reg = lookValue.replace(new RegExp('%', 'g'), '.*');
        return field.match(reg) === null;
    },
    '$gt': (field, lookValue) => {
        return field > lookValue;
    },
    '$gte': (field, lookValue) => {
        return field >= lookValue;
    },
    '$lt': (field, lookValue) => {
        return field < lookValue;
    },
    '$lte': (field, lookValue) => {
        return field <= lookValue;
    }
}

function matchField(field, options) {
    if (typeof(options) === 'object') {
        const lookType = Object.keys(options).pop();
        return lookTypes[lookType](field, options[lookType]);
    }

    return field === options;
}

module.exports = class {
    async init({ lists = {}, config = {} } = {}) {
        this.db = low(
            config.file === undefined
                ? new Memory()
                : new FileSync('db.json')
        );

        const preppedLists = Object.keys(lists)
            .reduce((acc, list) => ({...acc, [list]: []}), {});

        this.db.defaults(preppedLists).write();
    }

    async close() {
        return true;
    }

    async createCollection(name, { initialItems = [] } = {}) {
        this.db.defaults({ [name]: initialItems }).write();
    }

    async removeCollection(name) {
        const state = this.db.getState();
        delete state[name];
        this.db.setState(state)
    }

    async create(list, { data }) {
        const items = Array.isArray(data) ? data : [data];
        const listRef = this.db.get(list);

        return items.map(item => {
            listRef.push(item).write()
        });
    }

    async find(listName, { offset = 0, limit = 20, where, include } = {}) {
        const offsetLimit = offset + limit;

        let results = this.db
            .get(listName)
            .filter(item => {
                let match = true;
                let hasOrMatch = false;

                // @todo Move to method
                if (where) {
                    for (const [key, value] of Object.entries(where)) {
                        if (key !== '$or' && !matchField(item[key], value)) {
                            match = false;
                            break;
                        }
                    }
                }

                // @todo Move to method
                if (where && where.$or !== undefined) {
                    for (const orSel of where.$or) {
                        for (const [key, value] of Object.entries(orSel)) {
                            if (matchField(item[key], value)) {
                                hasOrMatch = true;
                                break;
                            }
                        }
                    }

                    match = match && hasOrMatch;
                }

                return match ;
            })
            .slice(offset, offsetLimit)
            .value();


        // @todo Move to method
        if (include !== undefined) {
            await Promise.all(Object.keys(include).map(async (subListName) => {
                const subList = include[subListName];

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

    async updateOne(list, query = {}) {
        return await this.db.get(list)
            .find(query.where)
            .assign(query.data)
            .write();
    }

    async updateMany(list, { data = {}, where = {}} = {}) {
        return await this.db.get(list)
            .filter(where)
            .each(item => {
                Object.keys(data).forEach(key => {
                    item[key] = data[key]
                });
            })
            .write();
    }

    async delete(list, query) {
        return this.db.get(list).remove(query.where).write();
    }
}
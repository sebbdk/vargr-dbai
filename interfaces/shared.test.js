const Sequelize = require('Sequelize');

const dbis = {
    lowdDB: require('./lowdb'),
    mongodb: require('./mongodb'),
    sequalize: require('./sequalize'),
    knex: require('./knex')
};

const initializers = {
    sequalize: {
        models: {
            cakeman: {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV1,
                    primaryKey: true
                },
                name:Sequelize.STRING,
                description: Sequelize.STRING,
                qty: Sequelize.INTEGER
            },
            messages: {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV1,
                    primaryKey: true
                },
                abc:Sequelize.STRING,
                users_id: Sequelize.UUID,
                type: Sequelize.STRING,
                name: Sequelize.STRING,
                order: Sequelize.INTEGER,
                message: Sequelize.STRING,
                updated: Sequelize.BOOLEAN
            },
            users: {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV1,
                    primaryKey: true
                },
                abc: Sequelize.STRING,
                type: Sequelize.STRING,
                name: Sequelize.STRING,
            }
        },
        associations: {
            messages: {
                belongsTo: {
                    foreignKey: 'users_id',
                    model: 'users',
                    as: 'cats'
                }
            },
            users: {
                hasMany: {
                    foreignKey: 'users_id',
                    model: 'messages'
                }
            }
        }
    },
    knex: {
        connection: {
            client: 'mysql2',
            connection: {
              host: '127.0.0.1',
              user: 'root',
              password: 'root',
              database: 'test'
            }
        }
    }
}

const messageDef = {
    id: {
        type: 'uuid',
        primaryKey: true
    },
    abc: 'string',
    users_id: 'uuid',
    type: 'string',
    name: 'string',
    message: 'string',
    order: 'integer',
    updated: 'boolean'
}

const usersDef = {
    id: {
        type: 'uuid',
        primaryKey: true
    },
    abc: 'string',
    name: 'string',
    type: 'string'
}

Object.keys(dbis).forEach(dbiName => {
    const DBI = dbis[dbiName];

    describe(`${dbiName} ORM methods`, () => {
        let dba = null;

        beforeEach(async () => {
            dba = await new DBI();
            await dba.init({...initializers[dbiName], unsafe: true});
            await dba.createCollection('messages', { initialItems: [], modelDef: messageDef });
            await dba.createCollection('users', { initialItems: [], modelDef: usersDef });
        });

        afterEach(async () => {
            try {
                await dba.removeCollection('messages');
                await dba.removeCollection('users');
            } catch(e) {}
        });

        it('should expose the internal db connection', async () => {
            expect(dba.db).toBeTruthy()
        });

        it('create collection', async () => {
            await dba.createCollection('cakeman', {
                initialItems: [{ name: 'mighty', description: 'mouse' }],
                modelDef: {
                    name: 'string',
                    description: 'string'
                }
            });
            const mice = await dba.find('cakeman');

            await dba.removeCollection('cakeman');
            expect(mice.length).toEqual(1);
        });

        it('remove collection', async () => {
            await dba.create('messages', { data: {'abc':'def'} });
            const res1 = await dba.find('messages');
            expect(res1.length).toEqual(1);

            await dba.removeCollection('messages');

            try {
                const res2 = await dba.find('messages');
                expect(res2.length).toEqual(0);
            } catch(e) {
                expect(true).toEqual(true);
            }
        });

        it('can create a item', async () => {
            const result = await dba.create('messages', { data: {'abc':'def'} });
            expect(result).toBeTruthy();

            const res = await dba.find('messages');
            expect(res[0].abc).toEqual('def');
        });

        it('will save nested / related data if included and matching list exists', async () => {
            const result = await dba.create('users', {
                data: {
                    id: 20,
                    name: 'major pain',
                    messages: [
                        { message: 'fart' },
                        { message: 'big fart' },
                    ]
                }
            });

            expect(result).toBeTruthy();
            const res = await dba.find('messages', { where: { users_id: 20 } });
            expect(res.length).toEqual(2);
        });

        it('generate id if not present on create single document', async () => {
            const result1 = await dba.create('messages', { data: {'abc':'def'} });

            expect(typeof(result1.id)).toEqual('string');
            expect(result1.id.length > 2).toBeTruthy();
        });

        it('generate id if not present on create multiple documents', async () => {
            const result2 = await dba.create('messages', { data: [{'abc':'def'}, {'abc':'def'}] });

            expect(typeof(result2[0].id)).toEqual('string');
            expect(result2[0].id.length > 2).toBeTruthy();

            expect(typeof(result2[1].id)).toEqual('string');
            expect(result2[1].id.length > 2).toBeTruthy();
        });

        it('create returns inserted item', async () => {
            const result = await dba.create('messages', { data: {'abc':'hello'} });
            expect(result.abc).toEqual('hello');
        });

        it('create multiple returns inserted items', async () => {
            const result = await dba.create('messages', {
                data: [
                    {'id':'1', 'name':'halback'},
                    {'id':'2', 'name':'pickelback'}
                ]
            });

            expect(result[0].name).toEqual('halback');
            expect(result[1].name).toEqual('pickelback');
        });

        it('create can optionally not return insert reference', async () => {
            const result = await dba.create('messages', { data: {'abc':'hello'}, returnRef: false });
            expect(result).toBeTruthy();
        });

        it('can create multiple items at once', async () => {
            const result = await dba.create('messages', {
                data: [
                    {'id':'1', 'name':'halback'},
                    {'id':'2', 'name':'pickelback'}
                ]
            });

            expect(result).toBeTruthy();
            const resultChecks = await dba.find('messages');
            expect(resultChecks.length).toEqual(2);
        });

        it('can find a single item', async () => {
            await dba.create('messages', { data: {id: 1, name: 'john doe'} });
            await dba.create('messages', { data: {id: 2, name: 'jane doe'} });
            await dba.create('messages', { data: {id: 3, name: 'poppa doe'} });

            const result = await dba.findOne('messages', { where: { id: 2 }});
            expect(result.name).toEqual('jane doe');
        });

        it('return false if single item cannot be found', async () => {
            const result = await dba.findOne('messages', { where: { id: 2 }});
            expect(result).toEqual(false);
        });

        it('can find many items', async () => {
            await dba.create('messages', { data: {id: 1, name: 'john doe'} });
            await dba.create('messages', { data: {id: 2, name: 'jane doe'} });
            await dba.create('messages', { data: {id: 3, name: 'poppa doe'} });

            const result = await dba.find('messages');
            expect(result.length).toEqual(3);
        });

        it('can sort found items numerically', async () => {
            await dba.create('messages', { data: {id: 1, order: 3, name: 'john doe'} });
            await dba.create('messages', { data: {id: 2, order: 1, name: 'jane doe'} });
            await dba.create('messages', { data: {id: 3, order: 2, name: 'poppa doe'} });

            const result = await dba.find('messages', {
                orderBy: ['order', 'asc']
            });

            expect(result[0].order).toEqual(1);
            expect(result[1].order).toEqual(2);
            expect(result[2].order).toEqual(3);
        });

        it('can sort found items alphabetically', async () => {
            await dba.create('messages', { data: {id: 1, order: 3, name: 'B'} });
            await dba.create('messages', { data: {id: 2, order: 1, name: 'C'} });
            await dba.create('messages', { data: {id: 3, order: 2, name: 'A'} });

            const result = await dba.find('messages', {
                orderBy: ['name', 'asc']
            });

            expect(result[0].name).toEqual("A");
            expect(result[1].name).toEqual("B");
            expect(result[2].name).toEqual("C");
        });

        it('can sort descending', async () => {
            await dba.create('messages', { data: {id: 1, order: 3, name: 'john doe'} });
            await dba.create('messages', { data: {id: 2, order: 1, name: 'jane doe'} });
            await dba.create('messages', { data: {id: 3, order: 2, name: 'poppa doe'} });

            const result = await dba.find('messages', {
                orderBy: ['order', 'desc']
            });

            expect(result[0].order).toEqual(3);
            expect(result[1].order).toEqual(2);
            expect(result[2].order).toEqual(1);
        });

        it('can use $OR query', async () => {
            await dba.create('messages', { data: {id: 1, type: 'B', name: 'john doe'} });
            await dba.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await dba.create('messages', { data: {id: 3, type: 'A', name: 'poppa doe'} });
            await dba.create('messages', { data: {id: 4, type: 'A', name: 'poppa doe'} });

            const results = await dba.find('messages', {
                where: {
                    name: 'john doe',
                    '$or': [
                        { type: 'A' },
                        { type: 'B' }
                    ]
                }
            });

            expect(results.length).toEqual(1);

            const results2 = await dba.find('messages', {
                where: {
                    '$or': [
                        { type: 'A' },
                        { type: 'B' }
                    ]
                }
            });

            expect(results2.length).toEqual(4);
        });

        it('can use $like query', async () => {
            await dba.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await dba.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await dba.create('messages', { data: {id: 3, type: 'A', name: 'john sage'} });
            await dba.create('messages', { data: {id: 4, type: 'C', name: 'jane sage'} });

            const results = await dba.find('messages', {
                where: {
                    '$or': [
                        {
                            name: {
                                '$like': '%sage%'
                            }
                        }
                    ]
                }
            });

            expect(results.length).toEqual(2);
            expect(results[0].name.indexOf('sage') > -1).toEqual(true);
            expect(results[1].name.indexOf('sage') > -1).toEqual(true);
        });

        it('can use $notLike X query', async () => {
            await dba.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await dba.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await dba.create('messages', { data: {id: 3, type: 'A', name: 'john sage'} });
            await dba.create('messages', { data: {id: 4, type: 'C', name: 'jane sage'} });

            const results = await dba.find('messages', {
                where: {
                    '$or': [
                        {
                            name: {
                                '$notLike': '%doe%'
                            }
                        }
                    ]
                }
            });

            expect(results.length).toEqual(2);
            expect(results[0].name.indexOf('sage') > -1).toEqual(true);
            expect(results[1].name.indexOf('sage') > -1).toEqual(true);
        });

        it('can use $gt/greater than query', async () => {
            await dba.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await dba.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await dba.create('messages', { data: {id: 3, type: 'A', name: 'john sage'} });
            await dba.create('messages', { data: {id: 4, type: 'C', name: 'jane sage'} });

            const results = await dba.find('messages', {
                where: {
                    id: {
                        $gt: 2
                    }
                }
            });

            expect(results.length).toEqual(2);
            expect(results[0].name.indexOf('sage') > -1).toEqual(true);
            expect(results[1].name.indexOf('sage') > -1).toEqual(true);
        });

        it('can use $gte/greater than or equals query', async () => {
            await dba.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await dba.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await dba.create('messages', { data: {id: 3, type: 'A', name: 'john sage'} });
            await dba.create('messages', { data: {id: 4, type: 'C', name: 'jane sage'} });

            const results = await dba.find('messages', {
                where: {
                    id: {
                        '$gte': 3
                    }
                }
            });

            expect(results.length).toEqual(2);
            expect(results[0].name.indexOf('sage') > -1).toEqual(true);
            expect(results[1].name.indexOf('sage') > -1).toEqual(true);
        });

        it('can use $lt/lesser than query', async () => {
            await dba.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await dba.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await dba.create('messages', { data: {id: 3, type: 'A', name: 'john sage'} });
            await dba.create('messages', { data: {id: 4, type: 'C', name: 'jane sage'} });

            const results = await dba.find('messages', {
                where: {
                    id: {
                        '$lt': 3
                    }
                }
            });

            expect(results.length).toEqual(2);
            expect(results[0].name.indexOf('doe') > -1).toEqual(true);
            expect(results[1].name.indexOf('doe') > -1).toEqual(true);
        });

        it('can use $lte/$lesser than or equals query', async () => {
            await dba.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await dba.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await dba.create('messages', { data: {id: 3, type: 'A', name: 'john sage'} });
            await dba.create('messages', { data: {id: 4, type: 'C', name: 'jane sage'} });

            const results = await dba.find('messages', {
                where: {
                    id: {
                        '$lte': 2
                    }
                }
            });

            expect(results.length).toEqual(2);
            expect(results[0].name.indexOf('doe') > -1).toEqual(true);
            expect(results[1].name.indexOf('doe') > -1).toEqual(true);
        });

        it('can use a limit to tech x documents', async () => {
            await dba.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await dba.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await dba.create('messages', { data: {id: 3, type: 'A', name: 'john sage'} });
            await dba.create('messages', { data: {id: 4, type: 'C', name: 'jane sage'} });

            const results = await dba.find('messages', {
                limit: 2
            });

            expect(results.length).toEqual(2);
        });

        it('can use a offset to skip x documents', async () => {
            await dba.create('messages', { data: {id: "1", type: 'A', name: 'john doe'} });
            await dba.create('messages', { data: {id: "2", type: 'B', name: 'jane doe'} });
            await dba.create('messages', { data: {id: "3", type: 'A', name: 'john sage'} });
            await dba.create('messages', { data: {id: "4", type: 'C', name: 'jane sage'} });
            await dba.create('messages', { data: {id: "5", type: 'D', name: 'Polly sage'} });

            const results = await dba.find('messages', {
                offset: 2
            });

            expect(results.length).toEqual(3);
            expect(results[0].id).toEqual("3");
        });

        it('can read multiple items in dbi with query', async () => {
            await dba.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await dba.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await dba.create('messages', { data: {id: 3, type: 'A', name: 'poppa doe'} });

            const results = await dba.find('messages', { where: { type: 'A' }});
            expect(results.length).toEqual(2);
        });

        it('can read multiple items in dbi without query', async () => {
            await dba.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await dba.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await dba.create('messages', { data: {id: 3, type: 'A', name: 'poppa doe'} });

            const results = await dba.find('messages');
            expect(results.length).toEqual(3);
        });

        it('can update an item', async () => {
            await dba.create('messages', { data: {id: 1, name: 'john doe'} });

            const result = await dba.updateOne('messages', { where: {id: 1}, data: {name: 'jane doe'} });
            expect(result).toBeTruthy();

            const results2 = await dba.findOne('messages', { where: { id: 1 } });
            expect(results2.name).toEqual('jane doe');
        });

        it('can update multiple items', async () => {
            await dba.create('messages', { data: {id: 1, type: 'a', name: 'john doe'} });
            await dba.create('messages', { data: {id: 2, type: 'a', name: 'john doe'} });

            const result = await dba.updateMany('messages', { where: {type: 'a'}, data: { updated: true } });
            expect(result).toBeTruthy();

            const results2 = await dba.find('messages', { where: { type: 'a' } });
            expect(results2[0].updated).toBeTruthy();
            expect(results2[1].updated).toBeTruthy();
        });

        it('can delete an item', async () => {
            await dba.create('messages', { data: {id: 1, name: 'john doe'} });

            await dba.delete('messages', { where: {id: 1} });
            const res = await dba.find('messages', { where: {} });
            expect(res.length).toEqual(0);
        });

        it('can read a single item and left join data from another lists', async () => {
            await dba.create('messages', { data: { id: 1, users_id: 2, message: 'I like popsicles' } });
            await dba.create('users', { data: {id: 2, name: 'jane doe'} });

            const result = await dba.findOne('messages', {
                where: { id: 1 },
                include: {
                    users: {
                        on: { 'users_id': 'id' }
                    }
                }
            });

            expect(Array.isArray(result.users)).toEqual(true);
            expect(result.users[0].name).toEqual('jane doe');
        });

        it('can read multiple items and left join data from another lists', async () => {
            await dba.create('messages', { data: {id: 1, users_id: 1, message: 'cakes are awesome'} });
            await dba.create('messages', { data: {id: 2, users_id: 2, message: 'I like popsicles'} });
            await dba.create('users', { data: {id: 1, name: 'jane joe'} });
            await dba.create('users', { data: {id: 2, name: 'Poppa joe'} });

            const result = await dba.find('messages', {
                include: {
                    users: {
                        on: { 'users_id': 'id' }
                    }
                }
            });

            expect(Array.isArray(result[0].users)).toEqual(true);
            expect(result[0].users[0].name).toEqual('jane joe');
        });

        it('can read multiple items and right join data from another lists', async () => {
            await dba.create('messages', { data: {id: 1, users_id: 1, message: 'cakes are awesome'} });
            await dba.create('messages', { data: {id: 2, users_id: 2, message: 'I like popsicles'} });
            await dba.create('users', { data: {id: 2, name: 'Poppa joe'} });

            const result = await dba.find('messages', {
                include: {
                    users: {
                        on: { 'users_id': 'id' },
                        required: true
                    }
                }
            });

            expect(result.length).toEqual(1);
            expect(Array.isArray(result[0].users)).toEqual(true);
            expect(result[0].users[0].name).toEqual('Poppa joe');
        });

        it('will assume join type on when including a child list', async () => {
            await dba.create('users', { data: {id: 2, name: 'Poppa joe'} });
            await dba.create('messages', { data: {id: 1, users_id: 2, message: 'cakes are awesome'} });
            await dba.create('messages', { data: {id: 2, users_id: 2, message: 'I like popsicles'} });

            const result = await dba.find('users', {
                include: { messages: {} }
            });

            expect(Array.isArray(result[0].messages)).toEqual(true);
            expect(result[0].messages.length).toEqual(2);
            expect(result[0].messages[0].message).toEqual('cakes are awesome');
        });

        it('will assume join type when a child list includes a parent list', async () => {
            await dba.create('messages', { data: {id: 1, users_id: 1, message: 'cakes are awesome'} });
            await dba.create('messages', { data: {id: 2, users_id: 2, message: 'I like popsicles'} });
            await dba.create('users', { data: {id: 2, name: 'Poppa joe'} });

            const result = await dba.find('messages', {
                include: { users: { } }
            });

            expect(Array.isArray(result[1].users)).toEqual(true);
            expect(result[1].users[0].name).toEqual("Poppa joe");
            expect(result.length).toEqual(2);
        });

        it('can close connection gracefully', async () => {
            const down = await dba.close();
            expect(down).toBe(true);
        });
    });
});


const dbis = {
    lowdDB: require('./lowdb')
};

Object.keys(dbis).forEach(dbiName => {
    const DBI = dbis[dbiName];

    describe(`${dbiName} ORM methods`, function () {
        it('can create an item', async () => {
            const lists = { messages: {} };
            const db1 = new DBI();
            await db1.init(lists, {});

            const result = await db1.create('messages', { data: {'abc':'def'} });
            expect(result).toBeTruthy();
        });

        it('can read a single item', async () => {
            const lists = { messages: {} };
            const db1 = new DBI();
            await db1.init(lists, {});
            await db1.create('messages', { data: {id: 1, name: 'john doe'} });
            await db1.create('messages', { data: {id: 2, name: 'jane doe'} });
            await db1.create('messages', { data: {id: 3, name: 'poppa doe'} });

            const result = await db1.findOne('messages', { where: { id: 2 }});
            expect(result.name).toEqual('jane doe');
        });

        it('can use OR query', async () => {
            const lists = { messages: {} };
            const db1 = new DBI();
            await db1.init(lists, {});
            await db1.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await db1.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await db1.create('messages', { data: {id: 3, type: 'A', name: 'poppa doe'} });
            await db1.create('messages', { data: {id: 3, type: 'C', name: 'poppa doe'} });

            const results = await db1.find('messages', {
                where: {
                    name: 'john doe',
                    '$or': [
                        {
                            type: 'A'
                        }
                    ]
                }
            });
            expect(results.length).toEqual(1);
        });

        it('can use $like query', async () => {
            const lists = { messages: {} };
            const db1 = new DBI();
            await db1.init(lists, {});
            await db1.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await db1.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await db1.create('messages', { data: {id: 3, type: 'A', name: 'john sage'} });
            await db1.create('messages', { data: {id: 4, type: 'C', name: 'jane sage'} });

            const results = await db1.find('messages', {
                where: {
                    '$or': [
                        {
                            name: {
                                '$like': 'sage'
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
            const lists = { messages: {} };
            const db1 = new DBI();
            await db1.init(lists, {});
            await db1.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await db1.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await db1.create('messages', { data: {id: 3, type: 'A', name: 'john sage'} });
            await db1.create('messages', { data: {id: 4, type: 'C', name: 'jane sage'} });

            const results = await db1.find('messages', {
                where: {
                    '$or': [
                        {
                            name: {
                                '$notLike': 'doe'
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
            const lists = { messages: {} };
            const db1 = new DBI();
            await db1.init(lists, {});
            await db1.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await db1.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await db1.create('messages', { data: {id: 3, type: 'A', name: 'john sage'} });
            await db1.create('messages', { data: {id: 4, type: 'C', name: 'jane sage'} });

            const results = await db1.find('messages', {
                where: {
                    id: {
                        '$qt': 2
                    }
                }
            });

            expect(results.length).toEqual(2);
            expect(results[0].name.indexOf('sage') > -1).toEqual(true);
            expect(results[1].name.indexOf('sage') > -1).toEqual(true);
        });

        it('can use $qte/greater than or equals query', async () => {
            const lists = { messages: {} };
            const db1 = new DBI();
            await db1.init(lists, {});
            await db1.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await db1.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await db1.create('messages', { data: {id: 3, type: 'A', name: 'john sage'} });
            await db1.create('messages', { data: {id: 4, type: 'C', name: 'jane sage'} });

            const results = await db1.find('messages', {
                where: {
                    id: {
                        '$qte': 3
                    }
                }
            });

            expect(results.length).toEqual(2);
            expect(results[0].name.indexOf('sage') > -1).toEqual(true);
            expect(results[1].name.indexOf('sage') > -1).toEqual(true);
        });

        it('can use $lt/lesser than query', async () => {
            const lists = { messages: {} };
            const db1 = new DBI();
            await db1.init(lists, {});
            await db1.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await db1.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await db1.create('messages', { data: {id: 3, type: 'A', name: 'john sage'} });
            await db1.create('messages', { data: {id: 4, type: 'C', name: 'jane sage'} });

            const results = await db1.find('messages', {
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
            const lists = { messages: {} };
            const db1 = new DBI();
            await db1.init(lists, {});
            await db1.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await db1.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await db1.create('messages', { data: {id: 3, type: 'A', name: 'john sage'} });
            await db1.create('messages', { data: {id: 4, type: 'C', name: 'jane sage'} });

            const results = await db1.find('messages', {
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

        it('can read multiple items in dbi with query', async () => {
            const lists = { messages: {} };
            const db1 = new DBI();
            await db1.init(lists, {});
            await db1.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await db1.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await db1.create('messages', { data: {id: 3, type: 'A', name: 'poppa doe'} });

            const results = await db1.find('messages', { where: { type: 'A' }});
            expect(results.length).toEqual(2);
        });

        it('can read multiple items in dbi without query', async () => {
            const lists = { messages: {} };
            const db1 = new DBI();
            await db1.init(lists, {});
            await db1.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
            await db1.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
            await db1.create('messages', { data: {id: 3, type: 'A', name: 'poppa doe'} });

            const results = await db1.find('messages');
            expect(results.length).toEqual(3);
        });

        it('can update an item', async () => {
            const lists = { messages: {} };
            const db1 = new DBI();
            await db1.init(lists, {});
            await db1.create('messages', { data: {id: 1, name: 'john doe'} });

            const result = await db1.update('messages', { where: {id: 1}, data: {name: 'jane doe'} });
            expect(result.name).toEqual('jane doe');
        });

        it('can delete an item', async () => {
            const lists = { messages: {} };
            const db1 = new DBI();
            await db1.init(lists, {});
            await db1.create('messages', { data: {id: 1, name: 'john doe'} });

            await db1.delete('messages', { where: {id: 1} });
            const res = await db1.find('messages', { where: {} });
            expect(res.length).toEqual(0);
        });

        it('can read a single item and left join data from another lists', async () => {
            const lists = { messages: {}, users: {} };
            const db1 = new DBI();
            await db1.init(lists, {});
            await db1.create('messages', { data: { id: 1, user_id: 2, message: 'I like popsicles' } });
            await db1.create('users', { data: {id: 2, name: 'jane doe'} });

            const result = await db1.findOne('messages', {
                where: { id: 1 },
                include: {
                    users: {
                        on: { 'user_id': 'id' }
                    }
                }
            });

            expect(Array.isArray(result.users)).toEqual(true);
            expect(result.users[0].id).toEqual(2);
        });

        it('can read multiple items and left join data from another lists', async () => {
            const lists = { messages: {}, users: {} };
            const db1 = new DBI();
            await db1.init(lists, {});
            await db1.create('messages', { data: {id: 1, user_id: 1, message: 'cakes are awesome'} });
            await db1.create('messages', { data: {id: 2, user_id: 2, message: 'I like popsicles'} });
            await db1.create('users', { data: {id: 1, name: 'jane joe'} });
            await db1.create('users', { data: {id: 2, name: 'Poppa joe'} });

            const result = await db1.find('messages', {
                include: {
                    users: {
                        on: { 'user_id': 'id' }
                    }
                }
            });

            expect(Array.isArray(result[0].users)).toEqual(true);
            expect(result[0].users[0].id).toEqual(1);
        });

        it('can read multiple items and right join data from another lists', async () => {
            const lists = { messages: {}, users: {} };
            const db1 = new DBI();
            await db1.init(lists, {});
            await db1.create('messages', { data: {id: 1, user_id: 1, message: 'cakes are awesome'} });
            await db1.create('messages', { data: {id: 2, user_id: 2, message: 'I like popsicles'} });
            await db1.create('users', { data: {id: 2, name: 'Poppa joe'} });

            const result = await db1.find('messages', {
                include: {
                    users: {
                        on: { 'user_id': 'id' },
                        required: true
                    }
                }
            });

            expect(Array.isArray(result[0].users)).toEqual(true);
            expect(result[0].users[0].id).toEqual(2);
            expect(result.length).toEqual(1);
        });

        test('will assume join type on when including a child list', async () => {
            const lists = { messages: {}, users: {} };
            const db1 = new DBI();
            await db1.init(lists, {});
            await db1.create('users', { data: {id: 2, name: 'Poppa joe'} });
            await db1.create('messages', { data: {id: 1, users_id: 2, message: 'cakes are awesome'} });
            await db1.create('messages', { data: {id: 2, users_id: 2, message: 'I like popsicles'} });

            const result = await db1.find('users', {
                include: { messages: {} }
            });

            expect(Array.isArray(result[0].messages)).toEqual(true);
            expect(result[0].messages.length).toEqual(2);
            expect(result[0].messages[0].users_id).toEqual(2);
        });

        it('will assume join type when a child list includes a parent list', async () => {
            const lists = { messages: {}, users: {} };
            const db1 = new DBI();
            await db1.init(lists, {});
            await db1.create('messages', { data: {id: 1, users_id: 1, message: 'cakes are awesome'} });
            await db1.create('messages', { data: {id: 2, users_id: 2, message: 'I like popsicles'} });
            await db1.create('users', { data: {id: 2, name: 'Poppa joe'} });

            const result = await db1.find('messages', {
                include: { users: { } }
            });

            expect(Array.isArray(result[1].users)).toEqual(true);
            expect(result[1].users[0].id).toEqual(2);
            expect(result.length).toEqual(2);
        });
    });
});


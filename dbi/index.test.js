const lowDBI= require('./lowdb');

test('Create a item in dbi', async () => {
    const lists = { messages: {} };
    const db1 = new lowDBI();
    await db1.init(lists, {});

    const result = await db1.create('messages', { data: {'abc':'def'} });
    expect(result).toBeTruthy();
});

test('Read a single item in dbi', async () => {
    const lists = { messages: {} };
    const db1 = new lowDBI();
    await db1.init(lists, {});
    await db1.create('messages', { data: {id: 1, name: 'john doe'} });
    await db1.create('messages', { data: {id: 2, name: 'jane doe'} });
    await db1.create('messages', { data: {id: 3, name: 'poppa doe'} });

    const result = await db1.findOne('messages', { where: { id: 2 }});
    expect(result.name).toEqual('jane doe');
});

// Join types to support, left, inner, and maybe later right
// See defs' here: https://stackoverflow.com/questions/448023/what-is-the-difference-between-left-right-outer-and-inner-joins
test('Read a single item and left join data from another lists in dbi', async () => {
    const lists = { messages: {}, users: {} };
    const db1 = new lowDBI();
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

test('Read multiples items and left join data from another lists in dbi', async () => {
    const lists = { messages: {}, users: {} };
    const db1 = new lowDBI();
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


test('Read multiples items and right join data from another lists in dbi', async () => {
    const lists = { messages: {}, users: {} };
    const db1 = new lowDBI();
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

test('Read multiple items in dbi width query', async () => {
    const lists = { messages: {} };
    const db1 = new lowDBI();
    await db1.init(lists, {});
    await db1.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
    await db1.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
    await db1.create('messages', { data: {id: 3, type: 'A', name: 'poppa doe'} });

    const results = await db1.find('messages', { where: { type: 'A' }});
    expect(results.length).toEqual(2);
});

test('Read multiple items in dbi without query', async () => {
    const lists = { messages: {} };
    const db1 = new lowDBI();
    await db1.init(lists, {});
    await db1.create('messages', { data: {id: 1, type: 'A', name: 'john doe'} });
    await db1.create('messages', { data: {id: 2, type: 'B', name: 'jane doe'} });
    await db1.create('messages', { data: {id: 3, type: 'A', name: 'poppa doe'} });

    const results = await db1.find('messages');
    expect(results.length).toEqual(3);
});

test('Update an item in dbi', async () => {
    const lists = { messages: {} };
    const db1 = new lowDBI();
    await db1.init(lists, {});
    await db1.create('messages', { data: {id: 1, name: 'john doe'} });

    const result = await db1.update('messages', { where: {id: 1}, data: {name: 'jane doe'} });
    expect(result.name).toEqual('jane doe');
});


test('Delete an item in dbi', async () => {
    const lists = { messages: {} };
    const db1 = new lowDBI();
    await db1.init(lists, {});
    await db1.create('messages', { data: {id: 1, name: 'john doe'} });

    await db1.delete('messages', { where: {id: 1} });
    const res = await db1.find('messages', { where: {} });
    expect(res.length).toEqual(0);
});

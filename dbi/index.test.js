const { KoiDB, getDbiClassMap, buildMethods } = require('./index.js');

const demoConfig = {
    dbs: {
        lowdb: { type: 'lowdb', config: {}}
    },
    lists: [
        { name: 'messages' }
    ]
}

test('Create a item in a database', async () => {
    const koiDB = await KoiDB(demoConfig);
    const result = await koiDB.create({'thing': 'abc'}, 'things', {}, {});

    expect(result).toBeTruthy();
});

test('return object map of dbis', () => {
    const dbis = getDbiClassMap(demoConfig);
    expect(typeof(dbis)).toBe('object');
});

test('return object map of action methods', () => {
    const dbis = getDbiClassMap(demoConfig);
    const actions = buildMethods(dbis, demoConfig);

    expect(typeof(actions)).toBe('object');
    [ 'create', 'find', 'findOne', 'update', 'delete' ].forEach(action => {
        expect(typeof(actions[action])).toBe('function')
    });
});



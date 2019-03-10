// Example 01
const config = {
    dbs: {
        myLowDB: {
            type: 'lowdb',
            config: {}
        }
    },
    lists: {
        messages: { db: 'myLowDB' },
        actions: { db: 'myLowDB' }
    }
}

const koiDB = KoiDB();
koiDB.save({'thing': 'abc'}, 'things', {}, {})

const apiA = restApi({
    dbi: koiDB,
    routerHook: async function(router) {
        addAllActions(router, 'images');
    }
});

const apiB = socketApi({
    dbi: koiDB,
    streams: async function(router) {
        addAllActions(router, 'messages');
        addAllActions(router, 'actions');

        // Stream event subscription
        // Create
        // Ping for clock syncronization
    }
});

// Auth, validation, how?
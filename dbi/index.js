const actionNames = [
    'create',
    'find',
    'findOne',
    'update',
    'delete'
];

module.exports.KoiDB = async function(config) {
    const dbiClassMap = getDbiClassMap(config);

    const dbiMap = Object
        .keys(dbiClassMap)
        .reduce((acc, key) => ({...acc, [key]: new dbiClassMap[key]()}), {});

    // Error handling here please
    const initPromises = Object.entries(dbiMap).map(([name, dbi]) => dbi.init(name, config));
    await Promise.all(initPromises);
    return buildMethods(dbiMap, config);
}

function getDbiForList(list, config, dbiMap) {
    const db = Object.keys(dbiMap).length === 1
        ? Object.entries(dbiMap).pop()[1]
        : dbiMap[config.lists[list].db];

    return db;
}
module.exports.getDbiForList = getDbiForList;

function getListsForDB(config, db) {
    if (Object.keys(config.dbs).length === 1) {
        return config.lists;
    } else {
        return Object
            .entries(config.lists)
            .filter(([key, value]) => value.db === db)
            .reduce((acc, [key, value]) => ({...acc, [key]:value }), {});
    }
}
module.exports.getListsForDB = getListsForDB;

function buildMethods(dbiMap, config) {
    return actionNames.reduce((actions, action) => {
        return {
            ...actions,
            [action]: (data, list) => {
                // When we do dual db's, consider calling it hydra mode. :D
                const dbi = getDbiForList(list, config, dbiMap)

                if (!dbi[action]) {
                    throw(`'${list}' list dbi is missing the '${action}' method`)
                }

                return dbi[action](data, list, config);
            }
        };
    }, {});
}
module.exports.buildMethods = buildMethods;

function getDbiClassMap(config) {
    const { dbs } = config;

    return Object
        .keys(dbs)
        .reduce((acc, key) => {
            try {
                return {
                    ...acc,
                    [key]: require(`./${dbs[key].type}/index.js`)
                };
            } catch(e) {
                throw(`Could not find ${key} dbi`);
            }
        }, {});
};
module.exports.getDbiClassMap = getDbiClassMap;
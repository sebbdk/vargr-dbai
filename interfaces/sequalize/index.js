const Sequelize = require('Sequelize');

/*

from nosql to sql problems

Create requires a table definition, no dynamic fields.. :/

Case 1, collection exists, grab definition from DB
Case 2, collection is being created, needs definition

 */

const Op = Sequelize.Op;
const operatorsAliases = {
  $or: Op.or,
  $like: Op.like,
  $notLike: Op.notLike,
  $gt: Op.gt,
  $gte: Op.gte,
  $lt: Op.lt,
  $lte: Op.lte,
}

const assocTypes = [
    "belongsTo",
    "hasMany"
];

module.exports = class {

    constructor() {
        this.collections = {};
    }

    async init({
        associations = {},
        unsafe = false,
        dbname = 'test',
        host = 'localhost',
        username = 'root',
        password = 'root',
        port = 3306,
        dialect = 'mysql',
        models = {} }) {
        this.db = new Sequelize(dbname, username, password, { host, port, dialect, logging: false, operatorsAliases });

        const err = await this.db.authenticate();

        if (err) {
            console.error('Sequalize connection error', err);
            return false;
        } else {
            const collectionNames = Object.keys(models);
            for(var c = 0; c < collectionNames.length; c++) {
                await this.createCollection(collectionNames[c], { data:[], modelDef: models[collectionNames[c]] });
            }

            await this.db.sync({force: unsafe});

            this.setupAssociations(associations);

            return true;
        }
    }

    setupAssociations(associations) {
        Object.keys(associations).forEach((fromAssoc) => {
            assocTypes.forEach((assocType) => {
                if(associations[fromAssoc][assocType]) {
                    const toAssocConf = associations[fromAssoc][assocType];
                    const toAssoc = this.collections[toAssocConf.model];

                    this.collections[fromAssoc][assocType](toAssoc, {foreignKey: toAssocConf.foreignKey});
                }
            })
        });
    }

    async close() {
        await this.db.close();
        return true;
    }

    async createCollection(collectionName, { initialItems = [], modelDef }) {
        if(modelDef && !this.collections[collectionName]) {
            this.collections[collectionName] = this.db.define(collectionName, modelDef, {
                freezeTableName: true,
                name: {
                    plural: collectionName,
                    singular: collectionName
                }
            });
        }

        if (this.collections[collectionName]) {
            if (initialItems.length > 0) {
                return await this.create(collectionName, initialItems)
            }

            return true;
        }

        return false;
    }

    async removeCollection(collectionName, { data = [], modelDef } = {}) {
        const res = await this.collections[collectionName].truncate();
        return  res;
    }

    async create(listName, { data, returnRef = true }) {
        try {
            const method = Array.isArray(data) ? 'bulkCreate' : 'create';
            const res = await this.collections[listName][method](data);

            if (!returnRef) {
                return true;
            }

            const findRes = Array.isArray(data) ? await res.map(el => el.get({ plain: true })) : res.get({ plain: true });
            return findRes;
        } catch(err) {
            console.error(err);
            return false;
        }
    };


    async find(listName, { where = {}, limit, offset, include =  false, orderBy } = {}) {
        try {
            const fixedInclude = Object.keys(include).reduce((acc, val) => {
                return [
                    ...acc,
                    {
                        model: this.collections[val],
                        required: include[val].required ? true : false
                    }
                ]
            }, []);

            let res = await this.collections[listName].findAll({
                where,
                limit,
                offset,
                order: orderBy ? [ orderBy ] : undefined,
                include: fixedInclude,
                //raw: true,
                nest: true
            });

            res = await res.map(el => el.get({ plain: true }))

            Object.keys(include).forEach(key => {
                res.map(subRes => {
                    subRes[key] = Array.isArray(subRes[key]) ? subRes[key] : [subRes[key]];
                })
            });

            return res;
        } catch(error) {
            console.error(error);
            return false;
        }

    }

    async findOne(listName, { where = {}, limit, offset, include =  false } = {}) {
        const fixedInclude = Object.keys(include).reduce((acc, val) => {
            return [
                ...acc,
                {
                    model: this.collections[val],
                    required: include[val].required
                }
            ]
        }, []);

        let res = await this.collections[listName].findOne({
            where,
            limit,
            offset,
            include: fixedInclude,
            //raw: true,
            nest: true
        });

        res = await res.get({ plain: true })

        Object.keys(include).forEach(key => {
            res[key] = Array.isArray(res[key]) ? res[key] : [res[key]];
        })

        return res;
    }

    async updateOne(listName, { data = {}, where = {}} = {}) {
        const item = await this.collections[listName].findOne({
            where,
            limit: 1
        });

        return await item.update(data);
    }

    async updateMany(listName, { data = {}, where = {}} = {}) {
        const res = await this.collections[listName].update(data, { where });
        return res[0] > 0;
    }

    async delete(listName, { where }) {
        return await this.collections[listName].destroy({ where });
    }

};
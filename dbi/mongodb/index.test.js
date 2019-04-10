const MongoDBDL = require('./index.js');

describe(`Mongo specific methods`, () => {
    let dba = null;

    beforeEach(async () => {
        dba = await new MongoDBDL();
        await dba.init({}, {});
        await dba.createCollection('messages', []);
    });

    afterEach(async () => {
        try {
            await dba.removeCollection('messages');
        } catch(e) {}
    });

    it('Get keys', async () => {
        await dba.create('messages', { data: { abc:'def', hello: 'ilikecake' } });
        await dba.create('messages', { data: { hangman: true } });

        const keys = await dba.getCollectionKeys('messages');

        expect(keys.indexOf('_id')).not.toBe(-1);
        expect(keys.indexOf('abc')).not.toBe(-1);
        expect(keys.indexOf('hello')).not.toBe(-1);
        expect(keys.indexOf('hangman')).not.toBe(-1);
    });
});


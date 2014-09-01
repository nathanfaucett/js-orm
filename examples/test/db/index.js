var ORM = require("../../../src");


var db = new ORM({

    defaultAdaptor: "sqlite",

    adaptors: {
        "sqlite": new ORM.SQLiteAdaptor()
    },
    schema: {
        file: "db/schema.json"
    },
    migrations: {
        folder: "db/migrate"
    }
});

module.exports = db;

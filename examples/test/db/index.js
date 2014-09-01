var ORM = require("../../../src");


var db = module.exports = new ORM({

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

require("../models/cart");
require("../models/user");

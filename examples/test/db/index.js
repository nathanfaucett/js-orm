var ORM = require("../../../src");


var db = module.exports = new ORM({

    defaultAdaptor: "memory",

    adaptors: {
        "memory": new ORM.MemoryAdaptor()
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

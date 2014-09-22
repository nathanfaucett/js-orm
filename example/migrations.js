var orm = require("../src/index"),
    SQLite3Adaptor = require("sqlite3_adaptor");


module.exports = {

    folder: __dirname + "/migrate",

    //adaptor: new orm.MemoryAdaptor()
    adaptor: new SQLite3Adaptor({
        file: __dirname + "/sqlite3_database"
    })
};

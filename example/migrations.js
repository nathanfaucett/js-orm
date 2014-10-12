//var orm = require("../src/index"),
var SQLite3Adapter = require("sqlite3_adapter");


module.exports = {

    folder: __dirname + "/migrate",

    //adapter: new orm.MemoryAdapter()
    adapter: new SQLite3Adapter({
        file: __dirname + "/sqlite.db"
    })
};

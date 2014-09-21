var orm = require("../src/index");


module.exports = {

    folder: __dirname + "/migrate",

    adaptor: new orm.MemoryAdaptor()
};

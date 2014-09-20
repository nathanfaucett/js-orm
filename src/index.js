var Collection = require("./collection"),
    Model = require("./model");


function orm(options) {

    return new Collection(options);
}

orm.define = function define(options) {

    return new Model(options);
};


orm.MemoryAdaptor = require("./memory_adaptor");


module.exports = orm;

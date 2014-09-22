var Collection = require("./collection"),
    Model = require("./model");


function orm(options) {

    return new Collection(options);
}

orm.define = function define(options) {

    return new Model(options);
};


orm.hooks = require("./hooks");
orm.functions = require("./functions");

orm.MemoryAdaptor = require("./memory_adaptor");


module.exports = orm;

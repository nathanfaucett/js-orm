var inflect = require("inflect"),
    utils = require("utils"),

    Collection = require("./collection");


function Collections(ctx) {

    this.ctx = ctx;

    this.values = [];
    this.hash = {};
}

Collections.prototype.init = function() {
    var values = this.values,
        i = 0,
        il = values.length;

    for (; i < il; i++) values[i].init();
    return this;
};

Collections.prototype.get = function(name) {
    var collection = this.hash[name];

    if (!collection) {
        throw new Error("get(name) Collection " + name + " not found make sure you defined it and required the file it was defined in");
    }

    return collection;
};

Collections.prototype.define = function(name, options) {
    if (utils.isObject(name)) {
        options = name;
        name = options.name;
    }
    options || (options = {});
    options.name = (name = inflect.classify(name, options.locale));

    if (!utils.isString(options.name)) throw new Error("define(options) options.name required as a string");

    var tableName = utils.isString(options.tableName) ? options.tableName : (options.tableName = inflect.tableize(name, options.locale)),
        hash = this.hash,
        index = hash[name],
        collection = null;

    if (!index) {
        collection = hash[name] = hash[tableName] = new Collection(this.ctx, options);
        collection.attributes = this.ctx.schema.table(tableName);

        this.values.push(collection);
    } else {
        throw new Error("define(options) " + name + " with table name " + tableName + " already member of ORM");
    }

    return collection;
};


module.exports = Collections;

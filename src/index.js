var utils = require("utils"),
    inflect = require("inflect"),
    EventEmitter = require("event_emitter"),

    Collection = require("./collection");


function ORM() {

    EventEmitter.call(this);

    this.autoMigrate = true;

    this.adaptors = {};
    this.collections = {};
}
EventEmitter.extend(ORM);

ORM.prototype.init = function(callback) {
    var _this = this,
        collections = this.collections,
        length = Object.keys(collections).length;

    function done(err) {
        if (err) {
            if (!callback && _this.listeners("init") === 0) throw new Error("ORM.init([callback]) failed to init with error:\n" + err.stack);
            callback && callback(err);
            _this.emit("init", err);
            return;
        }

        if (--length === 0) {
            callback && callback();
            _this.emit("init");
        }
    }

    for (var tableName in collections) collections[tableName].init(done);

    return this;
};

ORM.prototype.adaptor = function(name, adaptor) {
    if (adaptor == null) {
        adaptor = name;
        name = adaptor.name;
    }
    if (!utils.isString(name)) throw new Error("ORM.adaptor(name, adaptor) name required as a string, or adaptor does not have a name property");

    this.adaptors[name] = adaptor;
    return adaptor;
};

ORM.prototype.define = function(options) {
    options || (options = {});
    if (!utils.isString(options.name)) throw new Error("ORM.define(options) options.name required as a string");

    var name = (options.name = inflect.classify(options.name, options.locale)),
        tableName = utils.isString(options.tableName) ? options.tableName : (options.tableName = inflect.tableize(name, options.locale)),
        collections = this.collections,
        index = collections[tableName],
        collection = null;

    if (!index) {
        collection = collections[tableName] = new Collection(this, options);
    } else {
        throw new Error("ORM.define(options) " + tableName + " already member of ORM");
    }

    return collection;
};

module.exports = new ORM();

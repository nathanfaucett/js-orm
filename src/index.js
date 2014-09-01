var utils = require("utils"),
    inflect = require("inflect"),
    EventEmitter = require("event_emitter"),

    Schema = require("./schema"),
    Migrations = require("./migrations"),
    Collection = require("./collection"),

    SQLiteAdaptor = require("./sqlite_adaptor");


function ORM(options) {
    options || (options = {});

    EventEmitter.call(this);

    this.defaultAdaptor = options.defaultAdaptor;
    this.defaultPrimaryKeyFormat = options.defaultPrimaryKeyFormat || "integer";

    this.schema = new Schema(this, options.schema);
    this.migrations = new Migrations(this, options.migrations);
    this.collections = utils.create(null);
    this.adaptors = utils.create(null);

    if (utils.isObject(options.adaptors)) {
        var adaptors = options.adaptors;
        for (var key in adaptors) this.addAdaptor(key, adaptors[key]);
    }
}
EventEmitter.extend(ORM);

ORM.SQLiteAdaptor = SQLiteAdaptor;

ORM.prototype.init = function(callback) {
    var _this = this;

    this.schema.init(function(err) {
        if (err) {
            callback(err);
            return;
        }

        utils.async(
            utils.values(_this.adaptors).map(function(adaptor) {
                return function(next) {
                    adaptor.init(next);
                };
            }),
            function(err) {
                if (err) {
                    callback(err);
                    return;
                }

                utils.each(_this.collections, function(collection) {
                    collection.init();
                });

                callback();
            }
        );
    });
};

ORM.prototype.define = function(name, options) {
    var collections = this.collections,
        tableName;

    if (utils.isHash(name)) {
        options = name;
        name = options.name;
    } else {
        options || (options = {});
        options.name = name;
    }

    if (!utils.isString(options.name)) throw new Error("ORM.define(name, options) name must be a string");
    if (!utils.isHash(options)) throw new Error("ORM.define(name, options) options must be an object");
    if (collections[name]) throw new Error("ORM.define(name, options) Collection " + name + " already defined");

    tableName = options.tableName = utils.isString(options.tableName) ? options.tableName : inflect.tableize(options.name, options.locale);
    name = options.name = inflect.classify(options.name, options.locale);

    return (collections[name] = collections[tableName] = new Collection(this, options));
};

ORM.prototype.getCollection = function(name) {
    var collection = this.collections[name];

    if (!collection) throw new Error("ORM.getCollection(name) no collection defined named " + name);
    return collection;
};

ORM.prototype.addAdaptor = function(name, adaptor) {
    var adaptors = this.adaptors;

    if (utils.isObject(name)) {
        adaptor = name;
        name = adaptor.name;
    }

    if (!utils.isString(name)) throw new Error("ORM.addAdaptor(name, adaptor) name must be a string");
    if (!utils.isObject(adaptor)) throw new Error("ORM.addAdaptor(name, adaptor) adaptor must be an object");
    if (adaptors[name]) throw new Error("ORM.addAdaptor(name, adaptor) Adaptor " + name + " already added");

    adaptor.ctx = this;

    return (adaptors[name] = adaptor);
};

ORM.prototype.getAdaptor = function(name) {
    var adaptor = this.adaptors[name];

    if (!adaptor) throw new Error("ORM.getAdaptor(name) no adaptor found named " + name);
    return adaptor;
};


module.exports = ORM;

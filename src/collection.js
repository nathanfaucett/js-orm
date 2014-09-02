var utils = require("utils"),
    inflect = require("inflect"),
    Promise = require("promise"),
    validator = require("validator"),
    EventEmitter = require("event_emitter"),

    Database = require("./database");


function Collection(ctx, options) {
    utils.isHash(options) || (options = {});

    EventEmitter.call(this);

    this.ctx = ctx;
    this.adaptor = options.adaptor || ctx.defaultAdaptor;

    this.autoPK = options.autoPK != null ? !!options.autoPK : true;

    this.name = options.name;
    this.tableName = options.tableName;

    this.primaryKeyFormat = utils.isString(options.primaryKeyFormat) ? options.primaryKeyFormat : "integer";
    this.hasSchema = options.hasSchema != null ? !!options.hasSchema : true;

    this.prototype = {};
    this.schema = ctx.schema.getTable(this.tableName);

    this.database = new Database(this);

    this.Model = null;
}
EventEmitter.extend(Collection);

Collection.prototype.init = function() {
    if (utils.isString(this.adaptor)) {
        this.adaptor = this.ctx.getAdaptor(this.adaptor);
    }

    this.database.adaptor = this.adaptor;
    this.generateModel();

    return this;
};

Collection.prototype.new = function(attributes) {
    var model = new this.Model,
        keys, key, attribute, i;

    if (utils.isObject(attributes)) {
        keys = utils.keys(model);
        i = keys.length;

        while (i--) {
            key = keys[i];
            attribute = attributes[key];
            if (!(attribute === undefined || attribute === null)) model[key] = attribute;
        }
    }

    return model;
};

Collection.prototype.create = function(attributes, callback) {

    return this.save(this.new(attributes), callback);
};

Collection.prototype.save = function(model, callback) {
    var errors = this.validate(model, "save");

    if (errors) {
        if (utils.isFunction(callback)) {
            callback(errors);
            return undefined;
        } else {
            return Promise.reject(errors);
        }
    }

    return this.database.save(model, callback);
};

Collection.prototype.update = function(model, callback) {
    var errors = this.validate(model, "update");

    if (errors) {
        if (utils.isFunction(callback)) {
            callback(errors);
            return undefined;
        } else {
            return Promise.reject(errors);
        }
    }

    return this.database.update(model, callback);
};

Collection.prototype.all = function(callback) {

    return this.database.all(callback);
};

Collection.prototype.find = function(where, callback) {

    return this.database.find(where, callback);
};

Collection.prototype.findOne = function(where, callback) {

    return this.database.findOne(where, callback);
};

Collection.prototype.findById = function(id, callback) {
    if (utils.isObject(id)) id = id.id;

    return this.database.findById(id, callback);
};

Collection.prototype.delete = function(id, callback) {
    if (utils.isObject(id)) id = id.id;

    return this.database.delete(id, callback);
};

Collection.prototype.deleteWhere = function(where, callback) {

    return this.database.deleteWhere(where, callback);
};

Collection.prototype.deleteAll = function(callback) {

    return this.database.deleteAll(callback);
};

Collection.prototype.filter = function(values) {
    var has = utils.has,

        schema = this.schema,
        keys, i, il, key;

    if (!this.hasSchema) return values;

    keys = utils.keys(values)

    for (i = 0, il = keys.length; i < il; i++) {
        key = keys[i];
        if (!has(schema, key)) delete values[key];
    }

    return values;
};

Collection.prototype.defaults = function(values, action) {
    var has = utils.has,

        schema = this.schema,
        keys, i, il, key, value, defaultsTo;

    if (!this.hasSchema) return values;

    keys = utils.keys(schema)

    for (i = 0, il = keys.length; i < il; i++) {
        key = keys[i];
        value = values[key];
        defaultsTo = schema[key].defaultsTo;

        if (value || !defaultsTo) continue;

        if (defaultsTo === "NOW") {
            if (!value || (action === "save" && (key === "createdAt" || key === "created_at"))) values[key] = Date.now();
            if (!value || (action === "update" && (key === "updatedAt" || key === "updated_at"))) values[key] = Date.now();
        } else {
            values[key] = defaultsTo;
        }
    }

    return values;
};

Collection.prototype.validate = function(values, action) {
    var has = utils.has,
        isFunction = utils.isFunction,
        match = validator.match,

        schema = this.schema,
        validations = this.validations,
        errors = null,
        validation, value, args, attribute, defaultsTo, error, name, rule;

    this.filter(values);
    this.defaults(values, action);

    for (name in validations) {
        attribute = schema[name];
        validation = validations[name];
        value = values[name];

        if (value == null && (defaultsTo = attribute.defaultsTo)) {
            if (isFunction(defaultsTo)) {
                value = values[key] = defaultsTo();
            } else {
                value = values[key] = defaultsTo;
            }
        }

        if (!value && !has(validation, "required")) continue;

        for (rule in validation) {
            args = validation[rule];

            if (typeof(args) !== "boolean") {
                error = match(rule, value, args);
            } else {
                error = match(rule, value);
            }

            if (error) {
                (errors || (errors = [])).push(error);
                break;
            }
        }
    }

    return errors;
};

Collection.prototype.generateModel = function() {
    var collection = this;

    try {
        eval([
            "function " + this.name + "() {",
            generateModelAttributes(this),
            "}",
            generateModelPrototype(this),
            "this.Model = " + this.name + ";"
        ].join("\n"));
    } catch (e) {
        throw new Error("Collection.generateModel() failed to generate model for " + this.name + " with error " + e.message);
    }
};

function generateModelAttributes(collection) {
    var out = [],
        attributes = collection.schema,
        attribute;

    for (var name in attributes) {
        attribute = attributes[name];
        out.push("\tthis." + name + " = null;");
    }

    return out.join("\n");
}

function generateModelPrototype(collection) {
    var out = [],
        className = collection.name,
        fn;

    out.push(className + ".prototype = utils.create(collection.prototype);");
    out.push(className + ".prototype.constructor = " + className + ";");

    out.push(className + ".prototype.save = function (callback) {\n\treturn collection.save(this, callback);\n};");
    out.push(className + ".prototype.update = function (callback) {\n\treturn collection.update(this, callback);\n};");
    out.push(className + ".prototype.delete = function (callback) {\n\treturn collection.delete(this.id, callback);\n};");

    return out.join("\n");
}


module.exports = Collection;

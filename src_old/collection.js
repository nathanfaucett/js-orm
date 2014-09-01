var utils = require("utils"),
    inflect = require("inflect"),

    Datebase = require("./database");


function Collection(ctx, options) {
    options || (options = {});

    if (!utils.isString(options.name)) {
        throw new Error("Collection(name) name required as a string");
    }

    this.ctx = ctx;
    this.adaptor = options.adaptor || ctx.defaultAdaptor;
    this.database = new Datebase(this);

    this.name = inflect.classify(options.name, options.locale);
    this.tableName = utils.isString(options.tableName) ? options.tableName : inflect.tableize(this.name, options.locale);

    this.primaryKeyFormat = options.primaryKeyFormat != null ? options.primaryKeyFormat : "integer";
    this.hasSchema = options.hasSchema != null ? !!options.hasSchema : true;

    this.validations = {};
    this.prototype = {};

    this.attributes = null;
    this.Model = null;
}

Collection.prototype.init = function() {
    if (utils.isString(this.adaptor)) {
        this.adaptor = this.ctx.adaptors.get(this.adaptor);
    }

    this.database.adaptor = this.adaptor;
    this.generateModel();

    return this;
};

Collection.prototype.new = function(attributes) {
    var model = new this.Model;

    if (utils.isObject(attributes)) {
        utils.keys(model).forEach(function(key) {
            attribute = attributes[key];
            if (attribute != null) model[key] = attribute;
        });
    }

    return model;
};

Collection.prototype.create = function(attributes, callback) {

    return this.save(this.new(attributes), callback);
};

Collection.prototype.save = function(model, callback) {
    var errors;

    this.filter(model);
    errors = this.validate(model);

    if (errors != null) {
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
    var errors;

    this.filter(model);
    errors = this.validate(model);

    if (errors != null) {
        if (utils.isFunction(callback)) {
            callback(errors);
            return undefined;
        } else {
            return Promise.reject(errors);
        }
    }

    return this.database.save(model, callback);
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
    if (!this.hasSchema) return;
    var attributes = this.attributes;

    for (var key in values) {
        if (!attributes[key]) delete values[key];
    }
};

Collection.prototype.validate = function(values) {
    var attributes = this.attributes,
        validations = this.validations,
        errors, validation, value, args, attribute, defaultsTo, error;

    this.filter(values);

    for (var name in validations) {
        attribute = attributes[name];
        validation = validations[name];
        value = values[name];

        if (value == null && (defaultsTo = attribute.defaultsTo)) {
            if (utils.isFunction(defaultsTo)) {
                value = values[key] = defaultsTo();
            } else {
                value = values[key] = defaultsTo;
            }
        }

        if (!value && !utils.has(validation, "required")) continue;

        for (var rule in validation) {
            args = validation[rule];

            if (typeof(args) !== "boolean") {
                error = validator.match(rule, value, args);
            } else {
                error = validator.match(rule, value);
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
        attributes = collection.attributes,
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
        prototype = collection.prototype,
        fn;

    for (var name in prototype) {
        fn = prototype[name];
        out.push(className + ".prototype." + name + " = " + fn.toString() + ";");
    }

    out.push(className + ".prototype.save = function (callback) {\n\treturn collection.save(this, callback);\n};");
    out.push(className + ".prototype.update = function (callback) {\n\treturn collection.update(this, callback);\n};");
    out.push(className + ".prototype.delete = function (callback) {\n\treturn collection.delete(this.id, callback);\n};");

    return out.join("\n");
}


module.exports = Collection;

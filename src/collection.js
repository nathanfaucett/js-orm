var utils = require("utils"),
    inflect = require("inflect"),
    validator = require("validator"),

    Database = require("./database"),

    types = [
        "string",
        "text",
        "int",
        "integer",
        "float",
        "date",
        "time",
        "datetime",
        "bool",
        "boolean",
        "binary",
        "array",
        "json"
    ],
    reservedWords = [
        "default",
        "defaultsTo",
        "primaryKey",
        "foreignKey",
        "autoIncrement",
        "unique"
    ];


function Collection(context, options) {
    options || (options = {});
    if (!utils.isString(options.name)) {
        throw new Error("Collection(context, options) options.name required as a string");
    }

    this.context = context;
    this.adaptor = options.adaptor;
    this.database = new Database(this);

    this.name = inflect.classify(options.name, options.locale);
    this.tableName = utils.isString(options.tableName) ? options.tableName : inflect.tableize(this.name, options.locale);

    this.autoPK = options.autoPK != null ? !!options.autoPK : true;
    this.autoCreatedAt = options.autoCreatedAt != null ? !!options.autoCreatedAt : true;
    this.autoUpdatedAt = options.autoUpdatedAt != null ? !!options.autoUpdatedAt : true;
    this.primaryKeyFormat = utils.isString(options.primaryKeyFormat) ? options.primaryKeyFormat : "integer";

    this.hasSchema = options.hasSchema != null ? !!options.hasSchema : true;

    this.associations = [];
    this.attributes = {};
    this.validations = {};
    this.prototype = {};

    this.Model = null;

    initDefaults(this, options);
}

Collection.prototype.init = function(callback) {
    var name = this.name,
        collections = this.context.collections,
        associations = this.associations,
        i = associations.length,
        association, foreign, foreignName, foreignKey, i;

    while (i--) {
        association = associations[i];
        foreignName = association.through || association.name;
        foreign = collections[foreignName];
        if (!foreign) throw new Error(key + "(name, options) could not find collection " + foreignName + " make sure its define and the name is plural");

        if (association.foreign) {
            foreignKey = association.foreignKey || inflect.foreignKey(inflect.singularize(name, association.locale), association.key, false);

            foreign.addAttribute(foreignKey, {
                type: association.type || foreign.primaryKeyFormat,
                foreignKey: true
            });
        } else {
            foreignKey = association.foreignKey || inflect.foreignKey(inflect.singularize(foreignName, association.locale), association.key, false);

            this.addAttribute(foreignKey, {
                type: association.type || this.primaryKeyFormat,
                foreignKey: true
            });
        }
    }

    this.database.adaptor = findAdaptor(this, this.adaptor);
    this.generateModel();

    return this.database.init(callback);
};

Collection.prototype.new = function(attributes) {
    var model = new this.Model;

    if (utils.isObject(attributes)) {
        for (var key in model) {
            if (!utils.has(model, key)) continue;

            attribute = attributes[key];
            if (attribute != null) model[key] = attribute;
        }
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

    return this.database.findById(id, callback);
};

Collection.prototype.delete = function(id, callback) {

    return this.database.delete(id, callback);
};

Collection.prototype.deleteWhere = function(where, callback) {

    return this.database.deleteWhere(where, callback);
};

Collection.prototype.deleteAll = function(callback) {

    return this.database.deleteAll(callback);
};

Collection.prototype.filter = function(values) {
    if (this.hasSchema) return;
    var attributes = this.attributes;

    for (var key in values) {
        if (!attributes[key]) delete values[key];
    }
};

Collection.prototype.validate = function(values) {
    this.filter(values);
    var attributes = this.attributes,
        validations = this.validations,
        errors, validation, value, args, attribute, defaultsTo, error;

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

Collection.prototype.belongsTo = function(name, options) {
    if (!options || !utils.isObject(options)) options = {};
    options.name = inflect.pluralize(name, options.locale);
    options.foreign = false;

    this.associations.push(options);
    return this;
};

Collection.prototype.hasOne = function(name, options) {
    if (!options || !utils.isObject(options)) options = {};
    options.name = name;
    options.foreign = true;

    this.associations.push(options);
    return this;
};

Collection.prototype.hasMany = function(name, options) {
    if (!options || !utils.isObject(options)) options = {};
    options.name = name;
    options.foreign = true;

    this.associations.push(options);
    return this;
};

Collection.prototype.addAttribute = function(name, attribute) {
    if (!utils.isString(name)) {
        throw new Error("Collection.addAttribute(name, attribute) name must be a string");
    }
    if (name === "save" || name === "update" || name === "delete") {
        throw new Error("Collection.addAttribute(name, attribute) name can't be save, update or delete");
    }
    if (utils.isFunction(attribute)) {
        this.prototype[name] = attribute;
        return this;
    }
    if (utils.isString(attribute)) {
        attribute = {
            type: attribute
        };
    }
    if (!utils.isObject(attribute)) {
        throw new Error("Collection.addAttribute(name, attribute) attribute must be a string, function or object");
    }

    this.attributes[name] = parseAttribute(attribute);
    this.validations[name] = parseValidations(attribute);

    return this;
};

Collection.prototype.generateModel = function() {
    var collection = this,
        name = this.name,
        attributes = generateModelAttributes(this),
        prototype = generateModelPrototype(this),
        code = [
            "function " + name + "() {",
            attributes,
            "}",
            prototype,
            "this.Model = " + name + ";"
        ].join("\n");

    try {
        eval(code);
    } catch (e) {
        throw new Error("Collection.generateModel() failed to generate model for " + name + " with error " + e.message);
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

    out.push(className + ".prototype.save = function(callback) {\n\treturn collection.save(this, callback);\n};");
    out.push(className + ".prototype.update = function(callback) {\n\treturn collection.update(this, callback);\n};");
    out.push(className + ".prototype.delete = function(callback) {\n\treturn collection.delete(this.id, callback);\n};");

    return out.join("\n");
}

function parseAttribute(attribute) {
    var attr = {};

    for (var key in attribute) {
        value = attribute[key];

        if (key === "type") {
            attr[key] = types.indexOf(value) !== -1 ? value : "string";
        } else if (reservedWords.indexOf(key) !== -1) {
            attr[key] = value;
        }
    }

    return attr;
}

function parseValidations(attribute) {
    var attr = {};

    for (var key in attribute) {
        value = attribute[key];

        if (reservedWords.indexOf(key) === -1) {
            attr[key] = value;
        }
    }

    return attr;
}

function initDefaults(collection, options) {
    var attributes = options.attributes || (options.attributes = {}),
        hasPrimaryKey = false,
        now = {
            type: "datetime",
            default: "NOW"
        };

    for (var name in attributes) {
        if (utils.has(attributes[name], "primaryKey")) {
            hasPrimaryKey = true;
            break;
        }
    }

    if (hasPrimaryKey) collection.autoPK = false;

    if (!hasPrimaryKey && collection.autoPK && !attributes.id) {
        attributes.id = {
            type: collection.primaryKeyFormat,
            autoIncrement: true,
            primaryKey: true,
            unique: true
        };
    }

    if (collection.autoCreatedAt && !attributes.createdAt) attributes.createdAt = now;
    if (collection.autoUpdatedAt && !attributes.updatedAt) attributes.updatedAt = now;

    for (var name in attributes) collection.addAttribute(name, attributes[name]);
}

function findAdaptor(collection, adaptor) {
    if (utils.isString(adaptor)) {
        adaptor = collection.context.adaptors[adaptor];
    } else if (adaptor && adaptor.name) {
        collection.context.adaptors[adaptor.name] = adaptor;
    }
    if (!adaptor) throw new Error("Collection(options) adaptor is invalid");

    return adaptor;
}

module.exports = Collection;

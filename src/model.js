var EventEmitter = require("event_emitter"),
    inflect = require("inflect"),
    type = require("type"),
    each = require("each"),
    utils = require("utils"),
    Promise = require("promise"),
    validator = require("validator"),

    Query = require("./query");


var slice = Array.prototype.slice;


function Model(options) {
    if (!(this instanceof Model)) return new Model(options);

    options || (options = {});

    if (!type.isString(options.name)) {
        throw new Error("Model(options) name must be a string");
    }

    EventEmitter.call(this);

    this.adaptor = options.adaptor;

    this.className = inflect.capitalize(options.name);
    this.tableName = type.isString(options.tableName) ? options.tableName : inflect.tableize(this.className, options.locale);

    this.collection = null;
    this.schema = null;

    this.validations = {};
    this._wrappers = {};

    this.Class = null;
    this.prototype = {};

    return this;
}
EventEmitter.extend(Model);

Model.prototype.init = function() {
    var schema = this.schema,
        validations = this.validations;

    if (type.isString(this.adaptor)) {
        this.adaptor = this.collection.adaptors[this.adaptor];
    }
    if (!this.adaptor) {
        throw new Error("Model.init() no adaptor found with passed adaptor " + this.adaptor);
    }

    schema.hooks(this);

    this.generateClass();

    return this;
};

Model.prototype.new = function(attributes) {
    var instance = new this.Class,
        keys, key, attribute, i;

    if (type.isObject(attributes)) {
        keys = this.schema._keys;
        i = keys.length;

        while (i--) {
            key = keys[i];
            attribute = attributes[key];
            if (!(attribute === undefined || attribute === null)) instance[key] = attribute;
        }
    }

    return instance;
};

Model.prototype.create = function(attributes, callback) {
    var model = this.new(attributes);

    this.emit("beforeCreate", model);

    return this.save(model, callback);
};

Model.prototype.save = function(model, callback) {
    var _this = this,
        errors;

    model = this.schema.filter(model);
    errors = this.validate(model);

    if (errors) {
        if (type.isFunction(callback)) {
            callback(errors);
            return null;
        } else {
            return Promise.reject(errors);
        }
    }

    this.emit("beforeSave", model);

    if (type.isFunction(callback)) {
        this.adaptor.save(this.tableName, model, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            row = _this.new(row);
            _this.emit("save", row);
            callback(undefined, row);
        });
        return null;
    }

    return new Promise(function(resolve, reject) {
        _this.adaptor.save(_this.tableName, model, function(err, row) {
            if (err) {
                reject(err);
                return;
            }

            row = _this.new(row);
            _this.emit("save", row);
            resolve(row);
        });
    });
};

Model.prototype.update = function(model, callback) {
    var _this = this,
        errors;

    model = this.schema.filter(model);
    errors = this.validate(model);

    if (errors) {
        if (type.isFunction(callback)) {
            callback(errors);
            return null;
        } else {
            return Promise.reject(errors);
        }
    }

    this.emit("beforeUpdate", model);

    if (type.isFunction(callback)) {
        this.adaptor.update(this.tableName, model, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            row = _this.new(row);
            _this.emit("update", row);
            callback(undefined, row);
        });
        return null;
    }

    return new Promise(function(resolve, reject) {
        _this.adaptor.update(_this.tableName, model, function(err, row) {
            if (err) {
                reject(err);
                return;
            }

            row = _this.new(row);
            _this.emit("update", row);
            resolve(row);
        });
    });
};

Model.prototype.all = function(callback) {
    var _this = this;

    if (type.isFunction(callback)) {
        this.adaptor.all(this.tableName, function(err, rows) {
            if (err) {
                callback(err);
                return;
            }

            callback(undefined, Model_toModels(_this, rows));
        });
        return null;
    }

    return new Promise(function(resolve, reject) {
        _this.adaptor.all(_this.tableName, function(err, rows) {
            if (err) {
                reject(err);
                return;
            }

            resolve(Model_toModels(_this, rows));
        });
    });
};

Model.prototype.find = function(query, callback) {
    var _this = this;

    if (type.isFunction(query)) {
        callback = query;
        query = {};
    }

    if (type.isFunction(callback)) {
        if (query.where === undefined || query.where === null) {
            query.where = {};
        }

        this.adaptor.find(this.tableName, query, function(err, rows) {
            if (err) {
                callback(err);
                return;
            }

            callback(undefined, Model_toModels(_this, rows));
        });
        return null;
    }

    return new Query(this, "find", query);
};

Model.prototype.findOne = function(query, callback) {
    var _this = this;

    if (type.isFunction(query)) {
        callback = query;
        query = {};
    }

    if (type.isFunction(callback)) {
        if (query.where === undefined || query.where === null) {
            query.where = {};
        }

        this.adaptor.findOne(this.tableName, query, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            callback(undefined, _this.new(row));
        });
        return null;
    }

    return new Query(this, "findOne", query);
};

Model.prototype.findById = function(id, callback) {
    var _this = this;

    if (type.isFunction(callback)) {
        this.adaptor.findById(this.tableName, id, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            callback(undefined, _this.new(row));
        });
        return null;
    }

    return new Promise(function(resolve, reject) {
        _this.adaptor.findById(_this.tableName, id, function(err, row) {
            if (err) {
                reject(err);
                return;
            }

            resolve(_this.new(row));
        });
    });
};

Model.prototype["delete"] = function(model, callback) {
    var _this = this;

    this.emit("beforeDelete", model);

    if (type.isFunction(callback)) {
        this.adaptor["delete"](this.tableName, model.id, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            row = _this.new(row);
            _this.emit("delete", row);
            callback(undefined, row);
        });
        return null;
    }

    return new Promise(function(resolve, reject) {
        _this.adaptor["delete"](_this.tableName, model.id, function(err, row) {
            if (err) {
                reject(err);
                return;
            }

            row = _this.new(row);
            _this.emit("delete", row);
            resolve(row);
        });
    });
};

Model.prototype.deleteWhere = function(query, callback) {
    var _this = this;

    if (type.isFunction(query)) {
        callback = query;
        query = {};
    }

    if (type.isFunction(callback)) {
        this.emit("beforeDeleteWhere");

        if (query.where === undefined || query.where === null) {
            query.where = {};
        }

        this.adaptor.deleteWhere(this.tableName, query, function(err, rows) {
            var i;

            if (err) {
                callback(err);
                return;
            }

            rows = Model_toModels(_this, rows);
            i = rows.length;
            while (i--) _this.emit("delete", rows[i]);
            callback(undefined, rows);
        });
        return null;
    }

    return new Query(this, "deleteWhere", query);
};

Model.prototype.deleteAll = function(callback) {
    var _this = this;

    this.emit("beforeDeleteAll");

    if (type.isFunction(callback)) {
        this.adaptor.deleteAll(this.tableName, function(err, rows) {
            if (err) {
                callback(err);
                return;
            }

            _this.emit("deleteAll", rows);
            callback(undefined, Model_toModels(_this, rows));
        });
        return null;
    }

    return new Promise(function(resolve, reject) {
        _this.adaptor.deleteAll(_this.tableName, function(err, rows) {
            if (err) {
                reject(err);
                return;
            }

            _this.emit("deleteAll", rows);
            resolve(Model_toModels(_this, rows));
        });
    });
};

Model.prototype.validates = function(columnName) {
    var validations = this.validations,
        wrappers = this._wrappers,
        validation = validations[columnName] || (validations[columnName] = {}),
        wrapper = wrappers[columnName];

    if (!wrapper) {
        wrapper = wrappers[columnName] = {};

        each(validator.rules, function(rule, ruleName) {
            wrapper[ruleName] = function() {
                validation[ruleName] = arguments.length > 0 ? slice.call(arguments) : true;
                return wrapper;
            };
        });
    }

    return wrapper;
};

Model.prototype.validate = function(values) {
    var match = validator.match,
        validations = this.validations,
        keys = this.schema._keys,
        i = keys.length,
        key, validation, value, rule, args, err, error, errors;

    while (i--) {
        key = keys[i];
        value = values[key];
        validation = validations[key];

        if ((value === undefined || value === null) && (!validation || !validation.required)) continue;

        for (rule in validation) {
            args = validation[rule];

            if (typeof(args) === "boolean") {
                err = match(rule, value);
            } else {
                err = match(rule, value, args);
            }

            if (err) {
                (errors || (errors = {}));
                (errors[key] || (errors[key] = [])).push(err);
            }
        }
    }

    return errors;
};

Model.prototype.defineFindBy = function(key) {
    this[inflect.camelize("find_by_" + key, true)] = function(value, callback) {
        var _this = this,
            query = {
                where: {}
            };

        query.where[key] = value;

        if (type.isFunction(callback)) {
            this.adaptor.find(this.tableName, query, function(err, rows) {
                if (err) {
                    callback(err);
                    return;
                }

                callback(undefined, Model_toModels(_this, rows));
            });
            return null;
        }

        return new Promise(function(resolve, reject) {
            _this.adaptor.find(_this.tableName, query, function(err, rows) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(Model_toModels(_this, rows));
            });
        });
    };
};

Model.prototype.defineFindOneBy = function(key) {
    this[inflect.camelize("find_one_by_" + key, true)] = function(value, callback) {
        var _this = this,
            query = {
                where: {}
            };

        query.where[key] = value;

        if (type.isFunction(callback)) {
            this.adaptor.findOne(this.tableName, query, function(err, row) {
                if (err) {
                    callback(err);
                    return;
                }

                callback(undefined, _this.new(row));
            });
            return null;
        }

        return new Promise(function(resolve, reject) {
            _this.adaptor.findOne(_this.tableName, query, function(err, row) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(_this.new(row));
            });
        });
    };
};

Model.prototype.generateClass = function() {
    var collection = this;

    try {
        eval([
            "function " + this.className + "() {",
            Model_generateClassAttributes(this),
            "}",
            Model_generateClassPrototype(this),
            "this.Class = " + this.className + ";"
        ].join("\n"));
    } catch (e) {
        throw new Error("Model.generateClass() failed to generate model for " + this.className + " with error " + e.message);
    }
};

function Model_toModels(_this, array) {
    var i = array.length;

    while (i--) array[i] = _this.new(array[i]);
    return array;
}

function Model_generateClassAttributes(_this) {
    var out = [];

    each(_this.schema.columns, function(_, key) {
        out.push("\tthis." + key + " = null;");
    });

    return out.join("\n");
}

function Model_generateClassPrototype(_this) {
    var out = [],
        className = _this.className;

    out.push(
        className + ".prototype = collection.prototype;",
        className + ".prototype.constructor = " + className + ";",

        className + ".prototype.save = function (callback) {\n\treturn collection.save(this, callback);\n};",
        className + ".prototype.update = function (callback) {\n\treturn collection.update(this, callback);\n};",
        className + ".prototype.delete = function (callback) {\n\treturn collection.delete(this, callback);\n};"
    );

    return out.join("\n");
}


module.exports = Model;

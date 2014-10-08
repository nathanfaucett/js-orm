var EventEmitter = require("event_emitter"),
    each = require("each"),
    type = require("type"),
    inflect = require("inflect"),
    Promise = require("promise"),
    validator = require("validator"),

    Query = require("./query"),
    Table = require("./table"),
    hooks = require("./hooks");


var slice = Array.prototype.slice;


function Model(opts) {
    var options = {};

    opts || (opts = {});

    if (!type.isString(opts.name) && !type.isString(opts.className)) {
        throw new Error(
            "Model(options)\n" +
            "    options.name or options.className required as string ex {name: 'User'}"
        );
    }

    options.columns = opts.columns || opts.schema;
    options.functions = opts.functions;

    options.className = opts.name || opts.className;
    options.tableName = type.isString(opts.tableName) ? opts.tableName : inflect.tableize(options.className);

    options.autoId = (opts.autoId != null) ? opts.autoId : true;
    options.timestamps = (opts.timestamps != null) ? opts.timestamps : true;

    EventEmitter.call(this);

    this._options = options;

    this._init = false;
    this._collection = null;

    this._validations = {};
    this._wrappers = {};

    this._schema = new Table(options.tableName, options);

    this.Class = null;

    this.adaptor = opts.adaptor;

    this.className = options.className;
    this.tableName = options.tableName;

    this.prototype = {};
}
EventEmitter.extend(Model);

Model.prototype.init = function() {
    var _this = this,
        adaptor = this.adaptor || this._collection._options.defaultAdaptor,
        schema = this._schema;

    each(schema._functions, function(options, name) {
        var hookFunc = hooks[name],
            hook;

        if (!type.isFunction(hookFunc)) return;

        hook = hookFunc(type.isObject(options) ? options : {});

        each(hook.events, function(event, eventType) {
            if (type.isArray(event)) {
                each(event, function(e) {
                    _this.on(eventType, e);
                });
            } else if (type.isFunction(event)) {
                _this.on(eventType, event);
            }
        });
    });
    each(schema.columns, function(column, name) {

        _this.validates(name)[column.type]();
    });

    if (type.isString(adaptor)) {
        this.adaptor = this._collection.adaptor(adaptor);
    } else {
        this.adaptor = adaptor;
    }

    this.generateClass();
    this._wrappers = {};

    this.emit("init");

    return this;
};

Model.prototype.build = function(attributes) {
    var instance = new this.Class(),
        schema, columns, columnType, keys, key, attribute, i;

    if (type.isObject(attributes)) {
        schema = this._schema;
        columns = schema.columns;
        keys = schema._keys;
        i = keys.length;

        while (i--) {
            key = keys[i];
            attribute = attributes[key];
            columnType = columns[key].type;

            if (attribute !== undefined && attribute !== null) {
                if (columnType === "datetime") {
                    instance[key] = (new Date(attribute)).toJSON();
                } else {
                    instance[key] = attribute;
                }
            }
        }
    }

    return instance;
};

Model.prototype["new"] = Model.prototype.build;

Model.prototype.create = function(attributes, callback) {
    var _this = this,
        model = this.build(attributes),
        errors;

    this._schema.coerce(model);
    this.emit("beforeValidate", model);
    errors = this.validate(model);

    if (errors) {
        if (type.isFunction(callback)) {
            callback(errors);
            return null;
        } else {
            return Promise.reject(errors);
        }
    }

    this.emit("validate", model);
    this.emit("beforeCreate", model);

    if (type.isFunction(callback)) {
        this.adaptor.save(this.tableName, model, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            row = _this.build(row);
            _this.emit("create", row);
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

            row = _this.build(row);
            _this.emit("create", row);
            resolve(row);
        });
    });
};

Model.prototype.save = function(model, callback) {
    var _this = this,
        errors;

    model = this._schema.filter(model);
    this.emit("beforeValidate", model);
    errors = this.validate(model);

    if (errors) {
        if (type.isFunction(callback)) {
            callback(errors);
            return null;
        } else {
            return Promise.reject(errors);
        }
    }

    this.emit("validate", model);
    this.emit("beforeSave", model);

    if (type.isFunction(callback)) {
        this.adaptor.save(this.tableName, model, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            row = _this.build(row);
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

            row = _this.build(row);
            _this.emit("save", row);
            resolve(row);
        });
    });
};

Model.prototype.update = function(model, callback) {
    var _this = this,
        errors;

    model = this._schema.filter(model);
    this.emit("beforeValidate", model);
    errors = this.validate(model);

    if (errors) {
        if (type.isFunction(callback)) {
            callback(errors);
            return null;
        } else {
            return Promise.reject(errors);
        }
    }

    this.emit("validate", model);
    this.emit("beforeUpdate", model);

    if (type.isFunction(callback)) {
        this.adaptor.update(this.tableName, model, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            row = _this.build(row);
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

            row = _this.build(row);
            _this.emit("update", row);
            resolve(row);
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

            callback(undefined, _this.build(row));
        });
        return null;
    }

    return new Query(this, "findOne", query);
};

Model.prototype.destroy = function(model, callback) {
    var _this = this;

    this.emit("beforeDestroy", model);

    if (type.isFunction(callback)) {
        this.adaptor.destroy(this.tableName, model, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            row = _this.build(row);
            _this.emit("destroy", row);
            callback(undefined, row);
        });
        return null;
    }

    return new Promise(function(resolve, reject) {
        _this.adaptor.destroy(_this.tableName, model, function(err, row) {
            if (err) {
                reject(err);
                return;
            }

            row = _this.build(row);
            _this.emit("destroy", row);
            resolve(row);
        });
    });
};

Model.prototype.destroyWhere = function(query, callback) {
    var _this = this;

    if (type.isFunction(query)) {
        callback = query;
        query = {};
    }

    if (type.isFunction(callback)) {
        if (query.where === undefined || query.where === null) {
            query.where = {};
        }

        this.adaptor.destroy(this.tableName, query, function(err, rows) {
            if (err) {
                callback(err);
                return;
            }

            _this.emit("destroyWhere", rows);
            callback(undefined, Model_toModels(_this, rows));
        });
        return null;
    }

    return new Query(this, "destroyWhere", query);
};

Model.prototype.validates = function(columnName) {
    var validations = this._validations,
        wrappers = this._wrappers,
        validation = validations[columnName] || (validations[columnName] = {}),
        wrapper = wrappers[columnName];

    if (!wrapper) {
        wrapper = wrappers[columnName] = {};

        each(validator.rules, function(rule, ruleName) {
            wrapper[ruleName] = function() {
                validation[inflect.underscore(ruleName)] = arguments.length > 0 ? slice.call(arguments) : true;
                return wrapper;
            };
        });
    }

    return wrapper;
};

function ValidationError(tableName, columnName, value, rule, args) {

    this.tableName = tableName;
    this.columnName = columnName;
    this.value = value;
    this.rule = rule;
    this.args = args;
}

Model.prototype.validate = function(values) {
    var match = validator.match,
        validations = this._validations,
        keys = this._schema._keys,
        i = keys.length,
        key, validation, value, rule, args, error, errors;

    while (i--) {
        key = keys[i];
        value = values[key];
        validation = validations[key];

        if ((value === undefined || value === null) && (!validation || !validation.required)) continue;

        for (rule in validation) {
            args = validation[rule];

            if (typeof(args) === "boolean") {
                error = match(rule, value);
            } else {
                error = match(rule, value, args);
            }

            if (error) {
                (errors || (errors = [])).push(new ValidationError(this.tableName, key, value, rule, args));
            }
        }
    }

    return errors;
};

Model.prototype.generateClass = function() {
    var model = this,
        Class;

    try {
        eval([
            "function " + this.className + "() {",
            Model_generateClassAttributes(this),
            "}",
            "Class = " + this.className + ";"
        ].join("\n"));
    } catch (e) {
        throw new Error("Model.generateClass() failed to generate model for " + this.className + " with error " + e.message);
    }

    Class.prototype = model.prototype;
    Class.prototype.constructor = Class;

    Class.prototype.save = function(callback) {

        return model.save(this, callback);
    };

    Class.prototype.update = function(callback) {

        return model.update(this, callback);
    };

    Class.prototype.destroy = function(callback) {

        return model.destroy(this, callback);
    };

    this.Class = Class;

    return this;
};

function Model_toModels(_this, array) {
    var i = array.length;

    while (i--) array[i] = _this.build(array[i]);
    return array;
}

function Model_generateClassAttributes(_this) {
    var out = [];

    each(_this._schema.columns, function(_, key) {
        out.push("\tthis." + key + " = null;");
    });

    return out.join("\n");
}


module.exports = Model;

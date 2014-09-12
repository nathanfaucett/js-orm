var EventEmitter = require("event_emitter"),
    inflect = require("inflect"),
    type = require("type"),
    each = require("each"),
    Promise = require("promise"),

    Query = require("./query");


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

    this.Class = null;
    this.prototype = {};

    return this;
}
EventEmitter.extend(Model);

Model.prototype.init = function() {
    if (type.isString(this.adaptor)) {
        this.adaptor = this.collection.adaptors[this.adaptor];
    }
    if (!this.adaptor) {
        throw new Error("Model.init() no adaptor found with passed adaptor " + this.adaptor);
    }

    this.schema.hooks(this);

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

    return this.save(this.new(attributes), callback);
};

Model.prototype.save = function(model, callback) {
    var _this = this;

    model = this.filter(model);

    this.emit("beforeSave", model);

    if (type.isFunction(callback)) {
        this.adaptor.save(this.tableName, model, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            row = _this.new(row);
            _this.emit("save", row);
            callback(null, row);
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
    var _this = this;

    model = this.filter(model);

    this.emit("beforeUpdate", model);

    if (type.isFunction(callback)) {
        this.adaptor.update(this.tableName, model, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            row = _this.new(row);
            _this.emit("update", row);
            callback(null, row);
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

            callback(null, Model_toModels(_this, rows));
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

Model.prototype.find = function(where, callback) {
    var _this = this;

    if (type.isFunction(callback)) {
        this.adaptor.find(this.tableName, where, function(err, rows) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, Model_toModels(_this, rows));
        });
        return null;
    }

    return new Query(this, this.tableName, "find", where);
};

Model.prototype.findOne = function(where, callback) {
    var _this = this;

    if (type.isFunction(callback)) {
        this.adaptor.findOne(this.tableName, where, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, _this.new(row));
        });
        return null;
    }

    return new Query(this, this.tableName, "findOne", where);
};

Model.prototype.findById = function(id, callback) {
    var _this = this;

    if (type.isFunction(callback)) {
        this.adaptor.findById(this.tableName, id, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, _this.new(row));
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
            callback(null, row);
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

Model.prototype.deleteWhere = function(where, callback) {
    var _this = this;

    if (type.isFunction(callback)) {
        this.emit("beforeDeleteWhere", where);

        this.adaptor.deleteWhere(this.tableName, where, function(err, rows) {
            var i;

            if (err) {
                callback(err);
                return;
            }

            rows = Model_toModels(_this, rows);
            i = rows.length;
            while (i--) _this.emit("delete", rows[i]);
            callback(null, rows);
        });
        return null;
    }

    return new Query(this, this.tableName, "deleteWhere", where);
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
            callback(null, Model_toModels(_this, rows));
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

Model.prototype.filter = function(values) {

    return this.schema.filter(values);
};

Model.prototype.validate = function(values, action) {

    return null;
};

Model.prototype.generateClass = function() {
    var collection = this;

    try {
        eval([
            "function " + this.className + "() {",
            generateClassAttributes(this),
            "}",
            generateClassPrototype(this),
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

function generateClassAttributes(collection) {
    var out = [];

    each(collection.schema.columns, function(_, key) {
        out.push("\tthis." + key + " = null;");
    });

    return out.join("\n");
}

function generateClassPrototype(collection) {
    var out = [],
        className = collection.className;

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

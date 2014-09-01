var utils = require("utils");


function Database(collection) {

    this.collection = collection;
    this.tableName = collection.tableName;
    this.adaptor = null;
}

Database.prototype.init = function(callback) {

    return this.adaptor.init(this.collection, callback);
};

Database.prototype.toModel = function(rows) {
    if (!utils.isArray(rows)) return this.collection.new(rows);
    var collection = this.collection,
        i = rows.length;

    while (i--) rows[i] = collection.new(rows[i]);
    return rows;
};

Database.prototype.save = function(model, callback) {
    var _this = this;

    if (utils.isFunction(callback)) {
        _this.adaptor.save(_this.tableName, model, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, _this.toModel(row));
        });
        return null;
    }

    return new Promise(function(resolve, reject) {
        _this.adaptor.save(_this.tableName, model, function(err, row) {
            if (err) {
                reject(err);
                return;
            }

            resolve(_this.toModel(row));
        });
    });
};

Database.prototype.update = function(model, callback) {
    var _this = this;

    if (utils.isFunction(callback)) {
        _this.adaptor.update(_this.tableName, model, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, _this.toModel(row));
        });
        return null;
    }

    return new Promise(function(resolve, reject) {
        _this.adaptor.update(_this.tableName, model, function(err, row) {
            if (err) {
                reject(err);
                return;
            }

            resolve(_this.toModel(row));
        });
    });
};

Database.prototype.all = function(callback) {
    var _this = this;

    if (utils.isFunction(callback)) {
        _this.adaptor.all(_this.tableName, function(err, rows) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, _this.toModel(rows));
        });
        return null;
    }

    return new Promise(function(resolve, reject) {
        _this.adaptor.all(_this.tableName, function(err, rows) {
            if (err) {
                reject(err);
                return;
            }

            resolve(_this.toModel(rows));
        });
    });
};

Database.prototype.find = function(where, callback) {
    var _this = this;

    if (utils.isFunction(callback)) {
        _this.adaptor.find(_this.tableName, where, function(err, rows) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, _this.toModel(rows));
        });
        return null;
    }

    return new Promise(function(resolve, reject) {
        _this.adaptor.find(_this.tableName, where, function(err, rows) {
            if (err) {
                reject(err);
                return;
            }

            resolve(_this.toModel(rows));
        });
    });
};

Database.prototype.findOne = function(where, callback) {
    var _this = this;

    if (utils.isFunction(callback)) {
        _this.adaptor.findOne(_this.tableName, where, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, _this.toModel(row));
        });
        return null;
    }

    return new Promise(function(resolve, reject) {
        _this.adaptor.findOne(_this.tableName, where, function(err, row) {
            if (err) {
                reject(err);
                return;
            }

            resolve(_this.toModel(row));
        });
    });
};

Database.prototype.findById = function(id, callback) {
    var _this = this;

    if (utils.isFunction(callback)) {
        _this.adaptor.findById(_this.tableName, id, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, _this.toModel(row));
        });
        return null;
    }

    return new Promise(function(resolve, reject) {
        _this.adaptor.findById(_this.tableName, id, function(err, row) {
            if (err) {
                reject(err);
                return;
            }

            resolve(_this.toModel(row));
        });
    });
};

Database.prototype.delete = function(id, callback) {
    var _this = this;

    if (utils.isFunction(callback)) {
        _this.adaptor.delete(_this.tableName, id, function(err, row) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, _this.toModel(row));
        });
        return null;
    }

    return new Promise(function(resolve, reject) {
        _this.adaptor.delete(_this.tableName, id, function(err, row) {
            if (err) {
                reject(err);
                return;
            }

            resolve(_this.toModel(row));
        });
    });
};

Database.prototype.deleteWhere = function(where, callback) {
    var _this = this;

    if (utils.isFunction(callback)) {
        _this.adaptor.delete(_this.tableName, where, function(err, rows) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, _this.toModel(rows));
        });
        return null;
    }

    return new Promise(function(resolve, reject) {
        _this.adaptor.delete(_this.tableName, where, function(err, rows) {
            if (err) {
                reject(err);
                return;
            }

            resolve(_this.toModel(rows));
        });
    });
};

Database.prototype.deleteAll = function(callback) {
    var _this = this;

    if (utils.isFunction(callback)) {
        _this.adaptor.deleteAll(_this.tableName, function(err, rows) {
            if (err) {
                callback(err);
                return;
            }

            callback(null, _this.toModel(rows));
        });
        return null;
    }

    return new Promise(function(resolve, reject) {
        _this.adaptor.deleteAll(_this.tableName, function(err, rows) {
            if (err) {
                reject(err);
                return;
            }

            resolve(_this.toModel(rows));
        });
    });
};

module.exports = Database;

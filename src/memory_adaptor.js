var utils = require("utils"),
    Adaptor = require("./adaptor");


function MemoryAdaptor(options) {
    options || (options = {});
    options.name = "memory";

    Adaptor.call(this, options);

    this.counters = {};
    this.tables = {};
}
utils.inherits(MemoryAdaptor, Adaptor);

MemoryAdaptor.prototype.init = function(callback) {

    callback(null);
    return this;
};

MemoryAdaptor.prototype.table = function(name) {
    var tables = this.tables;

    return tables[name] || (tables[name] = []);
};

MemoryAdaptor.prototype.counter = function(name) {
    var counters = this.counters,
        counter = ++counters[name] || (counters[name] = 1);

    return counter;
};

MemoryAdaptor.prototype.save = function(name, attrs, callback) {
    var _this = this,
        schema = this.ctx.schema.getTable(name);

    if (schema.id) attrs.id = _this.counter(name);

    process.nextTick(function() {

        _this.table(name).push(attrs);
        callback(null, utils.copy(attrs));
    });
    return this;
};

MemoryAdaptor.prototype.update = function(name, attrs, callback) {
    var _this = this;

    process.nextTick(function() {

        _this.table(name).push(attrs);
        callback(null, utils.copy(attrs));
    });
    return this;
};

MemoryAdaptor.prototype.all = function(name, callback) {
    var _this = this;

    process.nextTick(function() {

        callback(null, utils.copy(_this.table(name)));
    });
    return this;
};

MemoryAdaptor.prototype.find = function(name, where, callback) {
    var _this = this;

    process.nextTick(function() {

        callback(null, utils.copy(findWhere(_this.table(name), where)));
    });
    return this;
};

MemoryAdaptor.prototype.findOne = function(name, where, callback) {
    var _this = this;

    process.nextTick(function() {

        callback(null, utils.copy(findOneWhere(_this.table(name), where)));
    });
    return this;
};

MemoryAdaptor.prototype.findById = function(name, id, callback) {
    var _this = this;

    process.nextTick(function() {

        callback(null, utils.copy(findOneWhere(_this.table(name), {
            id: id
        })));
    });
    return this;
};

MemoryAdaptor.prototype.delete = function(name, id, callback) {
    var _this = this;

    process.nextTick(function() {

        callback(null, utils.copy(removeOneWhere(_this.table(name), {
            id: id
        })));
    });
    return this;
};

MemoryAdaptor.prototype.deleteWhere = function(name, where, callback) {
    var _this = this;

    process.nextTick(function() {

        callback(null, utils.copy(removeWhere(_this.table(name), where)));
    });
    return this;
};

MemoryAdaptor.prototype.deleteAll = function(name, callback) {
    var _this = this,
        table = _this.table(name);

    process.nextTick(function() {

        callback(null, utils.copy(table));
        table.length = 0;
    });
    return this;
};

MemoryAdaptor.prototype.createTable = function(name, options, callback) {

    process.nextTick(callback);
    return this;
};

MemoryAdaptor.prototype.dropTable = function(name, callback) {

    process.nextTick(callback);
    return this;
};

MemoryAdaptor.prototype.renameTable = function(oldName, newName, callback) {

    process.nextTick(callback);
    return this;
};

MemoryAdaptor.prototype.addColumn = function(tableName, columnName, attribute, callback) {

    process.nextTick(callback);
    return this;
};

MemoryAdaptor.prototype.renameColumn = function(tableName, columnName, newColumnName, callback) {

    process.nextTick(callback);
    return this;
};

MemoryAdaptor.prototype.removeColumn = function(tableName, columnName, options, callback) {

    process.nextTick(callback);
    return this;
};

MemoryAdaptor.prototype.addIndex = function(tableName, columnName, options, callback) {

    process.nextTick(callback);
    return this;
};

MemoryAdaptor.prototype.removeIndex = function(tableName, columnName, options, callback) {

    process.nextTick(callback);
    return this;
};


function findWhere(array, where) {
    var i = 0,
        il = array.length,
        out = [],
        k = 0,
        keys, length, j, key, row, pass;

    if (i === 0) return out;

    keys = utils.keys(where);
    length = keys.length;

    while (++i < il) {
        row = array[i];
        pass = true;

        j = length;
        while (j--) {
            key = keys[j];
            if (where[key] !== row[key]) pass = false;
        }
        if (pass) out[k++] = row;
    }

    return out;
}

function findOneWhere(array, where) {
    var i = 0,
        il = array.length,
        k = 0,
        keys, length, j, key, row, pass;

    if (i === 0) return out;

    keys = utils.keys(where);
    length = keys.length;

    while (++i < il) {
        row = array[i];
        pass = true;

        j = length;
        while (j--) {
            key = keys[j];
            if (where[key] !== row[key]) pass = false;
        }
        if (pass) return row;
    }

    return null;
}

function removeWhere(array, where) {
    var i = array.length,
        removed = [],
        k = 0,
        keys, length, j, key, row, pass;

    if (i === 0) return removed;

    keys = utils.keys(where);
    length = keys.length;

    while (i--) {
        row = array[i];
        pass = true;

        j = length;
        while (j--) {
            key = keys[j];
            if (where[key] !== row[key]) pass = false;
        }
        if (pass) {
            removed[k++] = row;
            array.splice(i, 1);
        }
    }

    return removed;
}

function removeOneWhere(array, where) {
    var i = array.length,
        k = 0,
        keys, length, j, key, row, pass;

    if (i === 0) return null;

    keys = utils.keys(where);
    length = keys.length;

    while (i--) {
        row = array[i];
        pass = true;

        j = length;
        while (j--) {
            key = keys[j];
            if (where[key] !== row[key]) pass = false;
        }
        if (pass) {
            array.splice(i, 1);
            return row;
        }
    }

    return null;
}


module.exports = MemoryAdaptor;

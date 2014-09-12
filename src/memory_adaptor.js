var utils = require("utils"),
    each = require("each");

function findWhere(array, where) {
    var i = array.length,
        keys = utils.keys(where),
        length = keys.length,
        results = [],
        k = 0,
        item, j, key;

    while (i--) {
        item = array[i];

        j = length;
        while (j--) {
            key = keys[j];
            if (item[key] === where[key]) {
                results[k++] = item;
            }
        }
    }

    return results;
}

function findOneWhere(array, where) {
    var i = array.length,
        keys = utils.keys(where),
        length = keys.length,
        item, j, key;

    while (i--) {
        item = array[i];

        j = length;
        while (j--) {
            key = keys[j];
            if (item[key] === where[key]) {
                return item;
            }
        }
    }

    return null;
}

function MemoryTable(schema) {
    var counters = {};

    this.schema = schema;

    this.counters = counters;
    this.rows = [];

    each(schema.columns, function(column, columnName) {
        each(column, function(value, key) {
            if (key === "autoIncrement") {
                counters[columnName] = 1;
            }
        });
    });
}

MemoryTable.prototype.save = function(where, callback) {
    var row = {};

    each(this.counters, function(counter, key, counters) {
        where[key] = counters[key]++;
    });

    each(this.schema.columns, function(column, key) {
        var value = where[key];

        if (value === undefined) {
            row[key] = null;
        } else {
            row[key] = value;
        }
    });

    this.rows.push(row);

    callback(null, row);
};

MemoryTable.prototype.update = function(model, callback) {
    var row = findOneWhere(this.rows, {
        id: model.id
    });

    if (!row) {
        callback(new Error("MemoryAdaptor update() no row found where id=" + model.id));
        return;
    }

    each(this.schema.columns, function(column, key) {
        var value = where[key];

        if (value !== undefined) {
            row[key] = value;
        }
    });

    callback(null, utils.copy(row));
};

MemoryTable.prototype.all = function(callback) {

    callback(null, each.map(this.rows, utils.copy));
};

MemoryTable.prototype.find = function(where, callback) {
    var rows = findWhere(this.rows, where);

    callback(null, each.map(rows, utils.copy));
};

MemoryTable.prototype.findOne = function(where, callback) {
    var row = findOneWhere(this.rows, where);

    callback(null, utils.copy(row));
};

MemoryTable.prototype.findById = function(id, callback) {
    var row = findOneWhere(this.rows, {
        id: id
    });

    callback(null, utils.copy(row));
};

MemoryTable.prototype["delete"] = function(id, callback) {
    var rows = this.rows,
        row = findOneWhere(rows, {
            id: id
        });

    if (!row) {
        callback(new Error("MemoryAdaptor delete() no row found where id=" + id));
        return;
    }

    rows.splice(utils.indexOf(rows, row), 1);
    callback(null, utils.copy(row));
};

MemoryTable.prototype.deleteWhere = function(where, callback) {
    var rows = this.rows,
        toDelete = findWhere(rows, where),
        i = toDelete.length;

    while (i--) {
        rows.splice(utils.indexOf(rows, toDelete[i]), 1);
    }

    callback(null, each(toDelete, utils.copy));
};

MemoryTable.prototype.deleteAll = function(callback) {
    var rows = each.map(this.rows, utils.copy);

    this.rows.length = 0;
    callback(null, rows);
};


function MemoryAdaptor() {

    this.collection = null;
    this.tables = {};
}

MemoryAdaptor.prototype.init = function(callback) {
    var _this = this,
        tables = this.tables,
        schema = this.collection.schema;

    process.nextTick(function() {

        each(schema.tables, function(tableSchema, tableName) {

            tables[tableName] = new MemoryTable(tableSchema);
        });
        callback();
    });
    return this;
};

MemoryAdaptor.prototype.save = function(tableName, where, callback) {
    var _this = this;

    process.nextTick(function() {
        _this.tables[tableName].save(where, callback);
    });
};

MemoryAdaptor.prototype.update = function(tableName, model, callback) {
    var _this = this;

    process.nextTick(function() {
        _this.tables[tableName].update(model, callback);
    });
};

MemoryAdaptor.prototype.all = function(tableName, callback) {
    var _this = this;

    process.nextTick(function() {
        _this.tables[tableName].all(callback);
    });
};

MemoryAdaptor.prototype.find = function(tableName, where, callback) {
    var _this = this;

    process.nextTick(function() {
        _this.tables[tableName].find(where, callback);
    });
};

MemoryAdaptor.prototype.findOne = function(tableName, where, callback) {
    var _this = this;

    process.nextTick(function() {
        _this.tables[tableName].findOne(where, callback);
    });
};

MemoryAdaptor.prototype.findById = function(tableName, id, callback) {
    var _this = this;

    process.nextTick(function() {
        _this.tables[tableName].findById(id, callback);
    });
};

MemoryAdaptor.prototype["delete"] = function(tableName, id, callback) {
    var _this = this;

    process.nextTick(function() {
        _this.tables[tableName]["delete"](id, callback);
    });
};

MemoryAdaptor.prototype.deleteWhere = function(tableName, where, callback) {
    var _this = this;

    process.nextTick(function() {
        _this.tables[tableName].deleteWhere(where, callback);
    });
};

MemoryAdaptor.prototype.deleteAll = function(tableName, callback) {
    var _this = this;

    process.nextTick(function() {
        _this.tables[tableName].deleteAll(callback);
    });
};


module.exports = MemoryAdaptor;

var utils = require("utils"),
    type = require("type"),
    each = require("each");


function buildSort(columns, key, order) {
    var typeStr = columns[key].type;

    if (typeStr === "float" || typeStr === "integer") {
        return (
            order === "ASC" ?
            function sortNumber(a, b) {
                return a[key] - b[key];
            } :
            function sortNumber(a, b) {
                return b[key] - a[key];
            }
        );
    } else if (typeStr === "string") {
        return (
            order === "ASC" ?
            function sortString(a, b) {
                return a[key] < b[key] ? -1 : 1;
            } :
            function sortString(a, b) {
                return a[key] < b[key] ? 1 : -1;
            }
        );
    } else if (typeStr === "datetime") {
        return (
            order === "ASC" ?
            function sortDate(a, b) {
                return Date.parse(a[key]) < Date.parse(b[key]) ? -1 : 1;
            } :
            function sortDate(a, b) {
                return Date.parse(a[key]) < Date.parse(b[key]) ? 1 : -1;
            }
        );
    } else {
        return false;
    }
}

function queryAll(columns, array, query) {
    var i = (query.skip || 0) - 1,
        il = array.length,

        where = query.where,
        keys = utils.keys(where),
        length = keys.length,

        results = [],
        k = 0,

        limit = +query.limit,
        order = query.order,

        item, pass, j, key, sortFn;

    while (++i < il) {
        item = array[i];
        pass = true

        j = length;
        while (j-- && pass) {
            key = keys[j];
            pass = compare(item[key], where[key]);
        }

        if (pass) {
            results[k++] = item;
            if (limit > -1 && k >= limit) {
                break;
            }
        }
    }

    if (order) {
        sortFn = buildSort(columns, order[0], order[1]);

        if (sortFn) {
            results.sort(sortFn);
        }
    }

    return results;
}

function queryOne(columns, array, query) {
    var i = (query.skip || 0) - 1,
        il = array.length,

        where = query.where,
        keys = utils.keys(where),
        length = keys.length,

        item, pass, j, key;

    while (++i < il) {
        item = array[i];
        pass = true

        j = length;
        while (j-- && pass) {
            key = keys[j];
            pass = compare(item[key], where[key]);
        }

        if (pass) {
            return item;
        }
    }

    return null;
}

function compare(value, whereValue) {
    var key;

    if (type.isObject(whereValue)) {
        var pass = true;

        for (key in whereValue) {
            pass = conditions[key](value, whereValue[key]);
        }

        return pass;
    }

    return value === whereValue;
}

var conditions = {
    gt: function(a, b) {
        return a > b;
    },
    gte: function(a, b) {
        return a >= b;
    },
    lt: function(a, b) {
        return a < b;
    },
    lte: function(a, b) {
        return a <= b;
    },
    "in": function(a, b) {
        return utils.indexOf(b, a) !== -1;
    },
    inq: function(a, b) {
        return utils.indexOf(b, a) !== -1;
    },
    ne: function(a, b) {
        return a !== b;
    },
    neq: function(a, b) {
        return a !== b;
    },
    nin: function(a, b) {
        return utils.indexOf(b, a) === -1;
    }
};


function MemoryAdaptor() {

    this._collection = null;
    this._tables = {};
}

MemoryAdaptor.prototype.init = function(callback) {
    var _this = this,
        tables = this._tables,
        schema = this._collection._schema;

    process.nextTick(function() {

        each(schema.tables, function(tableSchema, tableName) {
            var counters = {};

            each(tableSchema.columns, function(column, columnName) {
                each(column, function(value, key) {
                    if (key === "autoIncrement") {
                        counters[columnName] = 1;
                    }
                });
            });

            tables[tableName] = {
                counters: counters,
                schema: tableSchema,
                rows: []
            };
        });

        callback();
    });
    return this;
};

MemoryAdaptor.prototype.save = function(tableName, params, callback) {
    var table = this._tables[tableName],
        columns = table.schema.columns;

    process.nextTick(function() {
        var row = {};

        each(table.counters, function(counter, key, counters) {
            params[key] = counters[key]++;
        });

        each(table.schema._keys, function(key) {
            var value = params[key],
                columnType = columns[key].type;

            if (value === undefined) {
                row[key] = null;
            } else {
                if (columnType === "datetime") {
                    row[key] = type.isDate(value) ? value.toJSON() : (new Date(value).toJSON());
                } else {
                    row[key] = value;
                }
            }
        });

        table.rows.push(row);
        callback(undefined, row);
    });
    return this;
};

MemoryAdaptor.prototype.update = function(tableName, params, callback) {
    var table = this._tables[tableName],
        columns = table.schema.columns;

    process.nextTick(function() {
        var row = queryOne(table.rows, {
            where: {
                id: params.id
            }
        });

        if (!row) {
            callback(new Error("MemoryAdaptor update(tableName, params, callback) no row found where id=" + params.id));
            return;
        }

        each(table.schema._keys, function(key) {
            var value = params[key];

            if (value !== undefined) {
                if (columns[key].type === "datetime") {
                    row[key] = type.isDate(value) ? value.toJSON() : (new Date(value).toJSON());
                } else {
                    row[key] = value;
                }
            }
        });

        callback(undefined, utils.copy(row));
    });
    return this;
};

MemoryAdaptor.prototype.find = function(tableName, query, callback) {
    var table = this._tables[tableName];

    process.nextTick(function() {
        var rows = queryAll(table.schema.columns, table.rows, query);

        callback(undefined, each.map(rows, utils.copy));
    });
    return this;
};

MemoryAdaptor.prototype.findOne = function(tableName, query, callback) {
    var table = this._tables[tableName];

    process.nextTick(function() {
        var row = queryOne(table.schema[tableName].columns, table.rows, query);

        callback(undefined, utils.copy(row));
    });
    return this;
};

MemoryAdaptor.prototype.destroy = function(tableName, params, callback) {
    var table = this._tables[tableName];

    process.nextTick(function() {
        var rows = table.rows,
            row = queryOne(rows, {
                where: {
                    id: params.id
                }
            });

        if (!row) {
            callback(new Error("MemoryAdaptor destroy(tableName, params, callback) no row found where id=" + params.id));
            return;
        }

        rows.splice(utils.indexOf(rows, row), 1);
        callback(undefined, utils.copy(row));
    });
    return this;
};

MemoryAdaptor.prototype.destroyWhere = function(tableName, query, callback) {
    var table = this._tables[tableName];

    process.nextTick(function() {
        var rows = table.rows,
            result = queryAll(table.schema.columns, rows, query),
            i = result.length;

        while (i--) {
            rows.splice(utils.indexOf(rows, result[i]), 1);
        }

        callback(undefined, each(result, utils.copy));
    });
    return this;
};


module.exports = MemoryAdaptor;

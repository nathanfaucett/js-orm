var utils = require("utils"),
    inflect = require("inflect"),
    fs = require("fs"),
    fileUtils = require("file_utils"),
    filePath = require("file_path"),
    EventEmitter = require("event_emitter");


var types = [
        "string",
        "text",
        "int",
        "integer",
        "float",
        "decimal",
        "double",
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
        "null",
        "default",
        "defaultsTo",
        "primaryKey",
        "foreignKey",
        "autoIncrement",
        "unique"
    ],
    functionWords = [
        "belongsTo",
        "hasMany",
        "hasOne",
        "timestamps"
    ];


function Schema(ctx, options) {
    utils.isHash(options) || (options = {});

    EventEmitter.call(this);

    this.ctx = ctx;
    this.tables = utils.create(null);

    this.file = utils.isString(options.file) ? options.file : "./db/schema.json;"
}
EventEmitter.extend(Schema);

Schema.prototype.init = function(callback) {
    var _this = this,
        file = this.file;

    fileUtils.mkdirP(filePath.dir(file), function(err) {
        if (err) {
            callback(err);
            return;
        }

        fs.readFile(file, function(err, buffer) {
            var json, tableName;

            if (err) {
                fs.writeFile(file, "{\n\t\n}\n", callback);
                return;
            }

            json = utils.tryParseJSON(buffer.toString());

            if (json) {
                for (tableName in json) {
                    _this.createTable(tableName, json[tableName]);
                }
            }

            callback(null);
        });
    });

    return this;
};

Schema.prototype.save = function(callback) {

    fs.writeFile(this.file, JSON.stringify(this.tables, null, 2), callback);
};

Schema.prototype.getTable = function(tableName) {
    var tables = this.tables,
        table = tables[tableName] || (tables[tableName] = utils.create(null));

    return table;
};

Schema.prototype.removeTable = function(tableName) {
    var tables = this.tables,
        table = tables[tableName]

    if (table) delete tables[tableName];
    return !!table;
};

Schema.prototype.renameTable = function(tableName, newTableName) {
    var tables = this.tables,
        table = tables[tableName];

    if (table) {
        delete tables[tableName];
        tables[newTableName] = table;
    } else {
        table = this.getTable(newTableName);
    }

    return table;
};

Schema.prototype.getColumn = function(tableName, columnName) {
    var table = this.getTable(tableName),
        column = table[columnName] || (table[columnName] = utils.create(null));

    return column;
};

Schema.prototype.removeColumn = function(tableName, columnName) {
    var table = this.getTable(tableName),
        column = table[columnName];

    if (column) delete table[columnName];
    return !!column;
};

Schema.prototype.renameColumn = function(tableName, columnName, newColumnName) {
    var table = this.getTable(tableName),
        column = table[columnName];

    if (column) {
        delete table[columnName];
        table[newColumnName] = column;
    } else {
        column = this.getColumn(tableName, newColumnName);
    }

    return column;
};

Schema.prototype.createTable = function(tableName, columns, options) {
    var has = utils.has,

        parsed = utils.create(null),
        table = this.getTable(tableName),
        collection = this.ctx.getCollection(tableName),
        columnName, column, parsedColumn, hasPK, createdAt, updatedAt;

    for (columnName in columns) {
        if (has(columns[columnName], "primaryKey")) hasPK = true;
    }

    if (!hasPK && collection.autoPK && !columns.id && !table.id) {
        columns.id = {
            type: collection.primaryKeyFormat || this.ctx.defaultPrimaryKeyFormat || "integer",
            autoIncrement: true,
            primaryKey: true
        };
    }

    if (has(columns, "timestamps")) {
        if (options && options.underscore === true) {
            createdAt = "created_at";
            updatedAt = "updated_at";
        } else {
            createdAt = "createdAt";
            updatedAt = "updatedAt";
        }

        if (!table[createdAt]) {
            columns[createdAt] = {
                type: "datetime",
                defaultsTo: "NOW"
            };
        }
        if (!table[updatedAt]) {
            columns[updatedAt] = {
                type: "datetime",
                defaultsTo: "NOW"
            };
        }

        delete columns.timestamps;
    }

    for (columnName in columns) {
        if (!has(columns, columnName)) continue;

        column = columns[columnName];

        if ((parsedColumn = this.createColumn(tableName, columnName, column, options))) {
            parsed[columnName] = parsedColumn;
        }
    }

    return parsed;
};

Schema.prototype.createColumn = function(tableName, columnName, column, options) {
    var parsed, attrName, attr;

    if (functionWords.indexOf(columnName) !== -1) return false;
    if (utils.isString(column) && types.indexOf(column) !== -1) {
        column = {
            type: column
        };
    }
    if (!utils.isHash(column)) return false;

    parsed = utils.create(null);

    for (attrName in column) {
        if (!utils.has(column, attrName)) continue;

        attr = column[attrName];

        if (attrName === "type") {
            parsed[attrName] = parseType(attr);
        } else if (reservedWords.indexOf(attrName) !== -1) {
            parsed[attrName] = attr;
        }
    }
    utils.extend(this.getColumn(tableName, columnName), parsed);

    return parsed;
};

Schema.prototype.removeColumnAttributes = function(tableName, columnName, attributes, options) {
    var column = this.getColumn(tableName, columnName),
        attrName, attr;

    for (attrName in attributes) {
        if (!utils.has(column, attrName)) continue;

        attr = column[attrName];
        delete column[attrName];
        parsed[attrName] = attr;
    }

    return parsed;
};

function parseType(type) {
    if (types.indexOf(type) === -1) throw new Error("parseType(type) type must be one of " + types.join(", "));

    if (type === "int") {
        return "integer"
    } else if (type === "double" || type === "decimal") {
        return "float";
    } else if (type === "bool") {
        return "boolean";
    } else if (type === "date" || type === "time") {
        return "datetime";
    }

    return type;
};


module.exports = Schema;
var fs = require("fs"),

    utils = require("utils"),
    inflect = require("inflect"),
    fileUtils = require("file_utils"),
    filePath = require("file_path"),

    types = [
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


function Schema(ctx, opts) {
    opts || (opts = {});

    this.ctx = ctx;

    this.fileName = utils.isString(opts.fileName) ? opts.fileName : "./db/schema.json";
    this.values = Object.create(null);

    this.functions = utils.copy(Schema.prototype._functions);
}

Schema.prototype.init = function(callback) {
    var _this = this,
        fileName = this.fileName;

    fileUtils.mkdirP(filePath.dir(fileName), function(err) {
        if (err) {
            callback(err);
            return;
        }

        fs.readFile(fileName, function(err, buffer) {
            var json;

            if (err) {
                fs.writeFile(fileName, "{\n\t\n}\n", callback);
                return;
            }

            json = JSON.parse(buffer.toString());

            for (var tableName in json) {
                _this.createTable(tableName, json[tableName]);
            }
            console.log(_this.values);
            callback(null);
        });
    });

    return this;
};

Schema.prototype.table = function(tableName, json) {
    var table = this.values[tableName];

    if (!table) {
        if (json === true) {
            table = this.values[tableName] = "json";
        } else {
            table = this.values[tableName] = Object.create(null);
        }
    }

    return table;
};

Schema.prototype.column = function(tableName, columnName) {
    var table = this.table(tableName),
        column;

    if (table === "json") throw new Error("Schema.column(tableName, columnName) can't get/create column on json table");

    column = table[columnName];

    if (!column) {
        column = table[columnName] = Object.create(null);
    }

    return column;
};

Schema.prototype.createTable = function(tableName, columns, options) {
    var isJSON = columns === "json",
        table = this.table(tableName, isJSON),
        parsedColumns, attribute;

    if (isJSON) return columns;

    options = utils.isObject(options) ? options : {};
    parsedColumns = Object.create(null);

    for (var columnName in columns) {
        if (!utils.has(columns, columnName)) continue;
        attribute = columns[columnName];

        if (functionWords.indexOf(columnName) !== -1) {
            this.functions[columnName](this, columns, options[columnName] || options);
            delete columns[columnName];
        }
    }

    for (var columnName in columns) {
        if (!utils.has(columns, columnName)) continue;
        attribute = columns[columnName];

        if (utils.isString(attribute)) {
            attribute = {
                type: attribute
            };
        }

        parsedColumns[columnName] = this.parseAttribute(columnName, attribute);
    }
    utils.deepExtend(table, parsedColumns);

    return parsedColumns;
};

Schema.prototype.parseAttribute = function(columnName, attribute) {
    var parsedAttribute, value;

    if (functionWords.indexOf(columnName) !== -1) {
        throw new Error("Schema.createAttribute(attributeName, attribute) attributeName can't be a function: " + functionWords.join(", "));
    }

    parsedAttribute = {};

    for (var key in attribute) {
        if (!utils.has(attribute, key)) continue;

        value = attribute[key];

        if (key === "type") {
            parsedAttribute[key] = this.parseType(value);
        } else if (reservedWords.indexOf(key) !== -1) {
            parsedAttribute[key] = value;
        }
    }

    return parsedAttribute;
};

Schema.prototype.parseType = function(type) {
    if (types.indexOf(type) === -1) throw new Error("Schema.parseType(type) got " + type + " type must be one of " + types.join(", "));

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

Schema.prototype._functions = {};

Schema.prototype._functions.timestamps = function(_this, attributes, options) {
    if (options.camelized !== false) {
        createdAt = "createdAt";
        updatedAt = "updatedAt";
    } else {
        createdAt = "created_at";
        updatedAt = "updated_at";
    }

    attributes[createdAt] = {
        type: "datetime",
        defaultsTo: "NOW"
    };
    attributes[updatedAt] = {
        type: "datetime",
        defaultsTo: "NOW"
    };
};

module.exports = Schema;

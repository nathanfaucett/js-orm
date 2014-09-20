var type = require("type"),
    each = require("each"),
    utils = require("utils"),

    functions = require("./functions");


var types = [
        "string",
        "integer",
        "float",
        "datetime",
        "boolean"
    ],
    allowed = [
        "primaryKey",
        "foreignKey",
        "autoIncrement",
        "index",
        "unique"
    ];

function coerceType(value) {
    value = (value + "").toLowerCase();

    if (value === "int") {
        return "integer";
    } else if (value === "double" || value === "decimal" || value === "dec") {
        return "float";
    } else if (value === "bool") {
        return "boolean";
    } else if (value === "date" || value === "time") {
        return "datetime";
    } else if (value === "text" || value === "str") {
        value = "string";
    }

    return value;
}

function coerceValue(type, value) {
    if (type === "string") {
        return typeof(value.toString) !== "undefined" ? value.toString() : value + "";
    } else if (type === "integer" || type === "float") {
        return +value;
    } else if (type === "boolean") {
        return !!value;
    } else if (type === "datetime") {
        return value instanceof Date ? value.toJSON() : (new Date(value)).toJSON();
    }

    return value;
}


function Table(tableName, opts) {
    var options = {};

    opts || (opts = {});

    options.autoId = (opts.autoId != null) ? opts.autoId : true;
    options.timestamps = (opts.timestamps != null) ? opts.timestamps : true;

    this._options = options;
    this._keys = null;
    this._functions = {};
    this._defines = {};

    this.schema = null;
    this.tableName = tableName;

    this.columns = {};

    if (opts.columns) this.addColumns(opts.columns);
}

Table.prototype.init = function() {
    var _this = this,
        options = this._options,

        schema = this.schema,
        globalFunctions = functions._functions,

        columns = this.columns;

    if (options.autoId) this.add("autoId", options.autoId);
    if (options.timestamps) this.add("timestamps", options.timestamps);

    each(this._defines, function(column, columnName) {

        columns[columnName] = utils.copy(column);
    });
    each(this._functions, function(opts, functionName) {

        globalFunctions[functionName](schema, _this, opts);
    });

    return this;
};

Table.prototype.table = function(tableName) {

    return this.schema.table(tableName);
};

Table.prototype.column = function(columnName) {
    var column = this.columns[columnName];

    if (column === undefined || column === null) {
        throw new Error(
            "Table.column(columnName)\n" +
            "    " + this.tableName + " has no column defined named " + columnName
        );
    }

    return column;
};

Table.prototype.has = function(columnName) {

    return !!this.columns[columnName];
};

Table.prototype.addColumns = function(columns) {
    var _this = this;

    each(columns, function(attributes, columnName) {

        _this.add(columnName, attributes);
    });
    return this;
};

Table.prototype.add = function(columnName, attributes) {
    var defines;

    if (utils.has(functions._functions, columnName)) {
        Table_parseFunction(this, columnName, attributes);
    } else {
        defines = this._defines;
        Table_parseColumn(this, columnName, attributes, defines[columnName] || (defines[columnName] = {}));
    }

    return this;
};

Table.prototype.functionAdd = function(columnName, attributes) {
    var columns = this.columns,
        column = columns[columnName] || (columns[columnName] = {});

    Table_parseColumn(this, columnName, attributes, column);
    return this;
};

Table.prototype.filter = function(values) {
    var filtered = {},
        columns = this.columns,
        keys = this._keys || [],
        i = keys.length,
        key, value;

    while (i--) {
        key = keys[i];
        value = values[key];

        if (value !== undefined && value !== null) {
            filtered[key] = coerceValue(columns[key].type, value);
        } else {
            filtered[key] = null;
        }
    }

    return filtered;
};

Table.prototype.coerce = function(values) {
    var columns = this.columns,
        keys = this._keys || [],
        i = keys.length,
        key, value;

    while (i--) {
        key = keys[i];
        value = values[key];

        if (value !== undefined && value !== null) {
            values[key] = coerceValue(columns[key].type, value);
        }
    }

    return values;
};

Table.prototype.toJSON = function() {
    var json = {};

    each(this._defines, function(column, columnName) {
        var keys = utils.keys(column),
            i = keys.length,
            jsonColumn, key;

        if (i === 1) {
            key = keys[0];
            json[columnName] = column[key];
        } else {
            jsonColumn = json[columnName] = {};

            while (i--) {
                key = keys[i];
                jsonColumn[key] = column[key];
            }
        }
    });
    each(this._functions, function(options, functionName) {

        json[functionName] = options;
    });

    return json;
};

function Table_parseFunction(_this, columnName, attributes) {

    _this._functions[columnName] = attributes != null ? attributes : true;
}

function Table_parseColumn(_this, columnName, attributes, column) {
    if (type.isString(attributes)) {
        attributes = {
            type: attributes
        };
    }

    each(attributes, function(value, key) {
        var coerced;

        if (key === "type") {
            coerced = coerceType(value);

            if (utils.indexOf(types, coerced) === -1) {
                throw new Error(
                    "Table parseColumn(columnName, attributes, column)\n" +
                    "    table " + _this.tableName + " was passed a column named " + columnName + " with a value of " + value + "\n" +
                    "    interpreted as type which must be on of\n" +
                    "    " + types.join(", ")
                );
            }

            column[key] = coerced;
        } else {
            if (utils.indexOf(allowed, key) === -1) {
                throw new Error(
                    "Table parseColumn(columnName, attributes, column)\n" +
                    "    table " + _this.tableName + " column " + columnName + " passed " + value + " allowed attributes are,\n" +
                    "    type, " + allowed.join(", ")
                );
            }

            column[key] = true;
        }
    });
}


module.exports = Table;
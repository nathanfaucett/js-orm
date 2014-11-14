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

    return (
        (value === "integer" || value === "int") ? "integer" :
        (value === "float" || value === "double" || value === "decimal" || value === "dec") ? "float" :
        (value === "boolean" || value === "bool") ? "boolean" :
        (value === "datetime" || value === "date" || value === "time") ? "datetime" :
        "string"
    );
}

function coerceValue(attributes, value) {
    var type = attributes.type,
        defaults = attributes.defaults;

    if (value == null && defaults != null) {
        value = defaults;
    }
    if (value == null) {
        return null;
    }

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
    options.functions = utils.extend(opts.functions || {}, functions);

    this._options = options;
    this._keys = null;
    this._functions = {};
    this._defines = {};

    this.schema = null;
    this.tableName = tableName;

    this.columns = {};

    if (opts.columns) this.addColumns(opts.columns);
}

Table.coerceType = coerceType;
Table.coerceValue = coerceValue;
Table.types = types;
Table.allowed = allowed;

Table.prototype.init = function() {
    var _this = this,
        options = this._options,
        schema = this.schema,
        columns = this.columns;

    if (options.autoId) this.add("autoId", options.autoId);
    if (options.timestamps) this.add("timestamps", options.timestamps);

    each(this._defines, function(column, columnName) {

        columns[columnName] = utils.copy(column);
    });
    each(this._functions, function(opts, functionName) {

        options.functions[functionName](schema, _this, opts);
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

    if (utils.has(this._options.functions, columnName)) {
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

Table.prototype.filter = function(values, accessible) {
    var filtered = {},
        columns = this.columns,
        keys = this._keys || [],
        i = keys.length,
        key, value;

    while (i--) {
        key = keys[i];
        value = values[key];

        if ((value !== undefined && value !== null) && (accessible ? accessible[key] : true)) {
            filtered[key] = coerceValue(columns[key], value);
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
            values[key] = coerceValue(columns[key], value);
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
        } else if (key === "defaults") {
            column[key] = value;
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

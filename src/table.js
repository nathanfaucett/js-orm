var EventEmitter = require("event_emitter"),
    utils = require("utils"),
    type = require("type"),
    each = require("each");

var allowedTypes = [
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
        "boolean"
    ],
    allowedAttributes = [
        "defaultsTo",
        "primaryKey",
        "foreignKey",
        "autoIncrement",
        "unique"
    ];


function Table(schema, tableName) {

    EventEmitter.call(this);

    this.schema = schema;
    this.tableName = tableName;

    this.columns = utils.create(null);
    this.columns.id = {
        type: "integer",
        primaryKey: true,
        autoIncrement: true
    };

    this._keys = null;
    this._schema = {};
    this._functions = {};
}
EventEmitter.extend(Table);

Table.prototype.init = function() {
    var _this = this,
        schema = this.schema;

    each(this._functions, function(args, functionName) {

        schema.functions[functionName](schema, _this, args[0], args[1]);
    });
    this._keys = utils.keys(this.columns);

    return this;
};

Table.prototype.hooks = function(model) {

    each(this._functions, function(_, functionName) {

        // add event hooks
    });
};

Table.prototype.column = function(columnName) {
    var columns = this.columns,
        column = columns[columnName];

    if (!column) {
        throw new Error(
            "Table.column(columnName)\n" +
            "    table " + this.tableName + " does not have a column named " + columnName
        );
    }

    return column;
};

Table.prototype.filter = function(values) {
    var filtered = {},
        keys = this._keys,
        i = keys.length,
        key, value;

    while (i--) {
        key = keys[i];
        value = values[key];
        if (value !== undefined && value !== null) filtered[key] = value;
    }

    return filtered;
};

Table.prototype.addColumns = function(columns, options) {
    var _this = this;

    options || (options = {});

    each(columns, function(attributes, columnName) {

        _this.addColumn(columnName, attributes, options);
    });
    return this;
};

Table.prototype.addColumn = function(columnName, attributes, options) {
    options || (options = {});

    if (Table_parseFunction(this, columnName, attributes, options)) {
        return this;
    }

    if (type.isString(attributes)) {
        attributes = {
            type: attributes
        };
    }

    this._schema[columnName] = this.columns[columnName] = Table_parseAttributes(this, columnName, attributes, options);
    return this;
};

Table.prototype.addFunctionColumn = function(columnName, attributes, options) {
    options || (options = {});

    if (type.isString(attributes)) {
        attributes = {
            type: attributes
        };
    }

    this.columns[columnName] = Table_parseAttributes(this, columnName, attributes, options);
    return this;
};

Table.prototype.toJSON = function() {
    var json = {};

    each(this._schema, function(column, columnName) {
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
    each(this._functions, function(args, functionName) {
        json[functionName] = utils.copy(args[0]);
    });

    return json;
};

function Table_parseAttributes(_this, columnName, attributes, options) {
    var parsedAttributes = utils.create(null);

    each(attributes, function(attribute, attributesName) {

        if (attributesName === "type") {

            parsedAttributes[attributesName] = Table_parseType(_this, columnName, attribute);

        } else if (allowedAttributes.indexOf(attributesName) !== -1) {

            parsedAttributes[attributesName] = attribute;
        }
    });

    return parsedAttributes;
}

function Table_parseType(_this, columnName, value) {
    if (allowedTypes.indexOf(value) === -1) {
        throw new Error(
            "Table parseType(value)\n" +
            "    table " + _this.tableName + " column " + columnName + " type passed " + value + " must be one of" + allowedTypes.join(", ")
        );
    }

    if (value === "int") {
        return "integer";
    } else if (value === "double" || value === "decimal") {
        return "float";
    } else if (value === "bool") {
        return "boolean";
    } else if (value === "date" || value === "time") {
        return "datetime";
    } else if (value === "text") {
        value = "string";
    }

    return value;
}

function Table_parseFunction(_this, functionName, attributes, options) {

    if (type.isFunction(_this.schema.functions[functionName])) {
        _this._functions[functionName] = [attributes, options];
        return true;
    }

    return false;
}


module.exports = Table;

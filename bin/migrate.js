var each = require("each"),
    type = require("type"),
    utils = require("utils"),

    functions = require("./functions"),
    Table = require("../src/table");


var slice = Array.prototype.slice;


function Task(name, order, args) {

    this.name = name;
    this.order = order;
    this.args = args;
    this._time = 0;
}

Task.prototype.print = function() {
    return (
        "\n=================================================\n" +
        "-- " + this.name + "(" + prettyArgs(this.args) + ");\n" +
        "   -> " + this._time + "(ms)\n" +
        "================================================="
    );
};

function prettyArgs(args) {
    var length = args.length - 1,
        i = -1,
        value, typeStr;

    args = args.slice(0, length);

    while (++i < length) {
        value = args[i];
        typeStr = typeof(value);

        if (typeStr === "string") {
            args[i] = '"' + value + '"';
        } else if (typeStr === "number") {
            args[i] = value;
        } else {
            value = JSON.stringify(value) || "null";

            if (value.length > 80) {
                value = value.slice(0, 50) + "...";
            }

            args[i] = value;
        }
    }
    return args.join(", ");
}

function filterColumns(_this, tableName, columns, options) {
    var out = {};

    if (_this._options.autoId && !columns.autoId) {
        columns.autoId = _this._options.autoId;
    }
    if (_this._options.timestamps && !columns.timestamps) {
        columns.timestamps = _this._options.timestamps;
    }

    each(columns, function(attributes, columnName) {

        if (utils.has(functions, columnName)) {
            functions[columnName](_this, tableName, out, attributes);
            return;
        }

        out[columnName] = filterAttributes(_this, tableName, columnName, attributes, options);
    });

    return out;
}

function filterAttributes(_this, tableName, columnName, attributes) {
    var out = {},
        coerced;

    if (type.isString(attributes)) {
        attributes = {
            type: attributes
        };
    }

    each(attributes, function(value, key) {
        if (key === "type") {
            coerced = Table.coerceType(value);
            if (utils.indexOf(Table.types, coerced) === -1) {
                return;
            }
            out[key] = coerced;
        } else {
            if (utils.indexOf(Table.allowed, key) === -1) {
                return;
            }
            out[key] = true;
        }
    });

    return out;
}


function Migrate(opts) {
    var options = {};

    opts || (opts = {});

    options.autoId = (opts.autoId != null) ? opts.autoId : true;
    options.timestamps = (opts.timestamps != null) ? opts.timestamps : true;

    this._options = options;
    this._tasks = [];
}

function Migrate_createTask(_this, name, order) {

    _this._tasks.push(new Task(name, order, slice.call(arguments, 3)));
}

Migrate.prototype.createTable = function(tableName, columns, options) {
    var filtered = filterColumns(this, tableName, columns, options);

    Migrate_createTask(this, "createTable", 0, tableName, filtered, options || {});
    return this;
};

Migrate.prototype.renameTable = function(tableName, newTableName) {

    Migrate_createTask(this, "renameTable", 1, tableName, newTableName);
    return this;
};

Migrate.prototype.removeTable = function(tableName) {

    Migrate_createTask(this, "removeTable", 2, tableName);
    return this;
};

Migrate.prototype.dropTable = Migrate.prototype.removeTable;

Migrate.prototype.addColumn = function(tableName, columnName, column, options) {
    var filtered = filterAttributes(this, tableName, columnName, column, options);

    Migrate_createTask(this, "addColumn", 3, tableName, columnName, filtered, options);
    return this;
};

Migrate.prototype.renameColumn = function(tableName, columnName, newColumnName) {

    Migrate_createTask(this, "renameColumn", 4, tableName, columnName, newColumnName);
    return this;
};

Migrate.prototype.removeColumn = function(tableName, columnName) {

    Migrate_createTask(this, "removeColumn", 5, tableName, columnName);
    return this;
};

Migrate.prototype.createIndex = function(tableName, columnName, options) {

    Migrate_createTask(this, "createIndex", 6, tableName, columnName, options || {});
    return this;
};

Migrate.prototype.removeIndex = function(tableName, columnName, options) {

    Migrate_createTask(this, "removeIndex", 7, tableName, columnName, options || {});
    return this;
};

Migrate.prototype.removeDatabase = function() {

    Migrate_createTask(this, "removeDatabase", 8);
    return this;
};

Migrate.prototype.dropDatabase = Migrate.prototype.removeDatabase;


module.exports = Migrate;

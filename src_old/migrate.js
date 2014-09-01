var utils = require("utils"),
    inflect = require("inflect");


var NAME_SPLITER = /[\s, ]+/,
    slice = Array.prototype.slice;


function Task(name, args) {
    this.name = name;
    this.args = args;
}


function Migrate(schema, callback) {

    this._schema = schema;
    this._errors = null;
    this._tasks = [];

    this._callback = callback;
}

Migrate.prototype._clear = function() {

    this._schema = null;
    this._errors = null;
    this._tasks = null;

    this._callback = null;

    return this;
};

Migrate.prototype._run = function(adaptor) {
    var tasks = this._tasks,
        i = tasks.length,
        task;

    while (i--) {
        task = tasks[i];
        adaptor[task.name].apply(adaptor, task.args);
    }

    return this;
};

Migrate.prototype._createTask = function(name) {
    var args = slice.call(arguments, 1),
        task = new Task(name, args);

    args.push(this._createCallback(task));
    this._tasks.unshift(task);

    return this;
};

Migrate.prototype._createCallback = function(task) {
    var _this = this,
        callback = this._callback,
        tasks = this._tasks,
        index = tasks.indexOf(task);

    return function(err) {
        if (err)(_this._errors || (_this._errors = [])).push(err);
        tasks.splice(index, 1);

        if (tasks.length === 0) {
            callback(_this._errors);
        }
    };
};

Migrate.prototype.createTable = function(tableName, attributes, options) {

    attributes = this._schema.parseTable(tableName, attributes || {}, options);

    return this._createTask("createTable", tableName, attributes);
};

Migrate.prototype.dropTable = function(tableName) {

    this._schema.removeTable(tableName);

    return this._createTask("dropTable", tableName);
};

Migrate.prototype.changeTable = function(tableName, attributes, options) {

    attributes = this._schema.parseTable(tableName, attributes || {}, options);

    return this._createTask("changeTable", tableName, attributes);
};

Migrate.prototype.renameTable = function(oldName, newName) {

    this._schema.renameTable(oldName, newName);

    return this._createTask("renameTable", oldName, newName);
};

Migrate.prototype.addColumn = function(tableName, columnName, type, attributes) {
    if (utils.isObject(type)) {
        attributes = type;
        type = attributes.type;
    }
    attributes || (attributes = {});

    attributes = this._schema.parseColumn(tableName, columnName, attributes);

    return this._createTask("addColumn", tableName, columnName, attributes);
};

Migrate.prototype.renameColumn = function(tableName, columnName, newColumnName) {

    this._schema.renameColumn(tableName, columnName, newColumnName);

    return this._createTask("renameColumn", tableName, columnName, newColumnName);
};

Migrate.prototype.changeColumn = function(tableName, columnName, type, attributes) {
    if (utils.isObject(type)) {
        attributes = type;
        type = attributes.type;
    }
    attributes || (attributes = {});

    attributes = this._schema.parseColumn(tableName, columnName, attributes);

    return this._createTask("changeColumn", tableName, columnName, attributes);
};

Migrate.prototype.removeColumn = function(tableName, columnName, type, options) {
    if (utils.isObject(type)) {
        options = type;
        type = options.type;
    }
    options || (options = {});

    this._schema.removeColumn(tableName, columnName);

    return this._createTask("removeColumn", tableName, columnName, options);
};

Migrate.prototype.addIndex = function(tableName, columnNames, options) {
    if (utils.isString(columnNames)) {
        columnNames = columnNames.split(NAME_SPLITER);
    }
    options || (options = {});
    var schema = this._schema;

    utils.each(columnNames, function(columnName) {
        var name = options.name || ("index_" + tableName + "_on_" + columnName)

        options = schema.parseColumn(tableName, columnName, options);
    });

    return this._createTask("addIndex", tableName, columnNames, options);
};

Migrate.prototype.removeIndex = function(tableName, columnNames, options) {
    if (utils.isString(options)) {
        options = {
            columnName: options
        };
    }
    options || (options = {});
    var schema = this._schema;

    utils.each(columnNames, function(columnName) {
        var name = options.name || ("index_" + tableName + "_on_" + columnName)

        schema.removeColumnAttributes(tableName, columnName, options);
    });

    return this._createTask("removeIndex", tableName, columnNames, options);
};


module.exports = Migrate;

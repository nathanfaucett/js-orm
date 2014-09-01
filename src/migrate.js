var utils = require("utils"),
    inflect = require("inflect");


var NAME_SPLITER = /[\s, ]+/,
    slice = Array.prototype.slice;


function Task(order, name, args, adaptor) {
    this.order = order;
    this.name = name;
    this.args = args;
    this.adaptor = adaptor;
}


function Migrate(ctx) {

    this.ctx = ctx;
    this.adaptor = null;
}

function createTask(_this, order, name) {
    var args = slice.call(arguments, 3),
        task = new Task(order, name, args, _this.adaptor);

    _this.ctx.migrations.tasks.push(task);
    return _this;
};

Migrate.prototype.createTable = function(tableName, attributes, options) {

    attributes = this.ctx.schema.createTable(tableName, attributes || {}, options);

    return createTask(this, 0, "createTable", tableName, attributes);
};

Migrate.prototype.dropTable = function(tableName) {

    this.ctx.schema.removeTable(tableName);

    return createTask(this, 1, "dropTable", tableName);
};

Migrate.prototype.changeTable = function(tableName, attributes, options) {

    attributes = this.ctx.schema.createTable(tableName, attributes || {}, options);

    return createTask(this, 2, "changeTable", tableName, attributes);
};

Migrate.prototype.renameTable = function(oldName, newName) {

    this.ctx.schema.renameTable(oldName, newName);

    return createTask(this, 3, "renameTable", oldName, newName);
};

Migrate.prototype.addColumn = function(tableName, columnName, type, attributes) {
    if (utils.isObject(type)) {
        attributes = type;
        type = attributes.type;
    }
    attributes || (attributes = {});

    attributes = this.ctx.schema.createColumn(tableName, columnName, attributes);

    return createTask(this, 4, "addColumn", tableName, columnName, attributes);
};

Migrate.prototype.renameColumn = function(tableName, columnName, newColumnName) {

    this.ctx.schema.renameColumn(tableName, columnName, newColumnName);

    return createTask(this, 5, "renameColumn", tableName, columnName, newColumnName);
};

Migrate.prototype.changeColumn = function(tableName, columnName, type, attributes) {
    if (utils.isObject(type)) {
        attributes = type;
        type = attributes.type;
    }
    attributes || (attributes = {});

    attributes = this.ctx.schema.createColumn(tableName, columnName, attributes);

    return createTask(this, 6, "changeColumn", tableName, columnName, attributes);
};

Migrate.prototype.removeColumn = function(tableName, columnName, type, options) {
    if (utils.isObject(type)) {
        options = type;
        type = options.type;
    }
    options || (options = {});

    this.ctx.schema.removeColumn(tableName, columnName);

    return createTask(this, 7, "removeColumn", tableName, columnName, options);
};

Migrate.prototype.addIndex = function(tableName, columnName, attributes, options) {
    var schema = this.ctx.schema;

    options || (options = {});
    options.name || (options.name = inflect.camelize("index_" + tableName + "_on_" + columnName, true));

    attributes = schema.createColumn(tableName, columnName, attributes, options);

    return createTask(this, 8, "addIndex", tableName, columnName, attributes);
};

Migrate.prototype.removeIndex = function(tableName, columnName, attributes, options) {
    var schema = this.ctx.schema;

    options || (options = {});
    options.name || (options.name = inflect.camelize("index_" + tableName + "_on_" + columnName, true));

    attributes = schema.removeColumnAttributes(tableName, columnName, attributes, options);

    return createTask(this, 8, "addIndex", tableName, columnName, attributes);
};


module.exports = Migrate;

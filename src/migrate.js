var utils = require("utils"),
    inflect = require("inflect");


var NAME_SPLITER = /[\s, ]+/,
    slice = Array.prototype.slice;


function Task(order, name, args, adaptor, collection) {
    this.order = order;
    this.name = name;
    this.args = args;
    this.adaptor = adaptor;
    this.collection = collection;
}


function Migrate(ctx) {

    this.ctx = ctx;

    this.adaptor = null;
    this.collection = null;
}

function Migrate_createTask(_this, order, name) {
    var args = slice.call(arguments, 3),
        task = new Task(order, name, args, _this.adaptor, _this.collection);

    _this.ctx.migrations.tasks.push(task);
    return _this;
};

function Migrate_parseFunctions(_this, tableName, attributes, options) {
    options || (options = {});

    if (utils.has(attributes, "hasMany")) {
        Migrate_hasMany(_this, tableName, attributes.hasMany, options);
        delete attributes.hasMany;
    }
    if (utils.has(attributes, "hasOne")) {
        Migrate_hasOne(_this, tableName, attributes.hasOne, options);
        delete attributes.hasOne;
    }
    if (utils.has(columns, "belongsTo")) {
        Migrate_belongsTo(_this, tableName, attributes.belongsTo, options);
        delete attributes.belongsTo;
    }
}

function Migrate_hasMany(_this, tableName, attribute, options) {
    var attributes = _this.ctx.schema.hasMany(tableName, attribute, options);

    return _this.changeTable(tableName, attributes, options);
}

function Migrate_hasOne(_this, tableName, attribute, options) {
    var attributes = _this.ctx.schema.hasOne(tableName, attribute, options);

    return _this.changeTable(tableName, attributes, options);
}

function Migrate_belongsTo(_this, tableName, attribute, options) {
    var attributes = _this.ctx.schema.belongsTo(tableName, attribute, options),
        otherTableName;

    if (utils.isString(attribute)) {
        otherTableName = inflect.pluralize(attribute, options.locale);
    } else if (utils.isString(attribute.model)) {
        otherTableName = attribute.model;
    }

    return _this.changeTable(otherTableName, attributes, options);
}

Migrate.prototype.createTable = function(tableName, attributes, options) {

    Migrate_parseFunctions(this, tableName, attributes, options);
    attributes = this.ctx.schema.createTable(tableName, attributes || {}, options);

    return Migrate_createTask(this, 0, "createTable", tableName, attributes);
};

Migrate.prototype.dropTable = function(tableName) {

    this.ctx.schema.removeTable(tableName);

    return Migrate_createTask(this, 1, "dropTable", tableName);
};

Migrate.prototype.changeTable = function(tableName, attributes, options) {

    Migrate_parseFunctions(this, tableName, attributes, options);
    attributes = this.ctx.schema.createTable(tableName, attributes || {}, options);

    return Migrate_createTask(this, 2, "changeTable", tableName, attributes);
};

Migrate.prototype.renameTable = function(oldName, newName) {

    this.ctx.schema.renameTable(oldName, newName);

    return Migrate_createTask(this, 3, "renameTable", oldName, newName);
};

Migrate.prototype.addColumn = function(tableName, columnName, type, attributes, options) {
    if (utils.isObject(type)) {
        options = attributes;
        attributes = type;
        type = attributes.type;
    }
    attributes || (attributes = {});

    Migrate_parseFunctions(this, tableName, attributes, options);
    attributes = this.ctx.schema.createColumn(tableName, columnName, attributes);

    return Migrate_createTask(this, 4, "addColumn", tableName, columnName, attributes);
};

Migrate.prototype.renameColumn = function(tableName, columnName, newColumnName) {

    this.ctx.schema.renameColumn(tableName, columnName, newColumnName);

    return Migrate_createTask(this, 5, "renameColumn", tableName, columnName, newColumnName);
};

Migrate.prototype.changeColumn = function(tableName, columnName, type, attributes, options) {
    if (utils.isObject(type)) {
        options = attributes;
        attributes = type;
        type = attributes.type;
    }
    attributes || (attributes = {});

    Migrate_parseFunctions(this, tableName, attributes, options);
    attributes = this.ctx.schema.createColumn(tableName, columnName, attributes);

    return Migrate_createTask(this, 6, "changeColumn", tableName, columnName, attributes);
};

Migrate.prototype.removeColumn = function(tableName, columnName, type, options) {
    if (utils.isObject(type)) {
        options = type;
        type = options.type;
    }
    options || (options = {});

    this.ctx.schema.removeColumn(tableName, columnName);

    return Migrate_createTask(this, 7, "removeColumn", tableName, columnName, options);
};

Migrate.prototype.addIndex = function(tableName, columnName, attributes, options) {
    var schema = this.ctx.schema;

    options || (options = {});
    options.name || (options.name = inflect.camelize("index_" + tableName + "_on_" + columnName, true));

    attributes = schema.createColumn(tableName, columnName, attributes, options);

    return Migrate_createTask(this, 8, "addIndex", tableName, columnName, attributes);
};

Migrate.prototype.removeIndex = function(tableName, columnName, attributes, options) {
    var schema = this.ctx.schema;

    options || (options = {});
    options.name || (options.name = inflect.camelize("index_" + tableName + "_on_" + columnName, true));

    attributes = schema.removeColumnAttributes(tableName, columnName, attributes, options);

    return Migrate_createTask(this, 9, "removeIndex", tableName, columnName, attributes);
};


module.exports = Migrate;

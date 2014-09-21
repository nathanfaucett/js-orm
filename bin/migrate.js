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
            value = JSON.stringify(value);

            if (value.length > 80) {
                value = value.slice(0, 50) + "...";
            }

            args[i] = value;
        }
    }
    return args.join(", ");
}


function Migrate() {

    this._tasks = [];
}

function Migrate_createTask(_this, name, order) {

    _this._tasks.push(new Task(name, order, slice.call(arguments, 3)));
}

Migrate.prototype.createTable = function(tableName, columns, options) {

    Migrate_createTask(this, "createTable", 0, tableName, columns, options || {});
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

    Migrate_createTask(this, "addColumn", 3, tableName, columnName, column, options);
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

Migrate.prototype.addIndex = function(tableName, columnName, options) {

    Migrate_createTask(this, "addIndex", 6, tableName, columnName, options || {});
    return this;
};

Migrate.prototype.removeIndex = function(tableName, columnName, options) {

    Migrate_createTask(this, "removeIndex", 7, tableName, columnName, options || {});
    return this;
};


module.exports = Migrate;

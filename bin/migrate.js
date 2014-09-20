var each = require("each");


var slice = Array.prototype.slice;


function Task(name, order, args) {

    this.name = name;
    this.order = order;
    this.args = args;
    this._time = 0;
}

Task.prototype.toString = function() {
    return (
        "=================================================\n" +
        "-- " + this.name + "(" + this.args + ")\n" +
        "   -> " + this._time + "s\n" +
        "=================================================\n"
    );
};


function Migrate(adaptor) {

    this._adaptor = adaptor;
    this._tasks = [];
}

function Migrate_createTask(_this, name, order, args) {

    _this.push(new Task(name, order, args));
}

each(
    [
        "createTable", // tableName, columns, options
        "renameTable", // tableName, newTableName
        "removeTable", // tableName

        "addColumn", // tableName, columnName, column, options
        "renameColumn", // tableName, columnName, newColumnName
        "removeColumn" // tableName, columnName
    ],
    function(taskName, order) {
        Migrate.prototype[taskName] = function() {

            Migrate_createTask(_this, taskName, order, slice.call(arguments));
            return this;
        };
    }
);


module.exports = Migrate;

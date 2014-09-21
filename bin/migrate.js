var each = require("each");


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

function Migrate_createTask(_this, name, order, args) {

    _this._tasks.push(new Task(name, order, args));
}

each(
    [
        "createTable", // tableName, columns
        "renameTable", // tableName, newTableName
        "removeTable", // tableName

        "addColumn", // tableName, columnName, column
        "renameColumn", // tableName, columnName, newColumnName
        "removeColumn", // tableName, columnName

        "addIndex", // tableName, columnName
        "removeIndex" // tableName, columnName
    ],
    function(taskName, order) {
        Migrate.prototype[taskName] = function() {

            Migrate_createTask(this, taskName, order, slice.call(arguments));
            return this;
        };
    }
);


module.exports = Migrate;

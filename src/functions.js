var type = require("type"),
    inflect = require("inflect");


var functions = module.exports;

functions._functions = {};

functions.define = function(name, callback) {

    functions._functions[name] = callback;
    return functions;
};

functions.define("autoId", function(schema, table, options) {
    var value = {};

    options = type.isObject(options) ? options : {};

    value.type = options.type || "integer";
    if (options.primaryKey !== false) value.primaryKey = true;
    if (options.autoIncrement !== false) value.autoIncrement = true;

    table.functionAdd(options.key || "id", value);
});

functions.define("timestamps", function(schema, table, options) {
    var createdAt = "createdAt",
        updatedAt = "updatedAt";

    if (type.isObject(options)) {
        if (options.underscore === true || options.camelcase === false) {
            createdAt = "created_at";
            updatedAt = "updated_at";
        }
    }

    table.functionAdd(createdAt, "datetime");
    table.functionAdd(updatedAt, "datetime");
});

functions.define("hasMany", function(schema, table, options) {
    var model, columnName;

    options = type.isObject(options) ? options : {
        collection: options + ""
    };

    model = schema.table(options.collection);

    columnName = inflect.foreignKey(
        inflect.singularize(table.tableName, options.locale), (options.key || "id"), (options.underscore === false || options.camelcase === true || true),
        options.lowFirstLetter != null ? !!options.lowFirstLetter : true
    );

    model.functionAdd(columnName, {
        type: options.type || "integer",
        foreignKey: true
    });
});

functions.define("hasOne", function(schema, table, options) {
    var model, columnName;

    options = type.isObject(options) ? options : {
        model: options + ""
    };

    model = schema.table(inflect.pluralize(options.model, options.locale));

    columnName = inflect.foreignKey(
        inflect.singularize(table.tableName, options.locale), (options.key || "id"), (options.underscore === false || options.camelcase === true || true),
        options.lowFirstLetter != null ? !!options.lowFirstLetter : true
    );

    model.functionAdd(columnName, {
        type: options.type || "integer",
        unique: true,
        foreignKey: true
    });
});

functions.define("belongsTo", function(schema, table, options) {
    var model, columnName;

    options = type.isObject(options) ? options : {
        model: options + ""
    };

    model = schema.table(inflect.pluralize(options.model, options.locale));

    columnName = inflect.foreignKey(
        options.model, (options.key || "id"), (options.underscore === false || options.camelcase === true || true),
        options.lowFirstLetter != null ? !!options.lowFirstLetter : true
    );

    table.functionAdd(columnName, {
        type: options.type || "integer",
        foreignKey: true
    });
});

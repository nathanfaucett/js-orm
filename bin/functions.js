var type = require("type"),
    inflect = require("inflect");


var functions = module.exports;


functions.autoId = function(migrate, tableName, columns, options) {
    var value = {};

    options = type.isObject(options) ? options : {};

    value.type = options.type || "integer";
    if (options.primaryKey !== false) value.primaryKey = true;
    if (options.autoIncrement !== false) value.autoIncrement = true;

    columns.id = value;
};

functions.timestamps = function(migrate, tableName, columns, options) {
    var createdAt = "createdAt",
        updatedAt = "updatedAt",
        value = {
            type: "datetime"
        };

    if (type.isObject(options)) {
        if (options.underscore === true || options.camelcase === false) {
            createdAt = "created_at";
            updatedAt = "updated_at";
        }
    }

    columns[createdAt] = value;
    columns[updatedAt] = value;
};

functions.hasMany = function(migrate, tableName, columns, options) {
    var modelName, columnName;

    options = type.isObject(options) ? options : {
        collection: options + ""
    };

    modelName = options.collection;

    columnName = inflect.foreignKey(
        inflect.singularize(tableName, options.locale),
        options.key || "id",
        options.underscore === false || options.camelcase === true || true,
        options.lowFirstLetter != null ? !!options.lowFirstLetter : true
    );

    migrate.addColumn(modelName, columnName, {
        type: options.type || "integer",
        foreignKey: true
    });
};

functions.hasOne = function(migrate, tableName, columns, options) {
    var modelName, columnName;

    options = type.isObject(options) ? options : {
        model: options + ""
    };

    modelName = inflect.pluralize(options.model, options.locale);

    columnName = inflect.foreignKey(
        inflect.singularize(table.tableName, options.locale),
        options.key || "id",
        options.underscore === false || options.camelcase === true || true,
        options.lowFirstLetter != null ? !!options.lowFirstLetter : true
    );

    migrate.addColumn(modelName, columnName, {
        type: options.type || "integer",
        unique: true,
        foreignKey: true
    });
};

functions.belongsTo = function(migrate, tableName, columns, options) {
    var modelName, columnName;

    options = type.isObject(options) ? options : {
        model: options + ""
    };

    modelName = inflect.pluralize(options.model, options.locale);

    columnName = inflect.foreignKey(
        modelName,
        options.key || "id",
        options.underscore === false || options.camelcase === true || true,
        options.lowFirstLetter != null ? !!options.lowFirstLetter : true
    );

    migrate.addColumn(tableName, columnName, {
        type: options.type || "integer",
        foreignKey: true
    });
};

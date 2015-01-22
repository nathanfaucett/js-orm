var isObject = require("is_object"),
    isArray = require("is_array"),
    forEach = require("for_each"),
    inflect = require("inflect");


var functions = module.exports;


functions.autoId = function(schema, table, options) {
    var value = {};

    options = isObject(options) ? options : {};

    value.type = options.type || "integer";
    if (options.primaryKey !== false) value.primaryKey = true;
    if (options.autoIncrement !== false) value.autoIncrement = true;

    table.functionAdd(options.key || "id", value);
};

functions.timestamps = function(schema, table, options) {
    var createdAt = "createdAt",
        updatedAt = "updatedAt";

    if (isObject(options)) {
        if (options.underscore === true || options.camelcase === false) {
            createdAt = "created_at";
            updatedAt = "updated_at";
        }
    }

    table.functionAdd(createdAt, "datetime");
    table.functionAdd(updatedAt, "datetime");
};

functions.hasMany = function(schema, table, options) {
    var model, columnName;

    if (isArray(options)) {
        forEach(options, function(value) {
            functions.hasMany(schema, table, value);
        });
        return;
    }

    options = isObject(options) ? options : {
        collection: options + ""
    };

    model = schema.table(options.collection);

    columnName = inflect.foreignKey(
        inflect.singularize(table.tableName, options.locale),
        options.key || "id",
        options.underscore === false || options.camelcase === true || true,
        options.lowFirstLetter != null ? !!options.lowFirstLetter : true
    );

    model.functionAdd(columnName, {
        type: options.type || "integer",
        foreignKey: true
    });
};

functions.hasOne = function(schema, table, options) {
    var model, columnName;

    if (isArray(options)) {
        forEach(options, function(value) {
            functions.hasOne(schema, table, value);
        });
        return;
    }

    options = isObject(options) ? options : {
        model: options + ""
    };

    model = schema.table(inflect.pluralize(options.model, options.locale));

    columnName = inflect.foreignKey(
        inflect.singularize(table.tableName, options.locale),
        options.key || "id",
        options.underscore === false || options.camelcase === true || true,
        options.lowFirstLetter != null ? !!options.lowFirstLetter : true
    );

    model.functionAdd(columnName, {
        type: options.type || "integer",
        unique: true,
        foreignKey: true
    });
};

functions.belongsTo = function(schema, table, options) {
    var model, columnName;

    if (isArray(options)) {
        forEach(options, function(value) {
            functions.belongsTo(schema, table, value);
        });
        return;
    }

    options = isObject(options) ? options : {
        model: options + ""
    };

    model = schema.table(inflect.pluralize(options.model, options.locale));

    columnName = inflect.foreignKey(
        options.model,
        options.key || "id",
        options.underscore === false || options.camelcase === true || true,
        options.lowFirstLetter != null ? !!options.lowFirstLetter : true
    );

    table.functionAdd(columnName, {
        type: options.type || "integer",
        foreignKey: true
    });
};

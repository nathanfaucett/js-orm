var EventEmitter = require("event_emitter"),
    utils = require("utils"),
    type = require("type"),
    each = require("each"),
    inflect = require("inflect"),

    Table = require("./table");


var JSON_REPLACER = /\"(.*?)\"\:/g;


function Schema(collection, schema) {

    EventEmitter.call(this);

    this.collection = collection;
    this.schema = schema;

    this.tables = utils.create(null);
    this.functions = utils.copy(Schema.functions);
}
EventEmitter.extend(Schema);

Schema.prototype.init = function() {
    var _this = this,
        schema = this.schema;

    each(schema, function(columns, tableName) {

        _this.table(tableName).addColumns(columns);
    });
    each(this.tables, function(table) {

        table.init();
    });

    return this;
};

Schema.prototype.table = function(tableName) {
    var tables = this.tables,
        table = tables[tableName];

    if (!table) {
        throw new Error(
            "Schema.table(tableName)\n" +
            "    no table exists named " + tableName
        );
    }

    return table;
};

Schema.prototype.createTable = function(tableName) {
    var tables = this.tables,
        table;

    if (tables[tableName]) {
        throw new Error(
            "Schema.createTable(tableName)\n" +
            "    a table already exists named " + tableName
        );
    }

    table = tables[tableName] = new Table(this, tableName);

    return table;
};

Schema.prototype.defineFunction = function(name, events, method) {

    this.functions[name] = new SchemaFunction(events, method);
};

Schema.prototype.toJSON = function(numOfSpacesPerTab) {
    var json = {};

    each(this.tables, function(table, tableName) {
        json[tableName] = table.toJSON();
    });

    return json;
};

Schema.prototype.toExports = function(numOfSpacesPerTab) {

    return "module.exports = " + JSON.stringify(this.toJSON(), null, +numOfSpacesPerTab || 4).replace(JSON_REPLACER, function(match, key) {
        return key + ":";
    }) + ";\n";
};


function SchemaFunction(events, method) {

    this.method = method;
    this.events = events;
}

Schema.functions = {};

Schema.defineFunction = function(name, events, method) {

    Schema.functions[name] = new SchemaFunction(events, method);
};

Schema.defineFunction("timestamps", {
        "beforeCreate": function(model) {
            model.createdAt = new Date();
        },
        "beforeSave": function(model) {
            model.updatedAt = new Date();
        }
    },
    function timestamps(schema, table, column, options) {
        var createdAt = "createdAt",
            updatedAt = "updatedAt",
            now = {
                type: "datetime",
                defaultsTo: "NOW"
            };

        if (options.underscore === true || options.camelcase === false) {
            createdAt = "created_at";
            updatedAt = "updated_at";
        }

        table.addFunctionColumn(createdAt, now, options);
        table.addFunctionColumn(updatedAt, now, options);
    }
);

Schema.defineFunction("hasMany", null, function hasMany(schema, table, column, options) {
    var modelName, modelTable, columnName, modelColumn, model;

    column = type.isString(column) ? {
        collection: column
    } : column;

    modelName = column.collection;
    modelTable = schema.table(modelName);
    modelColumn = modelTable.column(options.key || (options.key = "id"));

    columnName = inflect.foreignKey(
        inflect.singularize(table.tableName, options.locale),
        options.key,
        options.camelcase === true || options.underscore !== false,
        true
    );

    model = schema.collection.models[inflect.classify(modelName, options.locale)];
    model.defineFindBy(columnName);
    model.defineFindOneBy(columnName);

    modelTable.addFunctionColumn(columnName, {
        type: modelColumn.type,
        foreignKey: true
    }, options);
});

Schema.defineFunction("hasOne", null, function hasMany(schema, table, column, options) {
    var modelName, modelTable, columnName, modelColumn, model;

    column = type.isString(column) ? {
        model: column
    } : column;

    modelName = inflect.pluralize(column.model, options.locale),
    modelTable = schema.table(modelName);
    modelColumn = modelTable.column(options.key || (options.key = "id"));

    columnName = inflect.foreignKey(
        inflect.singularize(table.tableName, options.locale),
        options.key,
        options.camelcase === true || options.underscore !== false,
        true
    );

    model = schema.collection.models[inflect.classify(modelName, options.locale)];
    model.defineFindBy(columnName);
    model.defineFindOneBy(columnName);

    modelTable.addFunctionColumn(columnName, {
        type: modelColumn.type,
        foreignKey: true
    }, options);
});

Schema.defineFunction("belongsTo", null, function belongsTo(schema, table, column, options) {
    var modelName, modelTable, columnName, modelColumn, model;

    column = type.isString(column) ? {
        model: column
    } : column;

    modelName = inflect.pluralize(column.model, options.locale),
    modelTable = schema.table(modelName);
    modelColumn = modelTable.column(options.key || (options.key = "id"));

    columnName = inflect.foreignKey(
        column.model,
        options.key,
        options.camelcase === true || options.underscore !== false,
        true
    );

    model = schema.collection.models[inflect.classify(table.tableName, options.locale)];
    model.defineFindBy(columnName);
    model.defineFindOneBy(columnName);

    table.addFunctionColumn(columnName, {
        type: modelColumn.type,
        foreignKey: true
    }, options);
});


module.exports = Schema;

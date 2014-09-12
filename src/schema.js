var EventEmitter = require("event_emitter"),
    utils = require("utils"),
    type = require("type"),
    each = require("each"),

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

Schema.prototype.defineFunction = function(name, func) {

    this.functions[name] = func;
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


Schema.functions = {};

Schema.defineFunction = function(name, func) {

    Schema.functions[name] = func;
};

Schema.defineFunction("timestamps", function timestamps(schema, table, column, options) {
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
});

Schema.defineFunction("hasMany", function hasMany(schema, table, column, options) {

});


module.exports = Schema;

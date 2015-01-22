var forEach = require("for_each"),
    keys = require("keys"),

    Table = require("./table");


var JSON_REPLACER = /\"(.*?)\"\:/g;


function Schema(opts) {
    var options = {};

    opts || (opts = {});

    options.autoId = (opts.autoId != null) ? opts.autoId : true;
    options.timestamps = (opts.timestamps != null) ? opts.timestamps : true;

    this._options = options;

    this.tables = {};
}

Schema.prototype.init = function() {
    var tables = this.tables;

    forEach(tables, function(table) {
        table.init();
    });
    forEach(tables, function(table) {
        table._keys = keys(table.columns);
    });

    return this;
};

Schema.prototype.table = function(tableName) {
    var table = this.tables[tableName];

    if (table === undefined || table === null) {
        throw new Error(
            "Schema.table(tableName)\n" +
            "    no table defined named " + tableName
        );
    }

    return table;
};

Schema.prototype.has = function(tableName) {

    return !!this.tables[tableName];
};

Schema.prototype.create = function(tableName, options) {
    var tables = this.tables,
        opts = this._options,
        table;

    if (tables[tableName]) {
        throw new Error(
            "Schema.create(tableName, options)\n" +
            "    table already defined named " + tableName
        );
    }
    options || (options = {});

    options.autoId = (options.autoId === true) ? opts.autoId : options.autoId;
    options.timestamps = (options.timestamps === true) ? opts.timestamps : options.timestamps;

    table = new Table(tableName, options);
    table.schema = this;

    return (tables[tableName] = table);
};

Schema.prototype.add = function(table) {
    var tables = this.tables,
        opts = this._options,
        options = table._options,
        tableName;

    if (!(table instanceof Table)) {
        throw new Error(
            "Schema.add(table)\n" +
            "    table must be an instance of Table"
        );
    }

    tableName = table.tableName;

    if (tables[tableName]) {
        throw new Error(
            "Schema.add(table)\n" +
            "    table already defined named " + tableName
        );
    }

    options.autoId = (options.autoId === true) ? opts.autoId : options.autoId;
    options.timestamps = (options.timestamps === true) ? opts.timestamps : options.timestamps;

    table.schema = this;

    return (tables[tableName] = table);
};

Schema.prototype.toJSON = function() {
    var json = {};

    forEach(this.tables, function(table, tableName) {
        json[tableName] = table.toJSON();
    });

    return json;
};

Schema.prototype.fromJSON = function(json) {
    var _this = this,
        options = this._options;

    forEach(json, function(columns, tableName) {
        var opts = options[tableName];

        if (opts) {
            delete options[tableName];
        } else {
            opts = options;
        }

        _this.create(tableName, opts).addColumns(columns);
    });

    return this;
};

Schema.prototype.toExports = function(numOfSpacesPerTab) {

    return "module.exports = " + JSON.stringify(this.toJSON(), null, +numOfSpacesPerTab || 4).replace(JSON_REPLACER, function(match, key) {
        return key + ":";
    }) + ";\n";
};


module.exports = Schema;

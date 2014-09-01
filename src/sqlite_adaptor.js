var utils = require("utils"),
    sqlite3 = require("sqlite3"),

    Adaptor = require("./adaptor");


function SQLiteAdaptor(options) {
    options || (options = {});
    options.name = "sqlite";

    Adaptor.call(this, options);

    this.file = utils.isString(options.file) ? options.file : "db/sqlite.db";
    this.sql = null;

    if (options.verbose === true) sqlite3.verbose();
}
utils.inherits(SQLiteAdaptor, Adaptor);

SQLiteAdaptor.prototype.init = function(callback) {

    this.sql = new sqlite3.Database(this.file, callback);
    return this;
};

SQLiteAdaptor.prototype.save = function(name, attrs, callback) {
    var _this = this;

    this.sql.get("INSERT INTO " + name + " " + parseAttributes(attrs) + ";", function() {
        _this.findOne(name, attrs, callback);
    });
    return this;
};

SQLiteAdaptor.prototype.update = function(name, attrs, callback) {
    var _this = this;

    this.sql.get("INSERT INTO " + name + " " + parseAttributes(attrs) + ";", function() {
        _this.findOne(name, attrs, callback);
    });
    return this;
};

SQLiteAdaptor.prototype.all = function(name, callback) {

    this.sql.all("SELECT * FROM " + name + ";", callback);
    return this;
};

SQLiteAdaptor.prototype.find = function(name, where, callback) {

    this.sql.all("SELECT * FROM " + name + " WHERE " + parseWhere(where) + ";", callback);
    return this;
};

SQLiteAdaptor.prototype.findOne = function(name, where, callback) {

    this.sql.get("SELECT * FROM " + name + " WHERE " + parseWhere(where) + " LIMIT 1;", callback);
    return this;
};

SQLiteAdaptor.prototype.findById = function(name, id, callback) {

    this.sql.get("SELECT * FROM " + name + " WHERE id=" + id + " LIMIT 1;", callback);
    return this;
};

SQLiteAdaptor.prototype.delete = function(name, id, callback) {

    this.sql.get("DELETE FROM " + name + " WHERE id=" + id + ";", callback);
    return this;
};

SQLiteAdaptor.prototype.deleteWhere = function(name, where, callback) {

    this.sql.all("DELETE FROM " + name + " WHERE " + parseWhere(where) + ";", callback);
    return this;
};

SQLiteAdaptor.prototype.deleteAll = function(name, callback) {

    this.sql.all("DELETE FROM " + name + ";", callback);
    return this;
};

SQLiteAdaptor.prototype.createTable = function(name, options, callback) {

    console.log("CREATE TABLE IF NOT EXISTS " + name + "(\n" + parseTable(options) + "\n);");

    this.sql.exec("CREATE TABLE IF NOT EXISTS " + name + "(\n" + parseTable(options) + "\n);", callback);
    return this;
};

SQLiteAdaptor.prototype.dropTable = function(name, callback) {

    this.sql.exec("DROP TABLE IF EXISTS " + name + ";", callback);
    return this;
};

SQLiteAdaptor.prototype.changeTable = function(name, options, callback) {

    callback(new Error("changeTable(name, options, callback) " + this.name + " not implemented"));
    return this;
};

SQLiteAdaptor.prototype.renameTable = function(oldName, newName, callback) {

    callback(new Error("renameTable(oldName, newName, callback) " + this.name + " not implemented"));
    return this;
};

SQLiteAdaptor.prototype.addColumn = function(tableName, columnName, attributes, callback) {

    callback(new Error("addColumn(tableName, columnName, attributes, callback) " + this.name + " not implemented"));
    return this;
};

SQLiteAdaptor.prototype.renameColumn = function(tableName, columnName, newColumnName, callback) {

    callback(new Error("renameColumn(tableName, columnName, newColumnName, callback) " + this.name + " not implemented"));
    return this;
};

SQLiteAdaptor.prototype.changeColumn = function(tableName, columnName, options, callback) {

    callback(new Error("renameColumn(tableName, columnName, options, callback) " + this.name + " not implemented"));
    return this;
};

SQLiteAdaptor.prototype.removeColumn = function(tableName, columnName, options, callback) {

    callback(new Error("removeColumn(tableName, columnName, options, callback) " + this.name + " not implemented"));
    return this;
};

SQLiteAdaptor.prototype.addIndex = function(tableName, columnName, options, callback) {

    callback(new Error("addIndex(tableName, columnName, options, callback) " + this.name + " not implemented"));
    return this;
};

SQLiteAdaptor.prototype.removeIndex = function(tableName, columnName, options, callback) {

    callback(new Error("removeIndex(tableName, columnName, options, callback) " + this.name + " not implemented"));
    return this;
};

function parseWhere(obj) {
    var keys = utils.keys(obj),
        i = keys.length,
        str = [],
        name, value;

    while (i--) {
        name = keys[i];
        value = obj[name];

        if (value) str.push(name + "=" + dataToValue(value));
    }

    return str.join(" AND ");
}

function parseAttributes(obj) {
    var keys = utils.keys(obj),
        i = keys.length,
        values = [],
        value;

    while (i--) {
        value = obj[keys[i]];

        if (value) {
            values[i] = dataToValue(value);
        } else {
            keys.splice(i, 1);
        }
    }

    return "(" + keys.join(", ") + ") VALUES (" + values.join(", ") + ")";
}

function dataToValue(value) {
    if (typeof(value) === "string") {
        return value[0] === "\"" ? value : "\"" + value + "\"";
    }

    return value;
}

function parseTable(obj) {
    var str = [],
        value;

    for (var key in obj) {
        value = obj[key];
        str.push("\t" + key + " " + propertyToSQL(value));
    }

    return str.join(",\n");
}

function dataType(attribute) {
    var type = (attribute.type || "string").toLowerCase(),
        limit = +attribute.limit,
        ftype;

    if (type === "string" || type === "varchar") {
        return "VARCHAR(" + (limit || 255) + ")";
    } else if (type === "json" || type === "text") {
        return "TEXT";
    } else if (type === "integer" || type === "int") {
        ftype = (limit > 11) ? "BIGINT" : "INT";

        if (!limit && attribute.autoIncrement || attribute.primaryKey) return "INTEGER";
        return ftype + "(" + (limit || 11) + ")";
    } else if (type === "date" || type === "time" || type === "datetime") {
        return "DATETIME";
    } else if (type === "boolean" || type === "bool") {
        return "TINYINT(" + (limit || 1) + ")";
    }

    return "VARCHAR(" + (limit || 255) + ")";
}

function propertyToSQL(attribute) {
    var out = [];

    for (var key in attribute) {
        if (key === "autoIncrement") {
            out.push("AUTOINCREMENT");
        } else if (key === "unique") {
            out.push("UNIQUE");
        } else if (key === "primaryKey") {
            out.push("PRIMARY KEY");
        } else if (key === "defaultsTo") {
            out.push("DEFAULTS " + attribute[key]);
        } else if (key === "null") {
            if (attribute[key] === false) {
                out.push("NOT NULL");
            }
        } else if (key === "type") {
            out.push(dataType(attribute));
        }
    }

    return out.join(" ");
}

module.exports = SQLiteAdaptor;

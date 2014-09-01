var utils = require("utils");


function Adaptor(options) {
    options || (options = {});

    this.name = utils.isString(options.name) ? options.name : "adaptor";
}

Adaptor.prototype.init = function(callback) {

    callback(new Error("init(callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.save = function(tableName, attrs, callback) {

    callback(new Error("save(tableName, attrs, callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.update = function(tableName, attrs, callback) {

    callback(new Error("update(tableName, attrs, callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.all = function(tableName, callback) {

    callback(new Error("all(tableName, callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.find = function(tableName, where, callback) {

    callback(new Error("find(tableName, where, callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.findOne = function(tableName, where, callback) {

    callback(new Error("findOne(tableName, where, callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.findById = function(tableName, id, callback) {

    callback(new Error("findById(tableName, id, callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.delete = function(tableName, id, callback) {

    callback(new Error("delete(tableName, id, callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.deleteWhere = function(tableName, where, callback) {

    callback(new Error("deleteWhere(tableName, where, callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.deleteAll = function(tableName, callback) {

    callback(new Error("deleteWhere(tableName, callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.createTable = function(tableName, attributes, callback) {

    callback(new Error("createTable(tableName, attributes, callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.dropTable = function(tableName, callback) {

    callback(new Error("dropTable(tableName, callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.changeTable = function(tableName, attributes, callback) {

    callback(new Error("changeTable(tableName, attributes, callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.renameTable = function(oldName, newName, callback) {

    callback(new Error("renameTable(oldName, newName, callback) Adtor " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.addColumn = function(tableName, columnName, attributes, callback) {

    callback(new Error("addColumn(tableName, columnName, attributes, callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.renameColumn = function(tableName, columnName, newColumnName, callback) {

    callback(new Error("renameColumn(tableName, columnName, newColumnName, callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.changeColumn = function(tableName, columnName, attributes, callback) {

    callback(new Error("renameColumn(tableName, columnName, attributes, callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.removeColumn = function(tableName, columnName, options, callback) {

    callback(new Error("removeColumn(tableName, columnName, options, callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.addIndex = function(tableName, columnName, attributes, callback) {

    callback(new Error("addIndex(tableName, columnName, attributes, callback) " + this.name + " not implemented"));
    return this;
};

Adaptor.prototype.removeIndex = function(tableName, columnName, attributes, callback) {

    callback(new Error("removeIndex(tableName, columnName, attributes, callback) " + this.name + " not implemented"));
    return this;
};


module.exports = Adaptor;

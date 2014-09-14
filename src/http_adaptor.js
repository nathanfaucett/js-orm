var utils = require("utils"),
    each = require("each"),
    type = require("type"),
    qs = require("qs"),
    request = require("request");


var defaultPaths = {
    find: "/find",
    findOne: "/find_one",
    "delete": "/delete",
    deleteOne: "/delete_one",
    save: "/save",
    update: "/update"
};


function HttpAdaptor(options) {
    options || (options = {});

    this._options = options;

    this.collection = null;
    this.paths = null;
}

function HttpAdaptor_parsePaths(_this, options) {
    var parsed = {};

    options.paths || (options.paths = {});

    each(_this.collection.schema.tables, function(table, tableName) {
        var tablePaths = options.paths[tableName] || (options.paths[tableName] = {}),
            parsedPaths = parsed[tableName] = {};

        each(defaultPaths, function(path, method) {
            if (!tablePaths[method]) {
                tablePaths[method] = "/" + tableName + path;
            }
        });

        each(tablePaths, function(path, method) {
            parsedPaths[method] = (tablePaths.url || options.url || "") + tablePaths[method];
        });
    });

    return parsed;
}

HttpAdaptor.prototype.init = function(callback) {

    this.paths = HttpAdaptor_parsePaths(this, this._options);
    callback();

    return this;
};

HttpAdaptor.prototype.save = function(tableName, params, callback) {

    request.get({
        url: this.paths[tableName].save + "?" + qs.stringify(params),
        type: "json",
        success: function(response) {
            callback(undefined, response.data);
        },
        error: function(err) {
            callback(err);
        }
    });
    return this;
};

HttpAdaptor.prototype.update = function(tableName, params, callback) {

    request.get({
        url: this.paths[tableName].update + "?" + qs.stringify(params),
        type: "json",
        success: function(response) {
            callback(undefined, response.data);
        },
        error: function(err) {
            callback(err);
        }
    });
    return this;
};

HttpAdaptor.prototype.all = function(tableName, callback) {

    request.get({
        url: this.paths[tableName].find,
        type: "json",
        success: function(response) {
            callback(undefined, response.data);
        },
        error: function(err) {
            callback(err);
        }
    });
    return this;
};

HttpAdaptor.prototype.find = function(tableName, query, callback) {

    request.get({
        url: this.paths[tableName].find + "?" + qs.stringify(query),
        type: "json",
        success: function(response) {
            callback(undefined, response.data);
        },
        error: function(err) {
            callback(err);
        }
    });
    return this;
};

HttpAdaptor.prototype.findOne = function(tableName, query, callback) {

    request.get({
        url: this.paths[tableName].findOne + "?" + qs.stringify(query),
        type: "json",
        success: function(response) {
            callback(undefined, response.data);
        },
        error: function(err) {
            callback(err);
        }
    });
    return this;
};

HttpAdaptor.prototype.findById = function(tableName, id, callback) {

    request.get({
        url: this.paths[tableName].findOne + "?where%5Bid%5D=" + id,
        type: "json",
        success: function(response) {
            callback(undefined, response.data);
        },
        error: function(err) {
            callback(err);
        }
    });
    return this;
};

HttpAdaptor.prototype["delete"] = function(tableName, id, callback) {

    request.get({
        url: this.paths[tableName].deleteOne + "?where%5Bid%5D=" + id,
        type: "json",
        success: function(response) {
            callback(undefined, response.data);
        },
        error: function(err) {
            callback(err);
        }
    });
    return this;
};

HttpAdaptor.prototype.deleteWhere = function(tableName, query, callback) {

    request.get({
        url: this.paths[tableName]["delete"] + "?" + qs.stringify(query),
        type: "json",
        success: function(response) {
            callback(undefined, response.data);
        },
        error: function(err) {
            callback(err);
        }
    });
    return this;
};

HttpAdaptor.prototype.deleteAll = function(tableName, callback) {

    request.get({
        url: this.paths[tableName]["delete"],
        type: "json",
        success: function(response) {
            callback(undefined, response.data);
        },
        error: function(err) {
            callback(err);
        }
    });
    return this;
};


module.exports = HttpAdaptor;

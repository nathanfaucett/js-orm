var utils = require("utils"),
    each = require("each"),
    type = require("type"),
    request = require("request");


var defaultPaths = {
    save: "/save",
    update: "/update",
    all: "/all",
    find: "/find",
    findOne: "/findOne",
    findById: "/findById",
    "delete": "/delete",
    deleteWhere: "/deleteWhere",
    deleteAll: "/deleteAll"
};


function stringify(obj, prefix) {
    var values = [],
        key;

    if (Buffer.isBuffer(obj)) {
        obj = obj.toString();
    } else if (obj instanceof Date) {
        obj = obj.toISOString();
    } else if (obj == null) {
        obj = "";
    }

    if (typeof(obj) === "string" ||
        typeof(obj) === "number" ||
        typeof(obj) === "boolean") {

        return [encodeURIComponent(prefix) + "=" + encodeURIComponent(obj)];
    }

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            values = values.concat(stringify(obj[key], prefix + "[" + key + "]"));
        }
    }

    return values;
}

function qsStringify(obj) {
    var keys = [],
        key;

    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            keys = keys.concat(stringify(obj[key], key));
        }
    }

    return keys.join("&");
}


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
        url: this.paths[tableName].save + "?" + qsStringify(params),
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
        url: this.paths[tableName].update + "?" + qsStringify(params),
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
        url: this.paths[tableName].all,
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
        url: this.paths[tableName].find + "?" + qsStringify(query),
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
        url: this.paths[tableName].findOne + "?" + qsStringify(query),
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
        url: this.paths[tableName].findById + "?id=" + id,
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
        url: this.paths[tableName]["delete"] + "?id=" + id,
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
        url: this.paths[tableName].deleteWhere + "?" + qsStringify(query),
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
        url: this.paths[tableName].deleteAll,
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

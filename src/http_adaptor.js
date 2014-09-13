var utils = require("utils"),
    each = require("each"),
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


function HttpAdaptor(paths) {

    this.paths = HttpAdaptor_parsePaths(this, paths);
    this.collection = null;
}

function HttpAdaptor_parsePaths(_this, tablePaths) {
    var parsed = {};

    each(tablePaths, function(paths, tableName) {
        each(defaultPaths, function(path, method) {
            if (!paths[method]) {
                paths[method] = "/" + tableName + path;
            }

            paths[method] = (paths.url || "") + paths[method];
        });

        parsed[tableName] = paths;
    });

    return parsed;
}

HttpAdaptor.prototype.init = function(callback) {

    callback();
    return this;
};

HttpAdaptor.prototype.save = function(tableName, params, callback) {

    request.post({
        url: this.paths[tableName].save,
        type: "json",
        data: params,
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

    request.post({
        url: this.paths[tableName].update,
        type: "json",
        data: params,
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

    request.post({
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

    request.post({
        url: this.paths[tableName].find,
        type: "json",
        data: query,
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

    request.post({
        url: this.paths[tableName].findOne,
        type: "json",
        data: query,
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

    request.post({
        url: this.paths[tableName].findById,
        type: "json",
        data: {
            id: id
        },
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

    request.post({
        url: this.paths[tableName]["delete"],
        type: "json",
        data: {
            id: id
        },
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

    request.post({
        url: this.paths[tableName].deleteWhere,
        type: "json",
        data: query,
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

    request.post({
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

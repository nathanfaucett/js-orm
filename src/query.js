var Promise = require("promise"),
    utils = require("utils");


function Query(model, action, conditions) {

    this._model = model;
    this._action = action;

    this._currentKey = false;

    this._conditions = utils.extend({}, conditions.where);

    delete conditions.where;
    this._params = conditions;
}

Query.prototype.where = function(key, value) {

    if (value === undefined) {
        this._currentKey = key;
    } else {
        this._conditions[key] = value;
        this._currentKey = false;
    }

    return this;
};

Query.prototype.range = function(key, from, to) {
    var currentKey = this._currentKey,
        conditions = this._conditions,
        condition;

    if (currentKey === false && to === undefined) {
        throw new Error("Query.range(from, to) no key is currently selected");
    }

    if (to === undefined) {
        if (currentKey !== false) {
            to = from;
            from = key;
            condition = conditions[currentKey] || (conditions[currentKey] = {});

            condition.gt = from;
            condition.lt = to;
        }
    } else {
        this._currentKey = false;

        condition = conditions[key] || (conditions[key] = {});

        condition.gt = from;
        condition.lt = to;
    }
    return this;
};

Query.prototype.between = Query.prototype.range;

["gt", "gte", "lt", "lte", "in", "inq", "ne", "neq", "nin"].forEach(function(method) {
    Query.prototype[method] = function(key, value) {
        var conditions = this._conditions,
            currentKey = this._currentKey;

        if (currentKey === false && value === undefined) {
            throw new Error("Query." + method + "(value) no key is currently selected");
        }

        if (value === undefined) {
            if (currentKey !== false) {
                (conditions[currentKey] || (conditions[currentKey] = {}))[method] = key;
            }
        } else {
            (conditions[key] || (conditions[key] = {}))[method] = value;
            this._currentKey = false;
        }

        return this;
    };
});

var NEGATIVE = /^-/;
Query.prototype.order = function(key, value) {
    var params = this._params,
        param;

    this._currentKey = false;

    if (key === undefined && value === undefined) {
        throw new Error("Query.order(key, value) key and value, or key required");
    }

    if (value === undefined) {
        param = params.order || (params.order = []);

        if (NEGATIVE.test(key)) {
            param[0] = key.replace(NEGATIVE, "");
            param[1] = "DESC";
        } else {
            param[0] = key;
            param[1] = "ASC";
        }
    } else {
        param = params.order || (params.order = []);
        param[0] = key;
        param[1] = value.toUpperCase();
    }
    return this;
};
Query.prototype.sort = Query.prototype.order;

["skip", "limit"].forEach(function(method) {
    Query.prototype[method] = function(value) {
        this._currentKey = false;

        if (value === undefined) {
            throw new Error("Query." + method + "(value) value required");
        }

        this._params[method] = value;
        return this;
    };
});

Query.prototype.asc = function(value) {
    var params = this._params,
        param = params.order || (params.order = []);

    this._currentKey = false;
    param[0] = value;
    param[1] = "ASC";

    return this;
};

Query.prototype.desc = function(value) {
    var params = this._params,
        param = params.order || (params.order = []);

    this._currentKey = false;
    param[0] = value;
    param[1] = "DESC";

    return this;
};

Query.prototype.exec = function(callback) {
    var query = utils.extend({
        where: utils.extend({}, this._conditions)
    }, this._params);

    this._model[this._action](query, callback);
};

Query.prototype.run = Query.prototype.exec;

Query.prototype.then = function(onFulfill, onReject) {
    var defer = Promise.defer(),
        query = utils.extend({
            where: utils.extend({}, this._conditions)
        }, this._params);

    this._model[this._action](query, function(err, result) {
        if (err) {
            defer.reject(err);
            return;
        }

        defer.resolve(result);
    });

    return defer.promise.then(onFulfill, onReject);
};


module.exports = Query;

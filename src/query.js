var utils = require("utils");


function Query(model, table, action, where) {
    var conditions = utils.extend({}, where),
        params = {};

    this._model = model;
    this._table = table;
    this._action = action;

    this._currentKey = false;
    this._conditions = conditions;
    this._params = params;

    this._query = {
        conditions: conditions,
        params: params
    };
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

["gt", "gte", "lt", "lte", "in", "inq", "ne", "neq", "nin", "regex", "like", "nlike", "between"].forEach(function(method) {
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

};

Query.prototype.run = Query.prototype.exec;

Query.prototype.then = function(success, failure) {

};


module.exports = Query;

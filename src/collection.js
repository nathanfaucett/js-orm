var EventEmitter = require("event_emitter"),
    type = require("type"),
    each = require("each"),
    utils = require("utils"),
    Schema = require("./schema"),

    Model = require("./model");


function Collection(opts) {
    var options = {};

    opts || (opts = {});

    options.schema = opts.schema;
    options.adapters = opts.adapters;
    options.defaultAdapter = opts.defaultAdapter || utils.keys(opts.adapters)[0];

    EventEmitter.call(this);

    this._options = options;
    this._schema = new Schema(options.schema);

    this._adapters = {};
    this._modelHash = {};

    this.models = {};

    if (type.isObject(options.adapters)) {
        this.bindAdapters(options.adapters);
    }
}
EventEmitter.extend(Collection);

Collection.prototype.init = function(callback) {
    var length = 0,
        called = false;

    function createCallback() {
        length++;

        return function done(err) {
            if (called === true) {
                return;
            }

            if (err || --length === 0) {
                called = true;
                callback(err);
            }
        };
    }

    this._schema.init();

    each(this.models, function(model) {

        model.init(createCallback());
    });

    each(this._adapters, function(adapter) {

        adapter.init(createCallback());
    });

    return this;
};

Collection.prototype.close = function() {

    each(this._adapters, function(adapter) {

        adapter.close();
    });
    return this;
};

Collection.prototype.adapter = function(name) {
    var adapter = this._adapters[name];

    if (!adapter) {
        throw new Error(
            "Collection.adapter(name)\n" +
            "    no adapter bound to collection found with tableName or className " + name
        );
    }

    return adapter;
};

Collection.prototype.bindAdapter = function(name, adapter) {

    Collection_bindAdapter(this, name, adapter);
    return this;
};

Collection.prototype.bindAdapters = function(adapters) {
    var _this = this;

    if (!type.isObject(adapters)) {
        throw new Error(
            "Collection.bindAdapters(adapters)\n" +
            "    adapters must be a Object ex {'memory': new MemoryAdapter(), 'mysql': new MySQLAdapter()}"
        );
    }

    each(adapters, function(adapter, name) {

        Collection_bindAdapter(_this, name, adapter);
    });
    return this;
};

function Collection_bindAdapter(_this, name, adapter) {
    var adapters = _this._adapters;

    if (!adapters[name] && !adapter._collection) {
        adapter._collection = _this;
        adapters[name] = adapter;
    } else {
        throw new Error(
            "Collection.bind(adapter)\n" +
            "    adapter " + adapter._className + " already bound to collection"
        );
    }
}

Collection.prototype.model = function(name) {
    var model = this._modelHash[name];

    if (!model) {
        throw new Error(
            "Collection.model(name)\n" +
            "    no model bound to collection found with tableName or className " + name
        );
    }

    return model;
};

Collection.prototype.bindModel = function(model) {

    Collection_bindModel(this, model);
    return this;
};

Collection.prototype.bindModels = function() {
    var i = arguments.length,
        model;

    while (i--) {
        model = arguments[i];

        if (!(model instanceof Model)) {
            throw new Error(
                "Collection.bind(model [, model..])\n" +
                "    model is not an instance of Model"
            );
        }

        Collection_bindModel(this, model);
    }
    return this;
};

function Collection_bindModel(_this, model) {
    var models = _this.models,
        modelHash = _this._modelHash,

        className = model.className,
        tableName = model.tableName;

    if (!modelHash[tableName] && !modelHash[className] && !model._collection) {
        _this._schema.add(model._schema);

        model._collection = _this;
        models[className] = modelHash[tableName] = modelHash[className] = model;
    } else {
        throw new Error(
            "Collection.bind(model)\n" +
            "    model " + model._className + " already bound to collection"
        );
    }
}


module.exports = Collection;

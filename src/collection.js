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
    options.adaptors = opts.adaptors;
    options.defaultAdaptor = opts.defaultAdaptor || utils.keys(opts.adaptors)[0];

    EventEmitter.call(this);

    this._options = options;
    this._schema = new Schema(options.schema);

    this._adaptors = {};
    this._modelHash = {};

    this.models = {};

    if (type.isObject(options.adaptors)) {
        this.bindAdaptors(options.adaptors);
    }
}
EventEmitter.extend(Collection);

Collection.prototype.init = function(callback) {
    var length = 0,
        done = false;

    function createCallback() {
        length++;

        if (done) {
            return function() {};
        }

        return function adaptorCallback(err) {

            if (err || --length <= 0) {
                done = true;
                callback(err);
            }
        };
    }

    this._schema.init();

    each(this.models, function(model) {

        model.init();
    });

    each(this._adaptors, function(adaptor) {

        adaptor.init(createCallback());
    });

    return this;
};

Collection.prototype.adaptor = function(name) {
    var adaptor = this._adaptors[name];

    if (!adaptor) {
        throw new Error(
            "Collection.adaptor(name)\n" +
            "    no adaptor bound to collection found with tableName or className " + name
        );
    }

    return adaptor;
};

Collection.prototype.bindAdaptor = function(name, adaptor) {

    Collection_bindAdaptor(this, name, adaptor);
    return this;
};

Collection.prototype.bindAdaptors = function(adaptors) {
    var _this = this;

    if (!type.isObject(adaptors)) {
        throw new Error(
            "Collection.bindAdaptors(adaptors)\n" +
            "    adaptors must be a Object ex {'memory': new MemoryAdaptor(), 'mysql': new MySQLAdaptor()}"
        );
    }

    each(adaptors, function(adaptor, name) {

        Collection_bindAdaptor(_this, name, adaptor);
    });
    return this;
};

function Collection_bindAdaptor(_this, name, adaptor) {
    var adaptors = _this._adaptors;

    if (!adaptors[name] && !adaptor._collection) {
        adaptor._collection = _this;
        adaptors[name] = adaptor;
    } else {
        throw new Error(
            "Collection.bind(adaptor)\n" +
            "    adaptor " + adaptor._className + " already bound to collection"
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

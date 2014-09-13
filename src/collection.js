var utils = require("utils"),
    type = require("type"),
    each = require("each"),
    inflect = require("inflect"),

    Model = require("./model"),
    Schema = require("./schema");


function Collection(options) {
    if (!(this instanceof Collection)) return new Collection(options);

    options || (options = {});

    this.adaptors = utils.create(null);
    this.models = utils.create(null);
    this.schema = new Schema(this, options.schema);

    if (type.isObject(options.adaptors)) {
        each(options.adaptors, function(adaptor, name) {
            this.adaptor(name, adaptor);
        }, this);
    }

    return this;
}

Collection.prototype.init = function(callback) {
    var count = utils.keys(this.adaptors).length,
        errors;

    function done(err) {
        if (err) {
            (errors || (errors = [])).push(err);
        }
        if (--count <= 0) {
            callback(errors);
        }
    }

    this.schema.init();

    each(this.models, function(model) {
        model.init();
    });

    each(this.adaptors, function(adaptor) {

        adaptor.init(done);
    }, this);

    return this;
};

Collection.prototype.adaptor = function(name, adaptor) {

    adaptor.collection = this;
    this.adaptors[name] = adaptor;

    return this;
};

Collection.prototype.model = function() {
    var i = 0,
        length = arguments.length;

    for (; i < length; i++) {
        Collection_model(this, arguments[i]);
    }
    return this;
};

function Collection_model(_this, model) {
    var models = _this.models,
        className = model.className,
        tableName = model.tableName;

    if (models[className]) {
        throw new Error("Collection model(model) Collection already has model with class name " + className);
    }

    model.collection = _this;
    model.schema = _this.schema.createTable(tableName);

    models[className] = model;
}


module.exports = Collection;

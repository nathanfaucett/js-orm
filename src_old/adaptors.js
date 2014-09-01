var utils = require("utils");


function Adaptors(ctx, adaptors) {

    this.ctx = ctx;
    this.values = Object.create(null);

    if (utils.isObject(adaptors)) {
        for (var key in adaptors) this.set(key, adaptors[key]);
    }
};

Adaptors.prototype.init = function(callback) {
    return callback();
    var values = this.values,
        adaptors = utils.keys(values),
        count = adaptors.length,
        errors;

    function done(err) {
        if (err)(errors || (errors = [])).push(err);
        if (--count <= 0) callback(errors);
    }

    adaptors.forEach(function(name) {
        values[name].init(done);
    });

    return this;
};

Adaptors.prototype.get = function(name) {
    var adaptor = this.values[name];

    if (!adaptor) {
        throw new Error("get(name) Adaptor " + name + " not found make sure it was required and pass to ORM.adaptor(name, adaptor)");
    }

    return adaptor;
};

Adaptors.prototype.set = function(name, adaptor) {
    if (utils.isObject(name)) {
        adaptor = name;
        name = adaptor.name;
    }

    if (this.values[name]) {
        throw new Error("set(name, adaptor) Adaptor already has adaptor named " + name);
    }

    this.values[name] = adaptor;
    return this;
};


module.exports = Adaptors;

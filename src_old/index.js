var utils = require("utils"),
    EventEmitter = require("event_emitter"),

    Schema = require("./schema"),
    Collections = require("./collections"),
    Adaptors = require("./adaptors");


function ORM(opts) {
    opts || (opts = {});

    EventEmitter.call(this);

    this.defaultAdaptor = utils.isString(opts.defaultAdaptor) ? opts.defaultAdaptor : null;
    this.defaultPrimaryKeyFormat = utils.isString(opts.defaultPrimaryKeyFormat) ? opts.defaultPrimaryKeyFormat : "integer";

    this.adaptors = new Adaptors(this, opts.adaptors);
    this.schema = new Schema(this, opts.schema);
    this.collections = new Collections(this);
}
EventEmitter.extend(ORM);

ORM.prototype.init = function(callback) {
    var _this = this;

    this.adaptors.init(function(err) {
        if (err) {
            callback(err);
            return;
        }

        _this.schema.init(function(err) {
            if (err) {
                callback(err);
                return;
            }

            _this.collections.init();
            callback(null);
        });
    });

    return this;
};

ORM.prototype.adaptor = function(name, adaptor) {

    return this.adaptors.set(name, adaptor);
};

ORM.prototype.define = function(name, options) {

    return this.collections.define(name, options);
};

ORM.prototype.get = function(name) {

    return this.collections.get(name);
};


module.exports = ORM;

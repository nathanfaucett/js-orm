var fs = require("fs"),
    filePath = require("file_path"),
    fileUtils = require("file_utils"),
    utils = require("utils"),

    Migrate = require("./migrate");


var SPLITER = /(?:([0-9]+)\_)?([a-zA-Z]+)\_([a-zA-Z]+)/;


function Migration(fullPath) {
    var parts = filePath.base(fullPath).match(SPLITER);

    this.fullPath = fullPath;
    this.time = +parts[1] || Number.MAX_VALUE;
    this.action = parts[2];
    this.table = parts[3];
    this.exports = require(fullPath);
}


function Migrations(ctx, opts) {
    opts || (opts = {});

    this.ctx = ctx;
    this.folder = utils.isString(opts.folder) ? opts.folder : "./db/migrate";
    this.values = [];
}

Migrations.prototype.init = function(callback) {
    var values = this.values;

    fileUtils.dive(this.folder,
        function(err, fullName) {
            if (err) {
                callback(err);
                return false;
            }

            values.push(new Migration(fullName));
            return true;
        },
        function() {
            values.sort(function(a, b) {
                return a.time - b.time;
            });
            callback();
        }
    );

    return this;
};

Migrations.prototype.up = function(callback) {

    return this.run("up", callback);
};

Migrations.prototype.down = function(callback) {

    return this.run("down", callback);
};

Migrations.prototype.change = function(callback) {

    return this.run("change", callback);
};

Migrations.prototype.run = function(name, callback) {
    var _this = this;

    return this.init(function(err) {
        var ctx = _this.ctx,
            schema = ctx.schema,
            values = _this.values,
            tasks = values.length,
            errors;

        if (err) {
            values.length = 0;
            callback([err]);
            return;
        }

        function done(errs) {
            if (errs)(errors || (errors = [])).push.apply(errors, errs);
            if (--tasks <= 0) {
                values.length = 0;

                if (errs) {
                    callback(errors);
                } else {
                    schema.save(function(err) {
                        if (err)(errors || (errors = [])).push.apply(errors, errs);
                        callback(errors);
                    });
                }
            }
        }

        utils.each(values, function(value) {
            var collection = ctx.get(value.table),
                action = name || value.action,
                exports = value.exports,
                migrate;

            if (!collection.hasSchema) return true;

            if (!utils.isFunction(exports[action])) {
                callback(new Error("no migrations match " + action));
                return false;
            }

            migrate = new Migrate(ctx.schema, done);

            exports[action](migrate);
            migrate._run(collection.adaptor);
            migrate._clear();

            collection.generateModel();

            return true;
        });
    });
};


module.exports = Migrations;

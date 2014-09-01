var fs = require("fs"),

    utils = require("utils"),
    EventEmitter = require("event_emitter"),
    filePath = require("file_path"),
    fileUtils = require("file_utils"),

    Migrate = require("./migrate");


var SPLITER = /(?:([0-9]+)\_)?([a-zA-Z]+)\_([a-zA-Z]+)/,
    HR_TIME = process.hrtime();


function now() {
    var hrtime = process.hrtime(HR_TIME),
        s = hrtime[0],
        ns = hrtime[1] * 1e-9;

    return s + ns;
}

function Migration(fullPath) {
    var parts = filePath.base(fullPath).match(SPLITER);

    this.fullPath = fullPath;
    this.time = +parts[1] || Number.MAX_VALUE;
    this.action = parts[2];
    this.table = parts[3];

    this.exports = require(fullPath);
}


function Migrations(ctx, options) {
    options || (options = {});

    EventEmitter.call(this);

    this.ctx = ctx;
    this.folder = utils.isString(options.folder) ? options.folder : "./db/migrate";

    this.migrations = [];
    this.tasks = [];

    this.migrate = new Migrate(ctx);
}
EventEmitter.extend(Migrations);

Migrations.prototype.init = function(options, callback) {
    var migrations = this.migrations;

    if (utils.isFunction(options)) {
        callback = options;
        options = {};
    }
    options || (options = {});

    if (options.before) {
        if (options.before === "now") {
            options.before = Date.now();
        }
    }
    if (options.after) {
        if (options.after === "now") {
            options.after = Date.now();
        }
    }

    fileUtils.dive(this.folder,
        function(err, fullName) {
            var migration;

            if (err) {
                callback(err);
                return false;
            }

            migration = new Migration(fullName);
            migrations.push(migration);

            return true;
        },
        function() {
            removeMigrations(migrations);
            callback();
        }
    );

    return this;
};

Migrations.prototype.clear = function() {

    this.migrations.length = 0;
    this.tasks.length = 0;

    return this;
};

Migrations.prototype.up = function(options, callback) {

    return Migrations_run(this, "up", options, callback);
};

Migrations.prototype.down = function(options, callback) {

    return Migrations_run(this, "down", options, callback);
};

function Migrations_run(_this, type, options, callback) {

    function cb(errs) {

        _this.clear();

        if (errs) {
            callback(errs);
            return;
        }

        _this.ctx.schema.save(callback);
    }

    options || (options = {});

    return _this.init(options, function(err) {
        var verbose = options.verbose,
            ctx = _this.ctx,
            migrate = _this.migrate,
            migrations = _this.migrations,
            tasks = _this.tasks,
            collections = [],
            length, errors;

        if (err) {
            cb([err]);
            return;
        }

        utils.each(migrations, function(migration) {
            var collection = ctx.getCollection(migration.table),
                action = type || migration.action,
                exports = migration.exports;

            if (!collection.hasSchema) return true;

            if (!utils.isFunction(exports[action])) {
                cb([new Error("no migrations match " + action)]);
                return false;
            }

            if (collections.indexOf(collection) === -1) collections.push(collection);

            migrate.collection = collection;
            migrate.adaptor = collection.adaptor;

            exports[action](migrate);

            return true;
        });

        utils.each(collections, function(collection) {
            collection.generateModel();
        });

        tasks.sort(sortTasks);
        length = tasks.length;

        if (length === 0) {
            cb();
            return;
        }

        utils.each(tasks, function(task) {
            var adaptor = task.adaptor,
                start;

            task.args.push(function(err) {
                if (err) {
                    (errors || (errors = [])).push(err);
                } else {
                    task.ms = now() - start;
                    if (verbose !== false) console.log(task.toString());
                }

                if (--length === 0) {
                    cb(errors);
                }
            });

            if (adaptor) {
                if (utils.isFunction(adaptor[task.name])) {
                    start = now();
                    adaptor[task.name].apply(adaptor, task.args);
                } else {
                    cb([new Error("collection " + task.collection.name + " adaptor with name " + adaptor.name + " has no function " + task.name)]);
                    return false;
                }
            } else {
                cb([new Error("collection " + task.collection.name + " is not defined")]);
                return false;
            }

            return true;
        });
    });
}

function removeMigrations(migrations) {
    var remove = [],
        length = migrations.length,
        i = length,
        j = 0,
        a, b;

    loop0: while (i--) {
        a = migrations[i];

        j = length;
        loop1: while (j--) {
            b = migrations[j];
            if (a === b || a.table !== b.table) continue loop1;

            if (a.time <= b.time && a.action === b.action && remove.indexOf(i) === -1) {
                remove.unshift(i);
            }
        }
    }

    i = remove.length;
    while (i--) migrations.splice(remove[i], 1);
}

function sortTasks(a, b) {

    return a.order - b.order;
}


module.exports = Migrations;

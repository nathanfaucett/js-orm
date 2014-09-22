var fileUtils = require("file_utils"),
    each = require("each"),
    type = require("type"),
    utils = require("utils"),
    filePath = require("file_path"),
    Migrate = require("./migrate");


var migrations = module.exports,
    SPLITER = /(?:([0-9]+)\_)?([a-z]+)\_([a-z]+)/i,
    HR_TIME = process.hrtime();


function Migration(fullPath) {
    var parts = filePath.base(fullPath).match(SPLITER);

    this.fullPath = fullPath;
    this.time = +parts[1] || Number.MAX_VALUE;
    this.action = parts[2];
    this.table = parts[3];

    this.exports = require(fullPath);
}


function now() {
    var hrtime = process.hrtime(HR_TIME),
        s = hrtime[0],
        ns = hrtime[1] * 1e-9;

    return (s + ns) * 1e3;
}

migrations.now = now;

migrations.up = function(options, callback) {
    options || (options = {});

    options.type = "up";

    run(options, callback);
};

migrations.down = function(options, callback) {
    options || (options = {});

    options.type = "down";

    run(options, callback);
};

migrations.drop = function(options, callback) {
    var adaptor = options.adaptor,
        verbose = options.verbose !== false;

    adaptor.init(function(err) {
        var task;

        if (err) {
            callback(err);
            return;
        }

        migrate = new Migrate(options);
        migrate.dropDatabase();

        task = migrate._tasks[0];
        task.args.push(function(err) {
            task._time = now() - task._time;
            if (verbose) {
                console.log(task.print());
            }
            callback(err);
        });
        task._time = now();

        adaptor[task.name].apply(adaptor, task.args);
    });
};

function load(options, callback) {
    var migrations = [];

    fileUtils.dive(options.folder,
        function(file, next) {
            migrations.push(new Migration(file.path));
            next();
        },
        function(err) {
            if (err) {
                callback(err);
                return;
            }

            cleanMigrations(migrations, options.before, options.after);
            callback(undefined, migrations);
        }
    );
}

function run(options, callback) {
    if (!type.isString(options.folder)) {
        callback(new Error("options.folder must be an string"));
        return;
    }
    if (!type.isObject(options.adaptor)) {
        callback(new Error("options.adaptor must be an object"));
        return;
    }

    load(options, function(err, migrations) {
        var migrationType = options.type,
            adaptor = options.adaptor,
            verbose = options.verbose !== false;

        if (err) {
            callback(err);
            return;
        }

        adaptor.init(function(err) {
            var tasks = [],
                index = 0,
                length;

            if (err) {
                callback(err);
                return;
            }

            each(migrations, function(migration) {
                var migrate = new Migrate(options),
                    migrateTasks = migrate._tasks;

                migration.exports[migrationType](migrate);

                each(migrateTasks, function(task) {
                    task.args.push(function(err) {
                        task._time = now() - task._time;
                        if (verbose) {
                            console.log(task.print());
                        }
                        next(err);
                    });
                });

                tasks.push.apply(tasks, migrateTasks);
            });

            tasks.sort(sortTasks);
            length = tasks.length;

            function next(err) {
                var task;

                if (err || index >= length) {
                    callback(err);
                    return;
                }

                task = tasks[index++];

                if (!type.isFunction(adaptor[task.name])) {
                    next(new Error("adaptor does not have method " + task.name));
                    return;
                }

                try {
                    task._time = now();
                    adaptor[task.name].apply(adaptor, task.args);
                } catch (e) {
                    next(e);
                }
            };

            next();
        });
    });
}


function cleanMigrations(array, before, after) {
    var remove = [],
        length = array.length,
        i = length,
        j = 0,
        a, b;

    before || (before = Infinity);
    after || (after = -Infinity);

    outer: while (i--) {
        a = array[i];

        if (a.time >= before || a.time <= after) {
            remove.unshift(i);
            continue;
        }

        j = length;
        inner: while (j--) {
            b = array[j];

            if (a === b || a.table !== b.table || a.action !== b.action) {
                continue inner;
            }

            if (a.time < b.time && utils.indexOf(remove, i) === -1 && utils.indexOf(remove, j) === -1) {
                remove.unshift(i);
            }
        }
    }

    i = remove.length;
    while (i--) array.splice(remove[i], 1);
}

function sortTasks(a, b) {

    return a.order - b.order;
}

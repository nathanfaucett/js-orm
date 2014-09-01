#!/usr/bin/env node

var filePath = require("file_path");


function parseOptions() {
    var parsed = {},
        argv = process.argv.slice(2),
        i = 0,
        il = argv.length,
        arg, next;

    for (; i < il; i++) {
        arg = argv[i];
        next = argv[i + 1];

        if (!arg) continue;
        if (arg[0] !== "-") continue;

        if (!next || next[0] === "-") {
            parsed[arg] = true;
        } else if (next) {
            parsed[arg] = next;
        }
    }

    return parsed;
}

function prettyError(error) {

    return (error.stack || error.message || error + "");
}

function prettyErrors(errors) {
    var i = 0,
        il = errors.length,
        out = "";

    for (; i < il; i++) out += "\n" + prettyError(errors[i]) + "\n";
    return out;
}

function up(db, options) {
    db.migrations.up(options, function(errors) {
        if (errors) {
            console.log("\nORM Migrations failed with errors:\n" + prettyErrors(errors));
            return;
        }

        console.log("\nORM Migrations successfully migrated up\n");
    });
}

function down(db, options) {
    db.migrations.down(options, function(errors) {
        if (errors) {
            console.log("ORM Migrations failed with errors:\n" + prettyErrors(errors));
            return;
        }

        console.log("\nORM Migrations successfully migrated down\n");
    });
}

function run(args) {
    var db = require(filePath.join(process.cwd(), args["--db"])),
        options = {};

    db.init(function(err) {
        if (err) {
            console.log("\nORM Migrations failed with errors:\n" + prettyError(err));
            return;
        }

        if (args["--up"]) {
            up(db, options);
        } else if (args["--down"]) {
            down(db, options);
        } else {
            console.log("\nORM Migrations pass --up or --down to run migrations\n");
        }
    });
}


run(parseOptions());

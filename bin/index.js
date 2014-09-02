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

function runUp(db, options) {
    db.migrations.up(options, function(errors) {
        if (errors) {
            console.log("\nORM Migrations failed with errors:\n" + prettyErrors(errors));
            return;
        }

        console.log("\nORM Migrations successfully migrated up\n");
    });
}

function runDown(db, options) {
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
        var up = !!args["--up"],
            down = !!args["--down"],
            seed = args["--seed"];

        if (err) {
            console.log("\nORM Migrations failed with errors:\n" + prettyError(err));
            return;
        }

        if (seed && typeof(seed) === "string") {
            require(filePath.join(process.cwd(), seed))(function(err) {
                if (err) {
                    console.log("ORM Seed failed with error:\n" + prettyError(err));
                    return;
                }

                console.log("\nORM Seed successfully seeded\n");
            });
            return;
        }

        if (up || !down) {
            runUp(db, options);
        } else {
            runDown(db, options);
        }
    });
}


run(parseOptions());

#!/usr/bin/env node

require("inflections_en");

var filePath = require("file_path"),
    utils = require("utils"),
    migrations = require("./migrations"),

    options = {},
    start = 0,

    argv = require("optimist")
    .demand("c").alias("c", "config").describe("c", "config file")
    .alias("a", "after").describe("a", "only run migrations after passed date")
    .alias("b", "before").describe("b", "only run migrations before passed date")
    .describe("drop", "drop database")
    .describe("up", "migrate up")
    .describe("down", "migrate down")
    .alias("v", "verbose").describe("v", "verbose mode, defaults to true")
    .argv;


utils.extend(options, require(filePath.resolve(process.cwd(), argv.config)));

options.type = !!argv.drop ? "drop" : (!!argv.down ? "down" : "up");
options.after = argv.after != null ? Date.parse(argv.after) : null;
options.before = argv.before != null ? Date.parse(argv.before) : null;
options.verbose = argv.verbose != null ? !!argv.verbose : true;


start = migrations.now();
migrations[options.type](options, function(err) {
    if (err) {
        console.log(
            "\n=================================================\n" +
            "-- Migrations Failed\n" +
            "   -> " + (migrations.now() - start) + "(ms)\n" +
            "=================================================\n" +
            "   " + (err.stack || err.message || (err + "")) + "\n"
        );
        return;
    }

    console.log(
        "\n=================================================\n" +
        "-- Migrations Finished\n" +
        "   -> " + (migrations.now() - start) + "(ms)\n" +
        "=================================================\n"
    );
});

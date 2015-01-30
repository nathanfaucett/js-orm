module.exports = function(grunt) {

    grunt.initConfig({
        jsbeautifier: {
            files: [
                "src/**/*.js",
                "bin/**/*.js"
            ]
        },
        jshint: {
            options: {
                es3: true,
                unused: true,
                curly: true,
                eqeqeq: true,
                expr: true,
                eqnull: true,
                evil: true,
                globals: {
                    Promise: true
                }
            },
            files: [
                "src/**/*.js",
                "bin/**/*.js"
            ]
        }
    });

    grunt.loadNpmTasks("grunt-jsbeautifier");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.registerTask("default", ["jsbeautifier", "jshint"]);
};

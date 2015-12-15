/*
This file in the main entry point for defining grunt tasks and using grunt plugins.
Click here to learn more. http://go.microsoft.com/fwlink/?LinkID=513275&clcid=0x409
*/
module.exports = function (grunt) {
    'use strict';

    // distribution folder definition
    var distFolder = 'Content/';

    // path for the distfolders for the css
    var distFolders = {
        css: distFolder + 'css/'
    };

    // All scss files; these will be watched by the watch script
    var scssSrcFiles = ['Content/app.scss', 'Content/scss/*.scss', 'Content/scss/**/*.scss'];

    // Load time of Grunt does not slow down even if there are many plugins
    // Takes care of loading grunt modules, which is normally being done by grunt.loadNpmTasks
    require('jit-grunt')(grunt);

    // Measures the time each task takes
    require('time-grunt')(grunt);

    // function to create an independent clone of an object
    // works only for simple objects with property/value pairs, not for methods
    var cloneObject = function (srcObject) {
        var cloneObject = JSON.parse(JSON.stringify(srcObject));
        return cloneObject;
    };



    //-- Start Notify task - Notify user when Grunt finishes a task.
    // Docs: https://github.com/dylang/grunt-notify
    var notify = {
        watchCss: {
            options: {
                title: 'scss processed',
                message: '✔ css files created'
            }
        },
        build: {
            options: {
                title: 'Build',
                message: 'Grunt build and compiled scss'
            }
        }
    };
    //-- End Notify task


    //-- Start Sass task - Process SASS/SCSS to CSS.
    // Docs: https://github.com/gruntjs/grunt-contrib-sass
    var sass = {
        options: {
            sourceMap: true,
            outputStyle: 'expanded'
        },
        dist: {
            files: {
                'Content/css/app.css': 'Content/app.scss'
            }
        }
    };
    //-- End Sass task


    //-- Start Watch task - Run tasks whenever watched files change.
    // Docs: https://github.com/gruntjs/grunt-contrib-watch
    var watch = {
        sass: {
            files: scssSrcFiles,
            tasks: ['sass', 'notify:watchCss']
        },
        css: {
            files: ['*.css']
        }
    };
    //-- End watch




    //-- Start Grunt initialization --
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        config: grunt.file.readJSON('config.json'),// get site config like package name and application paths etc
        notify: notify,
        sass: sass,
        watch: watch
    });
    //-- End Grunt initialization --


    //-- Start defining Grunt tasks --
    grunt.registerTask('update-css', ['sass']);
    grunt.registerTask('update-javascript', ['jshint']);

    //default task - this one gets called when you simply type "grunt" into the console
    grunt.registerTask('default', [
        'update-css'
    ]);

    grunt.registerTask('init', [
        'default'
    ]);

    //-- needed for Visual Studio, don't remove! --
    grunt.registerTask('build', ['default']);

};
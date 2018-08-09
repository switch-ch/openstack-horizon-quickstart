// Generated on 2014-06-30 using generator-angular 0.9.0-1
'use strict';

var WEBROOT = '/horizon/'; // Replace with our webroot ending slash is not required

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    require('grunt-replace')(grunt);

    try {
      WEBROOT = grunt.file.readJSON('webroot.json').webroot;
    } catch(e) { }

    console.log('Using \'' + WEBROOT + '\' as WEBROOT');

    // Define the configuration for all the tasks
    grunt.initConfig({

        meta: {
            deployDir: "./quickstart/static/quickstart",
            outFile: "quickstart.js"
        },

        concat: {
            options: {
                // define a string to put between each file in the concatenated output
                separator: ';'
            },
            dist: {
                // the files to concatenate
                src: [
                    './node_modules/lodash/lodash.js',
                    './node_modules/angular-ui-router/release/angular-ui-router.js',
                    './app/scripts/kilo_backport/charts/*.js',
                    './app/scripts/app.js',
                    './app/scripts/config.js',
                    './app/scripts/services/*.js',
                    './app/scripts/filters/*.js',
                    './app/scripts/directives/**/*.js',
                    './app/scripts/components/**/*.js',
                    './app/scripts/instances/*.js',
                    '!**/*.spec.js',
                    '!GruntFile.js'],
                // the location of the resulting JS file
                dest: '<%= meta.deployDir %>/js/<%= meta.outFile %>'
            }
        },

        sass: {
            dist: {
                options: {
                    style: 'expanded'
                },
                files: {
                    '<%= meta.deployDir %>/css/quickstart.css': './app/styles/quickstart.scss'
                }
            }
        },

        replace: {
            dist: {
                options: {
                  patterns: [
                    {
                      match: 'webroot',
                      replacement: WEBROOT
                    }
                  ]
                },
                files: [
                  {
                      src: ['<%= meta.deployDir %>/css/quickstart.css'],
                      dest: '<%= meta.deployDir %>/css/quickstart.css'
                  },
                  {
                      src: ['<%= meta.deployDir %>/js/<%= meta.outFile %>'],
                      dest: '<%= meta.deployDir %>/js/<%= meta.outFile %>'
                  }
                ]
            }
        },


        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: './app/**/*.html',
                        dest: '<%= meta.deployDir %>/templates/',
                        filter: 'isFile',
                        flatten: true
                    }
                ]
            }
        },


        watch: {
            files: [
                './app/scripts/*.js',
                './app/scripts/**/*.js',
                './app/scripts/**/**/*.js',
                './app/scripts/**/*.html',
                './app/scripts/**/**/*.html'
            ],
            tasks: ['build']
        }
    });

    grunt.registerTask('build', ['concat', 'sass', 'replace', 'copy']);
    grunt.registerTask('default', ['build', 'watch']);
};

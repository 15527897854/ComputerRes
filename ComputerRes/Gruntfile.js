'use strict';

module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt);

    var path = require('path');

    /**
     * Resolve external project resource as file path
     */
    function resolvePath(project, file) {
        return path.join(path.dirname(require.resolve(project)), file);
    }

    // project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        //把多个模块中用到的相同的东西放在这里，这样只用改一遍就行了
        config: {
            sources: 'views/bpmn/app',
            public:'public/js/bpmn'
        },

        jshint: {
            src: [
                ['<%=config.sources %>']
            ],
            options: {
                jshintrc: true
            }
        },

        browserify: {
            options: {
                browserifyOptions: {
                    debug: true,
                    list: true,
                    // make sure we do not include browser shims unnecessarily
                    insertGlobalVars: {
                        process: function () {
                            return 'undefined';
                        },
                        Buffer: function () {
                            return 'undefined';
                        }
                    }
                },
                transform: [ 'brfs' ]
            },
            watch: {
                options: {
                    watch: true
                },
                files: {
                    '<%= config.public %>/app.js': [ '<%= config.sources %>/**/*.js' ]
                }
            },
            app: {
                files: {
                    '<%= config.public %>/app.js': [ '<%= config.sources %>/**/*.js' ]
                }
            }
        },

        copy: {
            diagram_js: {
                files: [
                    {
                        src: resolvePath('diagram-js', 'assets/diagram-js.css'),
                        dest: '<%= config.public %>/css/diagram-js.css'
                    }
                ]
            },
            bpmn_js: {
                files: [
                    {
                        expand: true,
                        cwd: resolvePath('bpmn-js', 'assets'),
                        src: ['**/*.*', '!**/*.js'],
                        dest: '<%= config.public %>/vendor'
                    }
                ]
            },
            public:{
                files:[
                    {
                        expand:true,
                        cwd:'<%= config.sources %>',
                        src:['**/*.js'],
                        dest:'<%= config.public %>'
                    }
                ]
            }
        },

        less: {
            options: {
                dumpLineNumbers: 'comments',
                paths: [
                    'node_modules'
                ]
            },

            styles: {
                files: {
                    '<%= config.public %>/css/app.css': 'views/bpmn/styles/app.less'
                }
            }
        },

        watch: {
            options: {
                livereload: 2345
            },

            samples: {
                files: [ '<%= config.sources %>/**/*.*' ],
                tasks: [ 'browserify:watch' ]
            },

            less: {
                files: [
                    'views/bpmn/styles/**/*.less',
                    'node_modules/bpmn-js-properties-panel/styles/**/*.less'
                ],
                tasks: [
                    'less'
                ]
            },
        },
    });

    // tasks
    grunt.registerTask('default', [
        'copy',
        'less',
        'browserify:watch',
        'watch'
    ]);
};

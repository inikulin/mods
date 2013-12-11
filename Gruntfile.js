module.exports = function (grunt) {
    grunt.initConfig({

        // Metadata.
        pkg: grunt.file.readJSON('package.json'),

        banner: '/*!\n' +
                ' <%= pkg.name %> v<%= pkg.version %> \n' +
                ' Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> (<%= pkg.author.email %>, <%= pkg.author.site %>)\n' +
                ' Released under the MIT license\n ' +
                '*/\n',

        // Task configuration.
        clean: {
            files: [
                '<%= pkg.name %>.js',
                '<%= pkg.name %>.min.js'
            ]
        },

        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            dist: {
                src: ['src/<%= pkg.name %>.js'],
                dest: '<%= pkg.name %>.js'
            }
        },

        uglify: {
            dist: {
                src: '<%= concat.dist.dest %>',
                dest: '<%= pkg.name %>.min.js'
            }
        },

        qunit: {
            files: ['test/**/*.html']
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-qunit');

    // Default task.
    grunt.registerTask('default', ['qunit', 'clean', 'concat', 'uglify']);

};

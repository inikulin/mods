module.exports = function (grunt) {
    grunt.initConfig({
        clean: {
            files: ['app/app.js']
        },

        concat: {
            dist: {
                src: [
                    '../dist/mods.min.js',
                    'src/intro.js',
                    'src/**/*.js'
                ],
                dest: 'app/app.js'
            }
        },

        uglify: {
            dist: {
                src: 'app/app.js',
                dest: 'app/app.js'
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

    // Default task.
    grunt.registerTask('default', ['clean', 'concat', 'uglify']);

};

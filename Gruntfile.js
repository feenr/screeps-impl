module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-screeps')
    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-contrib-copy')
    grunt.loadNpmTasks('grunt-run')
    grunt.initConfig({
	env: grunt.file.readYAML('env.yaml'),
        screeps: {
            options: {
                email: '<%= env.screeps.email %>',
                password: '<%= env.screeps.password %>',
                branch: '<%= env.screeps.branch %>',
                ptr: '<%= env.screeps.ptr %>'
            },
            dist: {
                src: ['dist/*.js']
            }
        },

	clean: {
            dist: ['dist']     
        },

        copy: {
            screeps: {
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: '**',
                    dest: 'dist/',
                    filter: 'isFile',
                    rename: function(dest, src){
                        return dest + src.replace(/\//g,'_');
                    }
                }]
            }
	    },

        run: {
	        fetch: {
	            cmd: 'npm',
                args: [
                    'run',
                    'fetch'
                ]
            }
        }
    });

    grunt.registerTask('default', ['clean', 'copy:screeps', 'screeps']);
    grunt.registerTask('fetch', ['run:fetch']);
};

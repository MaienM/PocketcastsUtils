module.exports = (grunt) ->
    # Project configuration.
    grunt.initConfig(
        pkg: grunt.file.readJSON('package.json')
        blackcoffee:
            dist:
                options:
                    join: true
                    sourceMap: true
                files:
                    'build/PocketcastsUtils.user.js': ['src/coffee/macros.coffee', 'src/coffee/main.coffee']
        codo:
            options:
                name: 'Pocketcasts Utils'
                undocumented: true
                private: true
            src: 'src/coffee'
        sass:
            dist:
                options:
                    style: 'compressed'
                    compass: true
                    sourcemap: 'none'
                files: [{
                    expand: true
                    cwd: 'src/scss'
                    src: ['*.scss']
                    dest: 'build/css'
                    ext: '.css'
                }]
        watch:
            gruntfile:
                files: 'Gruntfile.coffee'
                tasks: 'default'
                options:
                    spawn: false
            coffee:
                files: 'src/coffee/*.coffee'
                tasks: ['blackcoffee', 'codo']
                options:
                    spawn: false
            scss:
                files: 'src/scss/*.scss'
                tasks: ['sass', 'blackcoffee']
                options:
                    spawn: false
            docs:
                files: 'README.md'
                tasks: 'codo'
                options:
                    spawn: false
    )

    # Load the plugins.
    grunt.loadNpmTasks('grunt-codo')
    grunt.loadNpmTasks('grunt-contrib-blackcoffee')
    grunt.loadNpmTasks('grunt-contrib-sass')
    grunt.loadNpmTasks('grunt-contrib-watch')
    
    # Default task(s)
    grunt.registerTask('default', ['sass', 'blackcoffee', 'codo'])

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
                    'build/js/PocketcastsUtils.coffee.js': ['src/coffee/macros.coffee', 'src/coffee/main.coffee']
        codo:
            options:
                name: 'Pocketcasts Utils'
                undocumented: true
                private: true
            src: 'src/coffee'
        concat:
            options:
                process: true
                # sourceMap: true
            files:
                src: ['src/metadata.js', 'build/js/PocketcastsUtils.coffee.js']
                dest: 'dist/PocketcastsUtils.user.js'
        sass:
            dist:
                options:
                    style: 'compressed'
                    compass: true
                    sourcemap: 'none'
                files: [
                    expand: true
                    cwd: 'src/scss'
                    src: ['*.scss']
                    dest: 'build/css'
                    ext: '.css'
                ]
        shell:
            options:
                stderr: false
            outputVersion:
                command: 'grep "@version" dist/PocketcastsUtils.user.js'
        svgmin:
            dist:
                expand: true
                cwd: 'src/images'
                src: ['*.svg']
                dest: 'build/images'
                ext: '.min.svg'
        watch:
            gruntfile:
                files: ['Gruntfile.coffee', 'package.json', 'config.rb']
                tasks: 'default'
                options:
                    spawn: false
            coffee:
                files: 'src/coffee/*.coffee'
                tasks: ['basic', 'shell']
                options:
                    spawn: false
            concat:
                files: ['src/metadata.js', 'build/js/PocketcastsUtils.coffee.js']
                tasks: ['concat', 'shell']
                options:
                    spawn: false
            scss:
                files: 'src/scss/*.scss'
                tasks: ['sass', 'basic']
                options:
                    spawn: false
            svg:
                files: 'src/images/*.svg'
                tasks: ['svgmin', 'sass', 'basic']
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
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-sass')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-shell')
    grunt.loadNpmTasks('grunt-svgmin')
    
    # Default task(s)
    grunt.registerTask('default', ['svgmin', 'sass', 'blackcoffee', 'concat', 'codo', 'shell'])
    grunt.registerTask('basic', ['blackcoffee', 'concat', 'shell'])

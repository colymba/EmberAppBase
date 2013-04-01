/*jshint camelcase: false */
/*global module:false */

module.exports = function(grunt) {

  grunt.initConfig({
    /* 
      Reads the projects .jshintrc file and applies coding
      standards. Doesn't lint the dependencies or test
      support files.
    */
    jshint: {
      all: [
        'Gruntfile.js',
        'js/application/**/*.js',
        '!js/dependencies/**/*.*'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    /* 
       A simple ordered concatenation strategy.
       This will start at app/app.js and begin
       adding dependencies in the correct order
       writing their string contents into
       'build/application.js'

       Additionally it will wrap them in evals
       with @ sourceURL statements so errors, log
       statements and debugging will reference
       the source files by line number.

       You would set this option to false for 
       production.
    */

    neuter: {
      options: {
        includeSourceURL: false
      },
      'js/application.js': 'js/application/app.js'
    },

    /*
      Watch files for changes.

      Changes in dependencies/ember.js or application javascript
      will trigger the neuter task.

      Changes to any templates will trigger the ember_templates
      task (which writes a new compiled file into dependencies/)
      and then neuter all the files again.
    */
    watch: {
      application_code: {
        files: [
          'js/dependencies/ember.js',
          'js/dependencies/handlebars-runtime.js',
          'js/dependencies/jquery.js',
          'js/application/**/*.js'
        ],
        tasks: ['neuter']
      },
      handlebars_templates: {
        files: ['js/application/**/*.hbs'],
        tasks: ['ember_templates', 'neuter']
      }
    },

    /* 
      Finds Handlebars templates and precompiles them into functions.
      The provides two benefits:

      1. Templates render much faster
      2. We only need to include the handlebars-runtime microlib
         and not the entire Handlebars parser.

      Files will be written out to dependencies/compiled/templates.js
      which is required within the project files so will end up
      as part of our application.

      The compiled result will be stored in
      Ember.TEMPLATES keyed on their file path (with the 'app/templates' stripped)
    */
    ember_templates: {
      options: {
        templateName: function(sourceFile) {
          return sourceFile.replace(/js\/application\/templates\//, '');
        }
      },
      'js/dependencies/compiled/templates.js': ["js/application/templates/*.hbs"]
    },


    /* **********************************************************************************
     Production only
     deployment set of functions
    */

    //clean up _deploy folder
    clean: ["_deploy"],

    //Copy all files in deployment folder
    copy: {
      main: {
        files: [
          {expand: true, cwd: '.', src: ['index.html'],        dest: '_deploy'},
          {expand: true, cwd: '.', src: ['404.html'],        dest: '_deploy'},

          {expand: true, cwd: '.', src: ['css/*.css'],        dest: '_deploy'},
          {expand: true, cwd: '.', src: ['fonts/**'],        dest: '_deploy'},
          {expand: true, cwd: '.', src: ['img/**'],        dest: '_deploy'},
          {expand: true, cwd: '.', src: ['js/vendor/**'],  dest: '_deploy'},
          {expand: true, cwd: '.', src: ['js/*.js'],       dest: '_deploy'},

          {expand: true, cwd: '.', src: ['.htaccess'],     dest: '_deploy'},
          {expand: true, cwd: '.', src: ['human.txt'],     dest: '_deploy'},
          {expand: true, cwd: '.', src: ['robot.txt'],     dest: '_deploy'},
          {expand: true, cwd: '.', src: ['crossdomain.xml'],     dest: '_deploy'},

          {expand: true, cwd: '.', src: ['favicon.ico'],     dest: '_deploy'},
          {expand: true, cwd: '.', src: ['*.png'],     dest: '_deploy'}
        ]
      }
    },

    //Strip console.* out of JS
    strip : {
      main : {
        src  : '_deploy/js/application.js',
        dest : '_deploy/js/application.js'
      }
    },

    //minify JS
    uglify: {
      '_deploy/js/application.js': '_deploy/js/application.js'
    },

    //combine CSS
    requirejs: {
      css: {
        options: {
          optimizeCss: "standard.keepLines",
          cssIn: "_deploy/css/main.css",
          out: "_deploy/css/main.css"
        }
      }
    },

    //minify CSS
    cssmin: {
      prod: {
        files: {
          "_deploy/css/main.css": ["_deploy/css/main.css"]
        }
      }
    },

    //minify HTML
    htmlcompressor: {
      compile: {
        files: {
          '_deploy/index.html' : '_deploy/index.html'
        },
        options: {
          type: 'html',
          preserveServerScript: true,
          'compress-js': true
        }
      }
    },

    hashres: {
      options: {
        encoding: 'utf8',
        fileNameFormat: '${hash}.${name}.${ext}',
        renameFiles: true
      },
      deploy: {
        options: {},
        src: [
          '_deploy/js/application.js',
          '_deploy/css/main.css'
        ],
        dest: [
          '_deploy/index.html'
        ]
      }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-neuter');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-ember-templates');

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks("grunt-strip");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-requirejs");
  grunt.loadNpmTasks("grunt-contrib-cssmin");
  grunt.loadNpmTasks('grunt-htmlcompressor');
  grunt.loadNpmTasks('grunt-hashres');

  /*
    Default task. Compiles templates, neuters application code, and begins
    watching for changes.
  */
  grunt.registerTask('default', ['ember_templates', 'neuter', 'watch']);

  /*
    Deploy task:
    Compile JS App, strip console.*, min js, replace js ref, copy to deploy folder and rename js/css with hash
  */
 grunt.registerTask('deploy', ['ember_templates', 'neuter',
                                'copy', 'strip', 'uglify', 'requirejs', 'cssmin', 'hashres', 'htmlcompressor']);

};
/**
 * Copyright 2015 aixigo AG
 */
/*global module,__dirname,__filename */
module.exports = function( grunt ) {
   'use strict';

   var serverPort = 8001;
   var testPort = 1000 + serverPort;
   var liveReloadPort = 30000 + serverPort;

      grunt.initConfig( {
         pkg: grunt.file.readJSON( 'package.json' ),

         'laxar-configure': {
            options: {
               flows: [
                  { target: 'main', src: 'application/flow/flow.json' }
               ],
               ports: {
                  develop: serverPort,
                  test: testPort,
                  livereload: liveReloadPort
               },
               userTasks: {
                  'build-flow': [ 'laxar-compass-flow' ]
               }
            }
         },
         'connect': {
            'laxar-develop': {
               options: {
                  middleware: function( connect, options, defaultMiddleware ) {
                     var proxy =
                        require( 'grunt-connect-proxy/lib/utils' ).proxyRequest;
                     return [ proxy ].concat( defaultMiddleware );
                  }
               },
               'proxies': grunt.file.readJSON( 'var/proxies.json' )
            }
         },
         'laxar-compass': {
            options: {
               compass: './tools/bin/compass'
            }
         },
         babel: {
            options: {
               sourceMap: true,
               modules: 'amd'
            },
            widgets: {
               files: [{
                  expand: true,
                  cwd: 'includes/widgets/',
                  src: [ '*/*.jsx' ],
                  dest: 'includes/widgets/',
                  ext: '.js'
               }]
            }
         },
         watch: {
            jsx: {
               files: [ 'includes/widgets/*/*.jsx' ],
               tasks: [ 'babel:widgets' ]
            }
         }

   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   grunt.loadNpmTasks( 'grunt-laxar' );
   grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
   grunt.loadNpmTasks( 'grunt-contrib-concat' );
   grunt.loadNpmTasks( 'grunt-contrib-compress' );
   grunt.loadNpmTasks( 'grunt-contrib-watch' );

   grunt.registerTask( 'server', [ 'connect:default' ] );
   grunt.registerTask( 'build', [ 'directory_tree', 'laxar_application_dependencies' ] );
   grunt.registerTask( 'optimize', [ 'build', 'css_merger', 'cssmin', 'concat', 'requirejs' ] );
   grunt.registerTask( 'test', [ 'connect:test', 'widgets' ] );
   grunt.registerTask( 'dist', [ 'optimize', 'compress' ] );
   grunt.registerTask( 'start', [ 'build', 'server', 'watch' ] );
   grunt.registerTask( 'start-no-watch', [ 'build', 'connect:keepalive' ] );

   grunt.registerTask( 'default', [ 'build', 'test' ] );

};

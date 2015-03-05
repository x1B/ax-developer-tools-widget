/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://www.laxarjs.org
 */
define( [
   'laxar',
   'angular',
   'require'
], function( ax, ng, require ) {
   'use strict';

   var BUFFER_SIZE = 500;

   // To capture navigation and lifecycle events, the event log persists across LaxarJS navigation.
   var contentWindow;
   var cleanupInspector;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Controller.$inject = [ '$scope', 'axEventBus' ];

   function Controller( $scope, eventBus ) {
      var channel = window.axDeveloperTools = ( window.axDeveloperTools || {} );
      var buffers = channel.buffers = ( channel.buffers || { events: [], log: [] } );

      var contentUrl = require.toUrl( './content/' ) +
         ( $scope.features.develop.enabled ? 'debug' : 'index' ) + '.html';

      if( !cleanupInspector ) {
         cleanupInspector = eventBus.addInspector( function( eventItem ) {
            pushIntoStore( 'events',  ax.object.options( { time: new Date() }, eventItem ) );
         } );

         window.addEventListener( 'unload', function() {
            ax.log.removeLogChannel( logChannel );
            cleanupInspector();
            cleanupInspector = null;
         } );
      }

      ax.log.addLogChannel( logChannel );

      $scope.features.open.onActions.forEach( function( action ) {
         eventBus.subscribe( 'takeActionRequest.' + action, function( event ) {
            openContentWindow();
            eventBus.publish( 'didTakeAction.' + event.action, { action: event.action } );
         } );
      } );

      if( $scope.features.open.onGlobalMethod ) {
         window[ $scope.features.open.onGlobalMethod ] = openContentWindow;
      }

      if( $scope.features.grid ) {
         channel.gridSettings = $scope.features.grid;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function logChannel( messageObject ) {
         pushIntoStore( 'log', messageObject );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function pushIntoStore( storeName, item ) {
         var buffer = buffers[ storeName ];
         while( buffer.length >= BUFFER_SIZE ) {
            buffer.shift();
         }
         buffer.push( item );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function openContentWindow() {
         var settings = {
            resizable: 'yes',
            scrollbars: 'yes',
            status: 'yes',
            width: 1280,
            height: 700
         };

         var settingsString = Object.keys( settings ).map( function( key ) {
            return key + '=' + settings[ key ];
         } ).join( ',' );

         if( !contentWindow || contentWindow.closed ) {
            contentWindow = window.open( contentUrl, 'axDeveloperTools', settingsString );
         }
         contentWindow.focus();
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return ng.module( 'axDeveloperToolsWidget', [] )
      .controller( 'AxDeveloperToolsWidgetController', Controller );

} );

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


   var channel;
   var buffers;
   var enabled;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Controller.$inject = [ '$scope', 'axEventBus' ];

   function Controller( $scope, eventBus ) {
      $scope.enabled = enabled;
      if( !$scope.enabled ) {
         return;
      }

      $scope.commands = {
         open: openContentWindow
      };

      var contentUrl = require.toUrl( './content/' ) +
         ( $scope.features.develop.enabled ? 'debug' : 'index' ) + '.html';

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

      $scope.$on( '$destroy', cleanup );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function cleanup() {
         if( $scope.features.open.onGlobalMethod ) {
            delete window[ $scope.features.open.onGlobalMethod ];
         }
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

         try {
            contentWindow.focus();
         }
         catch( e ) {
            ax.log.warn(
               'AxDeveloperToolsWidget: Popup was blocked. Unblock in browser, or use the "button" feature.'
            );
         }
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function startCapturingEvents( eventBus ) {
      enabled = ax.configuration.get( 'widgets.laxar-developer-tools-widget.enabled', true );
      if( enabled ) {
         channel = window.axDeveloperTools = ( window.axDeveloperTools || {} );
         buffers = channel.buffers = ( channel.buffers || { events: [], log: [] } );


         ax.log.addLogChannel( logChannel );
         cleanupInspector = eventBus.addInspector( function( eventItem ) {
            pushIntoStore( 'events', ax.object.options( {time: new Date() }, eventItem ) );
         } );
         ng.element( window ).off( 'beforeunload.AxDeveloperToolsWidget' );
         ng.element( window ).on( 'beforeunload.AxDeveloperToolsWidget', function() {
            ax.log.removeLogChannel( logChannel );
            cleanupInspector();
            cleanupInspector = null;
         } );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function logChannel( messageObject ) {
         pushIntoStore( 'log', messageObject );
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function pushIntoStore( storeName, item ) {
      var buffer = buffers[ storeName ];
      while( buffer.length >= BUFFER_SIZE ) {
         buffer.shift();
      }
      buffer.push( item );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return ng.module( 'axDeveloperToolsWidget', [] )
       .run( [ 'axGlobalEventBus', startCapturingEvents ] )
       .controller( 'AxDeveloperToolsWidgetController', Controller );

} );

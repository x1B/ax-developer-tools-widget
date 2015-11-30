/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 */
define( [
   'laxar',
   'angular'
], function( ax, ng ) {
   'use strict';

   var REFRESH_DELAY_MS = 100;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Controller.$inject = [ '$scope' ];

   function Controller( $scope ) {
      var eventBus = $scope.eventBus;
      var pageInfoVersion = -1;
      var timeout;
      var lastIndexByStream = {};

      // If the development server is used and we don't want the development window to be reloaded each
      // time something changes during development, we shutdown live reload here.
      if( window.LiveReload && !$scope.features.development.liveReload ) {
         window.LiveReload.shutDown();
      }

      $scope.$on( '$destroy', function() {
         if( timeout ) {
            window.clearTimeout( timeout );
         }
      } );

      eventBus.subscribe( 'beginLifecycleRequest', function() {
         if( !window.opener ) {
            window.alert( 'The AxDeveloperToolsWidget window must be opened from a LaxarJS page.' );
            return;
         }

         var hostApplicationAvailable = publishGridSettings();
         if( hostApplicationAvailable ) {
            checkForData();
         }
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function publishGridSettings() {
         var channel;
         try {
            channel = window.opener.axDeveloperTools;
         }
         catch( exception ) {
            handleApplicationGone();
            return false;
         }

         var channelGridSettings = channel && channel.gridSettings;
         if( $scope.features.grid.resource && channelGridSettings ) {
            eventBus.publish( 'didReplace.' + $scope.features.grid.resource, {
               resource: $scope.features.grid.resource,
               data: channelGridSettings
            } );
         }
         return true;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function checkForData() {
         var channel;
         try {
            channel = window.opener.axDeveloperTools;
         } catch (e) {
            handleApplicationGone();
            return;
         }
         var buffers = channel && channel.buffers;
         if( buffers ) {
            [ 'events', 'log' ].forEach( function( streamType ) {
               var buffer = buffers[ streamType ];
               var lastIndex = lastIndexByStream[ streamType ] || -1;
               var events = buffer.filter( function( item ) {
                  return item.index > lastIndex;
               } );
               if( !events.length ) {
                  return;
               }
               eventBus.publish( 'didProduce.' + $scope.features[ streamType ].stream, {
                  stream: $scope.features[ streamType ].stream,
                  data: events
               } );
               lastIndexByStream[ streamType ] = events[ events.length - 1 ].index;
            } );


            if( buffers.log.length ) {
               eventBus.publish( 'didProduce.' + $scope.features.log.stream, {
                  stream: $scope.features.log.stream,
                  data: buffers.log
               } );
               buffers.log = [];
            }
         }

         if( channel && channel.pageInfoVersion > pageInfoVersion ) {
            pageInfoVersion = channel.pageInfoVersion;
            eventBus.publish( 'didReplace.' + $scope.features.pageInfo.resource, {
               resource: $scope.features.pageInfo.resource,
               data: channel.pageInfo
            } );
         }

         timeout = window.setTimeout( checkForData, REFRESH_DELAY_MS );
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function handleApplicationGone() {
         var message =
            'laxar-developer-tools-widget: Cannot access LaxarJS host window (or tab). Is it still open?';
         ax.log.error( message );
         eventBus.publish( 'didEncounterError', message );
      }

   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   return ng.module( 'axHostConnectorWidget', [] )
      .controller( 'AxHostConnectorWidgetController', Controller );

} );

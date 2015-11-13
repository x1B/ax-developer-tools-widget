/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://www.laxarjs.org
 */
define( [
   'laxar',
   'laxar-patterns',
   'angular',
   'require'
], function( ax, patterns, ng, require ) {
   'use strict';

   var BUFFER_SIZE = 500;

   // To capture navigation and lifecycle events, the event log persists across LaxarJS navigation.
   var contentWindow;
   var cleanupInspector;


   var developerHooks;
   var buffers;
   var enabled;

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   Controller.$inject = [ '$scope', 'axEventBus' ];

   function Controller( $scope, eventBus ) {
      $scope.enabled = enabled;
      if( !$scope.enabled ) {
         return;
      }

      if( ax._tooling.pages ) {
         ax._tooling.pages.addListener( onPageChange );
         onPageChange( ax._tooling.pages.current() );
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

      developerHooks.tracker = $scope.features.tracker.enabled ? topicTracker() : null;

      if( $scope.features.grid ) {
         developerHooks.gridSettings = $scope.features.grid;
      }

      $scope.$on( '$destroy', cleanup );


      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function cleanup() {
         developerHooks.tracker = null;
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
         developerHooks = window.axDeveloperTools = ( window.axDeveloperTools || {} );
         buffers = developerHooks.buffers = ( developerHooks.buffers || { events: [], log: [] } );

         ax.log.addLogChannel( logChannel );
         cleanupInspector = eventBus.addInspector( function( item ) {
            var problems = [];
            if( developerHooks.tracker ) {
               problems = developerHooks.tracker.track( item );
               problems.forEach( function( problem ) {
                  ax.log.warn( 'DeveloperTools: [0], event: [1]', problem.description, item );
               } );
            }
            pushIntoStore( 'events', ax.object.options( { time: new Date(), problems: problems }, item ) );
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

   function topicTracker() {

      var states = {
         resource: {},
         action: {},
         flag: {}
      };
      var monitored = {};

      // developer API:
      return {
         state: function() {
            return ax.object.deepClone( states );
         },
         monitorResource: function( topic ) {
            monitor( 'resource', topic );
         },
         monitorAction: function( topic ) {
            monitor( 'action', topic );
         },
         monitorFlag: function( topic ) {
            monitor( 'flag', topic );
         },
         track: function( eventItem ) {
            var problems = track( eventItem );
            var type = eventType( eventItem );
            if( monitored[ type ] ) {
               var topic = eventPatternTopic( eventItem );
               if( monitored[ type ][ topic ] ) {
                  var message = 'monitor([0]):\n   event: [1]\n   new state: [2]';
                  ax.log.info( message, topic, eventItem, ax.object.deepClone( states[ type ][ topic ] ) );
               }
            }
            return problems;
         }
      };

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function eventType( eventItem ) {
         var topics = eventItem.event.split( '.' );
         var verb = topics[ 0 ];
         return types[ verb ] || OTHER;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function eventPatternTopic( eventItem ) {
         var topics = eventItem.event.split( '.' );
         return topics[ 1 ];
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function monitor( type, patternTopic ) {
         monitored[ type ] = monitored[ type ] || {};
         monitored[ type ][ patternTopic ] = true;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function track( eventItem ) {
         if( eventItem.action !== 'publish' ) {
            return [];
         }

         var sender = ( eventItem.source || 'unknown' ).replace( /.*#(.*)/g, '$1' );
         var topics = eventItem.event.split( '.' );
         var verb = topics[ 0 ];
         var patternTopic = eventPatternTopic( eventItem );
         var payload = eventItem.eventObject;

         if( !patternTopic ) {
            return [ { description: 'Event has an invalid name: The second topic is missing!' } ];
         }
         if( !payload ) {
            return [ { description: 'Event has no payload!' } ];
         }

         var type = eventType( eventItem );
         if( type === RESOURCE ) {
            return trackResourceEvent( payload, sender, verb, patternTopic );
         }
         if( type === ACTION ) {
            return trackActionEvent( payload, sender, verb, patternTopic );
         }
         if( type === FLAG ) {
            return trackFlagEvent( payload, sender, verb, patternTopic );
         }
         return [];
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function trackActionEvent( payload, subject, verb, actionName ) {
         var problems = [];
         if( !payload.action ) {
            problems.push( { description: 'Event is missing "action" field in payload.' } );
         }

         var state = states.action[ actionName ] = states.action[ actionName ] || {
            state: 'inactive',
            numRequests: 0,
            requestedBy: null,
            outstandingReplies: {}
         };

         switch( verb ) {

            case 'takeActionRequest':
               state.state = 'active';
               state.requestedBy = subject;
               ++state.numRequests;
               return problems;

            case 'willTakeAction':
               if( !state.outstandingReplies.hasOwnProperty( subject ) ) {
                  state.outstandingReplies[ subject ] = 0;
               }
               ++state.outstandingReplies[ subject ];
               return problems;

            case 'didTakeAction':
               if( state.outstandingReplies.hasOwnProperty( subject ) ) {
                  --state.outstandingReplies[ subject ];
                  if( state.outstandingReplies[ subject ] === 0 ) {
                     delete state.outstandingReplies[ subject ];
                  }
               }

               if( Object.keys( state.outstandingReplies ).length === 0 ) {
                  state.state = 'inactive';
               }
               return problems;

            default:
               return problems;
         }
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function trackFlagEvent( payload, sender, verb, flagName ) {
         var problems = [];
         if( !payload.flag ) {
            problems.push( { description: 'Event is missing "flag" field in payload.' } );
         }

         states.flag[ flagName ] = states.flag[ flagName ] || {
            state: undefined,
            lastModificationBy: null
         };

         if( verb === 'didChangeFlag' ) {
            if( payload.state === undefined ) {
               problems.push( { description: 'Event is missing "state" field in payload.' } );
               return problems;
            }
            states.flag[ flagName ].state = payload.state;
            states.flag[ flagName ].lastModificationBy = sender;
         }

         return problems;
      }

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      function trackResourceEvent( payload, sender, verb, resourceName ) {
         var problems = [];
         if( !payload.resource ) {
            problems.push( { description: 'Event is missing "resource" field in payload.' } );
         }
         var state;

         switch( verb ) {

            case 'didReplace':
               if (payload.data === undefined) {
                  problems.push( { description: 'didReplace event-payload is missing "data" field.' } );
               }
               state = states.resource[ resourceName ] = states.resource[ resourceName ] || {
                  state: 'replaced',
                  master: sender,
                  lastModificationBy: null,
                  value: null
               };
               if( state.master !== sender ) {
                  problems.push( { description: ax.string.format(
                     'master/master conflict: for resource `[0]` (first master: [1], second master: [2])"',
                     [ resourceName, state.master, sender ]
                  ) } );
               }
               state.lastModificationBy = sender;
               state.value = payload.data;
               return problems;

            case 'didUpdate':
               state = states.resource[ resourceName ];
               if( !state ) {
                  problems.push( {
                     description: 'Sender "' + sender + '" sent didUpdate without prior didReplace.'
                  } );
               }
               else if( state.value === null || state.value === undefined ) {
                  problems.push( {
                     description: 'Sender "' + sender + '" sent didUpdate, but resource is ' + state.value
                  } );
               }
               if( !payload.patches ) {
                  problems.push( {
                     description: 'Sender "' + sender + '" sent didUpdate without patches field.'
                  } );
               }
               if( problems.length ) {
                  return problems;
               }

               state.lastModificationBy = sender;
               try {
                  patterns.json.applyPatch( state.value, payload.patches );
               }
               catch( error ) {
                  problems.push( {
                     description: 'Failed to apply patch sequence in didUpdate from "' + sender + '"'
                  } );
               }
               return problems;

            default:
               return problems;
         }
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   onPageChange( pageInfo ) {
      
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

   var ACTION = 'action';
   var FLAG = 'flag';
   var RESOURCE = 'resource';
   var ERROR = 'error';
   var OTHER = 'other';
   var types = {
      takeActionRequest: ACTION,
      willTakeAction: ACTION,
      didTakeAction: ACTION,

      didChangeFlag: FLAG,

      didReplace: RESOURCE,
      didUpdate: RESOURCE,
      validateRequest: RESOURCE,
      willValidate: RESOURCE,
      didValidate: RESOURCE,
      saveRequest: RESOURCE,
      willSave: RESOURCE,
      didSave: RESOURCE,

      didEncounterError: ERROR
   };

   return ng.module( 'axDeveloperToolsWidget', [] )
       .run( [ 'axGlobalEventBus', startCapturingEvents ] )
       .controller( 'AxDeveloperToolsWidgetController', Controller );

} );

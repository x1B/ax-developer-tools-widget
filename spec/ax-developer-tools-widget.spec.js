/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license.
 * http://www.laxarjs.org
 */
define( [
   '../ax-developer-tools-widget',
   'jquery',
   'laxar/laxar_testing'
], function( widgetModule, $, ax ) {
   'use strict';

   describe( 'An AxDeveloperToolsWidget', function() {

      var cleanup;
      var testBed;
      var windowOpenSpy;
      var windowState;

      beforeEach( function setup() {
         jasmine.Clock.useMock();
         testBed = ax.testing.portalMocksAngular.createControllerTestBed( 'laxarjs/ax-developer-tools-widget' );
         testBed.featuresMock = {
            open: {
               onActions: [ 'develop' ],
               onGlobalMethod: 'axOpenDevTools'
            }
         };

         // intercept unload registration
         spyOn( $.prototype, 'on' ).andCallFake( function( event, callback ) {
            expect( event ).toEqual( 'beforeunload.AxDeveloperToolsWidget' );
            cleanup = callback;
         } );

         windowState = {
            closed: false,
            focus: jasmine.createSpy( 'focus' )
         };

         windowOpenSpy = spyOn( window, 'open' ).andCallFake( function() {
            return windowState;
         } );

         testBed.useWidgetJson();
         testBed.setup();

      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      afterEach( function() {
         cleanup();
         windowState.closed = true;
         testBed.tearDown();

         if( window.axDeveloperTools ) {
            delete window.axDeveloperTools.buffers.log;
            delete window.axDeveloperTools.buffers.events;
            delete window.axDeveloperTools.buffers;
         }
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to configure an action for opening the developer tools window (R1.1)', function() {
         expect( testBed.scope.eventBus.subscribe ).toHaveBeenCalledWith(
            'takeActionRequest.develop', jasmine.any( Function ) );
         testBed.eventBusMock.publish( 'takeActionRequest.develop', { action: 'develop' } );
         jasmine.Clock.tick( 0 );
         expect( windowOpenSpy ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'allows to configure a global javascript method that opens the window directly (R1.2)', function() {
         window.axOpenDevTools();
         expect( windowOpenSpy ).toHaveBeenCalled();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'establishes a _communication channel_ to the contents of the developer tools window when open (R1.3)', function() {
         window.axOpenDevTools();
         expect( window.axDeveloperTools ).toBeDefined();
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'intercepts _event bus activity_ from the host application and forwards it to the communication channel (R1.4)', function() {
         window.axOpenDevTools();
         jasmine.Clock.tick( 0 );
         testBed.eventBusMock.subscribe( 'someEvent', function() {} );
         testBed.eventBusMock.publish( 'someEvent', { content: 'develop' } );
         jasmine.Clock.tick( 0 );

         // initial subscribe for develop action + subscribe/publish/deliver for someEvent:
         expect( window.axDeveloperTools.buffers.events.length ).toBe( 4 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      it( 'intercepts LaxarJS _log messages_ from the host application and forwards them to the communication channel (R1.5)', function() {
         window.axOpenDevTools();
         ax.log.trace( 'test log message' );
         ax.log.info( 'test log message' );
         jasmine.Clock.tick( 0 );
         expect( window.axDeveloperTools.buffers.log.length ).toBe( 2 );
      } );

      ////////////////////////////////////////////////////////////////////////////////////////////////////////

      // Note that he remaining requirements are satisfied by the content application widgets!

   } );

} );

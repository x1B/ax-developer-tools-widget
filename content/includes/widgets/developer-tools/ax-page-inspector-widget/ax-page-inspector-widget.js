/**
 * Copyright 2015 aixigo AG
 * Released under the MIT license
 */
define( [ 'react' ], function( React ) {
   'use strict';

   return {
      name: 'ax-page-inspector-widget',
      injections: [ 'axEventBus', 'axReactRender' ],
      create: function( eventBus, reactRender ) {

         function render() {
            reactRender(
               React.createElement( 'h1', {}, 'Page Inspector Here' )
            );
         }

         return { onDomAvailable: render };
      }
   };
} );

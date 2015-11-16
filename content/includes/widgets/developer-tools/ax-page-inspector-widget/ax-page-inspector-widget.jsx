import React from 'react';
import patterns from 'laxar-patterns';

export default {
   name: 'ax-page-inspector-widget',
   injections: [ 'axContext', 'axEventBus', 'axReactRender' ],

   create( context, eventBus, reactRender ) {

      patterns.resources.handlerFor( context )
         .registerResourceFromFeature( 'pageInfo', {
            onUpdateReplace: render
         } );

      function render() {
         const { name, page } = context.resources.pageInfo;
         reactRender(
            <div className=''>
               <h2><i className='fa fa-newspaper-o'></i>  { name }</h2>
               <div>{ JSON.stringify( page ) }</div>
            </div>
         );
      }

      return { onDomAvailable: render };
   }

};

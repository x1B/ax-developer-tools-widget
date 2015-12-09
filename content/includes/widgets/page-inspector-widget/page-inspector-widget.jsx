import React from 'react';
import patterns from 'laxar-patterns';

import wireflow from 'wireflow';

import { types, graph, layout, filterFromSelection } from './graph-helpers';

const {
  selection: { SelectionStore },
  history: { HistoryStore },
  layout: { LayoutStore },
  graph: { GraphStore },
  settings: {
    actions: { ChangeMode, MinimapResized },
    model: { Settings, READ_ONLY, READ_WRITE },
    SettingsStore
  },
  Dispatcher,
  components: { Graph }
} = wireflow;


function create( context, eventBus, reactRender ) {

   let domAvailable = false;
   let resourceAvailable = false;
   let visible = false;
   let showIrrelevantWidgets = false;
   let publishedSelection = null;

   patterns.resources.handlerFor( context )
      .registerResourceFromFeature( 'pageInfo', {
         onUpdateReplace: () => {
            resourceAvailable = true;
            update();
         }
      } );


   const publishFilter = patterns.resources.replacePublisherForFeature( context, 'filter', {
      isOptional: true
   } );

   eventBus.subscribe( `didChangeAreaVisibility.${context.widget.area}`, event => {
      if( !visible && event.visible ) {
         visible = true;
         update();
      }
   } );

   function replaceFilter( selection, graphModel ) {
      const resource = context.features.filter.resource;
      if( !resource || selection === publishedSelection ) {
         return;
      }
      publishedSelection = selection;
      publishFilter( filterFromSelection( selection, graphModel ) );
   }

   function toggleIrrelevantWidgets() {
      showIrrelevantWidgets = !showIrrelevantWidgets;
      update();
   }

   let dispatcher;
   function update() {
      if( !visible || !domAvailable || !resourceAvailable ) {
         return;
      }

      const pageInfo = context.resources.pageInfo;
      const pageGraph = graph( pageInfo, showIrrelevantWidgets );

      const pageTypes = types();
      dispatcher = new Dispatcher( render );
      new HistoryStore( dispatcher );
      const graphStore = new GraphStore( dispatcher, pageGraph, pageTypes );
      const layoutStore = new LayoutStore( dispatcher, graphStore );
      const settingsStore = new SettingsStore( dispatcher, Settings({ mode: READ_ONLY }) );
      const selectionStore = new SelectionStore( dispatcher, layoutStore, graphStore );

      function render() {
         replaceFilter( selectionStore.selection, graphStore.graph );

         reactRender(
            <div className='page-inspector-row form-inline'>
               <div className='text-right'>
                  <button className='btn btn-link'
                          type='button'
                          onClick={toggleIrrelevantWidgets}
                     ><i className={'fa fa-toggle-' + ( showIrrelevantWidgets ? 'on' : 'off' ) }
                     ></i> &quot;Silent&quot; Widgets</button>
               </div>
               <Graph className='nbe-theme-fusebox-app'
                      types={graphStore.types}
                      model={graphStore.graph}
                      layout={layoutStore.layout}
                      measurements={layoutStore.measurements}
                      settings={settingsStore.settings}
                      selection={selectionStore.selection}
                      eventHandler={dispatcher.dispatch} />
            </div>
         );
      }
   }

   return { onDomAvailable: () => {
      domAvailable = true;
      update();
   } };
}

export default {
   name: 'page-inspector-widget',
   injections: [ 'axContext', 'axEventBus', 'axReactRender' ],
   create
};

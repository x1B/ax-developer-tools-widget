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
    actions: { ChangeMode },
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
   let hideIrrelevantWidgets = true;
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

   function replaceFilter( selection ) {
      const resource = context.features.filter.resource;
      if( !resource || selection === publishedSelection ) {
         return;
      }
      publishedSelection = selection;
      publishFilter( filterFromSelection( selection ) );
   }

   function updateHideIrrelevantWidgets( event ) {
      hideIrrelevantWidgets = event.target.checked;
      update();
   }

   function renderEmpty() {
      reactRender( <h3>Waiting for data</h3> );
   }

   let dispatcher;
   function update() {
      if( !visible || !domAvailable || !resourceAvailable ) {
         return;
      }

      const pageInfo = context.resources.pageInfo;
      const pageGraph = graph( pageInfo, hideIrrelevantWidgets );

      const pageTyeps = types();
      dispatcher = new Dispatcher( render );
      new HistoryStore( dispatcher );
      const graphStore = new GraphStore( dispatcher, pageGraph, pageTyeps );
      const layoutStore = new LayoutStore( dispatcher, graphStore );
      const settingsStore = new SettingsStore( dispatcher, Settings({ mode: READ_ONLY }) );
      const selectionStore = new SelectionStore( dispatcher, layoutStore, graphStore );

      function render() {
         replaceFilter( selectionStore.selection );

         reactRender(
            <div className='page-inspector-row form-inline'>
               <div className='page-inspector-settings form-group form-group-sm'>
                     <input type='checkbox'
                        id='hideIrrelevant'
                        className='form-control input-sm'
                        checked={hideIrrelevantWidgets}
                        onChange={updateHideIrrelevantWidgets}/>
                     <label htmlFor='hideIrrelevant'> Hide simple widgets</label>
               </div>
               <Graph className={'nbe-theme-fusebox-app'}
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
   name: 'ax-page-inspector-widget',
   injections: [ 'axContext', 'axEventBus', 'axReactRender' ],
   create
};

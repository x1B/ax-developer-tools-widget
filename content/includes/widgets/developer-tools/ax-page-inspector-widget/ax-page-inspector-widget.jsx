import React from 'react';
import patterns from 'laxar-patterns';

import wireflow from 'wireflow';

import { types, graph, layout } from './graph-helpers';

const {
  selection: {
    SelectionStore
  },
  history: {
    actions: { CreateCheckpoint },
    HistoryStore
  },
  layout: {
     actions: { AutoLayout },
     LayoutStore
  },
  graph: {
    GraphStore
  },
  settings: {
    actions: { ChangeMode },
    model: { Settings, READ_ONLY, READ_WRITE },
    SettingsStore
  },
  Dispatcher,
  components: { Graph }
} = wireflow;

function create( context, eventBus, reactRender ) {

   var domAvailable = false;
   var resourceAvailable = false;
   var visible = false;

   patterns.resources.handlerFor( context )
      .registerResourceFromFeature( 'pageInfo', {
         onUpdateReplace: () => {
            resourceAvailable = true;
            update();
         }
      } );

   eventBus.subscribe( 'didChangeAreaVisibility.' + context.widget.area, event => {
      if( !visible && event.visible ) {
         visible = true;
         update();
      }
   } );

   function renderEmpty() {
      reactRender( <h3>Waiting for data</h3> );
   }


   let dispatcher;
   function update() {
      if( !visible || !domAvailable || !resourceAvailable ) {
         return;
      }

      const pageInfo = context.resources.pageInfo;
      const pageGraph = graph( pageInfo );
      const pageTyeps = types();
      const pageLayout = layout( pageGraph );
      dispatcher = new Dispatcher( render );
      new HistoryStore( dispatcher );
      const graphStore = new GraphStore( dispatcher, pageGraph, pageTyeps );
      const layoutStore = new LayoutStore( dispatcher, pageLayout, graphStore );
      const settingsStore = new SettingsStore( dispatcher, Settings({ mode: READ_ONLY }) );
      const selectionStore = new SelectionStore( dispatcher, layoutStore, graphStore );

      window.setTimeout( () => {
         dispatcher.dispatch( AutoLayout() );
      }, 0 );

      function render() {
         reactRender(
            <div className='page-inspector-row'>
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

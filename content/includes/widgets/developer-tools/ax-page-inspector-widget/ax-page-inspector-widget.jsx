import React from 'react';
import patterns from 'laxar-patterns';

import wireflow from 'wireflow';

const {
  selection: {
    SelectionStore
  },
  history: {
    actions: { CreateCheckpoint },
    HistoryStore
  },
  layout: {
     model: layoutModel,
     actions: { AutoLayout },
     LayoutStore
  },
  graph: {
    model: graphModel,
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

function graph( pageInfo ) {

   const vertices = {};
   const edges = {};

   const { pageRef, pageDefinitions, widgetDescriptors } = pageInfo;
   const page = pageDefinitions[ pageRef ];

   Object.keys( page.areas ).forEach( areaName => {
      page.areas[ areaName ].forEach( component => {
         if( component.widget ) {
            addWidgetInstance( component );
         }
      } );
   } );

   console.log( "GRAPH: ", {
      vertices,
      edges
   } );
   return graphModel.convert.graph( {
      vertices,
      edges
   } );

   function addWidgetInstance( widget ) {
      // console.log( "ADD WIDGET: ", widget );
      const descriptor = widgetDescriptors[ widget.widget ];
      const ports = { inbound: [], outbound: [] };
      identifyPorts( widget.features, descriptor.features, [] );
      vertices[ widget.id ] = {
         id: widget.id,
         label: widget.widget,
         ports: ports
      };

      function identifyPorts( value, schema, path ) {
         if( !value || !schema ) {
            return;
         }

         if( schema.type === 'string' &&
             schema.format === 'topic' &&
             schema.axRole ) {
            const type = schema.axPattern ? schema.axPattern.toUpperCase() : inferEdgeType( path );
            if( !type ) {
               return;
            }
            const edgeId = value;
            ports[ schema.axRole === 'master' ? 'outbound' : 'inbound' ].push( {
               label: path.join( '.' ),
               id: path.join( ':' ),
               type,
               edgeId
            } );
            if( edgeId && !edges[ edgeId ] ) {
               edges[ edgeId ] = { type, id: edgeId };
            }
         }

         if( schema.type === 'object' && schema.properties ) {
            Object.keys( schema.properties ).forEach( key => {
               identifyPorts(
                  value[ key ],
                  schema.properties[ key ] || schema.additionalProperties,
                  path.concat( [ key ] )
               );
            } );
         }

         if( schema.type === 'array' ) {
            value.forEach( (item,i) => {
               identifyPorts(
                  item,
                  schema.items,
                  path.concat( [ i ] )
               );
            } );
         }

      }

      function inferEdgeType( path ) {
         if( !path.length ) {
            return null;
         }
         const lastSegment = path[ path.length - 1 ];
         if( [ 'action', 'flag', 'resource' ].indexOf( lastSegment ) !== -1 ) {
            return lastSegment.toUpperCase();
         }
         if( lastSegment === 'onActions' ) {
            return 'ACTION';
         }
         return inferEdgeType( path.slice( 0, path.length - 1 ) );
      }
   }
}

function layout( graph ) {
   const vertices = {};
   let i = 0;
   graph.vertices.forEach( (_, key) => {
      vertices[ key ] = { left: 50, top: 50 + 50 * i };
      ++i;
   } );

   let j = 0;
   const edges = {};
   graph.edges.forEach( (_, key) => {
      edges[ key ] = { left: 450, top: 150 + 50 * j };
      ++j;
   } );

   console.log( "LAYOUT: ", {
      vertices,
      edges
   } );
   return layoutModel.convert.layout( {
      vertices,
      edges
   } );
}

function types() {
   return graphModel.convert.types( {
      RESOURCE: {
        hidden: false,
        label: 'Resources'
      },
      FLAG: {
        label: 'Flags',
        hidden: false
      },
      ACTION: {
        // owningPort: 'inbound',
        label: 'Actions',
        hidden: false
      }
   } );
}


function create( context, eventBus, reactRender ) {

   patterns.resources.handlerFor( context )
      .registerResourceFromFeature( 'pageInfo', {
         onUpdateReplace: update
      } );

   function renderEmpty() {
      reactRender( <h3>Waiting for data</h3> );
   }

   let dispatcher;
   function update() {
      const pageInfo = context.resources.pageInfo;
      if( !pageInfo || !pageInfo.pageRef ) {
         dispatcher = null;
         renderEmpty();
         return;
      }
      if( dispatcher ) {
         // TODO: tear down old dispatcher and stores, then rebuild
         return;
      }

      const pageGraph = graph( pageInfo );
      const pageTyeps = types();
      const pageLayout = layout( pageGraph );
      dispatcher = new Dispatcher( render );
      new HistoryStore( dispatcher );
      const graphStore = new GraphStore( dispatcher, pageGraph, pageTyeps );
      const layoutStore = new LayoutStore( dispatcher, pageLayout, graphStore );
      const settingsStore = new SettingsStore( dispatcher, Settings({ mode: READ_ONLY }) );
      const selectionStore = new SelectionStore( dispatcher, layoutStore, graphStore );
      render();
      window.setTimeout( () => dispatcher.dispatch( AutoLayout() ), 500 );

      function render() {
         reactRender(
            <div className='page-inspector-row'>
               <h2><i className='fa fa-newspaper-o'></i>  { name }</h2>
               <div className='demo-wrapper'>
                 <div className='demo-editor'>
                   <Graph className={'nbe-theme-fusebox-app'}
                          types={graphStore.types}
                          model={graphStore.graph}
                          layout={layoutStore.layout}
                          measurements={layoutStore.measurements}
                          settings={settingsStore.settings}
                          selection={selectionStore.selection}
                          eventHandler={dispatcher.dispatch} />
                 </div>
               </div>
            </div>
         );
      }
   }

   return { onDomAvailable: update };
}

export default {
   name: 'ax-page-inspector-widget',
   injections: [ 'axContext', 'axEventBus', 'axReactRender' ],
   create
};

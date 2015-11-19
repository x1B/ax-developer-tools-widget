
import wireflow from 'wireflow';

const TYPE_CONTAINER = 'CONTAINER';

const {
  layout: {
     model: layoutModel
  },
  graph: {
    model: graphModel
  }
} = wireflow;


export function graph( pageInfo ) {

   const PAGE_ID = '.';
   const { pageRef, pageDefinitions, widgetDescriptors } = pageInfo;
   const page = pageDefinitions[ pageRef ];

   const vertices = {};
   const edges = {};
   vertices[ PAGE_ID ] =  {
      PAGE_ID,
      label: 'Page: ' + pageRef,
      ports: { inbound: [], outbound: [] }
   };
   identifyVertices();
   identifyContainers();
   return graphModel.convert.graph( {
      vertices,
      edges
   } );

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function isWidget( pageAreaItem ) {
      return !!pageAreaItem.widget;
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function identifyContainers() {

      const type = TYPE_CONTAINER;

      Object.keys( page.areas ).forEach( areaName => {
         insertEdge( areaName );
         const owner = findOwner( areaName );
         console.log( "OWNER: ", owner );
         insertOwnerPort( owner, areaName );
         page.areas[ areaName ].filter( isWidget ).forEach( widget => {
            insertUplink( vertices[ widget.id ], areaName );
         } );
      } );

      function findOwner( areaName ) {
         if( areaName.indexOf( '.' ) === -1 ) {
            return vertices[ PAGE_ID ];
         }
         const prefix = areaName.slice( 0, areaName.lastIndexOf( '.' ) );
         return vertices[ prefix ];
      }

      function insertOwnerPort( vertex, areaName ) {
         vertex.ports.outbound.unshift( {
            id: areaEdgeId( areaName ),
            type: TYPE_CONTAINER,
            edgeId: areaEdgeId( areaName ),
            label: areaName
         } );
      }

      function insertUplink( vertex, areaName ) {
         vertex.ports.inbound.unshift( {
            type: TYPE_CONTAINER,
            edgeId: areaEdgeId( areaName ),
            label: 'anchor'
         } );
      }

      function insertEdge( areaName ) {
         const id = areaEdgeId( areaName );
         edges[ id ] = { id, type, label: areaName };
      }

      function areaEdgeId( areaName ) {
         return TYPE_CONTAINER + ':' + areaName;
      }
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function identifyVertices() {
      Object.keys( page.areas ).forEach( areaName => {
         page.areas[ areaName ].forEach( component => {
            if( component.widget ) {
               processWidgetInstance( component, areaName );
            }
         } );
      } );
   }

   ///////////////////////////////////////////////////////////////////////////////////////////////////////////

   function processWidgetInstance( widget, areaName ) {
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
            if( !type ) { return; }
            const edgeId = type + ':' + value;
            const label = path.join( '.' );
            const id =  path.join( ':' );
            ports[ schema.axRole === 'master' ? 'outbound' : 'inbound' ].push( {
               label, id, type, edgeId
            } );
            if( edgeId && !edges[ edgeId ] ) {
               edges[ edgeId ] = { type, id: edgeId, label: value };
            }
         }

         if( schema.type === 'object' && schema.properties ) {
            Object.keys( schema.properties ).forEach( key => {
               const propertySchema = schema.properties[ key ] || schema.additionalProperties;
               identifyPorts( value[ key ], propertySchema, path.concat( [ key ] ) );
            } );
         }

         if( schema.type === 'array' ) {
            value.forEach( (item, i) => {
               identifyPorts( item, schema.items, path.concat( [ i ] ) );
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

export function layout( graph ) {
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

   return layoutModel.convert.layout( {
      vertices,
      edges
   } );
}

export function types() {
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
         label: 'Actions',
         hidden: false
      },
      CONTAINER: {
         hidden: false,
         label: 'Container',
         owningPort: 'outbound'
      }
   } );
}

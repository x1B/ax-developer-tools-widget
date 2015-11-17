
import wireflow from 'wireflow';

const {
  layout: {
     model: layoutModel
  },
  graph: {
    model: graphModel
  }
} = wireflow;


export function graph( pageInfo ) {

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
      }
   } );
}

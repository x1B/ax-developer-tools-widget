import * as React from 'react';
import * as api from 'wireflow';
import * as data from './data';

const {
  Dispatcher,
  model: { convert, Settings, READ_ONLY, READ_WRITE },
  stores: { LayoutStore, GraphStore, SelectionStore, HistoryStore },
  components: { Graph }
} = api;

export default {
  name: 'ax-topic-net-widget',
  injections: [ 'axContext', 'axEventBus', 'axFeatures' ],
  create: create
};


const types = convert.types( {
  RESOURCE: {
    hidden: false,
    label: 'Resources'
  },
  CONTAINER: {
    owningPort: 'outbound',
    hidden: false,
    label: 'Nesting'
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



function create( context, eventBus, features ) {
  var domContainer = null;
  var mastersByResource = {};
  var slavesByResource = {};

  var graph = { edges: {}, vertices: {} };
  var layout = { edges: {}, vertices: {} };

  const dispatcher = new Dispatcher( render );
  new HistoryStore( dispatcher );
  const graphStore = new GraphStore( dispatcher, convert.graph( graph ), types );
  const layoutStore = new LayoutStore( dispatcher, convert.layout( layout ), types );
  const selectionStore = new SelectionStore( dispatcher, layoutStore, graphStore );
  const settings = Settings({ mode: READ_WRITE });

  var masterCounter = 0;
  var topicCounter = 0;
  var slaveCounter = 0;

  eventBus.subscribe( 'didProduce.' + features.events.stream, function( event ) {
    var items = event.data;
    items.forEach( ({ action, cycleId, event, source, target }) => {
      const parts = event.split( '.' );
      const topic = parts[ 1 ];
      if( !topic ) { return; }
      const widget = source.replace( /.*#(.*)/, '$1' );
      if( parts[ 0 ] === 'didReplace' ) {
        if( action === 'subscribe' ) {
          addResourceSlave( topic, widget );
        }
        else if( action === 'publish' ) {
          addResourceMaster( topic, widget );
        }
      }
    } );


    function addTopic( topic, type ) {
      if( graph.edges[ topic ] ) { return; }
      ++topicCounter;
      graph.edges[ topic ] = { type: type };
      layout.edges[ topic ] = {
        left: 250 + topicCounter*50,
        top: 100 + topicCounter*80
      };
    }


    function addResourceMaster( topic, widget ) {
      if( !mastersByResource[ topic ] ) {
        addTopic( topic, 'RESOURCE' );
        mastersByResource[ topic ] = {};
      }
      if( mastersByResource[ topic ][ widget ] ) {
        return;
      }
      mastersByResource[ topic ][ widget ] = true;

      if( !graph.vertices[ widget ] ) {
        ++masterCounter;
        graph.vertices[ widget ] = {
          label: widget,
          ports: { inbound: [], outbound: [] }
        };
        layout.vertices[ widget ] = {
          left: 10 + masterCounter*5,
          top: 10 + masterCounter*80
        };
      }
      graph.vertices[ widget ].ports.outbound.push( {
        id: 'M.'+topic,
        label: topic,
        edgeId: topic,
        type: 'RESOURCE'
      } );
    }

    function addResourceSlave( topic, widget ) {
      if( !slavesByResource[ topic ] ) {
        addTopic( topic, 'RESOURCE' );
        slavesByResource[ topic ] = {};
      }
      if( slavesByResource[ topic ][ widget ] ) {
        return;
      }
      slavesByResource[ topic ][ widget ] = true;

      if( !graph.vertices[ widget ] ) {
        ++slaveCounter;
        graph.vertices[ widget ] = {
          label: widget,
          ports: { inbound: [], outbound: [] }
        };
        layout.vertices[ widget ] = {
          left: 400 + slaveCounter*50,
          top: 30 + slaveCounter*80
        };
      }
      graph.vertices[ widget ].ports.inbound.push( {
        id: 'S'+topic,
        label: topic,
        edgeId: topic,
        type: 'RESOURCE'
      } );
    }

    console.log( 'CLOG model', convert.graph( graph ).toJS() ); // :TODO: DELETE ME
    console.log( 'CLOG layout', convert.layout( layout ).toJS() ); // :TODO: DELETE ME

    // :TODO: auto-layout
    layoutStore.layout = convert.layout( layout );
    graphStore.graph = convert.graph( graph );
    render();
  } );


  function render() {
    if( !domContainer ) {
      return;
    }
    React.render(
      <div className='ax-topic-net-wrapper'>
        <div>
          <Graph settings={settings}
                 className={'nbe-theme-fusebox-app'}
                 model={graphStore.graph}
                 types={types}
                 layout={layoutStore.layout}
                 measurements={layoutStore.measurements}
                 selection={selectionStore.selection}
                 eventHandler={dispatcher.dispatch} />
        </div>
      </div>,
      domContainer
    );
  }

  return {
    renderTo: function( element ) {
      domContainer = element;
      render();
    }
  };

}

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


const patternTypes = {
  didReplace: 'RESOURCE',
  takeActionRequest: 'ACTION',
  didChangeFlag: 'FLAG',
};


function create( context, eventBus, features ) {
  var domContainer = null;

  // topic state:
  var mastersByResource;
  var slavesByResource;
  var graph;
  var layout;
  var masterCounter;
  var topicCounter;
  var slaveCounter;
  reset();

  const dispatcher = new Dispatcher( render );
  new HistoryStore( dispatcher );
  const graphStore = new GraphStore( dispatcher, convert.graph( graph ), types );
  const layoutStore = new LayoutStore( dispatcher, convert.layout( layout ), types );
  const selectionStore = new SelectionStore( dispatcher, layoutStore, graphStore );
  const settings = Settings({ mode: READ_WRITE });

  eventBus.subscribe( 'didProduce.' + features.events.stream, function( event ) {
    var items = event.data;
    items.forEach( ({ action, cycleId, event, source, target }) => {
      const parts = event.split( '.' );
      if( parts[ 0 ] === 'endLifecycleRequest' ) {
        reset();
        render();
        return;
      }

      const topic = parts[ 1 ];
      if( !topic ) { return; }

      const widget = source.replace( /.*#(.*)/, '$1' );
      const patternType = patternTypes[ parts[ 0 ] ];
      if( !patternType ) { return; }

      if( action === 'subscribe' ) {
        addSlave( topic, widget, patternType );
      }
      else if( action === 'publish' ) {
        addMaster( topic, widget, patternType );
      }

    } );

    console.log( 'CLOG model', convert.graph( graph ).toJS() ); // :TODO: DELETE ME
    console.log( 'CLOG layout', convert.layout( layout ).toJS() ); // :TODO: DELETE ME

    // :TODO: auto-layout
    layoutStore.layout = convert.layout( layout );
    graphStore.graph = convert.graph( graph );
    render();
  } );

  function reset() {
    console.log( 'reset' ); // :TODO: DELETE ME
    graph = { edges: {}, vertices: {} };
    layout = { edges: {}, vertices: {} };
    mastersByResource = {};
    slavesByResource = {};

    masterCounter = topicCounter = slaveCounter = 0;
  }


  function addTopic( topic, type ) {
    if( graph.edges[ topic ] ) { return; }
    ++topicCounter;
    graph.edges[ topic ] = { type: type };
    layout.edges[ topic ] = {
      left: 250 + topicCounter*50,
      top: 100 + topicCounter*80
    };
  }


  function addMaster( topic, widget, type ) {
    if( !mastersByResource[ topic ] ) {
      addTopic( topic, type );
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
      type: type
    } );
  }


  function addSlave( topic, widget, type ) {
    if( !slavesByResource[ topic ] ) {
      addTopic( topic, type );
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
      type: type
    } );
  }

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

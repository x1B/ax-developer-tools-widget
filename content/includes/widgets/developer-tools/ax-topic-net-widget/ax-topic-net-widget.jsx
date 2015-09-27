import * as React from 'react';
import * as api from 'wireflow';
import * as data from './data';

const {
  Dispatcher,
  model: { convert, Settings, READ_ONLY, READ_WRITE },
  stores: { LayoutStore, GraphStore, SelectionStore, HistoryStore },
  components: { Graph }
} = api;

// application starting state:
const graph = convert.graph( data.graph );
const layout = convert.layout( data.layout );
const types = convert.types( data.types );

export default {
  name: 'ax-topic-net-widget',
  injections: [ 'axContext' ],
  create: function( context ) {
     return {
        renderTo: function( element ) {
          const dispatcher = new Dispatcher( render );

          new HistoryStore( dispatcher );
          const graphStore = new GraphStore( dispatcher, graph, types );
          const layoutStore = new LayoutStore( dispatcher, layout, types );
          const selectionStore = new SelectionStore( dispatcher, layoutStore, graphStore );

          var settings = Settings({ mode: READ_ONLY });
          const toggleMode = () => {
            settings = Settings({
              mode: settings.mode === READ_ONLY ? READ_WRITE : READ_ONLY
            });
            render();
          };

          function render() {
            // Later: <History checkpoints={historyStore.checkpoints } now={ historyStore.now } />

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
              element
            );
          }

        }
     };
  }
};

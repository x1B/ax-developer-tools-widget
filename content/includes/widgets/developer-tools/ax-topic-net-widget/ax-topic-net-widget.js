define(['exports', 'module', 'react', 'wireflow', './data'], function (exports, module, _react, _wireflow, _data) {
  'use strict';

  var Dispatcher = _wireflow.Dispatcher;
  var _api$model = _wireflow.model;
  var convert = _api$model.convert;
  var Settings = _api$model.Settings;
  var READ_ONLY = _api$model.READ_ONLY;
  var READ_WRITE = _api$model.READ_WRITE;
  var _api$stores = _wireflow.stores;
  var LayoutStore = _api$stores.LayoutStore;
  var GraphStore = _api$stores.GraphStore;
  var SelectionStore = _api$stores.SelectionStore;
  var HistoryStore = _api$stores.HistoryStore;
  var Graph = _wireflow.components.Graph;

  // application starting state:
  var graph = convert.graph(_data.graph);
  var layout = convert.layout(_data.layout);
  var types = convert.types(_data.types);

  module.exports = {
    name: 'ax-topic-net-widget',
    injections: ['axContext'],
    create: function create(context) {
      return {
        renderTo: function renderTo(element) {
          var dispatcher = new Dispatcher(render);

          new HistoryStore(dispatcher);
          var graphStore = new GraphStore(dispatcher, graph, types);
          var layoutStore = new LayoutStore(dispatcher, layout, types);
          var selectionStore = new SelectionStore(dispatcher, layoutStore, graphStore);

          var settings = Settings({ mode: READ_ONLY });
          var toggleMode = function toggleMode() {
            settings = Settings({
              mode: settings.mode === READ_ONLY ? READ_WRITE : READ_ONLY
            });
            render();
          };

          function render() {
            // Later: <History checkpoints={historyStore.checkpoints } now={ historyStore.now } />

            _react.render(_react.createElement(
              'div',
              { className: 'ax-topic-net-wrapper' },
              _react.createElement(
                'div',
                null,
                _react.createElement(Graph, { settings: settings,
                  className: 'nbe-theme-fusebox-app',
                  model: graphStore.graph,
                  types: types,
                  layout: layoutStore.layout,
                  measurements: layoutStore.measurements,
                  selection: selectionStore.selection,
                  eventHandler: dispatcher.dispatch })
              )
            ), element);
          }
        }
      };
    }
  };
});
//# sourceMappingURL=/Users/michael/work/github.com/LaxarJS/shop-demo/includes/widgets/laxarjs/ax-developer-tools-widget/content/includes/widgets/developer-tools/ax-topic-net-widget/ax-topic-net-widget.js.map
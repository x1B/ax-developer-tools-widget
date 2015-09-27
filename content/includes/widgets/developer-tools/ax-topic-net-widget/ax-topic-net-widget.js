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
  module.exports = {
    name: 'ax-topic-net-widget',
    injections: ['axContext', 'axEventBus', 'axFeatures'],
    create: create
  };

  var types = convert.types({
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
  });

  function create(context, eventBus, features) {
    var domContainer = null;
    var mastersByResource = {};
    var slavesByResource = {};

    var graph = { edges: {}, vertices: {} };
    var layout = { edges: {}, vertices: {} };

    var dispatcher = new Dispatcher(render);
    new HistoryStore(dispatcher);
    var graphStore = new GraphStore(dispatcher, convert.graph(graph), types);
    var layoutStore = new LayoutStore(dispatcher, convert.layout(layout), types);
    var selectionStore = new SelectionStore(dispatcher, layoutStore, graphStore);
    var settings = Settings({ mode: READ_WRITE });

    var masterCounter = 0;
    var topicCounter = 0;
    var slaveCounter = 0;

    eventBus.subscribe('didProduce.' + features.events.stream, function (event) {
      var items = event.data;
      items.forEach(function (_ref) {
        var action = _ref.action;
        var cycleId = _ref.cycleId;
        var event = _ref.event;
        var source = _ref.source;
        var target = _ref.target;

        var parts = event.split('.');
        var topic = parts[1];
        if (!topic) {
          return;
        }
        var widget = source.replace(/.*#(.*)/, '$1');
        if (parts[0] === 'didReplace') {
          if (action === 'subscribe') {
            addResourceSlave(topic, widget);
          } else if (action === 'publish') {
            addResourceMaster(topic, widget);
          }
        }
      });

      function addTopic(topic, type) {
        if (graph.edges[topic]) {
          return;
        }
        ++topicCounter;
        graph.edges[topic] = { type: type };
        layout.edges[topic] = {
          left: 250 + topicCounter * 50,
          top: 100 + topicCounter * 80
        };
      }

      function addResourceMaster(topic, widget) {
        if (!mastersByResource[topic]) {
          addTopic(topic, 'RESOURCE');
          mastersByResource[topic] = {};
        }
        if (mastersByResource[topic][widget]) {
          return;
        }
        mastersByResource[topic][widget] = true;

        if (!graph.vertices[widget]) {
          ++masterCounter;
          graph.vertices[widget] = {
            label: widget,
            ports: { inbound: [], outbound: [] }
          };
          layout.vertices[widget] = {
            left: 10 + masterCounter * 5,
            top: 10 + masterCounter * 80
          };
        }
        graph.vertices[widget].ports.outbound.push({
          id: 'M.' + topic,
          label: topic,
          edgeId: topic,
          type: 'RESOURCE'
        });
      }

      function addResourceSlave(topic, widget) {
        if (!slavesByResource[topic]) {
          addTopic(topic, 'RESOURCE');
          slavesByResource[topic] = {};
        }
        if (slavesByResource[topic][widget]) {
          return;
        }
        slavesByResource[topic][widget] = true;

        if (!graph.vertices[widget]) {
          ++slaveCounter;
          graph.vertices[widget] = {
            label: widget,
            ports: { inbound: [], outbound: [] }
          };
          layout.vertices[widget] = {
            left: 400 + slaveCounter * 50,
            top: 30 + slaveCounter * 80
          };
        }
        graph.vertices[widget].ports.inbound.push({
          id: 'S' + topic,
          label: topic,
          edgeId: topic,
          type: 'RESOURCE'
        });
      }

      console.log('CLOG model', convert.graph(graph).toJS()); // :TODO: DELETE ME
      console.log('CLOG layout', convert.layout(layout).toJS()); // :TODO: DELETE ME

      // :TODO: auto-layout
      layoutStore.layout = convert.layout(layout);
      graphStore.graph = convert.graph(graph);
      render();
    });

    function render() {
      if (!domContainer) {
        return;
      }
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
      ), domContainer);
    }

    return {
      renderTo: function renderTo(element) {
        domContainer = element;
        render();
      }
    };
  }
});
//# sourceMappingURL=/Users/michael/work/github.com/LaxarJS/shop-demo/includes/widgets/laxarjs/ax-developer-tools-widget/content/includes/widgets/developer-tools/ax-topic-net-widget/ax-topic-net-widget.js.map
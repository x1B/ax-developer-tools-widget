define(['exports', 'module', 'react', 'laxar-patterns', 'wireflow'], function (exports, module, _react, _laxarPatterns, _wireflow) {
   'use strict';

   function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

   var _React = _interopRequireDefault(_react);

   var _patterns = _interopRequireDefault(_laxarPatterns);

   var _wireflow2 = _interopRequireDefault(_wireflow);

   var SelectionStore = _wireflow2['default'].selection.SelectionStore;
   var _wireflow$history = _wireflow2['default'].history;
   var CreateCheckpoint = _wireflow$history.actions.CreateCheckpoint;
   var HistoryStore = _wireflow$history.HistoryStore;
   var _wireflow$layout = _wireflow2['default'].layout;
   var layoutModel = _wireflow$layout.model;
   var AutoLayout = _wireflow$layout.actions.AutoLayout;
   var LayoutStore = _wireflow$layout.LayoutStore;
   var _wireflow$graph = _wireflow2['default'].graph;
   var graphModel = _wireflow$graph.model;
   var GraphStore = _wireflow$graph.GraphStore;
   var _wireflow$settings = _wireflow2['default'].settings;
   var ChangeMode = _wireflow$settings.actions.ChangeMode;
   var _wireflow$settings$model = _wireflow$settings.model;
   var Settings = _wireflow$settings$model.Settings;
   var READ_ONLY = _wireflow$settings$model.READ_ONLY;
   var READ_WRITE = _wireflow$settings$model.READ_WRITE;
   var SettingsStore = _wireflow$settings.SettingsStore;
   var Dispatcher = _wireflow2['default'].Dispatcher;
   var Graph = _wireflow2['default'].components.Graph;

   function graph(pageInfo) {

      var vertices = {};
      var edges = {};

      var pageRef = pageInfo.pageRef;
      var pageDefinitions = pageInfo.pageDefinitions;
      var widgetDescriptors = pageInfo.widgetDescriptors;

      var page = pageDefinitions[pageRef];

      Object.keys(page.areas).forEach(function (areaName) {
         page.areas[areaName].forEach(function (component) {
            if (component.widget) {
               addWidgetInstance(component);
            }
         });
      });

      console.log("GRAPH: ", {
         vertices: vertices,
         edges: edges
      });
      return graphModel.convert.graph({
         vertices: vertices,
         edges: edges
      });

      function addWidgetInstance(widget) {
         // console.log( "ADD WIDGET: ", widget );
         var descriptor = widgetDescriptors[widget.widget];
         var ports = { inbound: [], outbound: [] };
         identifyPorts(widget.features, descriptor.features, []);
         vertices[widget.id] = {
            id: widget.id,
            label: widget.widget,
            ports: ports
         };

         function identifyPorts(value, schema, path) {
            if (!value || !schema) {
               return;
            }

            if (schema.type === 'string' && schema.format === 'topic' && schema.axRole) {
               var type = schema.axPattern ? schema.axPattern.toUpperCase() : inferEdgeType(path);
               if (!type) {
                  return;
               }
               var edgeId = value;
               ports[schema.axRole === 'master' ? 'outbound' : 'inbound'].push({
                  label: path.join('.'),
                  id: path.join(':'),
                  type: type,
                  edgeId: edgeId
               });
               if (edgeId && !edges[edgeId]) {
                  edges[edgeId] = { type: type, id: edgeId };
               }
            }

            if (schema.type === 'object' && schema.properties) {
               Object.keys(schema.properties).forEach(function (key) {
                  identifyPorts(value[key], schema.properties[key] || schema.additionalProperties, path.concat([key]));
               });
            }

            if (schema.type === 'array') {
               value.forEach(function (item, i) {
                  identifyPorts(item, schema.items, path.concat([i]));
               });
            }
         }

         function inferEdgeType(_x) {
            var _again = true;

            _function: while (_again) {
               var path = _x;
               _again = false;

               if (!path.length) {
                  return null;
               }
               var lastSegment = path[path.length - 1];
               if (['action', 'flag', 'resource'].indexOf(lastSegment) !== -1) {
                  return lastSegment.toUpperCase();
               }
               if (lastSegment === 'onActions') {
                  return 'ACTION';
               }
               _x = path.slice(0, path.length - 1);
               _again = true;
               lastSegment = undefined;
               continue _function;
            }
         }
      }
   }

   function layout(graph) {
      var vertices = {};
      var i = 0;
      graph.vertices.forEach(function (_, key) {
         vertices[key] = { left: 50, top: 50 + 50 * i };
         ++i;
      });

      var j = 0;
      var edges = {};
      graph.edges.forEach(function (_, key) {
         edges[key] = { left: 450, top: 150 + 50 * j };
         ++j;
      });

      console.log("LAYOUT: ", {
         vertices: vertices,
         edges: edges
      });
      return layoutModel.convert.layout({
         vertices: vertices,
         edges: edges
      });
   }

   function types() {
      return graphModel.convert.types({
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
      });
   }

   function create(context, eventBus, reactRender) {

      _patterns['default'].resources.handlerFor(context).registerResourceFromFeature('pageInfo', {
         onUpdateReplace: update
      });

      function renderEmpty() {
         reactRender(_React['default'].createElement(
            'h3',
            null,
            'Waiting for data'
         ));
      }

      var dispatcher = undefined;
      function update() {
         var pageInfo = context.resources.pageInfo;
         if (!pageInfo || !pageInfo.pageRef) {
            dispatcher = null;
            renderEmpty();
            return;
         }
         if (dispatcher) {
            // TODO: tear down old dispatcher and stores, then rebuild
            return;
         }

         var pageGraph = graph(pageInfo);
         var pageTyeps = types();
         var pageLayout = layout(pageGraph);
         dispatcher = new Dispatcher(render);
         new HistoryStore(dispatcher);
         var graphStore = new GraphStore(dispatcher, pageGraph, pageTyeps);
         var layoutStore = new LayoutStore(dispatcher, pageLayout, graphStore);
         var settingsStore = new SettingsStore(dispatcher, Settings({ mode: READ_ONLY }));
         var selectionStore = new SelectionStore(dispatcher, layoutStore, graphStore);
         render();
         window.setTimeout(function () {
            return dispatcher.dispatch(AutoLayout());
         }, 500);

         function render() {
            reactRender(_React['default'].createElement(
               'div',
               { className: 'page-inspector-row' },
               _React['default'].createElement(
                  'h2',
                  null,
                  _React['default'].createElement('i', { className: 'fa fa-newspaper-o' }),
                  '  ',
                  name
               ),
               _React['default'].createElement(
                  'div',
                  { className: 'demo-wrapper' },
                  _React['default'].createElement(
                     'div',
                     { className: 'demo-editor' },
                     _React['default'].createElement(Graph, { className: 'nbe-theme-fusebox-app',
                        types: graphStore.types,
                        model: graphStore.graph,
                        layout: layoutStore.layout,
                        measurements: layoutStore.measurements,
                        settings: settingsStore.settings,
                        selection: selectionStore.selection,
                        eventHandler: dispatcher.dispatch })
                  )
               )
            ));
         }
      }

      return { onDomAvailable: update };
   }

   module.exports = {
      name: 'ax-page-inspector-widget',
      injections: ['axContext', 'axEventBus', 'axReactRender'],
      create: create
   };
});
//# sourceMappingURL=ax-page-inspector-widget.js.map

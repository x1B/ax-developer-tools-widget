define(['exports', 'wireflow'], function (exports, _wireflow) {
   'use strict';

   Object.defineProperty(exports, '__esModule', {
      value: true
   });
   exports.graph = graph;
   exports.layout = layout;
   exports.types = types;

   function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

   var _wireflow2 = _interopRequireDefault(_wireflow);

   var layoutModel = _wireflow2['default'].layout.model;
   var graphModel = _wireflow2['default'].graph.model;

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

      return layoutModel.convert.layout({
         vertices: vertices,
         edges: edges
      });
   }

   function types() {
      return graphModel.convert.types({
         RESOURCE: {
            owningPort: 'inbound',
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
      });
   }
});
//# sourceMappingURL=graph-helpers.js.map

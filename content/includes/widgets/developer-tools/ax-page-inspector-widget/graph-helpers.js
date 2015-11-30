define(['exports', 'wireflow'], function (exports, _wireflow) {'use strict';Object.defineProperty(exports, '__esModule', { value: true });var _slicedToArray = (function () {function sliceIterator(arr, i) {var _arr = [];var _n = true;var _d = false;var _e = undefined;try {for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {_arr.push(_s.value);if (i && _arr.length === i) break;}} catch (err) {_d = true;_e = err;} finally {try {if (!_n && _i['return']) _i['return']();} finally {if (_d) throw _e;}}return _arr;}return function (arr, i) {if (Array.isArray(arr)) {return arr;} else if (Symbol.iterator in Object(arr)) {return sliceIterator(arr, i);} else {throw new TypeError('Invalid attempt to destructure non-iterable instance');}};})();exports.graph = graph;exports.layout = layout;exports.types = types;exports.filterFromSelection = filterFromSelection;function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _wireflow2 = _interopRequireDefault(_wireflow);


   var TYPE_CONTAINER = 'CONTAINER';var 



   layoutModel = _wireflow2['default'].layout.model;var 


   graphModel = _wireflow2['default'].graph.model;



   var edgeTypes = { 
      RESOURCE: { 
         hidden: false, 
         label: 'Resources' }, 

      FLAG: { 
         label: 'Flags', 
         hidden: false }, 

      ACTION: { 
         label: 'Actions', 
         hidden: false }, 

      CONTAINER: { 
         hidden: false, 
         label: 'Container', 
         owningPort: 'outbound' } };




   /**
    * Create a wireflow graph from a given page/widget information model.
    *
    * @param {Object} pageInfo
    * @param {Boolean=false} includeIrrelevantWidgets
    *   If set to `true`, widgets without any relevance to actions/resources/flags are removed.
    *   Containers of widgets (that are relevant by this measure) are kept.
    */
   function graph(pageInfo, includeIrrelevantWidgets) {

      var PAGE_ID = '.';var 
      pageRef = pageInfo.pageRef;var pageDefinitions = pageInfo.pageDefinitions;var widgetDescriptors = pageInfo.widgetDescriptors;
      var page = pageDefinitions[pageRef];

      var vertices = {};
      var edges = {};

      identifyVertices();
      identifyContainers();
      if (!includeIrrelevantWidgets) {
         pruneIrrelevantWidgets();}

      pruneEmptyEdges();

      return graphModel.convert.graph({ 
         vertices: vertices, 
         edges: edges });


      ///////////////////////////////////////////////////////////////////////////////////////////////////////////

      function isWidget(pageAreaItem) {
         return !!pageAreaItem.widget;}


      function isLayout(pageAreaItem) {
         return !!pageAreaItem.layout;}


      function either(f, g) {
         return function () {
            return f.apply(this, arguments) || g.apply(this, arguments);};}



      ///////////////////////////////////////////////////////////////////////////////////////////////////////////

      function identifyVertices() {
         Object.keys(page.areas).forEach(function (areaName) {
            page.areas[areaName].forEach(function (component) {
               if (component.widget) {
                  processWidgetInstance(component, areaName);} else 

               if (component.layout) {
                  processLayoutInstance(component, areaName);}});});}





      ///////////////////////////////////////////////////////////////////////////////////////////////////////////

      function processLayoutInstance(layout, areaName) {
         vertices[layout.id] = { 
            id: layout.id, 
            kind: 'LAYOUT', 
            label: layout.id, 
            ports: { inbound: [], outbound: [] } };}



      ///////////////////////////////////////////////////////////////////////////////////////////////////////////

      function processWidgetInstance(widget, areaName) {
         var descriptor = widgetDescriptors[widget.widget];
         var ports = { inbound: [], outbound: [] };

         var kinds = { 
            widget: 'WIDGET', 
            activity: 'ACTIVITY' };


         identifyPorts(widget.features, descriptor.features, []);
         vertices[widget.id] = { 
            id: widget.id, 
            kind: kinds[descriptor.integration.type], 
            label: widget.id, 
            ports: ports };


         function identifyPorts(value, schema, path) {
            if (!value || !schema) {
               return;}


            if (schema.type === 'string' && (
            schema.format === 'topic' || schema.format === 'flag-topic') && 
            schema.axRole) {
               var type = schema.axPattern ? schema.axPattern.toUpperCase() : inferEdgeType(path);
               if (!type) {return;}
               var edgeId = type + ':' + value;
               var label = path.join('.');
               var id = path.join(':');
               ports[schema.axRole === 'master' ? 'outbound' : 'inbound'].push({ 
                  label: label, id: id, type: type, edgeId: edgeId });

               if (edgeId && !edges[edgeId]) {
                  edges[edgeId] = { type: type, id: edgeId, label: value };}}



            if (schema.type === 'object' && schema.properties) {
               Object.keys(schema.properties).forEach(function (key) {
                  var propertySchema = schema.properties[key] || schema.additionalProperties;
                  identifyPorts(value[key], propertySchema, path.concat([key]));});}



            if (schema.type === 'array') {
               value.forEach(function (item, i) {
                  identifyPorts(item, schema.items, path.concat([i]));});}}




         function inferEdgeType(_x) {var _again = true;_function: while (_again) {var path = _x;_again = false;
               if (!path.length) {
                  return null;}

               var lastSegment = path[path.length - 1];
               if (['action', 'flag', 'resource'].indexOf(lastSegment) !== -1) {
                  return lastSegment.toUpperCase();}

               if (lastSegment === 'onActions') {
                  return 'ACTION';}_x = 

               path.slice(0, path.length - 1);_again = true;lastSegment = undefined;continue _function;}}}



      ///////////////////////////////////////////////////////////////////////////////////////////////////////////

      function pruneIrrelevantWidgets() {
         var toPrune = [];
         do {
            toPrune.forEach(function (id) {delete vertices[id];});
            pruneEmptyEdges();
            toPrune = mark();} while (
         toPrune.length);

         function mark() {
            var pruneList = [];
            Object.keys(vertices).forEach(function (vId) {
               var ports = vertices[vId].ports;
               if (ports.inbound.length <= 1) {
                  if (ports.outbound.every(function (_) {return !_.edgeId;})) {
                     pruneList.push(vId);}}});



            return pruneList;}}



      function pruneEmptyEdges() {
         var toPrune = [];
         Object.keys(edges).forEach(function (edgeId) {
            var type = edgeTypes[edges[edgeId].type];
            var masters = Object.keys(vertices).filter(isMasterOf(edgeId));
            var slaves = Object.keys(vertices).filter(isSlaveOf(edgeId));
            var hasMasters = masters.length > 0;
            var hasSlaves = slaves.length > 0;
            var isEmpty = type.owningPort ? !hasMasters || !hasSlaves : !hasMasters && !hasSlaves;
            if (!isEmpty) {
               return;}


            toPrune.push(edgeId);
            masters.concat(slaves).forEach(function (vertexId) {
               var ports = vertices[vertexId].ports;
               ports.inbound.concat(ports.outbound).forEach(function (port) {
                  port.edgeId = port.edgeId === edgeId ? null : port.edgeId;});});});



         toPrune.forEach(function (id) {delete edges[id];});

         function isSlaveOf(edgeId) {
            return function (vertexId) {
               return vertices[vertexId].ports.inbound.some(function (port) {return port.edgeId === edgeId;});};}



         function isMasterOf(edgeId) {
            return function (vertexId) {
               return vertices[vertexId].ports.outbound.some(function (port) {return port.edgeId === edgeId;});};}}




      ///////////////////////////////////////////////////////////////////////////////////////////////////////////

      function identifyContainers() {
         var type = TYPE_CONTAINER;

         vertices[PAGE_ID] = { 
            PAGE_ID: PAGE_ID, 
            label: 'Page ' + pageRef, 
            kind: 'PAGE', 
            ports: { inbound: [], outbound: [] } };


         Object.keys(page.areas).forEach(function (areaName) {
            insertEdge(areaName);
            var owner = findOwner(areaName);
            if (!owner) {
               return;}


            var containsAnything = false;
            page.areas[areaName].filter(either(isWidget, isLayout)).forEach(function (item) {
               if (vertices[item.id]) {
                  insertUplink(vertices[item.id], areaName);
                  containsAnything = true;}});


            if (containsAnything) {
               insertOwnerPort(owner, areaName);}});



         function findOwner(areaName) {
            if (areaName.indexOf('.') === -1) {
               return vertices[PAGE_ID];}

            var prefix = areaName.slice(0, areaName.lastIndexOf('.'));
            return vertices[prefix];}


         function insertOwnerPort(vertex, areaName) {
            vertex.ports.outbound.unshift({ 
               id: 'CONTAINER:' + areaName, 
               type: TYPE_CONTAINER, 
               edgeId: areaEdgeId(areaName), 
               label: areaName });}



         function insertUplink(vertex, areaName) {
            vertex.ports.inbound.unshift({ 
               id: 'CONTAINER:anchor', 
               type: TYPE_CONTAINER, 
               edgeId: areaEdgeId(areaName), 
               label: 'anchor' });}



         function insertEdge(areaName) {
            var id = areaEdgeId(areaName);
            edges[id] = { id: id, type: type, label: areaName };}


         function areaEdgeId(areaName) {
            return TYPE_CONTAINER + ':' + areaName;}}}





   //////////////////////////////////////////////////////////////////////////////////////////////////////////////

   function layout(graph) {
      return layoutModel.convert.layout({ 
         vertices: {}, 
         edges: {} });}



   //////////////////////////////////////////////////////////////////////////////////////////////////////////////

   function types() {
      return graphModel.convert.types(edgeTypes);}


   //////////////////////////////////////////////////////////////////////////////////////////////////////////////

   function filterFromSelection(selection, graphModel) {
      var topics = selection.edges.flatMap(function (edgeId) {var _edgeId$split = 
         edgeId.split(':');var _edgeId$split2 = _slicedToArray(_edgeId$split, 2);var type = _edgeId$split2[0];var topic = _edgeId$split2[1];
         return type === 'CONTAINER' ? [] : [{ pattern: type, topic: topic }];}).
      toJS();

      var participants = selection.vertices.flatMap(function (vertexId) {var _graphModel$vertices$get = 
         graphModel.vertices.get(vertexId);var id = _graphModel$vertices$get.id;var kind = _graphModel$vertices$get.kind;
         return kind === 'PAGE' || kind === 'LAYOUT' ? [] : [{ kind: kind, participant: vertexId }];});


      return { 
         topics: topics, 
         participants: participants };}});
//# sourceMappingURL=graph-helpers.js.map

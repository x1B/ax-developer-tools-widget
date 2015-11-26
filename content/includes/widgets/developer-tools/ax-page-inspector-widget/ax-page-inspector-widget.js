define(['exports', 'module', 'react', 'laxar-patterns', 'wireflow', './graph-helpers'], function (exports, module, _react, _laxarPatterns, _wireflow, _graphHelpers) {'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _React = _interopRequireDefault(_react);var _patterns = _interopRequireDefault(_laxarPatterns);var _wireflow2 = _interopRequireDefault(_wireflow);var 








   SelectionStore = _wireflow2['default'].selection.SelectionStore;var _wireflow$history = _wireflow2['default'].

   history;var 
   CreateCheckpoint = _wireflow$history.actions.CreateCheckpoint;var 
   HistoryStore = _wireflow$history.HistoryStore;var _wireflow$layout = _wireflow2['default'].

   layout;var 
   AutoLayout = _wireflow$layout.actions.AutoLayout;var 
   LayoutStore = _wireflow$layout.LayoutStore;var 


   GraphStore = _wireflow2['default'].graph.GraphStore;var _wireflow$settings = _wireflow2['default'].

   settings;var 
   ChangeMode = _wireflow$settings.actions.ChangeMode;var _wireflow$settings$model = _wireflow$settings.
   model;var Settings = _wireflow$settings$model.Settings;var READ_ONLY = _wireflow$settings$model.READ_ONLY;var READ_WRITE = _wireflow$settings$model.READ_WRITE;var 
   SettingsStore = _wireflow$settings.SettingsStore;var 

   Dispatcher = _wireflow2['default'].Dispatcher;var 
   Graph = _wireflow2['default'].components.Graph;


   function create(context, eventBus, reactRender) {

      var domAvailable = false;
      var resourceAvailable = false;
      var visible = false;
      var hideIrrelevantWidgets = true;

      _patterns['default'].resources.handlerFor(context).
      registerResourceFromFeature('pageInfo', { 
         onUpdateReplace: function onUpdateReplace() {
            resourceAvailable = true;
            update();} });



      eventBus.subscribe('didChangeAreaVisibility.' + context.widget.area, function (event) {
         if (!visible && event.visible) {
            visible = true;
            update();}});



      function updateHideIrrelevantWidgets(event) {
         hideIrrelevantWidgets = event.target.checked;
         update();}


      function renderEmpty() {
         reactRender(_React['default'].createElement('h3', null, 'Waiting for data'));}


      var dispatcher = undefined;
      function update() {
         if (!visible || !domAvailable || !resourceAvailable) {
            return;}


         var pageInfo = context.resources.pageInfo;
         var pageGraph = (0, _graphHelpers.graph)(pageInfo, hideIrrelevantWidgets);

         var pageTyeps = (0, _graphHelpers.types)();
         dispatcher = new Dispatcher(render);
         new HistoryStore(dispatcher);
         var graphStore = new GraphStore(dispatcher, pageGraph, pageTyeps);
         var layoutStore = new LayoutStore(dispatcher, graphStore);
         var settingsStore = new SettingsStore(dispatcher, Settings({ mode: READ_ONLY }));
         var selectionStore = new SelectionStore(dispatcher, layoutStore, graphStore);

         function render() {
            reactRender(
            _React['default'].createElement('div', { className: 'page-inspector-row' }, 
            _React['default'].createElement('div', { className: 'page-inspector-settings' }, 
            _React['default'].createElement('label', null, 
            _React['default'].createElement('input', { type: 'checkbox', 
               checked: hideIrrelevantWidgets, 
               onChange: updateHideIrrelevantWidgets }), 'Hide simple widgets')), 



            _React['default'].createElement(Graph, { className: 'nbe-theme-fusebox-app', 
               types: graphStore.types, 
               model: graphStore.graph, 
               layout: layoutStore.layout, 
               measurements: layoutStore.measurements, 
               settings: settingsStore.settings, 
               selection: selectionStore.selection, 
               eventHandler: dispatcher.dispatch })));}}





      return { onDomAvailable: function onDomAvailable() {
            domAvailable = true;
            update();} };}module.exports = 



   { 
      name: 'ax-page-inspector-widget', 
      injections: ['axContext', 'axEventBus', 'axReactRender'], 
      create: create };});
//# sourceMappingURL=ax-page-inspector-widget.js.map

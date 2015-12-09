define(['exports', 'module', 'react', 'laxar-patterns', 'wireflow', './graph-helpers'], function (exports, module, _react, _laxarPatterns, _wireflow, _graphHelpers) {'use strict';function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { 'default': obj };}var _React = _interopRequireDefault(_react);var _patterns = _interopRequireDefault(_laxarPatterns);var _wireflow2 = _interopRequireDefault(_wireflow);var 







   SelectionStore = _wireflow2['default'].selection.SelectionStore;var 
   HistoryStore = _wireflow2['default'].history.HistoryStore;var 
   LayoutStore = _wireflow2['default'].layout.LayoutStore;var 
   GraphStore = _wireflow2['default'].graph.GraphStore;var _wireflow$settings = _wireflow2['default'].
   settings;var _wireflow$settings$actions = _wireflow$settings.
   actions;var ChangeMode = _wireflow$settings$actions.ChangeMode;var MinimapResized = _wireflow$settings$actions.MinimapResized;var _wireflow$settings$model = _wireflow$settings.
   model;var Settings = _wireflow$settings$model.Settings;var READ_ONLY = _wireflow$settings$model.READ_ONLY;var READ_WRITE = _wireflow$settings$model.READ_WRITE;var 
   SettingsStore = _wireflow$settings.SettingsStore;var 

   Dispatcher = _wireflow2['default'].Dispatcher;var 
   Graph = _wireflow2['default'].components.Graph;



   function create(context, eventBus, reactRender) {

      var domAvailable = false;
      var resourceAvailable = false;
      var visible = false;
      var showIrrelevantWidgets = false;
      var publishedSelection = null;

      _patterns['default'].resources.handlerFor(context).
      registerResourceFromFeature('pageInfo', { 
         onUpdateReplace: function onUpdateReplace() {
            resourceAvailable = true;
            update();} });




      var publishFilter = _patterns['default'].resources.replacePublisherForFeature(context, 'filter', { 
         isOptional: true });


      eventBus.subscribe('didChangeAreaVisibility.' + context.widget.area, function (event) {
         if (!visible && event.visible) {
            visible = true;
            update();}});



      function replaceFilter(selection, graphModel) {
         var resource = context.features.filter.resource;
         if (!resource || selection === publishedSelection) {
            return;}

         publishedSelection = selection;
         publishFilter((0, _graphHelpers.filterFromSelection)(selection, graphModel));}


      function toggleIrrelevantWidgets() {
         showIrrelevantWidgets = !showIrrelevantWidgets;
         update();}


      var dispatcher = undefined;
      function update() {
         if (!visible || !domAvailable || !resourceAvailable) {
            return;}


         var pageInfo = context.resources.pageInfo;
         var pageGraph = (0, _graphHelpers.graph)(pageInfo, showIrrelevantWidgets);

         var pageTypes = (0, _graphHelpers.types)();
         dispatcher = new Dispatcher(render);
         new HistoryStore(dispatcher);
         var graphStore = new GraphStore(dispatcher, pageGraph, pageTypes);
         var layoutStore = new LayoutStore(dispatcher, graphStore);
         var settingsStore = new SettingsStore(dispatcher, Settings({ mode: READ_ONLY }));
         var selectionStore = new SelectionStore(dispatcher, layoutStore, graphStore);

         function render() {
            replaceFilter(selectionStore.selection, graphStore.graph);

            reactRender(
            _React['default'].createElement('div', { className: 'page-inspector-row form-inline' }, 
            _React['default'].createElement('div', { className: 'text-right' }, 
            _React['default'].createElement('button', { className: 'btn btn-link', 
               type: 'button', 
               onClick: toggleIrrelevantWidgets }, 
            _React['default'].createElement('i', { className: 'fa fa-toggle-' + (showIrrelevantWidgets ? 'on' : 'off') }), ' "Silent" Widgets')), 


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
      name: 'page-inspector-widget', 
      injections: ['axContext', 'axEventBus', 'axReactRender'], 
      create: create };});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2UtaW5zcGVjdG9yLXdpZGdldC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFRZSxpQkFBYyx5QkFBM0IsU0FBUyxDQUFJLGNBQWM7QUFDaEIsZUFBWSx5QkFBdkIsT0FBTyxDQUFJLFlBQVk7QUFDYixjQUFXLHlCQUFyQixNQUFNLENBQUksV0FBVztBQUNaLGFBQVUseUJBQW5CLEtBQUssQ0FBSSxVQUFVO0FBQ25CLFdBQVE7QUFDTixVQUFPLEtBQUksVUFBVSw4QkFBVixVQUFVLEtBQUUsY0FBYyw4QkFBZCxjQUFjO0FBQ3JDLFFBQUssS0FBSSxRQUFRLDRCQUFSLFFBQVEsS0FBRSxTQUFTLDRCQUFULFNBQVMsS0FBRSxVQUFVLDRCQUFWLFVBQVU7QUFDeEMsZ0JBQWEsc0JBQWIsYUFBYTs7QUFFZixhQUFVLHlCQUFWLFVBQVU7QUFDSSxRQUFLLHlCQUFuQixVQUFVLENBQUksS0FBSzs7OztBQUlyQixZQUFTLE1BQU0sQ0FBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRzs7QUFFL0MsVUFBSSxZQUFZLEdBQUcsS0FBSyxDQUFDO0FBQ3pCLFVBQUksaUJBQWlCLEdBQUcsS0FBSyxDQUFDO0FBQzlCLFVBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztBQUNwQixVQUFJLHFCQUFxQixHQUFHLEtBQUssQ0FBQztBQUNsQyxVQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQzs7QUFFOUIsMkJBQVMsU0FBUyxDQUFDLFVBQVUsQ0FBRSxPQUFPLENBQUU7QUFDcEMsaUNBQTJCLENBQUUsVUFBVSxFQUFFO0FBQ3ZDLHdCQUFlLEVBQUUsMkJBQU07QUFDcEIsNkJBQWlCLEdBQUcsSUFBSSxDQUFDO0FBQ3pCLGtCQUFNLEVBQUUsQ0FBQyxDQUNYLEVBQ0gsQ0FBRSxDQUFDOzs7OztBQUdQLFVBQU0sYUFBYSxHQUFHLHFCQUFTLFNBQVMsQ0FBQywwQkFBMEIsQ0FBRSxPQUFPLEVBQUUsUUFBUSxFQUFFO0FBQ3JGLG1CQUFVLEVBQUUsSUFB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QyxTQUFTLEFBQUM7QUFDcEMsMkJBQVksRUFBRSxVQUFVLENBQUMsUUFBUSxBQUFDLEdBQUcsQ0FDekMsQ0FDUixDQUFDLENBQ0osQ0FDSDs7Ozs7O0FBRUQsYUFBTyxFQUFFLGNBQWMsRUFBRSwwQkFBTTtBQUM1Qix3QkFBWSxHQUFHLElBQUksQ0FBQztBQUNwQixrQkFBTSxFQUFFLENBQUMsQ0FDWCxFQUFFLENBQUMsQ0FDTjs7OztBQUVjO0FBQ1osVUFBSSxFQUFFLHVCQUF1QjtBQUM3QixnQkFBVSxFQUFFLENBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUU7QUFDMUQsWUFBTSxFQUFOLE1BQU0sRUFDUiIsImZpbGUiOiJwYWdlLWluc3BlY3Rvci13aWRnZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHBhdHRlcm5zIGZyb20gJ2xheGFyLXBhdHRlcm5zJztcblxuaW1wb3J0IHdpcmVmbG93IGZyb20gJ3dpcmVmbG93JztcblxuaW1wb3J0IHsgdHlwZXMsIGdyYXBoLCBsYXlvdXQsIGZpbHRlckZyb21TZWxlY3Rpb24gfSBmcm9tICcuL2dyYXBoLWhlbHBlcnMnO1xuXG5jb25zdCB7XG4gIHNlbGVjdGlvbjogeyBTZWxlY3Rpb25TdG9yZSB9LFxuICBoaXN0b3J5OiB7IEhpc3RvcnlTdG9yZSB9LFxuICBsYXlvdXQ6IHsgTGF5b3V0U3RvcmUgfSxcbiAgZ3JhcGg6IHsgR3JhcGhTdG9yZSB9LFxuICBzZXR0aW5nczoge1xuICAgIGFjdGlvbnM6IHsgQ2hhbmdlTW9kZSwgTWluaW1hcFJlc2l6ZWQgfSxcbiAgICBtb2RlbDogeyBTZXR0aW5ncywgUkVBRF9PTkxZLCBSRUFEX1dSSVRFIH0sXG4gICAgU2V0dGluZ3NTdG9yZVxuICB9LFxuICBEaXNwYXRjaGVyLFxuICBjb21wb25lbnRzOiB7IEdyYXBoIH1cbn0gPSB3aXJlZmxvdztcblxuXG5mdW5jdGlvbiBjcmVhdGUoIGNvbnRleHQsIGV2ZW50QnVzLCByZWFjdFJlbmRlciApIHtcblxuICAgbGV0IGRvbUF2YWlsYWJsZSA9IGZhbHNlO1xuICAgbGV0IHJlc291cmNlQXZhaWxhYmxlID0gZmFsc2U7XG4gICBsZXQgdmlzaWJsZSA9IGZhbHNlO1xuICAgbGV0IHNob3dJcnJlbGV2YW50V2lkZ2V0cyA9IGZhbHNlO1xuICAgbGV0IHB1Ymxpc2hlZFNlbGVjdGlvbiA9IG51bGw7XG5cbiAgIHBhdHRlcm5zLnJlc291cmNlcy5oYW5kbGVyRm9yKCBjb250ZXh0IClcbiAgICAgIC5yZWdpc3RlclJlc291cmNlRnJvbUZlYXR1cmUoICdwYWdlSW5mbycsIHtcbiAgICAgICAgIG9uVXBkYXRlUmVwbGFjZTogKCkgPT4ge1xuICAgICAgICAgICAgcmVzb3VyY2VBdmFpbGFibGUgPSB0cnVlO1xuICAgICAgICAgICAgdXBkYXRlKCk7XG4gICAgICAgICB9XG4gICAgICB9ICk7XG5cblxuICAgY29uc3QgcHVibGlzaEZpbHRlciA9IHBhdHRlcm5zLnJlc291cmNlcy5yZXBsYWNlUHVibGlzaGVyRm9yRmVhdHVyZSggY29udGV4dCwgJ2ZpbHRlcicsIHtcbiAgICAgIGlzT3B0aW9uYWw6IHRydWVcbiAgIH0gKTtcblxuICAgZXZlbnRCdXMuc3Vic2NyaWJlKCBgZGlkQ2hhbmdlQXJlYVZpc2liaWxpdHkuJHtjb250ZXh0LndpZGdldC5hcmVhfWAsIGV2ZW50ID0+IHtcbiAgICAgIGlmKCAhdmlzaWJsZSAmJiBldmVudC52aXNpYmxlICkge1xuICAgICAgICAgdmlzaWJsZSA9IHRydWU7XG4gICAgICAgICB1cGRhdGUoKTtcbiAgICAgIH1cbiAgIH0gKTtcblxuICAgZnVuY3Rpb24gcmVwbGFjZUZpbHRlciggc2VsZWN0aW9uLCBncmFwaE1vZGVsICkge1xuICAgICAgY29uc3QgcmVzb3VyY2UgPSBjb250ZXh0LmZlYXR1cmVzLmZpbHRlci5yZXNvdXJjZTtcbiAgICAgIGlmKCAhcmVzb3VyY2UgfHwgc2VsZWN0aW9uID09PSBwdWJsaXNoZWRTZWxlY3Rpb24gKSB7XG4gICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwdWJsaXNoZWRTZWxlY3Rpb24gPSBzZWxlY3Rpb247XG4gICAgICBwdWJsaXNoRmlsdGVyKCBmaWx0ZXJGcm9tU2VsZWN0aW9uKCBzZWxlY3Rpb24sIGdyYXBoTW9kZWwgKSApO1xuICAgfVxuXG4gICBmdW5jdGlvbiB0b2dnbGVJcnJlbGV2YW50V2lkZ2V0cygpIHtcbiAgICAgIHNob3dJcnJlbGV2YW50V2lkZ2V0cyA9ICFzaG93SXJyZWxldmFudFdpZGdldHM7XG4gICAgICB1cGRhdGUoKTtcbiAgIH1cblxuICAgbGV0IGRpc3BhdGNoZXI7XG4gICBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICBpZiggIXZpc2libGUgfHwgIWRvbUF2YWlsYWJsZSB8fCAhcmVzb3VyY2VBdmFpbGFibGUgKSB7XG4gICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBhZ2VJbmZvID0gY29udGV4dC5yZXNvdXJjZXMucGFnZUluZm87XG4gICAgICBjb25zdCBwYWdlR3JhcGggPSBncmFwaCggcGFnZUluZm8sIHNob3dJcnJlbGV2YW50V2lkZ2V0cyApO1xuXG4gICAgICBjb25zdCBwYWdlVHlwZXMgPSB0eXBlcygpO1xuICAgICAgZGlzcGF0Y2hlciA9IG5ldyBEaXNwYXRjaGVyKCByZW5kZXIgKTtcbiAgICAgIG5ldyBIaXN0b3J5U3RvcmUoIGRpc3BhdGNoZXIgKTtcbiAgICAgIGNvbnN0IGdyYXBoU3RvcmUgPSBuZXcgR3JhcGhTdG9yZSggZGlzcGF0Y2hlciwgcGFnZUdyYXBoLCBwYWdlVHlwZXMgKTtcbiAgICAgIGNvbnN0IGxheW91dFN0b3JlID0gbmV3IExheW91dFN0b3JlKCBkaXNwYXRjaGVyLCBncmFwaFN0b3JlICk7XG4gICAgICBjb25zdCBzZXR0aW5nc1N0b3JlID0gbmV3IFNldHRpbmdzU3RvcmUoIGRpc3BhdGNoZXIsIFNldHRpbmdzKHsgbW9kZTogUkVBRF9PTkxZIH0pICk7XG4gICAgICBjb25zdCBzZWxlY3Rpb25TdG9yZSA9IG5ldyBTZWxlY3Rpb25TdG9yZSggZGlzcGF0Y2hlciwgbGF5b3V0U3RvcmUsIGdyYXBoU3RvcmUgKTtcblxuICAgICAgZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICAgcmVwbGFjZUZpbHRlciggc2VsZWN0aW9uU3RvcmUuc2VsZWN0aW9uLCBncmFwaFN0b3JlLmdyYXBoICk7XG5cbiAgICAgICAgIHJlYWN0UmVuZGVyKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BhZ2UtaW5zcGVjdG9yLXJvdyBmb3JtLWlubGluZSc+XG4gICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ndGV4dC1yaWdodCc+XG4gICAgICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGJ0bi1saW5rJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlPSdidXR0b24nXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZUlycmVsZXZhbnRXaWRnZXRzfVxuICAgICAgICAgICAgICAgICAgICAgPjxpIGNsYXNzTmFtZT17J2ZhIGZhLXRvZ2dsZS0nICsgKCBzaG93SXJyZWxldmFudFdpZGdldHMgPyAnb24nIDogJ29mZicgKSB9XG4gICAgICAgICAgICAgICAgICAgICA+PC9pPiAmcXVvdDtTaWxlbnQmcXVvdDsgV2lkZ2V0czwvYnV0dG9uPlxuICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICA8R3JhcGggY2xhc3NOYW1lPSduYmUtdGhlbWUtZnVzZWJveC1hcHAnXG4gICAgICAgICAgICAgICAgICAgICAgdHlwZXM9e2dyYXBoU3RvcmUudHlwZXN9XG4gICAgICAgICAgICAgICAgICAgICAgbW9kZWw9e2dyYXBoU3RvcmUuZ3JhcGh9XG4gICAgICAgICAgICAgICAgICAgICAgbGF5b3V0PXtsYXlvdXRTdG9yZS5sYXlvdXR9XG4gICAgICAgICAgICAgICAgICAgICAgbWVhc3VyZW1lbnRzPXtsYXlvdXRTdG9yZS5tZWFzdXJlbWVudHN9XG4gICAgICAgICAgICAgICAgICAgICAgc2V0dGluZ3M9e3NldHRpbmdzU3RvcmUuc2V0dGluZ3N9XG4gICAgICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uPXtzZWxlY3Rpb25TdG9yZS5zZWxlY3Rpb259XG4gICAgICAgICAgICAgICAgICAgICAgZXZlbnRIYW5kbGVyPXtkaXNwYXRjaGVyLmRpc3BhdGNofSAvPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICApO1xuICAgICAgfVxuICAgfVxuXG4gICByZXR1cm4geyBvbkRvbUF2YWlsYWJsZTogKCkgPT4ge1xuICAgICAgZG9tQXZhaWxhYmxlID0gdHJ1ZTtcbiAgICAgIHVwZGF0ZSgpO1xuICAgfSB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gICBuYW1lOiAncGFnZS1pbnNwZWN0b3Itd2lkZ2V0JyxcbiAgIGluamVjdGlvbnM6IFsgJ2F4Q29udGV4dCcsICdheEV2ZW50QnVzJywgJ2F4UmVhY3RSZW5kZXInIF0sXG4gICBjcmVhdGVcbn07XG4iXX0=

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

      var visible = false;
      var domAvailable = false;
      var viewModel = null;
      var viewModelCalculation = null;

      var showIrrelevantWidgets = false;
      var publishedSelection = null;

      _patterns['default'].resources.handlerFor(context).
      registerResourceFromFeature('pageInfo', { 
         onUpdateReplace: function onUpdateReplace() {return initializeViewModel(true);} });



      var publishFilter = _patterns['default'].resources.replacePublisherForFeature(context, 'filter', { 
         isOptional: true });


      eventBus.subscribe('didChangeAreaVisibility.' + context.widget.area, function (event, meta) {
         if (!visible && event.visible) {
            visible = true;
            render();}});



      //////////////////////////////////////////////////////////////////////////////////////////////////////////

      function replaceFilter(selection, graphModel) {
         var resource = context.features.filter.resource;
         if (!resource || selection === publishedSelection) {
            return;}

         publishedSelection = selection;
         publishFilter((0, _graphHelpers.filterFromSelection)(selection, graphModel));}


      //////////////////////////////////////////////////////////////////////////////////////////////////////////

      function toggleIrrelevantWidgets() {
         showIrrelevantWidgets = !showIrrelevantWidgets;
         initializeViewModel(true);}


      //////////////////////////////////////////////////////////////////////////////////////////////////////////

      function initializeViewModel(doReset) {
         if (doReset) {
            viewModel = null;
            clearTimeout(viewModelCalculation);
            viewModelCalculation = null;
            if (visible) {
               render();}}



         if (visible) {
            viewModelCalculation = viewModelCalculation || setTimeout(function () {
               var pageTypes = (0, _graphHelpers.types)();
               var pageInfo = context.resources.pageInfo;
               var pageGraph = (0, _graphHelpers.graph)(pageInfo, showIrrelevantWidgets);
               var dispatcher = new Dispatcher(render);
               new HistoryStore(dispatcher);
               var graphStore = new GraphStore(dispatcher, pageGraph, pageTypes);
               var layoutStore = new LayoutStore(dispatcher, graphStore);
               var settingsStore = new SettingsStore(dispatcher, Settings({ mode: READ_ONLY }));
               var selectionStore = new SelectionStore(dispatcher, layoutStore, graphStore);

               viewModel = { graphStore: graphStore, layoutStore: layoutStore, settingsStore: settingsStore, selectionStore: selectionStore, dispatcher: dispatcher };
               render();}, 
            20);}}



      //////////////////////////////////////////////////////////////////////////////////////////////////////////

      function render() {
         if (!visible || !domAvailable) {
            return;}


         if (!viewModel) {
            reactRender(
            _React['default'].createElement('div', { className: 'page-inspector-placeholder' }, 
            _React['default'].createElement('i', { className: 'fa fa-cog fa-spin' }), 'layout'));


            initializeViewModel();
            return;}var _viewModel = 








         viewModel;var graphStore = _viewModel.graphStore;var layoutStore = _viewModel.layoutStore;var settingsStore = _viewModel.settingsStore;var selectionStore = _viewModel.selectionStore;var dispatcher = _viewModel.dispatcher;

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
            eventHandler: dispatcher.dispatch })));}




      //////////////////////////////////////////////////////////////////////////////////////////////////////////

      return { onDomAvailable: function onDomAvailable() {
            domAvailable = true;
            render();} };}module.exports = 



   { 
      name: 'page-inspector-widget', 
      injections: ['axContext', 'axEventBus', 'axReactRender'], 
      create: create };});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhZ2UtaW5zcGVjdG9yLXdpZGdldC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFRZSxpQkFBYyx5QkFBM0IsU0FBUyxDQUFJLGNBQWM7QUFDaEIsZUFBWSx5QkFBdkIsT0FBTyxDQUFJLFlBQVk7QUFDYixjQUFXLHlCQUFyQixNQUFNLENBQUksV0FBVztBQUNaLGFBQVUseUJBQW5CLEtBQUssQ0FBSSxVQUFVO0FBQ25CLFdBQVE7QUFDTixVQUFPLEtBQUksVUFBVSw4QkFBVixVQUFVLEtBQUUsY0FBYyw4QkFBZCxjQUFjO0FBQ3JDLFFBQUssS0FBSSxRQUFRLDRCQUFSLFFBQVEsS0FBRSxTQUFTLDRCQUFULFNBQVMsS0FBRSxVQUFVLDRCQUFWLFVBQVU7QUFDeEMsZ0JBQWEsc0JBQWIsYUFBYTs7QUFFZixhQUFVLHlCQUFWLFVBQVU7QUFDSSxRQUFLLHlCQUFuQixVQUFVLENBQUksS0FBSzs7OztBQUlyQixZQUFTLE1BQU0sQ0FBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRzs7QUFFL0MsVUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLFVBQUksWUFBWSxHQUFHLEtBQUssQ0FBQztBQUN6QixVQUFJLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDckIsVUFBSSxvQkFBb0IsR0FBRyxJQUFJLENBQUM7O0FBRWhDLFVBQUkscUJBQXFCLEdBQUcsS0FBSyxDQUFDO0FBQ2xDLFVBQUksa0JBQWtCLEdBQUcsSUFBSSxDQUFDOztBQUU5QiwyQkFBUyxTQUFTLENBQUMsVUFBVSxDQUFFLE9BQU8sQ0FBRTtBQUNwQyxpQ0FBMkIsQ0FBRSxVQUFVLEVBQUU7QUFDdkMsd0JBQWUsRUFBRSxtQ0FBTSxtQkFBbUIsQ0FBRSxJQUFJLENBQUUsRUFBQSxFQUNwRCxDQUFFLENBQUM7Ozs7QUFHUCxVQUFNLGFBQWEsR0FBRyxxQkFBUyxTQUFTLENBQUMsMEJBQTBCLENBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRTtBQUNyRixtQkFBVSxFQUFF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Q1osVUFBSSxFQUFFLHVCQUF1QjtBQUM3QixnQkFBVSxFQUFFLENBQUUsV0FBVyxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUU7QUFDMUQsWUFBTSxFQUFOLE1BQU0sRUFDUiIsImZpbGUiOiJwYWdlLWluc3BlY3Rvci13aWRnZXQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHBhdHRlcm5zIGZyb20gJ2xheGFyLXBhdHRlcm5zJztcblxuaW1wb3J0IHdpcmVmbG93IGZyb20gJ3dpcmVmbG93JztcblxuaW1wb3J0IHsgdHlwZXMsIGdyYXBoLCBsYXlvdXQsIGZpbHRlckZyb21TZWxlY3Rpb24gfSBmcm9tICcuL2dyYXBoLWhlbHBlcnMnO1xuXG5jb25zdCB7XG4gIHNlbGVjdGlvbjogeyBTZWxlY3Rpb25TdG9yZSB9LFxuICBoaXN0b3J5OiB7IEhpc3RvcnlTdG9yZSB9LFxuICBsYXlvdXQ6IHsgTGF5b3V0U3RvcmUgfSxcbiAgZ3JhcGg6IHsgR3JhcGhTdG9yZSB9LFxuICBzZXR0aW5nczoge1xuICAgIGFjdGlvbnM6IHsgQ2hhbmdlTW9kZSwgTWluaW1hcFJlc2l6ZWQgfSxcbiAgICBtb2RlbDogeyBTZXR0aW5ncywgUkVBRF9PTkxZLCBSRUFEX1dSSVRFIH0sXG4gICAgU2V0dGluZ3NTdG9yZVxuICB9LFxuICBEaXNwYXRjaGVyLFxuICBjb21wb25lbnRzOiB7IEdyYXBoIH1cbn0gPSB3aXJlZmxvdztcblxuXG5mdW5jdGlvbiBjcmVhdGUoIGNvbnRleHQsIGV2ZW50QnVzLCByZWFjdFJlbmRlciApIHtcblxuICAgbGV0IHZpc2libGUgPSBmYWxzZTtcbiAgIGxldCBkb21BdmFpbGFibGUgPSBmYWxzZTtcbiAgIGxldCB2aWV3TW9kZWwgPSBudWxsO1xuICAgbGV0IHZpZXdNb2RlbENhbGN1bGF0aW9uID0gbnVsbDtcblxuICAgbGV0IHNob3dJcnJlbGV2YW50V2lkZ2V0cyA9IGZhbHNlO1xuICAgbGV0IHB1Ymxpc2hlZFNlbGVjdGlvbiA9IG51bGw7XG5cbiAgIHBhdHRlcm5zLnJlc291cmNlcy5oYW5kbGVyRm9yKCBjb250ZXh0IClcbiAgICAgIC5yZWdpc3RlclJlc291cmNlRnJvbUZlYXR1cmUoICdwYWdlSW5mbycsIHtcbiAgICAgICAgIG9uVXBkYXRlUmVwbGFjZTogKCkgPT4gaW5pdGlhbGl6ZVZpZXdNb2RlbCggdHJ1ZSApXG4gICAgICB9ICk7XG5cblxuICAgY29uc3QgcHVibGlzaEZpbHRlciA9IHBhdHRlcm5zLnJlc291cmNlcy5yZXBsYWNlUHVibGlzaGVyRm9yRmVhdHVyZSggY29udGV4dCwgJ2ZpbHRlcicsIHtcbiAgICAgIGlzT3B0aW9uYWw6IHRydWVcbiAgIH0gKTtcblxuICAgZXZlbnRCdXMuc3Vic2NyaWJlKCBgZGlkQ2hhbmdlQXJlYVZpc2liaWxpdHkuJHtjb250ZXh0LndpZGdldC5hcmVhfWAsIChldmVudCwgbWV0YSkgPT4ge1xuICAgICAgaWYoICF2aXNpYmxlICYmIGV2ZW50LnZpc2libGUgKSB7XG4gICAgICAgICB2aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgIHJlbmRlcigpO1xuICAgICAgfVxuICAgfSApO1xuXG4gICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgIGZ1bmN0aW9uIHJlcGxhY2VGaWx0ZXIoIHNlbGVjdGlvbiwgZ3JhcGhNb2RlbCApIHtcbiAgICAgIGNvbnN0IHJlc291cmNlID0gY29udGV4dC5mZWF0dXJlcy5maWx0ZXIucmVzb3VyY2U7XG4gICAgICBpZiggIXJlc291cmNlIHx8IHNlbGVjdGlvbiA9PT0gcHVibGlzaGVkU2VsZWN0aW9uICkge1xuICAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcHVibGlzaGVkU2VsZWN0aW9uID0gc2VsZWN0aW9uO1xuICAgICAgcHVibGlzaEZpbHRlciggZmlsdGVyRnJvbVNlbGVjdGlvbiggc2VsZWN0aW9uLCBncmFwaE1vZGVsICkgKTtcbiAgIH1cblxuICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4gICBmdW5jdGlvbiB0b2dnbGVJcnJlbGV2YW50V2lkZ2V0cygpIHtcbiAgICAgIHNob3dJcnJlbGV2YW50V2lkZ2V0cyA9ICFzaG93SXJyZWxldmFudFdpZGdldHM7XG4gICAgICBpbml0aWFsaXplVmlld01vZGVsKCB0cnVlICk7XG4gICB9XG5cbiAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgZnVuY3Rpb24gaW5pdGlhbGl6ZVZpZXdNb2RlbCggZG9SZXNldCApIHtcbiAgICAgIGlmKCBkb1Jlc2V0ICkge1xuICAgICAgICAgdmlld01vZGVsID0gbnVsbDtcbiAgICAgICAgIGNsZWFyVGltZW91dCggdmlld01vZGVsQ2FsY3VsYXRpb24gKTtcbiAgICAgICAgIHZpZXdNb2RlbENhbGN1bGF0aW9uID0gbnVsbDtcbiAgICAgICAgIGlmKCB2aXNpYmxlICkge1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmKCB2aXNpYmxlICkge1xuICAgICAgICAgdmlld01vZGVsQ2FsY3VsYXRpb24gPSB2aWV3TW9kZWxDYWxjdWxhdGlvbiB8fCBzZXRUaW1lb3V0KCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwYWdlVHlwZXMgPSB0eXBlcygpO1xuICAgICAgICAgICAgY29uc3QgcGFnZUluZm8gPSBjb250ZXh0LnJlc291cmNlcy5wYWdlSW5mbztcbiAgICAgICAgICAgIGNvbnN0IHBhZ2VHcmFwaCA9IGdyYXBoKCBwYWdlSW5mbywgc2hvd0lycmVsZXZhbnRXaWRnZXRzICk7XG4gICAgICAgICAgICBjb25zdCBkaXNwYXRjaGVyID0gbmV3IERpc3BhdGNoZXIoIHJlbmRlciApO1xuICAgICAgICAgICAgbmV3IEhpc3RvcnlTdG9yZSggZGlzcGF0Y2hlciApO1xuICAgICAgICAgICAgY29uc3QgZ3JhcGhTdG9yZSA9IG5ldyBHcmFwaFN0b3JlKCBkaXNwYXRjaGVyLCBwYWdlR3JhcGgsIHBhZ2VUeXBlcyApO1xuICAgICAgICAgICAgY29uc3QgbGF5b3V0U3RvcmUgPSBuZXcgTGF5b3V0U3RvcmUoIGRpc3BhdGNoZXIsIGdyYXBoU3RvcmUgKTtcbiAgICAgICAgICAgIGNvbnN0IHNldHRpbmdzU3RvcmUgPSBuZXcgU2V0dGluZ3NTdG9yZSggZGlzcGF0Y2hlciwgU2V0dGluZ3MoeyBtb2RlOiBSRUFEX09OTFkgfSkgKTtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGlvblN0b3JlID0gbmV3IFNlbGVjdGlvblN0b3JlKCBkaXNwYXRjaGVyLCBsYXlvdXRTdG9yZSwgZ3JhcGhTdG9yZSApO1xuXG4gICAgICAgICAgICB2aWV3TW9kZWwgPSB7IGdyYXBoU3RvcmUsIGxheW91dFN0b3JlLCBzZXR0aW5nc1N0b3JlLCBzZWxlY3Rpb25TdG9yZSwgZGlzcGF0Y2hlciB9O1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgICB9LCAyMCApO1xuICAgICAgfVxuICAgfVxuXG4gICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgIGZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgICAgIGlmKCAhdmlzaWJsZSB8fCAhZG9tQXZhaWxhYmxlICkge1xuICAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiggIXZpZXdNb2RlbCApIHtcbiAgICAgICAgIHJlYWN0UmVuZGVyKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BhZ2UtaW5zcGVjdG9yLXBsYWNlaG9sZGVyJz5cbiAgICAgICAgICAgICAgIDxpIGNsYXNzTmFtZT0nZmEgZmEtY29nIGZhLXNwaW4nPjwvaT5sYXlvdXRcbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgKTtcbiAgICAgICAgIGluaXRpYWxpemVWaWV3TW9kZWwoKTtcbiAgICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3Qge1xuICAgICAgICAgZ3JhcGhTdG9yZSxcbiAgICAgICAgIGxheW91dFN0b3JlLFxuICAgICAgICAgc2V0dGluZ3NTdG9yZSxcbiAgICAgICAgIHNlbGVjdGlvblN0b3JlLFxuICAgICAgICAgZGlzcGF0Y2hlclxuICAgICAgfSA9IHZpZXdNb2RlbDtcblxuICAgICAgcmVwbGFjZUZpbHRlciggc2VsZWN0aW9uU3RvcmUuc2VsZWN0aW9uLCBncmFwaFN0b3JlLmdyYXBoICk7XG5cbiAgICAgIHJlYWN0UmVuZGVyKFxuICAgICAgICAgPGRpdiBjbGFzc05hbWU9J3BhZ2UtaW5zcGVjdG9yLXJvdyBmb3JtLWlubGluZSc+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT0ndGV4dC1yaWdodCc+XG4gICAgICAgICAgICAgICA8YnV0dG9uIGNsYXNzTmFtZT0nYnRuIGJ0bi1saW5rJ1xuICAgICAgICAgICAgICAgICAgICAgICB0eXBlPSdidXR0b24nXG4gICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RvZ2dsZUlycmVsZXZhbnRXaWRnZXRzfVxuICAgICAgICAgICAgICAgICAgPjxpIGNsYXNzTmFtZT17J2ZhIGZhLXRvZ2dsZS0nICsgKCBzaG93SXJyZWxldmFudFdpZGdldHMgPyAnb24nIDogJ29mZicgKSB9XG4gICAgICAgICAgICAgICAgICA+PC9pPiAmcXVvdDtTaWxlbnQmcXVvdDsgV2lkZ2V0czwvYnV0dG9uPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8R3JhcGggY2xhc3NOYW1lPSduYmUtdGhlbWUtZnVzZWJveC1hcHAnXG4gICAgICAgICAgICAgICAgICAgdHlwZXM9e2dyYXBoU3RvcmUudHlwZXN9XG4gICAgICAgICAgICAgICAgICAgbW9kZWw9e2dyYXBoU3RvcmUuZ3JhcGh9XG4gICAgICAgICAgICAgICAgICAgbGF5b3V0PXtsYXlvdXRTdG9yZS5sYXlvdXR9XG4gICAgICAgICAgICAgICAgICAgbWVhc3VyZW1lbnRzPXtsYXlvdXRTdG9yZS5tZWFzdXJlbWVudHN9XG4gICAgICAgICAgICAgICAgICAgc2V0dGluZ3M9e3NldHRpbmdzU3RvcmUuc2V0dGluZ3N9XG4gICAgICAgICAgICAgICAgICAgc2VsZWN0aW9uPXtzZWxlY3Rpb25TdG9yZS5zZWxlY3Rpb259XG4gICAgICAgICAgICAgICAgICAgZXZlbnRIYW5kbGVyPXtkaXNwYXRjaGVyLmRpc3BhdGNofSAvPlxuICAgICAgICAgPC9kaXY+XG4gICAgICApO1xuICAgfVxuXG4gICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgIHJldHVybiB7IG9uRG9tQXZhaWxhYmxlOiAoKSA9PiB7XG4gICAgICBkb21BdmFpbGFibGUgPSB0cnVlO1xuICAgICAgcmVuZGVyKCk7XG4gICB9IH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgIG5hbWU6ICdwYWdlLWluc3BlY3Rvci13aWRnZXQnLFxuICAgaW5qZWN0aW9uczogWyAnYXhDb250ZXh0JywgJ2F4RXZlbnRCdXMnLCAnYXhSZWFjdFJlbmRlcicgXSxcbiAgIGNyZWF0ZVxufTtcbiJdfQ==

define(['exports', 'module', 'react', 'laxar-patterns'], function (exports, module, _react, _laxarPatterns) {
   'use strict';

   function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

   var _React = _interopRequireDefault(_react);

   var _patterns = _interopRequireDefault(_laxarPatterns);

   module.exports = {
      name: 'ax-page-inspector-widget',
      injections: ['axContext', 'axEventBus', 'axReactRender'],

      create: function create(context, eventBus, reactRender) {

         _patterns['default'].resources.handlerFor(context).registerResourceFromFeature('pageInfo', {
            onUpdateReplace: render
         });

         function render() {
            var _context$resources$pageInfo = context.resources.pageInfo;
            var name = _context$resources$pageInfo.name;
            var page = _context$resources$pageInfo.page;

            reactRender(_React['default'].createElement(
               'div',
               { className: '' },
               _React['default'].createElement(
                  'h2',
                  null,
                  _React['default'].createElement('i', { className: 'fa fa-newspaper-o' }),
                  '  ',
                  name
               ),
               _React['default'].createElement(
                  'div',
                  null,
                  JSON.stringify(page)
               )
            ));
         }

         return { onDomAvailable: render };
      }

   };
});
//# sourceMappingURL=ax-page-inspector-widget.js.map

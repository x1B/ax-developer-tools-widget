define( [
   'laxar-affix-control/ax-affix-control',
   'laxar-input-control/ax-input-control',
   'laxar-application/includes/widgets/developer-tools/ax-developer-toolbar-widget/ax-developer-toolbar-widget',
   'laxar-application/includes/widgets/developer-tools/ax-events-display-widget/ax-events-display-widget',
   'laxar-application/includes/widgets/developer-tools/ax-host-connector-widget/ax-host-connector-widget',
   'laxar-application/includes/widgets/developer-tools/ax-log-display-widget/ax-log-display-widget',
   'laxar-application/includes/widgets/developer-tools/ax-page-inspector-widget/ax-page-inspector-widget'
], function() {
   'use strict';

   var modules = [].slice.call( arguments );
   return {
      'angular': modules.slice( 0, 6 ),
      'react': modules.slice( 6, 7 )
   };
} );

'use strict'

angular.module('remoteGuiApp')
.component('pageHeader', {
    bindings: {
      title: '@',
      path: '<',
      onClick: '&',
      istree: '<'
    },
    /*controller: function () {
    },*/
    templateUrl: '/src/modules/page_header/page_header.html'
});

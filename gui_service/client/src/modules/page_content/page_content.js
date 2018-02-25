'use strict'

angular.module('remoteGuiApp')
.component('pageContent', {
    transclude: true,
    bindings: {
      title: '@',
      afterInit: '&'
    },
    controller: function () {
        const $ctrl = this;
        $ctrl.$postLink = ()=>{
            this.afterInit();
        }
    },
    templateUrl: '/src/modules/page_content/page_content.html'
});

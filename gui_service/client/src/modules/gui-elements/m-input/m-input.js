'use strict'

angular.module('remoteGuiApp')
.component('mInput', {
    bindings: {
      title: '@',
      item: '=',
      change:'&'
    },
    /*controller: function () {
        const $ctrl = this;
    },*/
    templateUrl: '/src/modules/gui-elements/m-input/m-input.html'
});

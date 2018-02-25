'use strict'

angular.module('remoteGuiApp')
.component('mSelect', {
    bindings: {
      title: '@',
      item: '=',
      change:'&',
      changel:'&',
      locked: '@'
    },
    /*controller: function () {
        const $ctrl = this;
    },*/
    templateUrl: '/src/modules/gui-elements/m-select/m-select.html'
});

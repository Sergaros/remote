'use strict'

angular.module('remoteGuiApp')
.component('mCheckbox', {
    bindings: {
      title: '@',
      label: '@',
      item: '=',
      change:'&'
    },
    controller: function () {
        const $ctrl = this;
        $ctrl.label = '';
    },
    templateUrl: '/src/modules/gui-elements/m-checkbox/m-checkbox.html'
});

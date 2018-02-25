'use strict'

angular.module('remoteGuiApp')
.component('column', {
    bindings: {
      content: '<',
      onOpen: '&'
    },
    controller: function () {
        const $ctrl = this;

        $ctrl.getClass = (item)=>{
           if(item.active)
              return item.class+' active';
           else
              return item.class;
       };
    },
    templateUrl: '/src/modules/tree/column/column.html'
});

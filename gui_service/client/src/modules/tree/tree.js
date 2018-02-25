'use strict'

angular.module('remoteGuiApp')
.component('tree', {
    bindings: {
      onOpen: '&'
    },
    controller: function (TreeService) {
        const $ctrl = this;
        TreeService.refresh()
        .then(()=>{
            $ctrl.tree = TreeService.tree();
        });

        $ctrl.openItem = (item, number)=>{
            TreeService.open(item, number);
            let elem = angular.element.find(".manager-tree");
            elem[0].scrollLeft = elem[0].scrollWidth;

            let options = TreeService.options();
            $ctrl.onOpen({item: item, path: $ctrl.tree.path, content: options.content, groups: options.groups});
        };
    },
    templateUrl: '/src/modules/tree/tree.html'
});

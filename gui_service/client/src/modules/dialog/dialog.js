angular.module('remoteGuiApp').component('modalComponent', {
  templateUrl: '/src/modules/dialog/dialog.html',
  bindings: {
    resolve: '<',
    close: '&',
    dismiss: '&'
  },
  controller: function () {
    var $ctrl = this;
    
    $ctrl.$onInit = function () {

        $ctrl.options = {};
        const setOption = (obj1, obj2, optionName, defValue)=>{
            if(optionName in obj1)
                obj2[optionName] = obj1[optionName];
            else
                obj2[optionName] = defValue;
        };

        setOption($ctrl.resolve.options, $ctrl.options, 'title', 'Information');
        setOption($ctrl.resolve.options, $ctrl.options, 'info', '');
        setOption($ctrl.resolve.options, $ctrl.options, 'cancel', true);
        setOption($ctrl.resolve.options, $ctrl.options, 'contentUrl', '');
        setOption($ctrl.resolve.options, $ctrl, 'result', {});
        setOption($ctrl.resolve.options, $ctrl.options, 'title', 'Information');

        //console.log('$ctrl.options.result - ',$ctrl.options.result);
        /*console.log('$ctrl.options.contentUrl - ',$ctrl.options.contentUrl);
        console.log('$ctrl.options.info - ',$ctrl.options.info);
        console.log('$ctrl.options.title - ',$ctrl.options.title);
        console.log('$ctrl.options.result - ',$ctrl.options.result);*/
    };

    $ctrl.ok = function () {
       $ctrl.close({$value: $ctrl.result});
    };

    $ctrl.cancel = function () {
      $ctrl.dismiss({$value: 'cancel'});
    };
  }
})
.factory('dialog', function ($uibModal) {

    return {
        //return promise resolve(result), reject();
        open: (options)=>{
            let modalInstance = $uibModal.open({
                animation: true,
                component: 'modalComponent',
                resolve: {
                    options: ()=>options
                }
            });
            return modalInstance.result;
        }
    }
});

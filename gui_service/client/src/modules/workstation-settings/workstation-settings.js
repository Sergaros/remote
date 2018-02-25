'use strict'

angular.module('remoteGuiApp')
.component('workstationSettings', {
    controller: function ($http, dialog, TreeService, MLog) {
        const $ctrl = this;
        $ctrl.data = {};
        $ctrl.isVisible = false;

        const loadWorkstation = (id)=>{
            console.log('Load wst - ', id);
            $ctrl.isVisible = true;
            return $http.get('api/workstations/settings/'+id)
            .then(result=>{
                //console.log('wst settings - ', result.data);
                $ctrl.data = result.data;
                $ctrl.wstId = id;
            })
            .catch(MLog.error);
        };

        $ctrl.$onInit = function(){
            TreeService.loadStateByName('sttTreeState');

            let current = TreeService.tree().current;
            $ctrl.path = TreeService.tree().path;

            if(current && current.treeType !== 'group')
                return loadWorkstation(current._id);
            else
                $ctrl.isVisible = false;
        };

        $ctrl.openTreeDialog = ()=>{
            let currentItem;
            let currentPath;
            return dialog.open({title: "Add Group",
                        contentUrl: "/src/modules/workstation-settings/tree.dialog.html",
                        result: {
                            onOpen: function (item, path, content, groups){
                                currentItem = item;
                                currentPath = path;
                            }
                        }
            })
            .then((result)=>{
                if(currentItem && currentItem.treeType !== 'group'){
                    $ctrl.path = currentPath;
                    TreeService.saveStateByName('sttTreeState');
                    return loadWorkstation(currentItem._id);
                } else
                    $ctrl.isVisible = false;


            }, ()=> {return null})
            .catch(MLog.error);
        };

    },
    templateUrl: '/src/modules/workstation-settings/workstation-settings.html'
});

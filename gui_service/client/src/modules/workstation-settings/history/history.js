'use strict'

angular.module('remoteGuiApp')
.component('history', {
    bindings: {
      wid: '<'
    },
    controller: function ($element, $state) {
        const $ctrl = this;
        $ctrl.isActive = $state.is('manage.history');

        $ctrl.afterInit = function () {
            if($ctrl.wid){
                let table = $element.find("table");
                $ctrl.table = table.DataTable({
                    ajax: {
                        url: `/api/history/${$ctrl.wid}`,
                        dataSrc: ""
                    },
                    columns: [
                        {title: "TaskType", data: "taskType"},
                        {title: "Device", data: "device"},
                        {title: "Performed (Date/Time)", data: "performed"},
                        {title: "Result", data: "result"}
                    ],
                    order: [[0, 'asc']],
                    createdRow: function (row, data, index) {}
                });

                $element.find("table tbody").on( 'click', 'tr', function () {
                   if ( $(this).hasClass('selected') ) {
                       $(this).removeClass('selected');
                   }
                   else {
                       $ctrl.table.$('tr.selected').removeClass('selected');
                       $(this).addClass('selected');
                   }
               });
            }
        };

        $ctrl.$onChanges = function (changesObj) {
            if (changesObj.wid && changesObj.wid.currentValue){
                $ctrl.afterInit();
            }
        };
    },
    templateUrl: '/src/modules/workstation-settings/history/history.html'
});

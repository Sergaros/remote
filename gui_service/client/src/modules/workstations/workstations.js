'use strict'

angular.module('remoteGuiApp')
.component('workstations', {
    bindings: {
      onOpen: '&'
    },
    controller: function ($element, $resource, dialog, TreeService, $state, MLog) {
        const Workstation = $resource("api/workstations/" + ":_id", { _id: "@_id" }, {update: {method: 'PATCH'}, query:{ method: "GET", isArray: true }});
        const $ctrl = this;

        $ctrl.workstationsRefresh = ()=>{
            $ctrl.table.ajax.reload();
        };

        $ctrl.afterInit = function () {
            let table = $element.find("table");
            $ctrl.table = table.DataTable({
                ajax: {
                    url: "/api/workstations",
                    dataSrc: ""
                },
                columns: [
                    {title: "Name", data: "name"},
                    {title: "Application", data: "application"},
                    {title: "Group", data: "group.name"},
                    {
                        title: "Actions",
                        sortable: false,
                        render: function (data, type, full, meta) {
                            return "<a class='action-edit'><span class='fa fa-bars' aria-hidden='true'></span></a>&nbsp;<a class='action-del'><span class='fa fa-trash' aria-hidden='true'></span></a>";
                        }
                    }
                ],
                order: [[0, 'asc']],
                createdRow: function (row, data, index) {
                    $('a.action-edit', row).click(function () {
                        $ctrl.openWorkstation(data._id);
                    });
                    $('a.action-del', row).click(function () {
                        $ctrl.removeWorkstation(data._id);
                    });
                }
            });
        };

        $ctrl.removeWorkstation = (id)=>{
            return dialog.open({
                                   title: "Remove Workstation",
                                   info: "Are you sure want to remove this workstation?"
                               })
             .then(()=>{
                 let workstation = new Workstation({ _id: id});
                 return workstation.$delete().then($ctrl.workstationsRefresh)
                 .then(()=>{
                     TreeService.removeFromState('sttTreeState', id);
                 })
                 .catch(MLog.error);
             },()=>null)
             .catch(MLog.error);
        };

        $ctrl.openWorkstation = (id)=>{
            /*let workstation = new Workstation({ _id: id});
            workstation.$get()
            .then(result=>{
                $ctrl.onOpen({wst: result});
            })
            .catch(logError);*/
            console.log('Open Workstation');
            return TreeService.openWorkstation('sttTreeState', id)
            .then(()=>{
                 $state.go('manage.calibration');
            })
            .catch(MLog.error);
        };
    },
    templateUrl: '/src/modules/workstations/workstations.html'
});

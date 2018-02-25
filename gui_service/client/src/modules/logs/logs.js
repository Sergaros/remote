'use strict'

angular.module('remoteGuiApp')
.component('logs', {
    /*bindings: {
    },*/
    controller: function (/*$resource,*/ $element) {
        //const Logs = $resource("api/logs/" + ":_id", { _id: "@_id" }, {update: {method: 'PATCH'}, query:{ method: "GET", isArray: true }});

        const $ctrl = this;

        $ctrl.afterInit = function () {
            console.log('After Init!');
            let table = $element.find("table");

            table.DataTable({
                ajax: {
                    url: "/api/logs",
                    dataSrc: ""
                },
                columns: [
                    {title: "Level", data: "level"},
                    {title: "Message", data: "message"},
                    {title: "Date", data: function ( row, type, val, meta ){
                        let date = new Date(row.date);
                        return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
                    }}
                    /*{
                        title: "Actions",
                        sortable: false,
                        render: function (data, type, full, meta) {
                            return "<a class='action-edit' href='#'><span class='fa fa-bars' aria-hidden='true'></span></a>&nbsp;<a class='action-del' href='#'><span class='fa fa-trash' aria-hidden='true'></span></a>";
                        }
                    }*/
                ],
                order: [[0, 'asc']]/*,
                createdRow: function (row, data, index) {
                    $('a.action-edit', row).click(function () {
                        $ctrl.openWorkstation(data._id);
                    });
                    $('a.action-del', row).click(function () {
                        $ctrl.removeWorkstation(data._id);
                    });
                }*/
            });
        };
    },
    templateUrl: '/src/modules/logs/logs.html'
});

'use strict'

angular.module('remoteGuiApp')
.component('taskTable', {
    bindings: {
      tableData: '<',
      onEdit: '&',
      onAdd: '&',
      onDelete: '&',
      config: '<'
    },
    controller: function ($log, $filter, dialog) {
        const $ctrl = this;
        const filter = $filter('filter');
        const orderBy = $filter('orderBy');

        $ctrl.taskFilter = '';
        $ctrl.taskOrderBy = 'name';
        $ctrl.taskReverse = false;
        $ctrl.items_per_page = 20;
        $ctrl.maxSize = 100;

        $ctrl.currentPage = 1;
        $ctrl.pageChanged = ()=>{
            //console.log('page changed');
            let start = ($ctrl.currentPage-1)*$ctrl.items_per_page;
            let end = start + $ctrl.items_per_page;

            let fdata = filter($ctrl.tableData, $ctrl.tasksFilter);
            $ctrl.totalItems = fdata.length;
            fdata = orderBy(fdata, $ctrl.taskOrderBy, $ctrl.taskReverse);
            $ctrl.pageData = fdata.slice(start, end);
        };

        $ctrl.sortBy = (field)=>{
            $ctrl.taskOrderBy = field;
            $ctrl.taskReverse = !$ctrl.taskReverse;
            $ctrl.pageChanged();
        };

        $ctrl.filterChanged = ()=>{
            $ctrl.taskSelected = null;
            $ctrl.currentPage = 1;
            $ctrl.pageChanged();
        };

        $ctrl.orderArrowUpDown = (field, arrowUp=true)=>{
            if(arrowUp)
                return $ctrl.taskReverse && $ctrl.taskOrderBy===field;
            else
                return !$ctrl.taskReverse && $ctrl.taskOrderBy===field;
        }

        //task select----------------------------------------------
        $ctrl.taskSelected = null;
        $ctrl.taskSelectedIndex = -1;
        $ctrl.setSelected = (index)=> {
            $ctrl.taskSelected =  $ctrl.pageData[index];
            $ctrl.taskSelectedIndex = index;
        };

        $ctrl.isSelected = (index)=>{
            return $ctrl.taskSelectedIndex == index;
        };

        $ctrl.taskEdit = ()=>{
            //console.log('task edit - ', $ctrl.taskSelected);
            $ctrl.onEdit({id: $ctrl.taskSelected.id});
        };

        $ctrl.taskDelete = ()=>{
            //console.log('task edit - ', $ctrl.taskSelected);
            $ctrl.onDelete({id: $ctrl.taskSelected.id});
        };
        //------------------------------------------------------------

        $ctrl.$onChanges = function (changesObj) {
            if(changesObj.tableData){
                //console.log('$ctrl.tableData - ', $ctrl.tableData);
                $ctrl.totalItems = $ctrl.tableData.length;
                $ctrl.currentPage = 1;
                $ctrl.taskSelected = null;
                $ctrl.pageChanged();
            }
        };
    },
    templateUrl: '/src/modules/scheduler/task-table/task-table.html'
});

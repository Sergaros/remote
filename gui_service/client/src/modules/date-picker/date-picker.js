'use strict'

angular.module('remoteGuiApp')
.component('datePicker', {
    bindings: {
      date: '=',
      fromDate: '<',
      toDate: '<',
      onChanged: '&'
    },
    controller: function () {
        const $ctrl = this;

        /*$ctrl.$onInit = function() {

        };*/

        $ctrl.disabled = (date, mode)=>{
            //return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        };

        $ctrl.displayDateChanged = ()=>{
            //$ctrl.form.InstalationDate.value = $ctrl.date.getFullYear()+'.'+($ctrl.date.getMonth()+1)+'.'+$ctrl.date.getDate();
            $ctrl.onChanged({date: $ctrl.date});
        }

        $ctrl.today = function() {
            $ctrl.date = new Date();
        };

        $ctrl.clear = function() {
            $ctrl.date = null;
        };

        $ctrl.dateOptions = {
            //dateDisabled: disabled,
            //formatYear: 'yy',
            maxDate: new Date(2050, 5, 22),
            minDate: new Date()
            //startingDay: 1
        };

        $ctrl.$onChanges = function (changesObj) {
            if (changesObj.toDate && changesObj.toDate.currentValue){
                $ctrl.dateOptions.maxDate = $ctrl.toDate;
            }

            if (changesObj.fromDate && changesObj.fromDate.currentValue){
                $ctrl.dateOptions.minDate = $ctrl.fromDate;
            }
        }

        console.log('$ctrl.toDate - ', $ctrl.toDate);
        console.log('$ctrl.fromDate - ', $ctrl.fromDate);


        // Disable weekend selection
        function disabled(data) {
            var date = data.date,
            mode = data.mode;
            return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
        }


        $ctrl.dateOpen = function() {
            $ctrl.popup.opened = true;
        };

        $ctrl.setDate = function(year, month, day) {
            $ctrl.date = new Date(year, month, day);
        };

        $ctrl.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $ctrl.format = $ctrl.formats[0];
        $ctrl.altInputFormats = ['M!/d!/yyyy'];

        $ctrl.popup = {
            opened: false
        };

        function getDayClass(data) {
            console.log('get day');
            let date = data.date,
            mode = data.mode;
            if (mode === 'day') {
                let dayToCheck = new Date(date).setHours(0,0,0,0);

                for (var i = 0; i < $ctrl.events.length; i++) {
                    let currentDay = new Date($ctrl.events[i].date).setHours(0,0,0,0);

                    if (dayToCheck === currentDay) {
                        return $ctrl.events[i].status;
                    }
                }
            }

            return '';
        };
    },
    templateUrl: '/src/modules/date-picker/date-picker.html'
});

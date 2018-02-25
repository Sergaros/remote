'use strict'

angular.module('remoteGuiApp')
.component('qaSettings', {
    bindings: {
      settings: '<',
      map: '<?settingsMap'
    },
    controller: function ($http, $log, SettingsCore, dialog, $state) {
        const $ctrl = this;
        $ctrl.form = {};
        $ctrl.isActive = $state.is('manage.qa');
        //"UsedRegulationForLastScheduling" "UsedClassificationForLastScheduling"
        $ctrl.settingsNames = ['UsedClassification', 'UsedRegulation',
                                'Facility', 'bodyRegion', 'Department',
                                 'Room', 'ResponsiblePersonName', 'ResponsiblePersonCity',
                               'ResponsiblePersonAddress', 'ResponsiblePersonEmail', 'ResponsiblePersonPhoneNumber'];

        $ctrl.fillGui = ()=>{
            SettingsCore.fillGui($ctrl.settingsNames, $ctrl.settings.preferences, $ctrl.map.settings, $ctrl.form);
            $ctrl.form.UsedClassification.options = SettingsCore.getOptions($ctrl.form.UsedRegulation.value, $ctrl.map.settings);
        };


        $ctrl.RegulationChanged = ()=>{
            $ctrl.form.UsedClassification.options = SettingsCore.getOptions($ctrl.form.UsedRegulation.value, $ctrl.map.settings);
            $ctrl.form.UsedClassification.value = $ctrl.form.UsedClassification.options[0].key;
        };


        this.$onChanges = function (changesObj) {
            //$log.debug('settings onChanges - ', changesObj);
            if (changesObj.settings.currentValue && changesObj.map.currentValue) {
                $ctrl.fillGui();
            }
        };

        $ctrl.save = ()=>{
            $ctrl.mform.$setPristine();
            let result = [];
            SettingsCore.save($ctrl.settingsNames, $ctrl.settings.preferences, $ctrl.form, result);

            //console.log('Save preferences - ', result);
            $http.post('api/preferences/'+$ctrl.settings.workstationId, result)
            .then(res=>{
                //console.log('Prefernces save ', res);
            })
            .catch(err=>{
                console.log(err);
            });
        };

        $ctrl.cancel = ()=>{
            $ctrl.mform.$setPristine();
            $ctrl.fillGui();
        };
    },
    templateUrl: '/src/modules/workstation-settings/qa-settings/qa-settings.html'
});

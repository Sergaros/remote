'use strict'

angular.module('remoteGuiApp')
.component('displaySettings', {
    bindings: {
      wid: '<',
      displays: '<',
      settings: '<',
      map: '<?settingsMap'
    },
    controller: function ($http, $log, SettingsCore, dialog, $state) {
        const $ctrl = this;
        $ctrl.form = {};
        $ctrl.isActive = $state.is('manage.dispsettings');
        $ctrl.settingsNames = ['BacklightStabilization', 'CommunicationType',
                               //'DispBlackLevel', 'DispSetBlackLevel', 'DispSetWhiteLevel', 'DispWhiteLevel',
                               'DisplayTechnology', 'InstalationDate', 'InternalSensor',
                               'Manufacturer', 'Model', 'SerialNumber',
                               'ResolutionHorizontal', 'ResolutionVertical', 'ScreenSize', 'TypeOfDisplay'
                           ];

        $ctrl.fillGui = (preferences)=>{
            SettingsCore.fillGui($ctrl.settingsNames, preferences, $ctrl.map.settings, $ctrl.form);
        };

        $ctrl.DisplayChanged = ()=>{
            let disp = $ctrl.settings.find(pref=>pref.displayId==$ctrl.currentDisplayId);
            $ctrl.fillGui(disp.Preferences);
            //$ctrl.mform.$setPristine();
            $ctrl.initDate = new Date($ctrl.form.InstalationDate.value);

            $ctrl.currentDisplay = $ctrl.displays.find(disp=>disp._id===$ctrl.currentDisplayId)

        };

        $ctrl.$onChanges = function (changesObj) {
            if (changesObj.settings.currentValue && changesObj.map.currentValue) {
                $ctrl.currentDisplayId = $ctrl.displays[0]._id;
                $ctrl.DisplayChanged();
                $ctrl.initDate = new Date($ctrl.form.InstalationDate.value);
                $log.debug('set pristine state');
            }
        };

        $ctrl.save = ()=>{
            let disp = $ctrl.settings.find(pref=>pref.displayId==$ctrl.currentDisplayId);
            $ctrl.mform.$setPristine();
            let result = [];

            SettingsCore.save($ctrl.settingsNames,  disp.Preferences, $ctrl.form, result);

            $http.post(`api/displays/${$ctrl.wid}/${disp.displayId}`, {result: result, isactive: $ctrl.currentDisplay.isactive})
            .then(res=>{
                console.log('Prefernces save ', res);
            })
            .catch(err=>{
                console.log(err);
            });
        };

        $ctrl.cancel = ()=>{
            $ctrl.mform.$setPristine();
            $ctrl.fillGui();
        };

        //datepicker
        $ctrl.displayDateChanged = (date)=>{
            $ctrl.form.InstalationDate.value = date.getFullYear()+'.'+(date.getMonth()+1)+'.'+date.getDate();
        }
    },
    templateUrl: '/src/modules/workstation-settings/display-settings/display-settings.html'
});

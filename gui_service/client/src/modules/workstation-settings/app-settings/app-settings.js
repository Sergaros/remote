'use strict'

angular.module('remoteGuiApp')
.component('appSettings', {
    bindings: {
      settings: '<',
      map: '<?settingsMap'
    },
    controller: function ($http, $log, WSettings, dialog, $state) {
        const $ctrl = this;
        $ctrl.form = {};
        $ctrl.isActive = $state.is('manage.appsettings');
        //'UpdateSoftwareAutomaticaly' 'RemindMinutes'
        $ctrl.settingsNames = ['Language', 'units',
                                'LumUnits', 'AmbientLight', 'AmbientStable',
                                'UseScheduler'];

        $ctrl.fillGui = ()=>{
            $ctrl.settingsNames.forEach(name=>{
                $ctrl.form[name] = {};
                let values = WSettings.getOptions(name, $ctrl.map.settings);
                if(values.length){
                    $ctrl.form[name].options = values;
                }

                let pref = $ctrl.settings.preferences.find(pref=>pref.name===name);
                //console.log('Find prefs',name,' - ',pref);
                if(pref){
                    $ctrl.form[name].value = pref.value;
                    $ctrl.form[name].isLocked = pref.isLocked;
                } else {
                    $ctrl.form[name].value = '';
                    $ctrl.form[name].isLocked = false;
                }
            });

            if(!$ctrl.form.LumUnits.value.length)
                $ctrl.form.LumUnits.value = 'cd';

            $ctrl.form.AmbientLight.value = parseFloat($ctrl.form.AmbientLight.value);
            $ctrl.form.UseScheduler.value = $ctrl.form.UseScheduler.value==='true';
        };

        this.$onChanges = function (changesObj) {
            //console.log('settings onChanges - ', changesObj);
            if (changesObj.settings.currentValue && changesObj.map.currentValue) {
                //console.log('changesObj.settings.currentValue - ', changesObj.settings.currentValue);
                $ctrl.fillGui();
            }
        };

        $ctrl.save = ()=>{
            $ctrl.mform.$setPristine();
            let result = [];
            $ctrl.settingsNames.forEach(name=>{
                let value = $ctrl.form[name].value;
                let pref = $ctrl.settings.preferences.find(pref=>pref.name===name);
                let isLocked = $ctrl.form[name].isLocked;

                if(pref){
                    if(pref.value != value || pref.isLocked != isLocked){
                        result.push({name, value, isLocked});
                        pref.value = value;
                        pref.isLocked = isLocked;
                    }
                }
            });

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
    templateUrl: '/src/modules/workstation-settings/app-settings/app-settings.html'
});

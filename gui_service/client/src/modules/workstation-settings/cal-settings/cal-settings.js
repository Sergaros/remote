'use strict'

angular.module('remoteGuiApp')
.component('calSettings', {
    bindings: {
      settings: '<',
      map: '<?settingsMap'
    },
    controller: function ($http, $log, SettingsCore, dialog, $state) {
        const $ctrl = this;
        $ctrl.form = {};
        $ctrl.isActive = $state.is('manage.calibration');
        $ctrl.settingsNames = ['CalibrationType', 'Gamma', 'ConformancePoints',
                               'ColorTemperatureAdjustment', 'AdjustColorTemperature', 'WhiteLevel_u', 'BlackLevel_u',
                               'WhiteLevel', 'BlackLevel', 'SetWhiteLevel', 'SetBlackLevel',
                               'gamut_name', 'Uniformity', 'CreateICCICMProfile', 'ColorTemperature', 'AdjustGamut'];

        $ctrl.fillGui = ()=>{
            SettingsCore.fillGui($ctrl.settingsNames, $ctrl.settings.preferences, $ctrl.map.settings, $ctrl.form);

            $ctrl.form.Gamma.value = parseFloat($ctrl.form.Gamma.value);
            $ctrl.form.ColorTemperature.value = parseInt($ctrl.form.ColorTemperature.value);
            $ctrl.form.CreateICCICMProfile.value = $ctrl.form.CreateICCICMProfile.value==='true';
            $ctrl.form.AdjustColorTemperature.value = $ctrl.form.AdjustColorTemperature.value==='true';
            $ctrl.form.AdjustGamut.value = $ctrl.form.AdjustGamut.value==='true';


            $ctrl.whiteLevelIsLocked = ($ctrl.form.WhiteLevel_u.isLocked || $ctrl.form.WhiteLevel.isLocked);

            if($ctrl.form.WhiteLevel_u.value === 'native'){
                $ctrl.whiteLevelType = 'native';
                $ctrl.whiteLevelValue = 200;
            }else{
                $ctrl.whiteLevelType = 'custom';
                $ctrl.whiteLevelValue = parseInt($ctrl.form.WhiteLevel_u.value);
            }

            $ctrl.blackLevelIsLocked = ($ctrl.form.BlackLevel_u.isLocked || $ctrl.form.BlackLevel.isLocked);
            if($ctrl.form.BlackLevel_u.value === 'native'){
                $ctrl.blackLevelType = 'native';
                $ctrl.blackLevelValue = 0;
            }else{
                $ctrl.blackLevelType = 'custom';
                $ctrl.blackLevelValue = parseInt($ctrl.form.BlackLevel_u.value);
            }

        };

        const valueInRanges = (value, target, diff)=>{
            return (value>=(target-diff) && value<=(target+diff));
        };

        //$ctrl.form.AdjustColorTemperature

        $ctrl.ColorTemperatureChanged = (value)=>{
            if(value === 'preset'){
                if($ctrl.form.ColorTemperatureAdjustment.value == 0)
                    $ctrl.form.ColorTemperature.value = 5000;
                else if($ctrl.form.ColorTemperatureAdjustment.value == 1)
                        $ctrl.form.ColorTemperature.value = 5500;
                else if($ctrl.form.ColorTemperatureAdjustment.value == 2)
                        $ctrl.form.ColorTemperature.value = 6500;
                else if($ctrl.form.ColorTemperatureAdjustment.value == 3)
                        $ctrl.form.ColorTemperature.value = 7500;
                else if($ctrl.form.ColorTemperatureAdjustment.value == 4)
                        $ctrl.form.ColorTemperature.value = 9300;
            } else {
                const diff = 100;
                if(valueInRanges($ctrl.form.ColorTemperature.value, 5000, diff))
                    $ctrl.form.ColorTemperatureAdjustment.value = '0';
                else if(valueInRanges($ctrl.form.ColorTemperature.value, 5500, diff))
                    $ctrl.form.ColorTemperatureAdjustment.value = '1';
                else if(valueInRanges($ctrl.form.ColorTemperature.value, 6500, diff))
                    $ctrl.form.ColorTemperatureAdjustment.value = '2';
                else if(valueInRanges($ctrl.form.ColorTemperature.value, 7500, diff))
                    $ctrl.form.ColorTemperatureAdjustment.value = '3';
                else if(valueInRanges($ctrl.form.ColorTemperature.value, 9300, diff))
                    $ctrl.form.ColorTemperatureAdjustment.value = '4';
                else
                    $ctrl.form.ColorTemperatureAdjustment.value = '20';
            }
        };

        $ctrl.WhiteLevelChanged = (value)=>{
            if(value === 'value'){
                $ctrl.form.WhiteLevel_u.value = $ctrl.whiteLevelValue;
                $ctrl.form.WhiteLevel.value = $ctrl.whiteLevelValue;
                $ctrl.form.SetWhiteLevel.value = true;
            } else {
                $ctrl.form.WhiteLevel_u.value = 'native';
                $ctrl.form.SetWhiteLevel.value = false;
            }
        };

        $ctrl.BlackLevelChanged = (value)=>{

            if(value === 'value'){
                $ctrl.form.BlackLevel_u.value = $ctrl.blackLevelValue;
                $ctrl.form.BlackLevel.value = $ctrl.blackLevelValue;
                $ctrl.form.SetBlackLevel.value = true;
            } else {
                $ctrl.form.BlackLevel_u.value = 'native';
                $ctrl.form.SetBlackLevel.value = false;
            }
        };

        $ctrl.blIsLockedChanged = ()=>{
            $ctrl.form.BlackLevel_u.isLocked = $ctrl.blackLevelIsLocked;
            $ctrl.form.BlackLevel.isLocked = $ctrl.blackLevelIsLocked;
            $ctrl.form.SetBlackLevel.isLocked = $ctrl.blackLevelIsLocked;
        };

        $ctrl.wlIsLockedChanged = ()=>{
            $ctrl.form.WhiteLevel_u.isLocked = $ctrl.whiteLevelIsLocked;
            $ctrl.form.WhiteLevel.isLocked = $ctrl.whiteLevelIsLocked;
            $ctrl.form.SetWhiteLevel.isLocked = $ctrl.whiteLevelIsLocked;
        };

        $ctrl.GamutChanged = ()=>{
            if($ctrl.form.gamut_name.value === 'custom')
                $ctrl.form.AdjustGamut.value = false;
            else
                $ctrl.form.AdjustGamut.value = true;
        };

        $ctrl.GamutIsLockedChanged = ()=>{
            $ctrl.form.AdjustGamut.isLocked = $ctrl.form.gamut_name.isLocked;
        };

        this.$onChanges = function (changesObj) {
            //$log.debug('settings onChanges - ', changesObj);
            if (changesObj.settings.currentValue && changesObj.map.currentValue) {
                $ctrl.fillGui();
                //$ctrl.mform.$setPristine();
            }
        };

        $ctrl.save = ()=>{
            $ctrl.mform.$setPristine();
            let result = [];
            SettingsCore.save($ctrl.settingsNames, $ctrl.settings.preferences, $ctrl.form, result);

            //console.log('Save preferences - ', result);
            $http.post('api/preferences/'+$ctrl.settings.workstationId, result)
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
    },
    templateUrl: '/src/modules/workstation-settings/cal-settings/cal-settings.html'
});

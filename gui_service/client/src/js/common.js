angular.module('remoteGuiApp')
.factory('WSettings', function () {

    return {
        getOptions: (name, map)=>{
            let res = [];

            map.forEach(item=>{
                if(item.name === name){
                    res = item.values;
                    return;
                }
            });

            return res;
        }
    }
})
.factory('SettingsCore', function(){

    const getOptions = (name, map)=>{
        let res = [];

        map.forEach(item=>{
            if(item.name === name){
                res = item.values;
                return;
            }
        });

        return res;
    };

    return {
        fillGui: (names, preferences,  map, form)=>{
            names.forEach(name=>{
                form[name] = {};
                let values = getOptions(name, map);
                if(values.length){
                    form[name].options = values;
                }

                let pref = preferences.find(pref=>pref.name===name);
                //console.log('Find prefs',name,' - ',pref);
                if(pref){
                    form[name].value = pref.value;
                    form[name].isLocked = pref.isLocked;
                }
            });
        },
        save: (names, preferences, form, data)=>{
            names.forEach(name=>{
                let value = form[name].value;
                let pref = preferences.find(pref=>pref.name===name);
                let isLocked = form[name].isLocked;

                if(pref){
                    if(pref.value != value || pref.isLocked != isLocked){
                        data.push({name, value, isLocked});
                        pref.value = value;
                        pref.isLocked = isLocked;
                    }
                }
            });
        },
        getOptions: getOptions,
        getValueBykey: (options, key)=>{
            let result;
            options.forEach(item=>{
                if(item.key === key)
                    result = item.value;
            });
            return result;
        }
    }
})
.factory('Search', function ($filter) {

    const filter = $filter('filter');
    const orderBy = $filter('orderBy');

    return{
        filter: filter,
        orderBy: orderBy
    }
})
.factory('UserTaskData', function(){

    const optionInit = (options)=>{
        let obj = {};
        obj.value = options[0].key;
        obj.isLocked = false;
        obj.options = options;
        return obj;
    };

    return{
        taskInit: ()=>{
            let obj = {};
            obj.lastrun = 0;
            obj.nextrun = 0;
            obj.type = 'cal',
            obj.status = '0';
            obj.testpattern = "SMPTE",
            obj.startdate = Date.now();
            obj.starttime = Date.now();
            obj.nthflag = true;
            obj.monthes = ['1','2','3','4','5','6','7','8','9','10','11','12'];
            obj.weekofmonth = '1';
            obj.everynweek = '1';
            obj.everynday = '2',
            obj.daysofweek = ['1','2','3','4','5','6','7'],
            obj.dayofmonth = '1',
            obj.deleted = false,
            obj.disabled = false

            return obj;
        },
        optionInit: optionInit,
        displaysInit: (displays)=>{
            let dispOptions = [];
            displays.forEach(disp=>{
                let item = {key: disp.displayId};

                let model = disp.Preferences.find(pref=>pref.name==='Model');
                let serial = disp.Preferences.find(pref=>pref.name==='SerialNumber')

                item.value = model.value +' '+serial.value;
                dispOptions.push(item);
            });

            return  optionInit(dispOptions);
        }
    }
})
.factory('MLog', function ($log) {
    return{
        error: (err)=>{$log.error('Error: ',err)},
        warning: (warning)=>{$log.warn('Warning: ',warning)},
        log: (message)=>{$log.log('Log: ',message)},
        info: (message)=>{$log.info('Info: ',message)},
        debug: (message)=>{$log.debug('Debug: ',message)}
    }
});

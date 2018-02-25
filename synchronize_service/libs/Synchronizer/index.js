'use strict'

require('m_database');

 const ACTION_SYNC_TASKS_US             ="CALTASKS";
 const ACTION_SYNC_TASKS_QA             ="QATASKS";
 const ACTION_SYNC_TASKS_QA_TIME        ="TASKQATIME";
 const ACTION_SYNC_STEPS_QA             ="QASTEPS";
 const ACTION_SYNC_PREFS                ="PREFERENCES";
 const ACTION_SYNC_HISTORY              ="HISTORY";
 const ACTION_SYNC_DISPLAY              ="DISPLAY";
 const ACTION_SYNC_DISPLAY_PREFS        ="DISPLAYPREFS";
 const ACTION_SYNC_DISPLAY_HOURS        ="DISPLAYHOURS";
 const ACTION_SYNC_EXEC_STATUS          ="TASK";
 const ACTION_SYNC_WS                   ="WORKSTATION";
 const ACTION_SYNC_HISTORYFREQUPDATE    ="HISTORYFREQ";
 const ACTION_DISP_STATUS               ="DISPLAYSTATUSES";
 const ACTION_SYNCH_USER_REG            ="USERREGULATIONLIST";
 const ACTION_SYNCH_USER_LANGS          ="USERLANGUAGES";
 const ACTION_SYNCH_AMBIENT_MEASURES    ="AMBIENTMEASURES";
 const ACTION_GET_GROUPS                ="GROUPS";
 const SYNCH_ACTION_SELECTGROUP         ="SELECTGROUP";
 const SYNCH_ACTION_SETTINGS_NAMES      ="SETTINGSNAMES";
 const SYNCH_ACTION_HISTORY             ="HISTORY";

 //results
 const AUTH_FAIL = 1;       // 1
 const OK = 4;              // 4
 const UNDEFINED_ACTION = 5;// 5

 const BaseSynchronizer = require('./BaseSynchronizer.js');
 const GroupsSynchronizer = require('./GroupsSynchronizer.js');
 const SetGroupSynchronizer = require('./SetGroupSynchronizer.js');
 const PreferencesSynchronizer = require('./PreferencesSynchronizer.js');
 const RegulationsSynchronizer = require('./RegulationsSynchronizer.js');
 const LanguagesSynchronizer = require('./LanguagesSynchronizer.js');
 const DisplaysSynchronizer = require('./DisplaysSynchronizer.js');
 const DisplaysPreferencesSynchronizer = require('./DisplaysPreferencesSynchronizer.js');
 const DisplaysHoursSynchronizer = require('./DisplaysHoursSynchronizer.js');
 const DisplaysStatusesSynchronizer = require('./DisplaysStatusesSynchronizer.js');
 const QATasksSynchronizer = require('./QATasksSynchronizer.js');
 const QAStepsSynchronizer = require('./QAStepsSynchronizer.js');
 //const CalibrationTasksSynchronizer = require('./CalibrationTasksSynchronizer.js');
 const CalTasksSynchronizer = require('./CalTasksSynchronizer.js');
 const SettingsNamesSynchronizer = require('./SettingsNamesSynchronizer.js');
 const HistorySynchronizer = require('./HistorySynchronizer.js');


exports.GetRequest = (obj)=>{
    const header = obj.header;
    const action = header.action;

    let syncronizer;

    if(action === SYNCH_ACTION_SELECTGROUP){
        syncronizer = new SetGroupSynchronizer(obj);
    } else if(action === ACTION_GET_GROUPS){
        syncronizer = new GroupsSynchronizer(obj);
    } else if(action === ACTION_SYNC_PREFS){
        syncronizer = new PreferencesSynchronizer(obj);
    } else if(action === ACTION_SYNCH_USER_REG){
        syncronizer = new RegulationsSynchronizer(obj);
    } else if(action === ACTION_SYNCH_USER_LANGS){
        syncronizer = new LanguagesSynchronizer(obj);
    } else if(action === ACTION_SYNC_DISPLAY){
        syncronizer = new DisplaysSynchronizer(obj);
    } else if(action === ACTION_SYNC_DISPLAY_PREFS){
        syncronizer = new DisplaysPreferencesSynchronizer(obj);
    } else if(action === ACTION_SYNC_DISPLAY_HOURS){
        syncronizer = new DisplaysHoursSynchronizer(obj);
    } else if(action === ACTION_DISP_STATUS){
        syncronizer = new DisplaysStatusesSynchronizer(obj);
    } else if(action === ACTION_SYNC_TASKS_QA){
        syncronizer = new QATasksSynchronizer(obj);
    } else if(action === ACTION_SYNC_STEPS_QA){
        syncronizer = new QAStepsSynchronizer(obj);
    } else if(action === ACTION_SYNC_TASKS_US){
        syncronizer = new CalTasksSynchronizer(obj);
    } else if(action === SYNCH_ACTION_SETTINGS_NAMES){
        syncronizer = new SettingsNamesSynchronizer(obj);
    }else if(action === SYNCH_ACTION_HISTORY){
        syncronizer = new HistorySynchronizer(obj);
    }else {
        header.result = UNDEFINED_ACTION;
        return Promise.resolve({header: header, data: {}});
    }

    return syncronizer.CheckAccess()
    .then(result=>{
        if(result || action === ACTION_GET_GROUPS){
            return syncronizer.Synchronize()
                    .then(result=>{
                        header.result = OK;
                         if(action === ACTION_GET_GROUPS && (!result || !Array.isArray(result) || result.length == 0)) {
                             header.result = AUTH_FAIL;
                         }
                        return {header: header, data: result};
                    });
        }
        else {
            header.result = AUTH_FAIL;
            return {header: header, data: {}};
        }
    });
}

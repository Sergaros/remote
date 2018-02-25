'use strict'

const mongoose = require('m_mongoose');
const {BaseSynchronizer} = require('./BaseSynchronizer.js');

const Languages = mongoose.models.Languages;
const Workstation = mongoose.models.Workstation;

class LanguagesSynchronizer extends BaseSynchronizer {
    Synchronize(){
        let languages = [];
        let wstOId;

        this.data.forEach(language=>{
            let lang = {};
            lang.name = language.name;
            lang.id_name = language.id;

            languages.push(lang);
        });

        return Workstation.findOne({wsId: this.workstationId})
        .then(workstation=>{
            wstOId = workstation._id;
            return Languages.findOne({workstationId: workstation._id});
        })
        .then(langList=>{
            if(!langList){
                langList =  new Languages({
                    workstationId: wstOId,
                    languages: languages
                });
            } else{
                langList.languages = languages;
            }

            return langList.save();
        })
        .then(result=>{
            return {};
        });
    }
};

module.exports = LanguagesSynchronizer;

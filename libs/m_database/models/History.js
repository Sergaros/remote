'use strict'

const mongoose = require('m_mongoose');
const Schema = mongoose.Schema;

const QATYPE_QA = 1;
const QATYPE_QA_IMPORTED = 71
const QATYPE_TESTPATTERN = 41;
const CALTYPE_CALIBRATION = 2;
const CALTYPE_CONFORMANCE = 3;
const CALTYPE_AMBIENTTEST = 4;
const CALTYPE_WHITELEVEL = 10;
const CALTYPE_WHITELEVELVERIFY = 11;
const CALTYPE_WHITELEVELAUTOSTAB = 12;
const CALTYPE_UNIFORMITY = 20;
const CALTYPE_UNIFORMITYVERIFY = 21;
const CALTYPE_ICCCREATE = 31;
const CALTYPE_ONLINEVISUALTEST = 51;
const CALTYPE_CORRELATION = 61;
const CALTYPE_ALS_CALIBRATION = 62;
const CALTYPE_CORRELATION_OLORIN = 63;
const CALTYPE_BACKLIGTH_STABILISATION = 81;
const CALTYPE_NOTDISPLAYS_START = 100;
const CALTYPE_CAMERA_PROFILING_CALIBRATION = 101;
const CALTYPE_PRINTER_PROFILING_CALIBRATION = 102;
const CALTYPE_PRINTER_PROFILING_CONFORMANCE = 103;

const MEASUREMENT_TEST_CODE = 'meas';
const ACCEPTANCE_TEST_CODE = "acceptance";
const VISUAL_TEST_CODE = "visual";

const FreqNone = -1;
const FreqDaily = 0;
const FreqWeekly = 1;
const FreqBiWeekly = 6;
const FreqMonthly = 2;
const FreqQuaterly = 3;
const FreqBinnualy = 4;
const FreqAnnualy = 5;
const FreqEveryFiveYears = 7;

const {
    OptionStringSchema
} = require('./Option.js');

const historySchema = new Schema({
    workstationId: {
        type: Schema.Types.ObjectId,
        ref: 'Workstation',
        require: true
    },

    deviceid: {
        type: Number,
        required: true
    },

    displayid: {
        type: Number,
        required: true
    },

    historyid: {
        type: Number,
        required: true,
        unique: true
    },

    historytype: {
        type: Number,
        required: true
    },

    isdisabled: {
        type: Number,
        required: true
    },

    result: {
        type: Number,
        required: true
    },

    runtime: {
        type: Number,
        required: true
    },

    textname: {
        type: String,
        required: true
    },

    preferences: {
        type: [OptionStringSchema]
    },

    report: {
        type: Schema.Types.Mixed
    },

    calHistory:{
        curvename: String,
        calhistoryid: Number,
        iscolor: Number,
        isexpress: Number,
        calMeasurements: [{
            X: Number,
            Y: Number,
            Z: Number,
            measuretype: Number,
            reasureB:    Number,
            reasureG:    Number,
            reasureR:    Number
        }],
        calTargets: {
            type: [{
                name: String,
                value: String
            }]
        }
    }
});

historySchema.methods.getTypeName = function() {
    let typeName;

    switch (this.historytype) {
        case QATYPE_QA:
        case QATYPE_QA_IMPORTED:
            {
                //QString nm = getTestName(historyId).toLower();
                typeName = "QA ";
                //DBQAHistory qahistory;
                //QubyxDynamicData::iterator it = qahistory.beginResults(historyId);

                let regulationName = this.preferences.find(p => p.name === 'regulationName');
                regulationName = regulationName.value;

                if (!regulationName)
                    typeName = `( Regulation does not exist. )`;
                else {
                    typeName = regulationName;
                }

                typeName += " ";

                if (!this.textname)
                    typeName += '(Regulation Deleted)';
                else if (this.textname.includes(ACCEPTANCE_TEST_CODE))
                    typeName += 'Acceptance Test';
                else {
                    let isMeas = this.textname.includes(MEASUREMENT_TEST_CODE);
                    if (isMeas)
                        typeName += 'measurement';

                    if (this.textname.includes(VISUAL_TEST_CODE)) {
                        if (isMeas)
                            typeName += '/';
                        typeName += 'visual';
                    }

                    let frs = this.preferences.find(p => p.name === 'frequency list');
                    frs = frs.value;

                    if (frs) {
                        let l = frs.split("||");
                        console.log('l - ', l);
                        typeName += " (";

                        let FREQUENCIES = {};
                        FREQUENCIES[FreqDaily] = "Daily";
                        FREQUENCIES[FreqWeekly] = "Weekly";
                        FREQUENCIES[FreqBiWeekly] = "BiWeekly";
                        FREQUENCIES[FreqMonthly] = "Monthly";
                        FREQUENCIES[FreqQuaterly] = "Quarterly";
                        FREQUENCIES[FreqBinnualy] = "Semiannually";
                        FREQUENCIES[FreqAnnualy] = "Annually";

                        let added = 0;
                        for (let i = 0; i < l.length; ++i) {
                            let freqId = l[i];

                            if (freqId >= 0) {
                                if (added > 0)
                                    typeName += "/";

                                if (!typeName.includes(FREQUENCIES[freqId]))
                                    typeName += FREQUENCIES[freqId];
                                else
                                    typeName = typeName.slice(0, typeName.length - 1);
                                ++added;
                            }
                        }
                        typeName += ")";
                    }

                }

                if (this.historytype == QATYPE_QA_IMPORTED) {
                    typeName += '(';
                    typeName += 'imported';
                    typeName += ')';
                }
            }
            break;
        case QATYPE_TESTPATTERN:
            typeName = 'Display Test Pattern';
            break;

        case CALTYPE_CALIBRATION:
            typeName = 'Calibration'; //getDetailedTypeName(QObject::tr("Calibration"), historyId);
            break;
        case CALTYPE_CONFORMANCE:
            typeName = 'Calibration Conformance'; //getDetailedTypeName(QObject::tr("Calibration Conformance"), historyId);
            break;
        case CALTYPE_WHITELEVEL:
            typeName = 'Display Luminance Calibration';
            break;
        case CALTYPE_WHITELEVELVERIFY:
            typeName = 'Display Luminance Conformance';
            break;
        case CALTYPE_UNIFORMITY:
            typeName = 'Uniformity';
            break;
        case CALTYPE_UNIFORMITYVERIFY:
            typeName = 'Uniformity Conformance';
            break;
        case CALTYPE_ICCCREATE:
            typeName = 'Create ICC Profile';
            break;
        case CALTYPE_ONLINEVISUALTEST:
            typeName = 'Online Visual Display Test';
            break;
        case CALTYPE_CAMERA_PROFILING_CALIBRATION:
            typeName = 'Camera Profiling';
            break;
        case CALTYPE_PRINTER_PROFILING_CALIBRATION:
            typeName = 'Printer Profiling';
            break;
        case CALTYPE_PRINTER_PROFILING_CONFORMANCE:
            typeName = 'Printer Conformance';
            break;
        default:
            typeName = "";
            break;
    }

    return typeName;
}

module.exports = mongoose.model('History', historySchema);

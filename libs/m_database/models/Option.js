const mongoose = require('m_mongoose');
const {getClass} = require('Common');

const Schema = mongoose.Schema;

const OptionBooleanSchema = new Schema({
    name:{
        type: String,
        require: true
    },
    value:{
        type: Boolean,
        require: true
    },
    isChanged: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    }
});

const OptionStringSchema = new Schema({
    name:{
        type: String,
        require: true
    },
    value:{
        type: String,
        require: true
    },
    isChanged: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    }
});

const OptionDateSchema = new Schema({
    name:{
        type: String,
        require: true
    },
    value:{
        type: Date,
        require: true
    },
    isChanged: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    }
});

const ValueObjectIdSchema = new Schema({
    value:{
        type: Schema.Types.ObjectId,
        require: true
    },
    isChanged: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    }
});

const ValueBooleanSchema = new Schema({
    value:{
        type: Boolean,
        require: true
    },
    isChanged: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    }
});

const ValueNumberSchema = new Schema({
    value:{
        type: Number,
        require: true
    },
    isChanged: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    }
});

const ValueStringSchema = new Schema({
    value:{
        type: String,
        require: true
    },
    isChanged: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    }
});

const ValueDateSchema = new Schema({
    value:{
        type: Date,
        require: true
    },
    isChanged: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    }
});

const eq = (value1, value2)=>{
    let type = getClass(value1);
    let type2 = getClass(value2);

    if(type !== type2) return false;

    if(type === 'Date'){
        return value1.getTime() === value2.getTime();
    } else
        return value1 === value2;
};

const resolveValue = (obj, value)=>{
    let result = undefined;

    if(eq(obj.value, value)){
        obj.isChanged =  false;
    } else {
        if(obj.isLocked){
            result = obj.value;
        } else if(obj.isChanged){
            result = obj.value;
            obj.isChanged = false;
        } else {
            obj.value = value;
        }
    }

    return result;
};

module.exports = {
                    OptionBooleanSchema,
                    OptionStringSchema,
                    OptionDateSchema,
                    ValueBooleanSchema,
                    ValueStringSchema,
                    ValueDateSchema,
                    ValueNumberSchema,
                    ValueObjectIdSchema,
                    resolveValue
                };

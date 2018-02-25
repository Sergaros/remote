const util = require('util');
const log = require('m_log')(module);
const {koa_responce} = require('m_responce');

const level = {
    TRIVIAL: 'Error Trivial',
    MINOR: 'Error Minor',
    MAJOR: 'Error Major',
    BLOCKER: 'Error Blocker',
    CRITICAL: 'Error Critical',
    TEST: 'Error test'
};

const type = {
    ERR_AUTH: 'Authentification Error',
    ERR_DATABASE: 'Database Error',
    ERR_HTTP: 'Http Error',
    ERR_VALIDATION: 'Validation Error',
    ERR_TEST: 'Error test'
};

function error(msg, lvl, type) {
    this.message = msg;
    this.level = lvl;
    this.type = type;

    /*if(msg) this.messages.push(msg);
    if(lvl) this.levels.push(lvl);
    if(type) this.types.push(type);*/

    Error.captureStackTrace(this, error );
}
util.inherits(error, Error);

//const errorMsg = msg=>{return {result: false, message: msg}};
const ErrorHandler = (err, ctx)=>{
    //log.info('Error handler');
    /*log.error(err.message, err);
    ctx.status = 500;

    if(err instanceof error){
        //console.log('Error handler instance', err.type);

        if(err.type === type.ERR_TEST){
            console.log('Test Error');
            ctx.body = errorMsg('Test Error');
        } else if(err.type === type.ERR_AUTH){
            ctx.body = errorMsg('Authentication Error');
        } else if(err.type === type.ERR_DATABASE){
            ctx.body = errorMsg('Database Error');
        } else if(err.type === type.ERR_HTTP){
            ctx.body = errorMsg('Http Error');
        } else if(err.type === type.ERR_VALIDATION){
            ctx.body = errorMsg('Validation Error');
        }
    } else {
        //console.log('Error handler native');
        //console.error(err.message, err.stack);
        ctx.body = errorMsg('Internal server error');
        koa.err_500(ctx);
    }*/


    //log.info('Error handler');
    log.error(err.message, err);

    if(err instanceof error){
        //console.log('Error handler instance', err.type);

        if(err.type === type.ERR_TEST){
            koa_responce.err(ctx,'Test Error');
        } else if(err.type === type.ERR_AUTH){
            koa_responce.err(ctx, 'Authentication Error');
        } else if(err.type === type.ERR_DATABASE){
            koa_responce.err(ctx, 'Database Error');
        } else if(err.type === type.ERR_HTTP){
            koa_responce.err(ctx, 'Http Error');
        } else if(err.type === type.ERR_VALIDATION){
            koa_responce.err(ctx, 'Validation Error');
        }
    } else
        koa_responce.err_500(ctx);
    return;
}


module.exports = {error, level, type, ErrorHandler};

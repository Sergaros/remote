
/*const result = ({result, data=undefined, message=undefined}) => {
    let obj = {result};

    if(data)
        obj.data = data;

    if(message)
        obj.message = message;

    return JSON.stringify(obj);
};*/

const sent = (res, data, code=200) => {
    res.statusCode = code;
    res.end(JSON.stringify(data));
};

const yesno = (res, result, code=200) => {
    sent(res, {result: result}, code);
};

const err = (res, message, code=500) => {
    let result = {
        result: false,
        message: message
    };
    sent(res, result, code);
};

const err_404 = (res) => {
    let result = {
        result: false,
        message: 'Not found.'
    };
    sent(res, result, 404);
};

const err_500 = (res) => {
    let result = {
        result: false,
        message: 'Server Error.'
    };
    sent(res, result, 500);
};




const sent_koa = (ctx, data, code=200) => {
    ctx.status = code;
    ctx.body = data;
};

const yesno_koa = (res, result, code=200) => {
    sent_koa(res, {result: result}, code);
};

const err_koa = (ctx, message, code=500) => {
    let result = {
        result: false,
        message: message
    };
    sent_koa(ctx, result, code);
};

const err_404_koa = (ctx) => {
    let result = {
        result: false,
        message: 'Not found.'
    };
    sent_koa(ctx, result, 404);
};

const err_500_koa = (ctx) => {
    let result = {
        result: false,
        message: 'Server Error.'
    };
    sent_koa(ctx, result, 500);
};

const node_responce = {
    sent,
    yesno,
    err,
    err_404,
    err_500
};

const koa_responce = {
    sent: sent_koa,
    yesno: yesno_koa,
    err: err_koa,
    err_404: err_404_koa,
    err_500: err_500_koa
};

module.exports = {
    node_responce,
    koa_responce
};

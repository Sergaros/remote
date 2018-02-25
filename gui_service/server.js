const Koa = require('koa');
const app = new Koa();

require('m_database');

const config = require('config');
app.keys = ['secret'];//config.get('secret');

const path = require('path');
const fs = require('fs');

require('koa-csrf')(app);
const handlers = fs.readdirSync(path.join(__dirname, 'handlers')).sort();
handlers.forEach(handler => require('./handlers/' + handler).init(app));

const Router = require('koa-router');
const router = new Router();

router.get('/isloggedin', async function(ctx) {
    //console.log('isLogged - ', ctx.isAuthenticated());
    //console.log('Session - ', ctx.session);
    /*console.log('ctx.csrf - ',ctx.csrf);
    console.log('ctx.headers - ',ctx.headers);
    console.log('csrf-token ',ctx.req.headers['csrf-token']);
    console.log('xsrf-token ',ctx.req.headers['xsrf-token']);
    console.log('x-csrf-token ',ctx.req.headers['x-csrf-token']);
    console.log('x-xsrf-token ', ctx.req.headers['x-xsrf-token']);*/
    ctx.body = {result: ctx.isAuthenticated()};
});

//for test only
if(process.env.NODE_ENV == 'test'){
    router.get('/oncsrf', async function(ctx) {
        ctx.set('X-Test-Csrf', true);
        ctx.body = {result: true};
    });

    router.get('/token', async function(ctx) {
        ctx.set('X-Test-Csrf', true);
        ctx.body = ctx.csrf;
    });

    router.post('/token', async function(ctx) {
        //ctx.get('X-Test-Csrf');
        ctx.body = {ok: ctx.get('X-Test-Csrf')};
    });
}

/*router.post('/login', async function(ctx) {
    ctx.body = {result: ctx.request.body};
});*/

router.post('/login', require('./routes/login').post);
router.get('/logout', require('./routes/logout').post);

//check it!
/*router.all('', function (ctx, next) {
    console.log('for all requests!');
    return next();
});*/
// Require authentication for now
/*app.use(function(ctx, next) {
  if (ctx.isAuthenticated()) {
    return next()
  } else {
    ctx.redirect('/')
  }
})*/

const userAuth = function(ctx, next){
    if(!ctx.isAuthenticated()){
        ctx.status = 401;
        ctx.body = {result: false};
    } else
        return next();
}

router.use(['/api/users',
            '/api/users/:id',
            '/api/groups',
            '/api/groups/:id',
            '/api/workstations',
            '/api/workstations/:id',
            '/api/preferences',
            '/api/preferences/:id',
            '/api/displays',
            '/api/displays/:id',
            '/api/qatasks',
            '/api/qatasks/:id',
            '/api/usertasks',
            '/api/usertasks/:id',
            '/api/calendar',
            '/api/calendar/:id',
            '/api/mailconfig',
            '/api/userinfo',
            '/api/group_manager',
            '/api/group_manager/:id',
            '/api/history/:workstationId',
            ], userAuth);

require('./routes/users')(router);
require('./routes/userinfo')(router);
require('./routes/groups')(router);
require('./routes/workstations')(router);
require('./routes/preferences')(router);
require('./routes/displays')(router);
require('./routes/qatasks')(router);
require('./routes/usertasks')(router);
require('./routes/permissions')(router);
require('./routes/group_manager')(router);
require('./routes/logs')(router);
require('./routes/calendar')(router);
require('./routes/mailconfig')(router);
require('./routes/history')(router);

/*const proxy = require('koa-proxies');

router.get(proxy('/version', {
  target: 'http://synchronizer:5500/version',
  changeOrigin: false
}));

router.get(proxy('/synchronize2.php', {
  target: 'http://synchronizer:5500/synchronize2.php',
  changeOrigin: false
}));*/

/*router.get('/version', async function(ctx) {
    console.log('redirect!!!!!');
    ctx.status = 301;
    ctx.redirect('http://synchronizer:5500/version');
});
router.post('/synchronize2.php', async function(ctx) {
    console.log('redirect!!!!!');
    ctx.status = 301;
    ctx.redirect('http://synchronizer:5500/synchronize2.php');
});*/

app.use(router.routes());

if(require.main === module){
    // application run directly; start app server
    app.listen(config.get('port'));
} else {
    // application imported as a module via "require": export function to create server
    module.exports = app;
}

angular.module('remoteGuiApp', ['ui.bootstrap', 'ngRoute', 'ngSanitize',
 'ngResource', 'angular-md5', 'ui.router',
 'ngCookies', 'LocalStorageModule', 'ngTouch', 'mwl.calendar', 'ui.select'])
.factory('Authentication', function ($http, $location) {
    let loggedIn = false;

    const isLoggedIn = ()=>{
        return new Promise((resolve, reject)=>{
            $http.get('/isloggedin').then(resolve, reject);
        })
        .then((result, status, headers, config)=>{
            loggedIn = result.data.result;
            return loggedIn;
        })
        .catch(err=>{
            console.log('Error: ', err);
            return false;
        });
    };

    let user = {};

    return {
        isLoggedIn: isLoggedIn,
        logIn: (name, password)=>{
            let data = {
                name: name,
                password: password
            };
            //console.log('login data - ', data);
            return $http.post('/login', data);
        },
        boolIsLoggedIn: function () {
            return loggedIn;
        },
        logOut: ()=>{
            return new Promise((resolve, reject)=>{
                $http.get('/logout').then(resolve, reject);
            })
            .then((data, status, headers, config)=>{
                return data.result;
            })
            .catch(err=>{
                console.log('Error: ', err);
                return false;
            });
        },
    checkIsLogedIn: (isRedirect, isNotRedirect)=>{
                return isLoggedIn()
                    .then(result=>{
                        if(result)
                                return isRedirect;
                        else
                                return isNotRedirect;
            });

            // return deferred;
        },
        getUserInfo:()=>{
            return $http.get('/userinfo')
            .then(usr=>{
                user = usr;
                return user;
            })
            .catch(err=>{
                console.log('Error - ', err);
                return {};
            });
        },
        updateUserInfo:(usr)=>{
            user = usr;
            return $http.post('/userinfo', user);
        }
    };
})
.config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
})
.factory('authInterceptor', function($q, $state) {
    var authInterceptor = {
        //request: (config)=>{ console.log('myInterceptor request'); return config;},
        //response: (response)=>{ console.log('myInterceptor response ', response); return response;},
        //requestError: (rejectReason)=>{ console.log('myInterceptor requestError'); return $q.reject(rejectReason);},
        responseError: (response)=>{
            if ([401, 403].indexOf(response.status) >= 0) {
               // redirecting to login page
               $state.go('login');
               return response;
             } else
                return $q.reject(response);
        }
    };
    return authInterceptor;
})
.config(function (localStorageServiceProvider) {
  localStorageServiceProvider
    .setPrefix('remoteApp')
    .setStorageType('localStorage')
    .setNotify(true, true);
})
.config(function($logProvider, $routeProvider, $locationProvider, $stateProvider, $urlRouterProvider) {
    $logProvider.debugEnabled(true);

    let redirectFn = function (loggedState=null, notLoggedState="login") {
        return function (trans) {
            let auth = trans.injector().get('Authentication');
            return auth.checkIsLogedIn(loggedState, notLoggedState);
        }
    }

    $stateProvider.state({
        name: "login",
        url: "/login",
        template:  '<login on-login="$ctrl.login()"></login>',
        redirectTo: redirectFn("admin.groups", null)
    }).state({
        name: "error",
        url: "/error",
        template: '<h1>Welcome to error page<h1>',
    }).state({
        name: "admin",
        abstract: true,
    }).state({
        name: "admin.groups",
        url: "/groups",
        component: "groups",
        redirectTo: redirectFn()
    }).state({
        name: "calendar",
        url: "/calendar",
        component: "calendar",
        redirectTo: redirectFn()
    }).state({
        name: "admin.users",
        url: "/users",
        component: "users",
        redirectTo: redirectFn()
    }).state({
        name: "admin.workstations",
        url: "/workstations",
        //template: '<workstations on-open="$ctrl.openWorkstation(wst)"></workstations>',
        template: '<workstations></workstations>',
        redirectTo: redirectFn()
    }).state({
        name: "admin.logs",
        url: "/logs",
        component: "logs",
        redirectTo: redirectFn()
    }).state({
        name: "admin.outmail",
        url: "/outmail",
        component: "mailconfig",
        redirectTo: redirectFn()
    }).state({
        name: "manage",
        abstract: true
    }).state({
        name: "manage.calibration",
        url: "/manage/calibration",
        component: "workstationSettings",
        redirectTo: redirectFn()
    }).state({
        name: "manage.qa",
        url: "/manage/qa",
        component: "workstationSettings",
        redirectTo: redirectFn()
    }).state({
        name: "manage.scheduler",
        url: "/manage/scheduler",
        component: "workstationSettings",
        redirectTo: redirectFn()
    }).state({
        name: "manage.history",
        url: "/manage/history",
        component: "workstationSettings",
        redirectTo: redirectFn()
    }).state({
        name: "manage.appsettings",
        url: "/manage/appsettings",
        component: "workstationSettings",
        redirectTo: redirectFn()
    }).state({
        name: "manage.dispsettings",
        url: "/manage/dispsettings",
        component: "workstationSettings",
        redirectTo: redirectFn()
    }).state({
        name: "manage.licenses",
        url: "/manage/licenses",
        component: "workstationSettings",
        redirectTo: redirectFn()
    });

    $urlRouterProvider.otherwise("/login");

    // configure html5 to get links working on jsfiddle
    $locationProvider.hashPrefix('');
    $locationProvider.html5Mode({
                                    enabled: false,
                                    requireBase: true,
                                    rewriteLinks: true
                                });
});

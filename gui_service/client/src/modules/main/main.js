angular.module('remoteGuiApp')
/*.directive('main', function counter() {
  return {
    scope: {},
    controller: function () {
    },
    controllerAs: 'mainCtrl',
    templateUrl: '/src/modules/main/main.html'
  };
});*/

.component('main', {
    controller: function (Authentication, $state, Permissions) {
        /*$ctrl.$onInit = function () {

        });*/
        this.show = true;
        this.wst = {};
        this.login = ()=>{
            Authentication.getUserInfo()
            .then(info=>{
                //console.log('User info - ', info);
                //this.userInfo = info.data;
                Permissions.set(info.data.permissions);
            })
        };

        this.logOut = ()=>{
            Authentication.logOut().then(result=>{
                $state.go("login");
            }, err=>{
                console.log('Error: ', err);
            });
        };

        this.isLogged = function () {
            // console.log(Authentication.boolIsLoggedIn());
            // return Authentication.boolIsLoggedIn();
            return Authentication.boolIsLoggedIn();
        };

        /*this.openWorkstation = function(wst){
            this.wst = wst;
            console.log(wst);
            ManageSelection.selectWorkstations([wst]);

            $state.go("manage.calibration");
        }**/
    },
    templateUrl: '/src/modules/main/main.html'
});

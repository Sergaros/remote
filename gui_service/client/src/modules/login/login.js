angular.module('remoteGuiApp')
.component('login', {
    bindings: {
      onLogin: '&'
    },
    controller: function (Authentication, $state) {
        this.login = '';
        this.password = '';
        this.showError = false;
        const $ctrl = this;
        console.log();

        this.change = ()=>{
            this.showError = false;
        };

        this.logIn = (isValid)=>{
            if(!isValid){
                this.showError = true;
                return;
            }
            
            const res_success = (data, status, headers, config)=> {
                //console.log('success - ', data);
                Authentication.isLoggedIn()
                .then(isLogged=>{
                    console.log('$ctrl.onLogin - ',$ctrl.onLogin);
                    $ctrl.onLogin({result: isLogged});
                    if(isLogged){
                        $state.go("admin.groups");
                    }

                });
            };

            const res_error = (data, status, headers, config)=> {
                //console.log('error - ', data);
                this.showError=true;
                //console.log(data, status);
            };

            Authentication.logIn(this.login, this.password).then(res_success, res_error);
        }
    },
    templateUrl: '/src/modules/login/login.html'
});

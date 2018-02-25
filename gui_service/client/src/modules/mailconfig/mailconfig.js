'use strict'

angular.module('remoteGuiApp')
.component('mailconfig', {
    /*bindings: {
    },*/
    controller: function ($http, dialog) {
        const $ctrl = this;
        $ctrl.isConfigured = false;

        $ctrl.getClass = (el)=>{
            return  {
                'has-error': el.$invalid && (el.$dirty || el.$touched),
                'has-success': el.$valid && (el.$dirty || el.$touched)
            }
        };

        $ctrl.hasError = (el, name)=>{
            return el.$error[name] && (el.$dirty || el.$touched);
        }

        $ctrl.$onInit = function(){
            $http.get('/api/mailconfig')
            .then(responce=>{

                if(Object.keys(responce.data).length > 0){
                    $ctrl.config = responce.data;
                    $ctrl.isConfigured = true;
                }
                else
                    $ctrl.config = {secure: false};

            }).catch(err=>{
                console.log('err - ', err);
            })
        };

        $ctrl.submit = ()=>{
            return $http.post('/api/mailconfig', $ctrl.config)
            .then(result=>{
                //console.log('result - ', result.data);
                $ctrl.isConfigured = true;

            })
            .then(()=>{
                return dialog.open({title: "Information", info: "Email box has been configured.", cancel: false});
            })
            .catch(err=>{
                console.log('err - ', err);
            })
        };

        $ctrl.sendTestEmail = ()=>{
            $http.post('/api/mailconfig/test', {to: $ctrl.testemail})
            .then(responce=>{
                //console.log('test result - ', responce.data);
                $ctrl.testemail = "";
            })
            .then(()=>{
                return dialog.open({title: "Information", info: "Test letter has been sent.", cancel: false});
            })
            .catch(err=>{
                console.log('err - ', err);
            })
        };
    },
    templateUrl: '/src/modules/mailconfig/mailconfig.html'
});

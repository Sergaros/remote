'use strict'

angular.module('remoteGuiApp')
    .component('topnavbar', {
        templateUrl: '/src/modules/topnavbar/topnavbar.html',
        controller: function ($location, $window, $http, Authentication) {
            this.logOut = ()=>{
                Authentication.logOut().then(result=>{
                    $location.path('/');
                $window.location.reload();
            }, err=>{
                    console.log('Error: ', err);
                });
            };
        }
    });

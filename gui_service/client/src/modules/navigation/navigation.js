'use strict'

angular.module('remoteGuiApp')
    .component('navigation', {
        templateUrl: '/src/modules/navigation/navigation.html',
        controller: function($scope, $element, $state, Permissions) {
            let $ctrl = this;
            $ctrl.checkPermission = Permissions.check;

            this.$onInit = function() {
                $ctrl.$state = $state;

                // Call the metsiMenu plugin and plug it to sidebar navigation
                $element.metisMenu();

                // Colapse menu in mobile mode after click on element
                var menuElement = $('#side-menu a:not([href$="\\#"])');
                menuElement.click(function() {
                    if ($(window).width() < 769) {
                        $("body").toggleClass("mini-navbar");
                    }
                });

                // Enable initial fixed sidebar
                if ($("body").hasClass('fixed-sidebar')) {
                    var sidebar = element.parent();
                    sidebar.slimScroll({
                        height: '100%',
                        railOpacity: 0.9,
                    });
                }
            };
        }

    });

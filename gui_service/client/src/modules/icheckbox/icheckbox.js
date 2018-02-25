'use strict'

angular.module('remoteGuiApp')
.directive('icheck', function ($timeout) {
    return {
        restrict: 'A',
        link: function ($scope, element, $attrs, ngModel) {
            return $timeout(function () {
                var value;
                value = $attrs['value'];

                if($attrs['ngModel'])
                    $scope.$watch($attrs['ngModel'], function (newValue) {
                        $(element).iCheck('update');
                    });

                return $(element).iCheck({
                    checkboxClass: 'icheckbox_square-green',
                    radioClass: 'icheckbox_square-green',

                }).on('ifChanged', function (event) {
                    /*if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                        $scope.$apply(function () {
                            return ngModel.$setViewValue(event.target.checked);
                        });
                    }
                    if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
                        return $scope.$apply(function () {
                            return ngModel.$setViewValue(value);
                        });
                    }*/
                });
            });
        }
    }
});

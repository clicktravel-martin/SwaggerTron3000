;(function (angular) {
    'use strict';

    angular.module('fileinput-directive', [])
        .directive('fileInput', function () {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function (scope, element, attributes, ngModelCtrl) {
                    element.bind('change', function (event) {
                        ngModelCtrl.$setViewValue(event.target.files[0]);
                        scope.$apply();
                    });
                }
            };
        });

}(angular));

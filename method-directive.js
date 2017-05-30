;(function (angular) {
    'use strict';

    angular.module('swaggertron3000/method-directive', [])
        .directive('method', function () {

            var SUCCESS_RESPONSE_CODES = [
                {
                    label: '200 OK',
                    value: '200'
                },
                {
                    label: '201 Created',
                    value: '201'
                },
                {
                    label: '202 Accepted',
                    value: '202'
                },
                {
                    label: '204 No Content',
                    value: '204'
                }
            ];

            return {
                restrict: 'E',
                scope: {
                    method: '<'
                },
                templateUrl: 'method-directive.html',
                link: function (scope) {
                    scope.SUCCESS_RESPONSE_CODES = SUCCESS_RESPONSE_CODES;
                }
            };
        });

}(angular));
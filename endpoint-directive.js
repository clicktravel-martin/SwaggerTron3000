;(function (angular) {
    'use strict';

    angular.module('endpoint-directive', [
        'constants-service'
    ])
        .directive('endpoint', function () {
            return {
                restrict: 'E',
                scope: {
                    endpoint: '<'
                },
                templateUrl: 'endpoint-directive.html',
                transclude: true,
                controller: function ($scope, constants) {

                    $scope.Method = constants.Method;
                    $scope.Status = constants.Status;

                    $scope.statusLabel = function (status) {
                        switch (status) {
                            case constants.Status['200']:
                                return '200 OK';
                            case constants.Status['201']:
                                return '201 Created';
                            case constants.Status['202']:
                                return '202 Accepted';
                            case constants.Status['204']:
                                return '204 No Content';
                        }
                    };

                    $scope.methodHasRequestBody = function () {
                        return $scope.endpoint.method === constants.Method.PUT ||
                                $scope.endpoint.method === constants.Method.POST;
                    };

                    $scope.responseStatusHasBody = function () {
                        return $scope.endpoint.response.status !== constants.Status['204'];
                    };

                }
            };
        });

}(angular));
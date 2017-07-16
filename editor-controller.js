;(function (angular) {
    'use strict';

    angular.module('editor-controller', [
        'constants-service',
        'swaggergenerator-service',
        'filereader-service',
        'swaggerparser-service',
        'endpoint-directive',
        'fileinput-directive'
    ])
        .controller('Editor', function ($scope, constants, swaggerGenerator, fileReader, swaggerParser) {

            $scope.Platform = constants.Platform;
            $scope.AuthType = constants.AuthType;

            $scope.createNewApi = function () {
                $scope.api = {
                    title: undefined,
                    description: undefined,
                    version: '1',
                    host: undefined,
                    serviceName: undefined,
                    authType: constants.AuthType.BASIC,
                    platform: constants.Platform.PIONEER
                };
                $scope.endpoints = [];
                $scope.addEndpoint();
            };

            $scope.addEndpoint = function () {
                $scope.endpoints.push({
                    path: undefined,
                    method: constants.Method.GET,
                    pathParams: [],
                    queryParams: [],
                    request: {},
                    response: {
                        status: constants.Status['200'],
                        description: undefined,
                        schema: undefined
                    }
                });
            };

            $scope.cloneEndpoint = function (endpoint) {
                $scope.endpoints.push(angular.copy(endpoint));
            };

            $scope.removeEndpoint = function (endpoint) {
                $scope.endpoints.splice($scope.endpoints.indexOf(endpoint), 1);
            };

            $scope.generateSwagger = function () {
                if ($scope.apiForm.$valid) {
                    $scope.swagger = angular.toJson(swaggerGenerator.generate($scope.api, $scope.endpoints), 4);
                }
            };

            $scope.clearSwagger = function () {
                $scope.swagger = undefined;
            };

            $scope.importApi = function () {
                $scope.import = {
                    swagger: undefined,
                    file: undefined
                };
            };

            $scope.confirmImport = function () {
                $scope.importError = undefined;
                if ($scope.import.file) {
                    fileReader.readAsText($scope.import.file)
                        .then(parseAndStoreSwagger)
                        .catch(function (error) {
                            $scope.importError = error;
                        });
                } else if ($scope.import.swagger) {
                    parseAndStoreSwagger($scope.import.swagger);
                } else {
                    $scope.importError = 'Please paste your Swagger spec or choose a file.';
                }
            };

            function parseAndStoreSwagger(json) {
                var parseResult = swaggerParser.parse(json);
                if (angular.isString(parseResult)) {
                    $scope.importError = parseResult;
                } else {
                    $scope.api = parseResult.api;
                    $scope.endpoints = parseResult.endpoints;
                    $scope.import = undefined;
                }
            }

            // #######################################################################

            $scope.api = undefined;
            $scope.endpoints = undefined;

            $scope.import = undefined;
            $scope.importError = undefined;

        });

}(angular));
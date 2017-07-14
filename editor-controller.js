;(function (angular) {
    'use strict';

    angular.module('editor-controller', [
        'constants-service',
        'swaggergenerator-service',
        'endpoint-directive'
    ])
        .controller('Editor', function ($scope, constants, swaggerGenerator) {

            $scope.Platform = constants.Platform;
            $scope.AuthType = constants.AuthType;

            $scope.api = {
                title: undefined,
                description: undefined,
                version: '1',
                host: undefined,
                serviceName: undefined,
                authType: constants.AuthType.API_KEY,
                platform: constants.Platform.PIONEER
            };

            $scope.endpoints = [];

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
                        schema: undefined,
                        mediaType: undefined
                    }
                });
            };

            $scope.cloneEndpoint = function (endpoint) {
                $scope.endpoints.push(angular.copy(endpoint));
            };

            $scope.removeEndpoint = function (endpoint) {
                $scope.endpoints.splice($scope.endpoints.indexOf(endpoint), 1);
            };

            // $scope.api = {
            //     swagger: '2.0',
            //     info: {
            //         title: undefined,
            //         version: '1'
            //     },
            //     host: undefined,
            //     schemes: [
            //         'https'
            //     ],
            //     consumes: 'application/json',
            //     produces: 'application/json',
            //     paths: []
            // };

            $scope.generateSwagger = function () {
                var output = swaggerGenerator.generate($scope.api, $scope.endpoints);
                $scope.swagger = angular.toJson(output, 4);
            };

            // FIXME remove
            $scope.generateSwaggerOld = function () {

                function copyMethodIfEnabled(method) {
                    var copy;
                    if (method.meta.enabled) {
                        copy = angular.copy(method);
                        copy.responses = {};
                        copy.responses[method.meta.responseCode] = {
                            description: 'HTTP ' + method.meta.responseCode + ' response'
                        };
                        if (copy.consumes) {
                            copy.consumes = [copy.consumes];
                        }
                        if (copy.produces) {
                            copy.produces = [copy.produces];
                        }
                        delete copy.meta;
                    }
                    return copy;
                }

                function extractParameters(regex, path) {
                    var captured = regex.exec(path),
                        matches = [];

                    while (captured !== null) {
                        matches.push(captured[1]);
                        captured = regex.exec(path);
                    }

                    return matches.length ? matches : undefined;
                }

                function extractPathParameters(path) {
                    return extractParameters(/{(.+?)}/g, path);
                }

                function extractQueryParameters(path) {
                    return extractParameters(/[?&](.+?)=/g, path);
                }

                var output = angular.copy($scope.api);
                output.consumes = [output.consumes];
                output.produces = [output.produces];
                output.paths = {};
                angular.forEach($scope.api.paths, function (pathItem) {
                    var outputPathItem = {},
                        outputPath = pathItem.meta.url,
                        pathParams,
                        queryParams;

                    pathParams = extractPathParameters(outputPath);
                    if (pathParams) {
                        outputPathItem.parameters = [];
                        angular.forEach(pathParams, function (param) {
                            outputPathItem.parameters.push({
                                name: param,
                                in: 'path',
                                required: true,
                                type: 'string'
                            });
                        });
                    }

                    queryParams = extractQueryParameters(outputPath);
                    if (queryParams) {
                        outputPathItem.parameters = outputPathItem.parameters || [];
                        angular.forEach(queryParams, function (param) {
                            outputPathItem.parameters.push({
                                name: param,
                                in: 'query',
                                type: 'string'
                            });
                        });
                        // We have to chop off the query params to be compliant
                        outputPath = outputPath.split('?')[0];
                    }

                    outputPathItem.get = copyMethodIfEnabled(pathItem.get);
                    outputPathItem.post = copyMethodIfEnabled(pathItem.post);
                    outputPathItem.put = copyMethodIfEnabled(pathItem.put);
                    outputPathItem.delete = copyMethodIfEnabled(pathItem.delete);
                    output.paths[outputPath] = outputPathItem;
                });

                $scope.swagger = angular.toJson(output, 4);
            };

            // #######################################################################

            $scope.addEndpoint();

        });

}(angular));
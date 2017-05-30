;(function (angular) {
    'use strict';

    angular.module('swaggertron3000/main', [
        'swaggertron3000/method-directive'
    ])
        .controller('Main', function ($scope) {

            $scope.api = {
                swagger: '2.0',
                info: {
                    title: undefined,
                    version: '1'
                },
                host: undefined,
                schemes: [
                    'https'
                ],
                consumes: [
                    'application/json'
                ],
                produces: [
                    'application/json'
                ],
                paths: []
            };

            $scope.addPath = function () {
                $scope.api.paths.push({
                    meta: {
                        url: undefined
                    },
                    get: {
                        meta: {
                            label: 'GET',
                            labelClass: 'label-primary',
                            enabled: false,
                            responseCode: '200',
                            consumes: false
                        },
                        description: undefined,
                        produces: undefined
                    },
                    post: {
                        meta: {
                            label: 'POST',
                            labelClass: 'label-success',
                            enabled: false,
                            responseCode: '201',
                            consumes: true
                        },
                        description: undefined,
                        produces: undefined,
                        consumes: undefined
                    },
                    put: {
                        meta: {
                            label: 'PUT',
                            labelClass: 'label-warning',
                            enabled: false,
                            responseCode: '204',
                            consumes: true
                        },
                        description: undefined,
                        produces: undefined,
                        consumes: undefined
                    },
                    delete: {
                        meta: {
                            label: 'DELETE',
                            labelClass: 'label-danger',
                            enabled: false,
                            responseCode: '204',
                            consumes: false
                        },
                        description: undefined,
                        produces: undefined
                    }
                });
            };

            $scope.removePath = function (path) {
                $scope.api.paths.splice($scope.api.paths.indexOf(path), 1);
            };

            $scope.generateSwagger = function () {

                function copyMethodIfEnabled(method) {
                    var copy;
                    if (method.meta.enabled) {
                        copy = angular.copy(method);
                        copy.responses = {};
                        copy.responses[method.meta.responseCode] = {
                            description: 'HTTP ' + method.meta.responseCode + ' response'
                        };
                        if (copy.consumes) {
                            copy.consumes = [ copy.consumes ];
                        }
                        if (copy.produces) {
                            copy.produces = [ copy.produces ];
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
                output.consumes = [ output.consumes ];
                output.produces = [ output.produces ];
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

            $scope.addPath();

        });

}(angular));
;(function (angular) {
    'use strict';

    angular.module('swaggerparser-service', [
        'constants-service'
    ])
        .factory('swaggerParser', function (constants) {

            function extractSchemaName($ref) {
                var captured = /^#\/definitions\/(.+)$/.exec($ref);
                if (captured) {
                    return captured[1];
                }
            }

            return {

                /**
                 * @returns {string|{api:object,endpoints:[]}}
                 */
                parse: function (swagger) {
                    var spec,
                        api = {},
                        endpoints = [];

                    try {
                        spec = angular.fromJson(swagger);
                    } catch (ignored) {
                        return 'Your Swagger file is not valid JSON.';
                    }

                    try {
                        api.title = spec.info.title;
                        api.version = spec.info.version;
                        api.description = spec.info.description;

                        api.host = spec.host;
                        api.serviceName = spec['x-serviceName'];

                        if (spec.securityDefinitions.basic) {
                            api.authType = constants.AuthType.BASIC;
                        } else if (spec.securityDefinitions.oauth2) {
                            api.authType = constants.AuthType.OAUTH;
                        }

                        if (spec.host.indexOf('travel.cloud') > -1) {
                            api.platform = constants.Platform.TRAVEL_CLOUD;
                        } else if (spec.host.indexOf('pioneer.io') > -1) {
                            api.platform = constants.Platform.PIONEER;
                        } else {
                            return 'Host must be a subdomain of travel.cloud or pioneer.io';
                        }

                        angular.forEach(spec.paths, function (methods, path) {
                            angular.forEach(methods, function (methodDetails, method) {
                                var endpoint = {
                                        path: path,
                                        method: method.toUpperCase()
                                    },
                                    queryParams = [];

                                angular.forEach(methodDetails.parameters, function (param) {
                                    if (param.in === 'query') {
                                        queryParams.push(param.name + '={' + param.name + '}');
                                    }
                                    if (param.in === 'body') {
                                        endpoint.request = {
                                            schema: extractSchemaName(param.schema.$ref),
                                            description: param.description
                                        };
                                    }
                                });
                                if (queryParams.length) {
                                    endpoint.path += '?' + queryParams.join('&');
                                }

                                angular.forEach(methodDetails.responses, function (response, status) {
                                   if (status !== 'default') {
                                       endpoint.response = {
                                           status: status,
                                           description: response.description
                                       };
                                       if (response.schema) {
                                           endpoint.response.schema = extractSchemaName(response.schema.$ref);
                                       }
                                       if (response.headers && response.headers.Location) {
                                           endpoint.response.locationHeader = true;
                                       }
                                   }
                                });

                                endpoints.push(endpoint);
                            });
                        });

                    } catch (error) {
                        return 'Sorry, something went wrong: ' + error.toString();
                    }

                    return {
                        api: api,
                        endpoints: endpoints
                    };
                }
            };
        });

}(angular));
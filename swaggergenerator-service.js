;(function (angular) {
    'use strict';

    angular.module('swaggergenerator-service', [
        'constants-service'
    ])
        .factory('swaggerGenerator', function (constants) {

            var AUTH_HEADER_PARAMETER_NAME = 'authorizationHeader';

            function extractParameters(regex, path) {
                var captured = regex.exec(path),
                    matches = [];

                while (captured !== null) {
                    matches.push(captured[1]);
                    captured = regex.exec(path);
                }

                return matches;
            }

            function extractPathParameters(path) {
                return extractParameters(/\/{(.+?)}/g, path);
            }

            function extractQueryParameters(path) {
                return extractParameters(/[?&](.+?)=/g, path);
            }

            function basicSwaggerTemplate() {
                return {
                    swagger: '2.0',
                    info: {},
                    host: undefined,
                    schemes: [
                        'https'
                    ],
                    securityDefinitions: {},
                    security: [],
                    parameters: {},
                    responses: {
                        ErrorResponseV1: {
                            description: 'Errors that occurred when the request was processed',
                            schema: {
                                $ref: '#/definitions/ErrorResponseV1'
                            }
                        }
                    },
                    paths: {},
                    definitions: {
                        ErrorResponseV1: {
                            type: 'object',
                            properties: {
                                errors: {
                                    description: 'General errors that occurred when the request was processed',
                                    type: 'array',
                                    items: {
                                        description: 'A general error that occurred when the request was processed',
                                        type: 'object',
                                        properties: {
                                            description: {
                                                type: 'string'
                                            }
                                        }
                                    }
                                },
                                validationErrors: {
                                    description: 'Validation errors that occurred when evaluating input values of the request',
                                    type: 'array',
                                    items: {
                                        description: 'A validation error that occurred when evaluating input values of the request',
                                        type: 'object',
                                        properties: {
                                            field: {
                                                description: 'Names of fields in error',
                                                type: 'array',
                                                items: {
                                                    type: 'string'
                                                }
                                            },
                                            error: {
                                                description: 'Validation error detail',
                                                type: 'string'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                };
            }

            function addAuth(swagger, api) {
                if (api.authType === constants.AuthType.BASIC) {
                    swagger.securityDefinitions.basic = {
                        type: 'basic',
                        description: '3Scale app ID (username) and key (password)'
                    };
                    swagger.security.push({
                        basic: []
                    });
                    swagger.parameters[AUTH_HEADER_PARAMETER_NAME] = {
                        name: 'Authorization',
                        in: 'header',
                        description: 'Basic scheme authentication credentials. Format should conform to "Basic base64Encoded({app_id}:{app_key})"',
                        required: true,
                        type: 'string'
                    };
                } else if (api.authType === constants.AuthType.OAUTH) {
                    // Not implemented yet
                }
            }

            function addPath(swagger, endpoint, api) {
                var method = {
                    parameters: [
                        {
                            $ref: '#/parameters/' + AUTH_HEADER_PARAMETER_NAME
                        }
                    ],
                    produces: [
                        'application/vnd.' + api.platform + '.ErrorResponseV1+json'
                    ],
                    responses: {
                        default: {
                            $ref: '#/responses/ErrorResponseV1'
                        }
                    }
                };
                var cleanPath = endpoint.path.split('?',1)[0];

                // Params
                angular.forEach(extractQueryParameters(endpoint.path), function (queryParam) {
                    method.parameters.push({
                        name: queryParam,
                        in: 'query',
                        type: 'string'
                    });
                });
                angular.forEach(extractPathParameters(endpoint.path), function (pathParam) {
                    method.parameters.push({
                        name: pathParam,
                        in: 'path',
                        required: true,
                        type: 'string'
                    });
                });

                // Request
                if (endpoint.method === constants.Method.POST ||
                    endpoint.method === constants.Method.PUT && endpoint.request.schema) {
                    method.consumes = [
                        'application/vnd.' + api.platform + '.' + api.serviceName + '.' + endpoint.request.schema +
                        '+json'
                    ];
                    method.parameters.push({
                        name: endpoint.request.schema,
                        in: 'body',
                        schema: {
                            $ref: '#/definitions/' + endpoint.request.schema
                        },
                        required: true,
                        description: endpoint.request.description
                    });
                }

                // Response
                method.responses[endpoint.response.status] = {
                    description: endpoint.response.description
                };
                if (endpoint.response.status !== constants.Status['204'] && endpoint.response.schema) {
                    method.produces.push(
                        'application/vnd.' + api.platform + '.' + api.serviceName + '.' + endpoint.response.schema +
                        '+json');
                    method.responses[endpoint.response.status].schema = {
                        $ref: '#/definitions/' + endpoint.response.schema
                    };
                }
                if (endpoint.response.locationHeader) {
                    method.responses[endpoint.response.status].headers = {
                        'Location': {
                            type: 'string'
                        }
                    };
                }

                if (!swagger.paths[cleanPath]) {
                    swagger.paths[cleanPath] = {};
                }
                swagger.paths[cleanPath][endpoint.method.toLowerCase()] = method;
            }

            return {
                generate: function (api, endpoints) {
                    var swagger = basicSwaggerTemplate();

                    swagger.info.title = api.title;
                    swagger.info.description = api.description || undefined;
                    swagger.info.version = api.version;
                    swagger.host = api.host;
                    swagger['x-serviceName'] = api.serviceName;

                    addAuth(swagger, api);
                    angular.forEach(endpoints, function (endpoint) {
                        addPath(swagger, endpoint, api);
                    });

                    return swagger;
                }
            };

        });

}(angular));
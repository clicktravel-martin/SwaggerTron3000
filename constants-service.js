;(function (angular) {
    'use strict';

    angular.module('constants-service', [])
        .value('constants',
            {
                Platform: {
                    PIONEER: 'pioneer.io',
                    TRAVEL_CLOUD: 'travel.cloud'
                },

                AuthType: {
                    BASIC: 'Basic',
                    OAUTH: 'OAuth'
                },

                Method: {
                    POST: 'POST',
                    GET: 'GET',
                    PUT: 'PUT',
                    DELETE: 'DELETE'
                },

                Status: {
                    '200': '200',
                    '201': '201',
                    '202': '202',
                    '204': '204'
                }
            }
        );

}(angular));
;(function (angular) {
    'use strict';

    angular.module('filereader-service', [])
        .factory('fileReader', function ($window, $q) {
            return {
                readAsText: function (file) {
                    var reader = new $window.FileReader(),
                        deferred = $q.defer();
                    reader.onload = function (event) {
                        deferred.resolve(event.target.result);
                    };
                    reader.onerror = function () {
                        deferred.reject('Sorry, your file could not be read.');
                    };
                    reader.readAsText(file);
                    return deferred.promise;
                }
            };
        });


}(angular));
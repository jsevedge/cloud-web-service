angular.module('httpControllers', [])
.controller('httpController', ['$scope','$q','$location','$http','$timeout',
                           function($scope,  $q,  $location,  $http,  $timeout) {

    // Base function to query rest interface
    var rest = function(method, uri, data) {
        var deferred = $q.defer();

        // Fill in backend location
        $scope.protocol = 'http://';
        $scope.host = 'localhost';
        $scope.port = '8800';
        $scope.url = $scope.protocol + $scope.host + ':' + $scope.port + uri;
        var restData = typeof data === 'undefined' ? [] : data;

        $http({method: method, url: $scope.url, data: restData})
        .then(function(response) {
            deferred.resolve(response.data);
        }).catch(function(err) {
            deferred.reject(err);
        });
        return deferred.promise;
    };

    // Function to 'get' data via rest interface
    var getData = function(uri) {
        var deferred = $q.defer();

        rest('get', uri).then(function(data) {
            deferred.resolve(data);
        }).catch(function(err) {
            deferred.reject(err);
            console.log('Error', err);
        });
        return deferred.promise;
    };

    // Function to 'put' data via rest interface
    var putData = function(uri, data) {
        var deferred = $q.defer();

        rest('put', uri, data).then(function(data) {
            deferred.resolve(data);
        }).catch(function(err) {
            deferred.reject(err);
            console.log('Error', err);
        });
        return deferred.promise;
    };

    // Function to Power Off VM
    $scope.powerVmOff = function(vmName, vmId) {
        var rgName = vmId.substring(vmId.lastIndexOf("resourceGroups/")+15, vmId.lastIndexOf("/providers"));
        var data = {
            vmName: vmName,
            vmId: vmId,
            resourceGroupName: rgName
        };
        // Replace with API call
        putData('/vms', data).then(function(data) {
            console.log('Powering VM Off:', vmName);
        });
    };

    // Pull in VMs
    getData('/interfaces').then(function(data) {
        $scope.interfaces = data;
    });
    // Pull in VM Interfaces
    getData('/vms').then(function(data) {
        $scope.vms = data;
    });
    // Pull in Deployments
    getData('/deployments').then(function(data) {
        $scope.deployments = data;
    });
  }]);

#!/usr/bin/env node

function azureRestProvider() {
    var fs = require('fs');
    var q = require('q');

    // For now pull credentials from local file for this worker
    var configFile = {};
    if (fs.existsSync('config.json')) {
        configFile = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    }
    else {
        console.log('Configuration file not found');
        return;
    }

    var subscriptionId = configFile.subscriptionId;
    var clientId = configFile.credentials.clientId;
    var tenantId = configFile.credentials.tenantId;
    var secret = configFile.credentials.secret;

    var msRestAzure = require('ms-rest-azure');
    var credentials = new msRestAzure.ApplicationTokenCredentials(clientId, tenantId, secret);

    var networkManagementClient = require('azure-arm-network');
    var computeManagementClient = require('azure-arm-compute');
    var resourceManagementClient = require('azure-arm-resource').ResourceManagementClient;
    var networkClient = new networkManagementClient(credentials, subscriptionId);
    var computeClient = new computeManagementClient(credentials, subscriptionId);
    var resourceClient = new resourceManagementClient(credentials, subscriptionId);

    /**
    * Lists all network interface configurations in this subscription
    *
    * @returns {Promise} A promise which can be resolved with a non-error response from Azure REST API
    */
    this.listAzNics = function () {
        return new Promise(
        function (resolve, reject) {
            networkClient.networkInterfaces.listAll(
            (error, data) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(data);
                }
            });
        });
    };

    /**
    * Lists all VMs in this subscription including its instance view data
    *
    * @returns {Promise} A promise which can be resolved with a non-error response from Azure REST API
    */
    this.listVmsWithInstanceView = function () {
        var deferred = q.defer();

        listVms()
        .then(function(data) {
            var vms = data;
            var vm;
            var promises = [];

            vms.forEach(function(vm) {
                var vmId = vm.id;
                var resourceGroupName = vmId.substring(vmId.lastIndexOf("resourceGroups/")+15, vmId.lastIndexOf("/providers"));
                var vmName = vm.name;
                promises.push(getVmWithInstanceView(resourceGroupName, vmName));
            });

            q.all(promises)
                .then(function(results) {
                    deferred.resolve(results);
                }).catch(function(err) {
                    deferred.reject(err);
                });
        });

        return deferred.promise;
    };

    /**
    * Power Off (deallocate) individual VM
    *
    * @param {string} resourceGroupName The name of the resource group.
    *
    * @param {string} vmName The name of the VM.
    *
    * @returns {Promise} A promise which can be resolved with a non-error response from Azure REST API
    */
    this.powerOffVm = function (resourceGroupName, vmName) {
        return new Promise(
        function (resolve, reject) {
            computeClient.virtualMachines.deallocate(resourceGroupName, vmName,
            (error, data) => {
                if (error) {
                    reject(error);
                }
                else {
                    console.log('VM Power Off (Deallocate) succeeded:', data);
                    resolve(data);
                }
            });
        });
    };

    /**
    * Lists all VMs in this subscription
    *
    * @returns {Promise} A promise which can be resolved with a non-error response from Azure REST API
    */
    var listVms = function () {
        return new Promise(
        function (resolve, reject) {
            computeClient.virtualMachines.listAll(
            (error, data) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(data);
                }
            });
        });
    };

    /**
    * List individual VMs and include instance View
    *
    * @param {string} resourceGroupName The name of the resource group.
    *
    * @param {string} vmName The name of the VM.
    *
    * @returns {Promise} A promise which can be resolved with a non-error response from Azure REST API
    */
    var getVmWithInstanceView = function (resourceGroupName, vmName) {
        // Add option to get instanceView
        var options = {'expand': 'instanceView'};
        return new Promise(
        function (resolve, reject) {
            computeClient.virtualMachines.get(resourceGroupName, vmName, options,
            (error, data) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(data);
                }
            });
        });
    };

    /**
    * Lists all deployments
    *
    * @returns {Promise} A promise which can be resolved with a non-error response from Azure REST API
    */
    this.listDeployments = function () {
        var deferred = q.defer();

        listResourceGroups()
        .then(function(data) {
            var rGs = data;
            var rG;
            var promises = [];

            rGs.forEach(function(rG) {
                var resourceGroupName = rG.name;
                promises.push(listDeploymentsByResourceGroup(resourceGroupName));
            });

            q.all(promises)
                .then(function(results) {
                    deferred.resolve(results);
                }).catch(function(err) {
                    deferred.reject(err);
                });
        });

        return deferred.promise;
    };

    /**
    * List all resource groups
    *
    * @returns {Promise} A promise which can be resolved with a non-error response from Azure REST API
    */
    var listResourceGroups = function () {
        return new Promise(
        function (resolve, reject) {
            resourceClient.resourceGroups.list(
            (error, data) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(data);
                }
            });
        });
    };

    /**
    * List all deployments in specific resource group
    *
    * @param {string} resourceGroupName The name of the resource group.
    *
    * @returns {Promise} A promise which can be resolved with a non-error response from Azure REST API
    */
    var listDeploymentsByResourceGroup = function (resourceGroupName) {
        return new Promise(
        function (resolve, reject) {
            resourceClient.deployments.listByResourceGroup(resourceGroupName,
            (error, data) => {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(data);
                }
            });
        });
    };

}

module.exports = azureRestProvider;

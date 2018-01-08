#!/usr/bin/nodejs


var http = require('http');
var URL = require('url');
var azureProvider = require('./azureProvider.js');

var httpPortNumber = 8800;
var httpDebug = true;

var httpRespond = function(res, data){
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200);
    res.write(JSON.stringify(data));
    res.end();
};

http.createServer(function(req, res){
    var aP = new azureProvider();
    var payloadRaw = '';
    var payloadRequest = {};
    var payloadResponse = {};
    var error = '';
    var promises = [];

    var url = req.url;
    var method = req.method;

    if (httpDebug) {console.log('Method:', method, 'URL:', url);}
    switch(method) {
        case 'GET':
            switch(url) {
                case '/interfaces':
                    promises.push(aP.listAzNics());
                    break;
                case '/vms':
                    promises.push(aP.listVmsWithInstanceView());
                    break;
                    case '/deployments':
                    promises.push(aP.listDeployments());
                    break;
                default:
                    payloadResponse = 'Error: incorrect GET URL';
            }
            break;
        case 'POST':
            req.on('data', function(data){
                payloadRaw += data;
            });
            req.on('end', function(){
                // Get Data first
                try {
                    payloadRequest = JSON.parse(payloadRaw);
                } catch(err) {
                    console.log('Payload Fetch Error:', err);
                    payloadResponse = err;
                    return;
                }
                switch(url) {
                    case '/interfaces':
                        // Insert correct call
                        break;
                    case '/vms':
                        // Insert correct call
                        break;
                    default:
                        payloadResponse = 'Error: incorrect POST URL';
                }
            });
            break;
        case 'PUT':
            req.on('data', function(data){
                payloadRaw += data;
            });
            req.on('end', function(){
                // Get Data first
                try {
                    payloadRequest = JSON.parse(payloadRaw);
                } catch(err) {
                    console.log('Payload Fetch Error:', err);
                    payloadResponse = err;
                    return;
                }
                switch(url) {
                    case '/interfaces':
                        // Insert correct call
                        break;
                    case '/vms':
                        promises.push(aP.powerOffVm(payloadRequest.resourceGroupName, payloadRequest.vmName));
                        break;
                    default:
                        payloadResponse = 'Error: incorrect PUT URL';
                }
            });
            break;
        case 'OPTIONS':
            payloadResponse = {};
            break;
    }
    Promise.all(promises)
    .then(function(results) {
        var actualResponse = results.length ? results[0] : payloadResponse;

        // Respond
        httpRespond(res, actualResponse);
    }).catch(function(err) {
        console.log('Promise Error:', err);
    });
}).listen(httpPortNumber);
console.log('Server is listening on port', httpPortNumber);
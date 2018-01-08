angular.module("siteRoutes", ["ngRoute", "httpControllers"])
.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "site/main.html",
        controller : "httpController"
    })
    .when("/vms", {
        templateUrl : "site/vms.html",
        controller : "httpController"
    })
    .when("/interfaces", {
        templateUrl : "site/interfaces.html",
        controller : "httpController"
    })
    .when("/deployments", {
        templateUrl : "site/deployments.html",
        controller : "httpController"
    });
});
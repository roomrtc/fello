/**
 * Created by Vunb on 24/1/2015.
 */

define(function (require) {
  var angular = require('angular')
    , Controllers = angular.module('controllers', []);

  Controllers.controller('angUserController', require('controllers/angUserController'));
  return Controllers;
});

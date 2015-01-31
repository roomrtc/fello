/**
 * Created by Vunb on 1/2/2015.
 */
angular.module('fello.dashboard').controller('LiveController', ['$scope', '$filter', function ($scope, $filter) {

  $scope.clients = [];

  var client1 = {
    name: "Vu Bao Nhu"
    , email: "vunb@fello.in"
    , messages: [
      "Hello bussiness!"
      , "Can i ask you a question ?"
    ]
  };

  $scope.clients.push(client1);

}]);

/**
 * Created by Vunb on 1/2/2015.
 */
angular.module('fello.dashboard').controller('LiveController', ['$scope', '$filter', 'CallService', function ($scope, $filter, callService) {

  var _init = function() {

    $scope.waitingClients = [];
    $scope.processingList = [];

    var now = new Date();

    var client1 = {
      name: "Vu Bao Nhu"        // required:
      , email: "vunb@fello.in"  // required:
      , messages: [{
        timeSent: new Date().setMilliseconds(now.getMilliseconds() - 10),
        timeReceived: new Date().setMilliseconds(now.getMilliseconds() - 20),
        message: "Hello bussiness!"
      }, {
        timeSent: new Date().setMilliseconds(now.getMilliseconds() - 10),
        timeReceived: new Date().setMilliseconds(now.getMilliseconds() - 10),
        message: "Can i ask you a question ?"
      }]
      , callId: 'thewqe15' // required: rtc_id used for call
      , uuid: 'ahgfdfghjh'  // --> identify to blocked
      , timeJoined: now
      , timeAccepted: now
      , timeEnd: now
      , isAgent: false  // required:
      , state : 'waiting(default)|processing|blocked|dropped|end' // required:

    };

    callService.init();
    callService.changeStateListener(function (waitingList, all) {

      $scope.waitingClients = waitingList;
    });


    $scope.accept = function(callId) {
      // make call
      callService.call(callId, null, null, function (accepted, clientId) {
        if (accepted) {
          var client = {
            name: clientId,
            email: "fake@1234.com"
            , timeAccepted: new Date()
            , isAgent: false
            , state: 'processing'
          };
          $scope.clients.push(client);
        }
      });
      alert('accepted: ' + false);
    };

    $scope.chat = function(callId) {
      // make call
    };

    $scope.deny = function(callId) {
      // make call
    };

    $scope.waitingClients.push(client1);
  };


  // init
  _init();

}]);

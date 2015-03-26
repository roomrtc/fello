/**
 * Created by Vunb on 3.26.2015.
 */
angular.module('fello.common')
  .factory('memo', ['$cookies', 'lodash', function ($cookies, _) {

    var memo = {};

    memo.getUsername = function () {
      //return $cookies.get('username');
      return $cookies.username;
    };

    memo.getUserEmail = function () {
      //return $cookies.get('useremail');
      return $cookies.useremail;
    };

    memo.saveUsername = function (username) {
      if (_.isEmpty(username)) {
        //$cookies.remove('username');
        delete $cookies.username;
      } else {
        //$cookies.put('username', username);
        $cookies.username = username;
      }
    };

    memo.saveUserEmail = function (email) {
      if (_.isEmpty(email)) {
        //$cookies.remove('useremail');
        delete $cookies.useremail;
      } else {
        //$cookies.put('useremail', email);
        $cookies.useremail = email;
      }
    };

    return memo;
  }]);

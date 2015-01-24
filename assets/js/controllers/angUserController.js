/**
 * Created by Vunb on 24/1/2015.
 */

define(function () {
  return ['$scope', '$http', function ($scope, $http) {
    function resetItem() {
      $scope.user = {
        username: ''
        , password: ''
        , email: ''
        , phone: ''
        , nickname: ''
      };
      $scope.displayForm = '';
    }

    // reset
    resetItem();

    $scope.addItem = function () {
      resetItem();
      $scope.displayForm = true;
    };


    $scope.saveItem = function () {
      var user = $scope.user;
      if (!user.id) {
        $http.get('/user/create?username=' + user.username + '&nickname=' + user.nickname + '&email=' + user.email + '&phone=' + user.phone + '&password=' + user.password)
          .success(function (data) {
            $scope.items.push(data);
            $scope.displayForm = '';
            removeModal();
          }).error(function (data, status, headers, config) {
            alert(data.summary);
          });
      }
      else {
        $http.get('/user/update/' + user.id + '?username=' + user.username + '&nickname=' + user.nickname + '&email=' + user.email + '&phone=' + user.phone + '&password=' + user.password)
          .success(function (data) {
            $scope.displayForm = '';
            removeModal();
          }).error(function (data, status, headers, config) {
            alert(data.summary);
          });
      }
    };

    $scope.editItem = function (data) {
      $scope.user = data;
      $scope.displayForm = true;
    };

    $scope.removeItem = function (data) {
      if (confirm('Do you really want to delete?')) {
        $http['delete']('/user/' + data.id).success(function () {
          $scope.items.splice($scope.items.indexOf(data), 1);
        });
      }
    };

    $http.get('/user/find').success(function (data) {
      for (var i = 0; i < data.length; i++) {
        data[i].index = i;
      }
      $scope.items = data;
    });

    function removeModal() {
      $('.modal').modal('hide');
    }

  }];
});

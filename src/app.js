"use strict";

angular.module('myApp',[]);

angular.module('myApp').service('AppModel', function($http) {

  this.tasks = [];
  this.description = '';
  this.isAuthenticated = false;
  this.isDirty = false;
  this.socket = null;
  this.user = null;

  this.getTasks = function(user) {

      $http.get('http://localhost:3000/real-time/api/v1/tasks', user)
          .then(function(response) {
              this.tasks = response.data;
          }.bind(this),
          function(response) {
            alert('An error occurred. ' + response.data.message);
          });

  };

  this.createTask = function(task) {
    $http.post('http://localhost:3000/real-time/api/v1/tasks', task)
      .then(function(response) {
          task = _.merge(task, response.data);
          this.tasks.push(task);
          this.description = '';
        }.bind(this),
        function(response) {
          alert('An error occurred. ' + response.data.message);
        });
  };

  this.updateTask = function(task, forceUpdate) {
    if (!this.isDirty && !forceUpdate) {
      this.unlockTask(task);
      return;
    }
    this.isDirty = false;
    $http.put('http://localhost:3000/real-time/api/v1/tasks/' + task.id, task)
      .then(function(response) {
          this.unlockTask(task);
          task = _.merge(task, response.data);
        }.bind(this),
        function(response) {
          alert('An error occurred. ' + response.data.message);
        });
  };

  this.deleteTask = function(taskId) {
    $http.delete('http://localhost:3000/real-time/api/v1/tasks/' + taskId)
      .then(function(response) {
          this.tasks = _.remove(this.tasks, function(task) {
            return task.id !== taskId;
          });
        }.bind(this),
        function(response) {
          alert('An error occurred. ' + response.data.message);
        });
  };


  this.changeTaskStatus = function(task) {
    this.updateTask(task, true);
  };

  this.login = function() {
    $http.post('http://localhost:3000/real-time/api/v1/login', { email: this.email, password: this.password })
      .then(function(response) {
          this.isAuthenticated = true;
          this.user = response.data;
          $http.defaults.headers.common.Authorization = this.user.authorization;
          this.getTasks();
        }.bind(this),
        function(response) {
          alert('An error occurred. ' + response.data.message);
        });
  }


});

angular.module('myApp').controller('MainController', ['AppModel', function(AppModel) {
    this.model = AppModel;
}]);

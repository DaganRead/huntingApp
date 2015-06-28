app.directive("gantt", function(socket, $timeout, $window) {
  return {
    restrict: 'E',
    templateUrl: '/directives/templates/ganttDirective.html',
    scope:false,
    link: function(scope, elements, attrs) {
      var userData = JSON.parse(localStorage['userData']),
          projectId = socket.project(),
          projectIndex = 0;
      userData.projects.every(function(element, index, array) {
        if (element.id === projectId) {
          projectIndex = index;
          return false;
        } else{
          return true;
        };
      });
      //alert(socket.project(null));
      scope.tasks = [
        {"startDate":new Date(), "endDate":new Date(), "taskName":"demo", "componentName":"E Job","creativesAssigned":"Dagan" ,"status":"RUNNING"}
      ];

        var taskStatus = {
            "RUNNING" : "bar-running",
            "OVERDUE" : "bar-overdue",
            "COMLPLETE" : "bar-complete"
        };
        scope.components = [];

        scope.tasks.sort(function(a, b) {
            return a.endDate - b.endDate;
        });
        var maxDate = scope.tasks[scope.tasks.length - 1].endDate;
        scope.tasks.sort(function(a, b) {
            return a.startDate - b.startDate;
        });
        var minDate = scope.tasks[0].startDate,
            format = "%H:%M",
            timeDomainString = "1day",
            gantt = d3.gantt().taskTypes(scope.components).taskStatus(taskStatus).tickFormat(format),
            margin = {
              top : 20,
              right : 40,
              bottom : 20,
              left : 80
            };

        gantt.margin(margin);

        gantt.timeDomainMode("fixed");

        gantt(scope.tasks);

        var getEndDate = function() {
            var lastEndDate = Date.now();
            if (scope.tasks.length > 0) {
          lastEndDate = scope.tasks[scope.tasks.length - 1].endDate;
            }

            return lastEndDate;
        };
        var changeTimeDomain = function (timeDomainString) {
            this.timeDomainString = timeDomainString;
            switch (timeDomainString) {
              case "6hr":
                format = "%H:%M";
                gantt.timeDomain([ d3.time.hour.offset(getEndDate(), -6), getEndDate() ]);
                break;

              case "1day":
                format = "%H:%M";
                gantt.timeDomain([ d3.time.day.offset(getEndDate(), -1), getEndDate() ]);
                break;

              case "1week":
                format = "%a %H:%M";
                gantt.timeDomain([ d3.time.day.offset(getEndDate(), -7), getEndDate() ]);
                break;

              case "2week":
                format = "%a %H:%M";
                gantt.timeDomain([ d3.time.day.offset(getEndDate(), -14), getEndDate() ]);
                break;

              default:
                format = "%H:%M"

              }
            gantt.tickFormat(format);
            gantt.redraw(scope.tasks);
        };
        changeTimeDomain(timeDomainString);
        scope.changeTimeD = function(timeDomainString) {
          changeTimeDomain(timeDomainString);
        };
        scope.taskAddModalEnter = function() {
            scope.$root.$broadcast('taskAddModalWindowOpen');
        };
        scope.addTask = function() {

            var lastEndDate = getEndDate(),
                taskStatusName = 'RUNNING',
                creativesAssigned = scope.newTask.creativesAssigned,
                componentName = scope.newTask.componentName,
                taskName = scope.newTask.taskName;
                
            scope.tasks.push({
              "startDate" : scope.newTask.startDate,
              "endDate" : scope.newTask.endDate,
              "taskName" : taskName,
              "componentName" : componentName,
              "creativesAssigned" : creativesAssigned,
              "status" : taskStatusName
            });

            scope.$root.$broadcast('taskAddModalWindowClose');
            $timeout(function() {gantt.redraw(scope.tasks);}, 450);

            scope.project.components = scope.components;
            scope.project.tasks = scope.tasks;
            socket.emit('restricted', 'request projectUpdate', scope.project);

            scope.newTask = {
                addComponentName:"",
                componentName:"",
                taskName:"",
                startDate:"",
                endDate:"",
                creativesAssigned:[]
              };
            console.log('userData in add task before');
            console.log(userData);
            userData.projects[projectIndex] = scope.project;
            console.log('userData in add task here');
            console.log(userData);
            localStorage['userData'] = JSON.stringify(userData);
            console.log('userData in add task here');
            console.log(JSON.parse(localStorage['userData']));

            
        };
        scope.removeTask = function(taskName) {
            scope.tasks.every(function(element, index, array) {
              if (element.taskName === taskName) {
                scope.tasks.splice(index, 1);
                scope.project.tasks = scope.tasks;
                userData.projects[projectIndex].tasks = scope.tasks;
                localStorage['userData'] = JSON.stringify(userData);
                socket.emit('restricted', 'request projectUpdate', scope.project);
                return false;
              } else{
                return true;
              };
            });
            gantt.redraw(scope.tasks);
        };
        scope.removeTask("demo");
        scope.confirmTask = function(taskName) {
          console.log(taskName);
          gantt.redraw(scope.tasks);
        };
        scope.$root.$on('gantt redraw', function() {


          scope.project.tasks.forEach(function (element, index, array) {
            console.log(element);
            var lastEndDate = getEndDate();
            scope.tasks.push({
              "startDate" : new Date(element.startDate),
              "endDate" : new Date(element.endDate),
              "taskName" : element.taskName,
              "componentName" : element.componentName,
              "creativesAssigned" : element.creativesAssigned,
              "status" : element.status
            });
          });
          scope.project.components.forEach(function (element, index, array) {
            console.log(element);
            scope.components.push(element);
          });
          console.log('gantt redrap scope');
          console.log(scope.tasks);
          console.log(scope.components);
          gantt.redraw(scope.tasks);
        });
        scope.addComponent = function(componentName) {
          scope.components.push(componentName);
          scope.newTask.componentName = scope.components[scope.components.length-1];
          scope.newTask.addComponentName = '';
          gantt.redraw(scope.tasks);
        };
        /*
        scope.$watch(function(){
           return $window.innerWidth * $window.innerHeight;
        }, function(value) {
          console.log(elements[0].childNodes[0]);
           gantt.resize(elements[0].childNodes[0], scope.tasks);
       });*/
        window.onresize = function() {
           gantt.resize(elements[0].childNodes[0], scope.tasks);
       };

    }
  };
});
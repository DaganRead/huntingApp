app.directive("portfolio", function(socket, upload, ms, filterFilter) {
  return {
    restrict: 'E',
    templateUrl: '/directives/templates/portfolioDirective.html',
    scope: false,
    link: function(scope, elements, attrs) {
      scope.uploads = [];
      scope.controllerPlaceholder = false;
      scope.portfolioController = 'Current Projects';
      scope.filteredProjects = filterFilter(scope.userData.projects, function(value, index){
          if(value.status == 'running'){
            //alert('found file' + value.name);
            return true
          };
        });
        if (scope.userData.projects == undefined) {
          scope.userData.projects = [];
        }    
/*      if (localStorage['userData']) {
        var newData = JSON.parse(localStorage['userData']);
        console.log(" portfolio localStorage exists");
        console.log(newData);
        scope.filteredProjects = filterFilter(scope.userData.projects, function(value, index){
          if(value.status == 'running'){
            //alert('found file' + value.name);
            return true
          };
        });
        if (scope.userData.projects == undefined) {
          scope.userData.projects = [];
        }       
      } else{
        console.log(" portfolio localStorage does not exist");
        socket.emit('restricted', 'request portfolio', localStorage['token']);
      };*/

      socket.on('restricted', 'recieve portfolio',function(data) {
        var newData = JSON.parse(data);
        console.log(newData);
        scope.userData.projects = newData.projects;
        scope.filteredProjects = filterFilter(scope.userData.projects, function(value, index){
          if(value.status == 'running'){
            //alert('found file' + value.name);
            return true
          };
        });
        if (scope.userData.projects == undefined) {
          scope.userData.projects = [];
        }    	  
        console.log(scope.userData.projects);
      });

      socket.on('restricted', 'recieve portfolioUpdate',function(project) {
        scope.userData.projects.push(project);
        console.log(scope.userData.projects);
        var oldData = JSON.parse(localStorage['userData']);
        oldData.projects = scope.userData.projects; 
        scope.filteredProjects = filterFilter(scope.userData.projects, function(value, index){
          if(value.status == 'running'){
            //alert('found file' + value.name);
            return true
          };
        });
        localStorage['userData']= JSON.stringify(oldData);
        console.log('updated portfolio localStorage');
        console.log(localStorage['userData']);
        scope.$root.$broadcast('portfolioCropModalWindowClose');
      });


    /*Bubbles
        var chart, render_vis, display_all, display_year, toggle_view, update;
        chart = null;
        render_vis = function(csv) {
          console.log(csv);
          chart = new BubbleChart(csv);
          chart.start();
          return chart.display_group_all();
        };
        update = function(csv) {
          chart.update_vis(csv);
          chart.start();
          return chart.display_group_all();
        };
        //d3.csv("data/gates_money_current.csv", render_vis);
        render_vis(scope.userData.projects);
*/
      document.getElementById('portfolioDropZone').addEventListener("drop", function(event){
        event.preventDefault();
         console.log(event);
        if ('dataTransfer' in event) {
          var files = event.dataTransfer.files;
        } else if('originalTarget' in event){
          var files = event.originalTarget.files;
        }else if('target' in event){
          var files = event.target.files;
        }else{
          var files = event.files;
        };
        for(var i=0; i<files.length; i++){
          scope.uploads.push([ms.sealer("portfolio" + i, files[i].name), files]);
        };
      }, false);
      //3
      document.getElementById('portfolioDrop').addEventListener("change", function(event){
        event.preventDefault();
        if ('dataTransfer' in event) {
          var files = event.dataTransfer.files;
        } else if('originalTarget' in event){
          var files = event.originalTarget.files;
        }else if('target' in event){
          var files = event.target.files;
        }else{
          var files = event.files;
        };        console.log(files);
        for(var i=0; i<files.length; i++){
          scope.uploads.push([ms.sealer("portfolio" + i, files[i].name), files]);
        };
      }, false);
        upload.listenOnInput(document.getElementById('portfolioDrop'));
        upload.listenOnDrop(document.getElementById('portfolioDropZone'));
      scope.changeData = function(expressionArg) {
        scope.filteredProjects = filterFilter(scope.userData.projects, function(value, index){
          if(value.status == expressionArg){
            return true
          };
        });
      };
      /*scope.changeData = function(value) {
        if (value == "Current Projects") {
          d3.csv("data/gates_money_current.csv", update);
          scope.controllerPlaceholder = false;
        } else if (value == "Portfolio"){
          if (scope.controllerPlaceholder) {
            chart.display_group_all();
          }else{
            d3.csv("data/gates_money.csv", update);
            scope.controllerPlaceholder = true;
          }
        } else{
          chart.display_by_year();
        }
      };*/
    }
  };
});
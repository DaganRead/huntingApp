app.directive("portfolioProject", function(socket, upload, ms, utils, filterFilter) {
  return {
    restrict: 'E',
    templateUrl: '/directives/templates/portfolioProjectDirective.html',
    scope:false,
    replace:true,
    link: function(scope, elements, attrs) {
      console.log('portfolioProject');
      console.log(scope.portfolioProject);
  scope.largerViewModalWindow = {
    html: '<img src="">',
    title:'',
    use : 'largerViewModalWindow'
  };  

  socket.on('restricted', 'recieve blab',function(data) {
    console.log(data);
  });
  
  scope.largerView = function(file){
    scope.largerViewModalWindow.html = '<section id="largerView" ng-style="{\'background-image\':\'url('+file.dataURI+')\'}" ></section>';
    scope.largerViewModalWindow.title = file.filename;
    scope.$root.$broadcast('largerViewModalWindowOpen');
  };
  scope.largerViewVideo = function(file){
    scope.largerViewModalWindow.html = '<video src="'+file.dataURI+'" controls></video>';
    scope.largerViewModalWindow.title = file.filename;
    scope.$root.$broadcast('largerViewModalWindowOpen');
  };
  scope.removeFile = function(file){
    scope.filteredPortfolioProjects = filterFilter(scope.portfolioProject.files, function(value, index){
      if(value.filename == file){
        console.log('found file' + value.filename);
        return false
      };
      return true
    });
    scope.portfolioProject.files = scope.filteredPortfolioProjects; 
    scope.portfolioProject.files.every(function(element, index, array) {
      console.log(element);
      delete element['$$hashKey'];
      console.log(element);
    });
    var data = {
      token:localStorage['token'],
      project:scope.portfolioProject
    };
    socket.emit('restricted', 'request portfolioFilesUpdate', data);
  };
  /*Find upload inputs 
  console.log('attach to this');
      var log = [];
      angular.forEach(elements.find('input'), function(value, key) {
        if (value.id === 'portfolioProjectDrop') {
          log.push(value);
        };
      }, log);
      angular.forEach(elements.find('label'), function(value, key) {
        if (value.id === 'portfolioProjectDrop') {
          log.push(value);
        };
      }, log);
      */
  document.getElementById('portfolioProjectDropZone').addEventListener("drop", function(event){
        event.preventDefault();
        if ('dataTransfer' in event) {
          var files = event.dataTransfer.files;
        } else if('originalTarget' in event){
          var files = event.originalTarget.files;
        } else if('target' in event){
          var files = event.target.files;
        }else{
          var files = event.files;
        };
        for(var i=0; i<files.length; i++){
          scope.uploads.push([ms.sealer("pProject" + i, files[i].name), files]);
        };
      }, false);
      //3
      document.getElementById('portfolioProjectDrop').addEventListener("change", function(event){
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
          scope.uploads.push([ms.sealer("pProject" + i, files[i].name), files]);
        };
      }, false);
        upload.listenOnInput(document.getElementById('portfolioProjectDrop'));
        upload.listenOnDrop(document.getElementById('portfolioProjectDropZone'));
    }
  };
});
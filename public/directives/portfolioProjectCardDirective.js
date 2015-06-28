app.directive("portfolioProjectCard", function(socket) {
  return {
    restrict: 'E',
    templateUrl: '/directives/templates/portfolioProjectCardDirective.html',
    scope:false,
    replace:true,
    link: function(scope, elements, attrs) {
        scope.saveCard = function (){
        var data = {
          token:localStorage['token'],
          project:scope.portfolioProject
        };
        socket.emit('restricted', 'request portfolioCardUpdate', data);
        scope.userData.projects.every(function(element, index, array) {
                                if (element.id === scope.portfolioProject.id) {
                                    console.log(index);
                                    scope.userData.projects[index].title = scope.portfolioProject.title;
                                    scope.userData.projects[index].description = scope.portfolioProject.description;
                                    return false;
                                  } else{
                                    return true;
                                  };
                              });
        localStorage['userData'] = JSON.stringify(scope.userData);
      };
      scope.removeProject = function () {
        console.log('called removeProject socket emit');
        var data = {
          token : localStorage['token'],
          project : scope.portfolioProject
        };
        socket.emit('restricted', 'request projectRemove', data); 
      };
    }
  };
});
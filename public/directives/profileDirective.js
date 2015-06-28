app.directive("profile", function(socket, upload, ms, $timeout) {
  return {
    restrict: 'E',
    replace:true,
    templateUrl: '/directives/templates/profileDirective.html',
    scope: false,
    link: function(scope, elements, attrs) {
     /* if (localStorage['userData']) {
        var newData = JSON.parse(localStorage['userData']);
        console.log(newData);
          scope.user = newData;
      } else{
        socket.emit('restricted', 'request profile', localStorage["token"]);
      };
        socket.on('restricted', 'recieve profile',function(data) {
          var newData = JSON.parse(data);
          scope.user = newData;
        });*/
      socket.on('restricted', 'recieve profileUpdated',function(fileName) {
          console.log("profile updated successfully");
          //scope.profileUpdated = true;
      });
      scope.uploads = [];
        socket.on('public', 'upload complete',function(event) {
        for(var i=0; i<scope.uploads.length; i++){
          var uploadedFileName = event.file.name,
          files = scope.uploads[i][1]; 
          console.log(scope.uploads[i][0].username);
          if(ms.unsealer(scope.uploads[i][0], uploadedFileName)){
            if (scope.uploads[i][0].username === 'avatar'+i) {
              console.log('upload complete');
              console.log(files);
              scope.$root.$broadcast('profileModalWindowSwap');
              $timeout(function() {scope.$root.$broadcast('crop avatar', files);}, 300);
            };
          };
        };
        scope.uploads = []; 
      });
      socket.on('restricted', 'recieve avatarSaved',function(fileName) {
        scope.user.avatar = fileName;
        scope.$root.$broadcast('avatarCropModalWindowClose');
      });

      document.getElementById('avatar_drop_zone2').addEventListener("drop", function(event){
        event.preventDefault();
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
          scope.uploads.push([ms.sealer("avatar" + i, files[i].name), files]);
          console.log(scope.uploads);
        };
      }, false)
      document.getElementById('avatarOverlay').addEventListener("drop", function(event){
        event.preventDefault();
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
          scope.uploads.push([ms.sealer("avatar" + i, files[i].name), files]);
          console.log(scope.uploads);
        };
      }, false);
      //3
      document.getElementById('avatar_drop2').addEventListener("change", function(event){
        event.preventDefault();
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
          scope.uploads.push([ms.sealer("avatar" + i, files[i].name), files]);
          console.log('scope.upload');
          console.log(files);
        };
      }, false);

      upload.listenOnInput(document.getElementById('avatar_drop2'));
      upload.listenOnDrop(document.getElementById('avatar_drop_zone2'));
      upload.listenOnDrop(document.getElementById('avatarOverlay'));

      scope.submit = function() {
        var data = scope.user;
        data['token'] = localStorage["token"];
        console.log(data);
          socket.emit('restricted', 'request profileUpdate',data);
          localStorage["userData"] = JSON.stringify(scope.user);
          scope.$root.$broadcast('profileModalWindowClose');
      };
    }
  };
});
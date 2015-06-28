/*
*	Marketplace directive
*/
app.directive('marketPlace', function(socket, $filter){
  return {
    restrict: 'E',
    replace: true,
    templateUrl: '/directives/templates/marketPlaceDirective.html',
    scope : {
    	tagFilter : "&"
    },
  	link: function(scope, element, attrs) {
  		scope.filterUpdate = function (value) {
  			tagFilter = value;
  			console.log(tagFilter);
  		}
      scope.offerings = [
          {
            _id:'123',
            price:'10',
            creator: 'dagan',
            samplefiles : ['jobListing.svg'],
            tagFilter:'article'
          },
          {
            _id:'1234',
            price:'10',
            creator: 'dagan',
            samplefiles : ['jobListing.svg'],
            tagFilter:'project'
          },
          {
            _id:'12345',
            price:'10',
            creator: 'dagan',
            samplefiles : ['jobListing.svg'],
            tagFilter:'service'
          },
          {
            _id:'123456',
            price:'10',
            creator: 'dagan',
            samplefiles : ['jobListing.svg'],
            tagFilter:'article'
          }
        ];
      /*
		socket.emit('public', 'request dashboard');
		socket.on('public', 'recieve dashboard', function(data) {
		    
		    //scope.$digest();
		});
	*/
    }
  }
})

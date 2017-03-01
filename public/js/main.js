var app = angular.module('app', ['ngRoute','ngSanitize', 'ngImgCrop', 'ui.bootstrap.datetimepicker', 'checklist-model']);
app.constant('levelAuthorisation', { levelAuthority : '' });
app.config(function($routeProvider, $locationProvider, levelAuthorisation){

	/*	use the HTML5 History API	*/
	$locationProvider.html5Mode(true);

	/*	Router	*/
	$routeProvider
		.when('/',
		{
			controller:'landingPage',
			templateUrl:'views/landingPage.html'
		})
		.when('/:username', 
                {   
                    controller:'dashboard', 
                    templateUrl: function(){
						switch (levelAuthorisation.levelAuthority) {
						  case "admin":
						    return 'views/'+levelAuthorisation.levelAuthority+'/profile.html';
						    break;
						  case "client":
						    return 'views/'+levelAuthorisation.levelAuthority+'/profile.html'
						    break;
						  case "mentor":
						    return 'views/'+levelAuthorisation.levelAuthority+'/profile.html';
						    break;
						  case "creative":
						    return 'views/'+levelAuthorisation.levelAuthority+'/portfolio.html';
						    break;
						    default:
						    return 'views/error.html';
						}
                    }
                }
            )
		.when('/projects/:title',
		{   
                    controller:'project', 
                    templateUrl: function(){
						switch (levelAuthorisation.levelAuthority) {
						  case "admin":
						    return 'views/'+levelAuthorisation.levelAuthority+'/project.html';
						    break;
						  case "client":
						    return 'views/'+levelAuthorisation.levelAuthority+'/project.html'
						    break;
						  case "mentor":
						    return 'views/'+levelAuthorisation.levelAuthority+'/project.html';
						    break;
						  case "creative":
						    return 'views/'+levelAuthorisation.levelAuthority+'/project.html';
						    break;
						    default:
						    return 'views/error.html';
						}
                    }
                })
		.when('/portfolio/:title',
		{   
                    controller:'portfolioProject', 
                    templateUrl: function(){
						switch (levelAuthorisation.levelAuthority) {
						  case "admin":
						    return 'views/'+levelAuthorisation.levelAuthority+'/portfolioProject.html';
						    break;
						  case "client":
						    return 'views/'+levelAuthorisation.levelAuthority+'/portfolioProject.html'
						    break;
						  case "mentor":
						    return 'views/'+levelAuthorisation.levelAuthority+'/portfolioProject.html';
						    break;
						  case "creative":
						    return 'views/'+levelAuthorisation.levelAuthority+'/portfolioProject.html';
						    break;
						    default:
						    return 'views/error.html';
						}
                    }
                })
		.when('/admin/dashboard',
		{
			controller:'adminDashboard',
			templateUrl:'views/admin/dashboard.html'
		})
		.when('/mentor/dashboard',
		{
			controller:'mentorDashboard',
			templateUrl:'views/mentor/dashboard.html'
		})
		.when('/creative/dashboard',
		{
			controller:'creativeDashboard',
			templateUrl:'views/mentor/dashboard.html'
		})
		.when('/error',
		{
			controller:'error',
			templateUrl:'views/error.html'
		})
		.otherwise({ redirectTo: '/error' });
});
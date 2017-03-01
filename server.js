var express = require('express'),
	app = express(),
	http = require('http'),
	scrypt = require("./lib/scrypt.js"),
	mailbot = require('./lib/email.js'),
	tokenGenerator = require('./public/js/createToken.js'),
	tokenGetter = require('./public/js/getDataFromToken.js'),
	SocketIOFileUploader = require('socketio-file-upload'),
	server = http.createServer(app),
	databaseUrl = process.env.OPENSHIFT_MONGODB_DB_USERNAME + ":" +  process.env.OPENSHIFT_MONGODB_DB_PASSWORD + "@" +  process.env.OPENSHIFT_MONGODB_DB_HOST + ':' +  process.env.OPENSHIFT_MONGODB_DB_PORT + '/' +  process.env.OPENSHIFT_APP_NAME,
	collections = ["users", "projects", "messages","external", "talk", "reports", "creativeapplications", "offerings", "orders", "invoices"],
	mongojs = require("mongojs"),
	db = mongojs.connect(databaseUrl, collections),
	io = require('socket.io').listen(server),
	tempUsername = "Dagan",
	tempPassword = "Pass123",
	tempEmail = "daganread@gmail.com",
	enableEmail = true,
	ip  = process.env.OPENSHIFT_NODEJS_IP,
	port    = parseInt(process.env.OPENSHIFT_NODEJS_PORT),
	redisCloud = {
	  'host' : process.env.OPENSHIFT_REDIS_HOST,
	  'port' : process.env.OPENSHIFT_REDIS_PORT,
	  'password' : process.env.REDIS_PASSWORD
	},
	redis = require("redis"),
	login,
	run = 0,
	secret = 'longasshashtobeusedassalt',
	developement = false;


	if(typeof(redisCloud.host) !== "undefined"){
	  var client = redis.createClient(
	      redisCloud.port,
	      redisCloud.host, {
	        auth_pass: redisCloud.password
	  });
	  client.on("error", function (err) {
		  console.log("Error " + err);
		});
	};
 
	if (typeof ip === "undefined") {
    	console.log('No OPENSHIFT_NODEJS_IP environment variable');
  	};
console.log(databaseUrl);
console.log(redisCloud);
/* Start the server */

    if (developement) {
		server.listen(8000);
	} else{
		server.listen(port, ip);	
	};
	app.use(SocketIOFileUploader.router);
	app.use(express.static(__dirname + '/public'));
	app.use(express.static(__dirname + '/content'));
	app.use(express.static(__dirname + '/bower_components'));

  app.get('/', function(req,res) {
    res.sendfile(__dirname + '/index.html');
  });

/*	Socket.io Namespaces	*/
/*
*	Public Communication Chanels
*/
var public = io
  .of('/public')
  .on('connection', function (socket) {
  	socket.on('request data', function(data) {

  	});
 /*
 *	Login
 */
 socket.on('request login', function(newuser) {
 	var encrypted = scrypt.crypto_scrypt(scrypt.encode_utf8(secret), scrypt.encode_utf8(newuser.password), 128, 8, 1, 32);
	var encryptedhex = scrypt.to_hex(encrypted);		
  	//finds users in the database that have the same username already
	db.users.find({username: newuser.username}, function(err, users){
		if ( err || !users) { 
			console.log("DB error"); 
			public.to(socket.id).emit('request error');
		} else {
			console.log(users);

			if (users.length == 1) {
				console.log("DB User Found.");
				
				if (users[0].password == encryptedhex) {
					//match!
					console.log("User matched");
					tokenGenerator.createToken(function (error, token) {
						if (error === null) {
							var encryptedToken = scrypt.crypto_scrypt(scrypt.encode_utf8(secret), scrypt.encode_utf8(token), 128, 8, 1, 32);
							var encryptedTokenhex = scrypt.to_hex(encryptedToken);
							var returnData = users[0];
							delete returnData.password;
							/*sudo*/
							//delete returnData.projects;
							//console.log(JSON.stringify(returnData));
						    client.set(encryptedTokenhex, JSON.stringify(returnData), function(err, reply) {
						        if (err) {
						        	console.log('token not sent or stored!'+err);
						        }else if (reply) {
						            client.expire(encryptedTokenhex, 86400, function(error, success) {
						                if (error) {
						                	console.log('token not sent or ttl set!');

						                }else if (success) {
						                    console.log('token sent and stored!');
						                    public.to(socket.id).emit('recieve token', token);
						                }
						                else {
						                    console.log(new Error('Expiration not set on redis'));
						                }
						            });
						        }else {
						            console.log(new Error('Token not set in redis'));
						        }
						    });
						}else{
							console.log('requested error token');
							public.to(socket.id).emit('request error');
						}
					});
				} else {
					//username exists
					//password wrong
					public.to(socket.id).emit('request error');
				}


			} else {
			//ERROR NOT FOUND
			public.to(socket.id).emit('request error');
			}
		}
	});
});

/*
*	Public File avatar_uploader
*/
// Make an instance of SocketIOFileUploader and listen on this socket:
    var avatarServerUploader = new SocketIOFileUploader();
    avatarServerUploader.dir = "./public/uploads/";
    avatarServerUploader.listen(socket);

    // Do something when a file is saved:
    avatarServerUploader.on("saved", function(event){
    	console.log(event.file.name);
    	public.to(socket.id).emit('upload complete', event);
    	//get clients security token and send event data to be saved
        //public.to(socket.id).emit('recieve avatar', event.file.name);

    });

    // Error handler:
    avatarServerUploader.on("error", function(event){
        console.log("Error from avatarServerUploader", event);
    });
	console.log('new connection on public');
	console.log(socket.id);
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
  });
/*
*	Private Communication Chanels
*/
var restricted = io
	.of('/restricted')
	.on('connection', function (socket) {
/*	Restrict communication	*/
		socket.auth = false;
		delete restricted.connected[socket.id];

		socket.on('authenticate', function(data){
			var encryptedToken = scrypt.crypto_scrypt(scrypt.encode_utf8(secret), scrypt.encode_utf8(data.token), 128, 8, 1, 32),
				encryptedTokenhex = scrypt.to_hex(encryptedToken),
				limit = 0;
			//check the auth data sent by the client
			client.get(encryptedTokenhex, function(err, userData) {
		    	if (err) {
		    		console.log('Token not found. Disconnecting socket '+ socket.id);
		    		//restricted.to(socket.id).emit('recieve reauth');
		    		socket.disconnect();
		    	}else if (userData != null) {
					restricted.connected[socket.id] = socket;
					var returnData  = JSON.parse(userData);
					returnData.redirect = data.redirect;
					restricted.to(socket.id).emit('recieve login', returnData);
	        		console.log('new connection on restricted:8000');
		    	};
		    });
		});
		
		socket.on('request logout', function(token){
			var encryptedToken = scrypt.crypto_scrypt(scrypt.encode_utf8(secret), scrypt.encode_utf8(token), 128, 8, 1, 32);
			var encryptedTokenhex = scrypt.to_hex(encryptedToken);
			client.del(token);
			
		});
	});

/**************************************************************************************************************************************/
		socket.on('disconnect', function(){
			console.log('user disconnected from restricted');
		});
	});
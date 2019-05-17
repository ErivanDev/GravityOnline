// Based off of Shawn Van Every's Live Web
// http://itp.nyu.edu/~sve204/liveweb_fall2013/week3.html

// Using express: http://expressjs.com/
var express = require('express');
// Create the app
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use(express.static('main'));

// Set up the server
// process.env.PORT is related to deploying on heroku
var server = app.listen(process.env.PORT || 8081, listen);
server.lastID = 0;

// This call back just tells us that the server has started
function listen() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at http://' + host + ':' + port);
}

var locais = [
  { x : 420, y: 400, dist: 95},
  { x : 746, y: 134, dist: 85},
  { x : 746, y: 534, dist: 85},
  { x : 946, y: 334, dist: 95}
]

// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io')(server);

var planets = [];

var run = false;
// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',function (socket) {  // We are given a websocket object in our function
  
    // console.log("We have a new client: " + socket.id);
    planets = [
      { pos: { x: -400, y:  100 } , radius: 75, mass: 750},
      { pos: { x:  200, y:  160 } , radius: 75, mass: 750},
      { pos: { x: -100, y: -100 } , radius: 75, mass: 750},
      { pos: { x:  300, y: -200 } , radius: 75, mass: 750}
    ];

    socket.emit('connect', socket.id );

    socket.player = { 
      id: server.lastID++, 
      x: planets[server.lastID % 4].pos.x, 
      y: planets[server.lastID % 4].pos.y, 
      giro: 4.71, 
      dist: locais[server.lastID % 4].dist,
      shooting: false,
      shooter: {
        x1: 0, 
        y1: 0,
        x2: 0,
        y2: 0, 
        R: 0,
        G: 0,
        B: 0,
        currentMouse: {
          x: 0,
          y: 0
        }
      },
      arrow: null
    };

    // this example takes 2 seconds to run
    // var last = Date.now();

    function myFunc() {
      var players = getAllPlayers();

      for(var i=0; i<players.length; i++){
        if(players[i].arrow != null){
          // console.log(players[i].arrow);
          for (var j = 0; j < planets.length ; j++) {
            players[i].arrow.orbit(planets[j]);
          }  
          players[i].arrow.newton();
          players[i].arrow.way();
        }
      }
    //   // while(Date.now() - last < 1000/20){
    //   //   //nothing
    // console.log((getAllPlayers()).length);
      io.sockets.emit('currentPlayers', getAllPlayers() );
      // io.sockets.emit('currentShooter', getAllPlayers() ); //socket.player.shooter );
      // io.sockets.emit('currentArrow', getAllPlayers() );
    }
      

    //   var millis = Date.now() - last;
    //   console.log(millis);
    //   last = Date.now();

    if(run == false){ setInterval(myFunc, 1000/30);
      run = true;
    }
    //   io.sockets.emit('currentPlayers', getAllPlayers() );
    //   // setImmediate(myFunc, 1000/10);
    //   // io.sockets.emit('currentShooter', getAllPlayers() ); //socket.player.shooter );
    //   // io.sockets.emit('currentArrow', getAllPlayers() );
    // 

    // io.sockets.emit('currentPlayers', getAllPlayers() );
  
    // When this user emits, client side: socket.emit('otherevent',some data);
    // socket.on('mouse', function(data) {
    //     io.sockets.emit('mouse', data);
    //   }
    // );

    socket.on('keyPressed', function(data) {
        socket.player.giro += data ;
        // io.sockets.emit('currentPlayers', getAllPlayers() );
        // console.log(data);
      }
    );

    socket.on('mouseNoPress', function(data) {
      if(socket.player.shooting){
        var alpha = 0, dir = { x: 0, y: 0 };

        if (socket.player.shooter.force > 1) {
          if (socket.player.shooter.x1 != socket.player.shooter.x2) {
            alpha = Math.atan(Math.abs((socket.player.shooter.y2 - socket.player.shooter.y1)) / Math.abs((socket.player.shooter.x2 - socket.player.shooter.x1)));
            socket.player.shooter.force_x = socket.player.shooter.force * Math.cos(alpha);
            socket.player.shooter.force_y = socket.player.shooter.force * Math.sin(alpha);
          } else {
            socket.player.shooter.force_x = 0;
            socket.player.shooter.force_y = socket.player.shooter.force;
          }	

          if (socket.player.shooter.x2 < socket.player.shooter.x1) {
            
            if(socket.player.shooter.y2 < socket.player.shooter.y1) dir = { x: 1, y: 1 };
            else dir = { x: 1, y: -1 };

          } else {
            
            if(socket.player.shooter.y2 < socket.player.shooter.y1) dir = { x: -1, y: 1 };
            else dir = { x: -1, y: -1 }
          }
          // console.log("go");

          socket.player.arrow = new Arrows(socket.player.shooter.x2, 
                                          socket.player.shooter.y2, 
                                          (dir.x * socket.player.shooter.force_x),
                                          (dir.y * socket.player.shooter.force_y),
                                          socket.player.shooter.R,
                                          socket.player.shooter.G,
                                          socket.player.shooter.B,
                                          10);

        }
      }
      socket.player.shooting = data;
    });

    socket.on('mousePress', function(data) {
      socket.player.shooter.currentMouse.x = data.x;
      socket.player.shooter.currentMouse.y = data.y;

      if((!socket.player.shooting)) {
        socket.player.shooting = true;

        var pos = {
                    x: socket.player.x + (Math.cos(socket.player.giro) * (socket.player.dist)),
                    y: socket.player.y + (Math.sin(socket.player.giro) * (socket.player.dist))
                  };

        socket.player.shooter.x2 = pos.x;
        socket.player.shooter.y2 = pos.y;
        socket.player.shooter.R = Math.floor(Math.random() * 255);
        socket.player.shooter.G = Math.floor(Math.random() * 255);
        socket.player.shooter.B = Math.floor(Math.random() * 255);
      }
  
      if(socket.player.shooting) {
        var pos = { 
                    x: data.x - socket.player.shooter.x2, 
                    y: data.y - socket.player.shooter.y2
                  };
        var tan = Math.atan(pos.y/pos.x);
        pos.x < 0 ? tan+= Math.PI : pos.x > 0 && pos.y < 0 ? tan+= Math.PI * 2 : tan = tan;
        var distance = dist(socket.player.shooter.x2, socket.player.shooter.y2, data.x, data.y) < 100 ? dist(socket.player.shooter.x2, socket.player.shooter.y2, data.x, data.y) : 100;
        socket.player.shooter.x1 = socket.player.shooter.x2 + Math.cos(tan) * distance;
        socket.player.shooter.y1 = socket.player.shooter.y2 + Math.sin(tan) * distance;
        socket.player.shooter.force = Math.floor(dist(socket.player.shooter.x1, 
                                            socket.player.shooter.y1, 
                                            socket.player.shooter.x2, 
                                            socket.player.shooter.y2))/6; //10
      }

      // io.sockets.emit('currentPlayers', getAllPlayers() );
      // io.sockets.emit('currentshooter', socket.player.shooter );
    });
  }
);

function dist(x1,y1,x2,y2){
  return Math.sqrt(Math.pow(x2 - x1 ,2) + Math.pow(y2 - y1 ,2));
}

function getAllPlayers(){
  var players = [];
  Object.keys(io.sockets.connected).forEach(function(socketID){
      var player = io.sockets.connected[socketID].player;
      if(player) players.push(player);
  });
  return players;
}

function Planet(x,y,r,m) {
	this.pos = {x: 0, y: 0};
	this.pos.x = x;
	this.pos.y = y;
	this.radius = r; //30
	this.mass = m; //1000
}

function Arrows(x,y,accx,accy,R,G,B,radius) {
	this.radius = radius || 10;
	this.traj = [];
	this.count = 0;
	this.R = R || 0;
	this.G = G || 0;
	this.B = B || 0;
	this.pos = new Vector(x, y);
	this.vel = new Vector(0, 0);
	this.acc = new Vector(accx, accy);
	this.mass = 10;
  this.Gravity = 1;
  
  this.way = function(){
    if (this.count == 20) {
			for (var i = 0; i < this.count-1; i++) {
				this.traj[i] = this.traj[i+1];
			}
			this.traj[this.count-1] = new Vector(this.pos.x,this.pos.y);
		} else {
			this.traj[this.count] = new Vector(this.pos.x,this.pos.y);
			this.count++;
		}
  }

	this.applyForce = function(force) {
		this.acc.add(force);
	}

	this.newton = function () {
		this.vel.add(this.acc);
		this.pos.add(this.vel);
		this.acc.mult(0);
	}

	this.orbit = function(body) {
		var gravity_force = 0; 
		var gravity_force_x = 0; 
		var gravity_force_y = 0; 
		var x_dir = 0;
		var y_dir = 0;
		var alpha =  0;

		/* Gravitational force */
		var g_dist = dist(this.pos.x,this.pos.y,body.pos.x,body.pos.y)
		gravity_force = ((this.Gravity * this.mass * body.mass)/(g_dist*g_dist));
		if (body.pos.x != this.pos.x) {
			alpha = Math.atan(Math.abs((body.pos.y - this.pos.y)) / Math.abs((body.pos.x - this.pos.x)));
			gravity_force_x = gravity_force * Math.cos(alpha);
			gravity_force_y = gravity_force * Math.sin(alpha);
		} else {
			gravity_force_x = 0;
			gravity_force_y = gravity_force;
		}	

		/* Gravitational force direction */
		if (this.pos.x < body.pos.x) {
			if(this.pos.y < body.pos.y) {
				x_dir = 1;
				y_dir = 1;
			} else {
				x_dir = 1;
				y_dir = -1;
			}
		} else {
			if(this.pos.y < body.pos.y) {
				x_dir = -1;
				y_dir = 1;
			} else {
				x_dir = -1;
				y_dir = -1;
			}
		}

		/* Apply gravitational force */
		this.applyForce(new Vector((x_dir * gravity_force_x), (y_dir * gravity_force_y)));
	}

}

var Vector = function(x, y) {
	this.x = x || 0;
	this.y = y || 0;
	return this;
};

// add a vector to this one
Vector.prototype.add = function(v2) {
	this.x += v2.x || 0;
	this.y += v2.y || 0;
	return this;
};

// multiply this vector by the scalar
Vector.prototype.mult = function(scalar) {
	this.x *= scalar || 0;
	this.y *= scalar || 0;
	return this;
};

//Calculate the angle of rotation for this vector (only 2D vectors)
Vector.prototype.heading = function () {
	var h = Math.atan2(this.y, this.x);
	return h;
};
// ITP Networked Media, Fall 2014
// https://github.com/shiffman/itp-networked-media
// Daniel Shiffman

// Keep track of our socket connection
var socket;
var goku;
var planets = [];
var shoot;

function setup() {
  planets.push( new Planet(420, 400, 75, 750) ); //200
  planets.push( new Planet(746, 134, 65, 650) ); //900
  planets.push( new Planet(746, 534, 65, 650) ); //900
  planets.push( new Planet(946, 334, 75, 750) ); //X

  createCanvas(1000, 1000);
  // createPlanets();
  ellipse(30,30,100,100);
  // shoot = new Shooter();
  goku = loadImage("assets/goku.png");
  // background(0);
  // Start a socket connection to the server
  // Some day we would run this server somewhere else
  socket = io.connect();
  frameRate(30);
  // We make a named event called 'mouse' and write an
  // anonymous callback function
  // socket.on('mouse',
  //   // When we receive data
  //   function(data) {
  //     console.log("Got: " + data.x + " " + data.y);
  //     fill(255,0,0);
  //     ellipse(data.x, data.y, 20, 20);
  //   }
  // );

  socket.on('currentPlayers', function(data) { 
    
    // When we receive data
    background(255);
    for (var i = 0; i < planets.length ; i++) {
      ellipse(planets[i].pos.x,planets[i].pos.y,planets[i].radius*2,planets[i].radius*2);
    }

    var key = Object.keys(data);
    for(x in key){
      var player = data[key[x]];
      // console.log(player);
      if(player){
        push();
      
        translate(player.x + (cos(player.giro) * player.dist), player.y + (sin(player.giro) * player.dist));
        imageMode(CENTER);

        var y = sin(player.giro - 4.71);
        var x = cos(player.giro - 4.71);
        var tan = atan( y/x );

        x < 0 ? tan+= PI : x > 0 && y < 0 ? tan+=TWO_PI : tan = tan;

        rotate(tan);
        image(goku,0,0);
      
        pop();
      // }
          // console.log(player.shooter)
        // var data = player.shooter;
        /* Draw the line and the arraow */
        stroke(0);
        var pos = createVector(player.shooter.currentMouse.x-player.shooter.x2, player.shooter.currentMouse.y-player.shooter.y2);
        var tan = atan(pos.y/pos.x)
        pos.x < 0 ? tan+= PI : pos.x > 0 && pos.y < 0 ? tan+=TWO_PI : tan = tan;
        line(player.shooter.x1-cos(tan)*5, player.shooter.y1-sin(tan)*5, player.shooter.x1+cos(tan)*5, player.shooter.y1+sin(tan)*5);
        triangle(player.shooter.x1+cos(tan)*5, player.shooter.y1+sin(tan)*5, 
        player.shooter.x1-cos(tan + PI/2)*5, player.shooter.y1-sin(tan + PI/2)*5, 
        player.shooter.x1+cos(tan + PI/2)*5, player.shooter.y1+sin(tan + PI/2)*5);
      
        line(player.shooter.x2+cos(tan)*30-cos(tan + PI/2)*5, player.shooter.y2+sin(tan)*30-sin(tan + PI/2)*5, 
        player.shooter.x2+cos(tan)*30+cos(tan + PI/2)*5, player.shooter.y2+sin(tan)*30+sin(tan + PI/2)*5);
      // 
        line(player.shooter.x2+cos(tan)*30, player.shooter.y2+sin(tan)*30, player.shooter.x1, player.shooter.y1);
      
        stroke(0);
        fill(player.shooter.R, player.shooter.G, player.shooter.B);
        ellipse(player.shooter.x2, player.shooter.y2, 20, 20);
        
        push();
        fill(0);
        translate( (player.shooter.x1+player.shooter.x2)/2, (player.shooter.y1+player.shooter.y2)/2 );
        (player.shooter.x2 > player.shooter.x1) ? 
        rotate( atan2(player.shooter.y2-player.shooter.y1,player.shooter.x2-player.shooter.x1) ) : 
        (rotate( atan2(player.shooter.y1-player.shooter.y2,player.shooter.x1-player.shooter.x2) ) );
        pop();

      //     // console.log(players.length);
          if( player.arrow != null ){
          //   // var data = players[i].arrow;
      //     //   console.log("ARROW " + i + "=" +  player.arrow == null);
            ellipse( player.arrow.pos.x,  player.arrow.pos.y,  player.arrow.radius*2,  player.arrow.radius*2); 

            // for (var i =0; i < player[i].arrow.traj.length; i++) {
              // fill(player[i].arrow.R, player[i].arrow.G, player[i].arrow.B);//,i);
              // noStroke();
              // ellipse(player.arrow.traj[i].x, player[i].arrow.traj[i].y, 10, 10);
            // }
          }
      // }
      }

    }
    if(keyIsPressed) keyPress();
    if(mouseIsPressed) mousePress();
    else socket.emit('mouseNoPress', false);

    // console.log(mouseIsPressed);
  });

  // socket.on('currentArrow', function(p){
  //   // console.log(data);
  //   // background(255);
  //   /* Draw planet */
  //   var players = p;
  //   // console.log(players);
  //   if(players[0]) console.log(players[0].arrow);
  //   if(players[1]) console.log(players[1].arrow);

  //   for(var i=0; i<players.length; i++){
  //     // console.log(players.length);
  //     if(players[i].arrow != null){
  //       // var data = players[i].arrow;
  //       console.log("ARROW " + i + "=" + players[i].arrow == null);
  //       ellipse(players[i].arrow.pos.x, players[i].arrow.pos.y, players[i].arrow.radius*2, players[i].arrow.radius*2); 

  //       // for (var i =0; i < players[i].arrow.traj.length; i++) {
  //       //   fill(players[i].arrow.R, players[i].arrow.G, players[i].arrow.B);//,i);
  //       // noStroke();
  //       //   ellipse(players[i].arrow.traj[i].x, players[i].arrow.traj[i].y, 10, 10);
  //       // }
  //     }
  //   }
  // });

//   socket.on('currentShooter', function(p){
//     var players = p;

//     for(var i=0; i<players.length; i++){
//       var data = players[i].shooter;
//       /* Draw the line and the arraow */
//       stroke(0);
//       var pos = createVector(data.currentMouse.x-data.x2, data.currentMouse.y-data.y2);
//       var tan = atan(pos.y/pos.x)
//       pos.x < 0 ? tan+= PI : pos.x > 0 && pos.y < 0 ? tan+=TWO_PI : tan = tan;
//       line(data.x1-cos(tan)*5, data.y1-sin(tan)*5, data.x1+cos(tan)*5, data.y1+sin(tan)*5);
//       triangle(data.x1+cos(tan)*5, data.y1+sin(tan)*5, 
//           data.x1-cos(tan + PI/2)*5, data.y1-sin(tan + PI/2)*5, 
//           data.x1+cos(tan + PI/2)*5, data.y1+sin(tan + PI/2)*5);

//       line(data.x2+cos(tan)*30-cos(tan + PI/2)*5, data.y2+sin(tan)*30-sin(tan + PI/2)*5, 
//         data.x2+cos(tan)*30+cos(tan + PI/2)*5, data.y2+sin(tan)*30+sin(tan + PI/2)*5);

//       line(data.x2+cos(tan)*30, data.y2+sin(tan)*30, data.x1, data.y1);

//       /* Draw the futur planet */
//       // noStroke();
//       stroke(0);
//       fill(data.R, data.G, data.B);
//       ellipse(data.x2, data.y2, 20, 20);

//       push();
//       fill(0);
//           translate( (data.x1+data.x2)/2, (data.y1+data.y2)/2 );
//       if (data.x2 > data.x1) {
//             rotate( atan2(data.y2-data.y1,data.x2-data.x1) );
//       } else {
//             rotate( atan2(data.y1-data.y2,data.x1-data.x2) );
//       }
//           // text(nfc(data.force,1,1), 0, -5);
//       pop();
//     }
//   })
}

// function draw() {
//   // Nothing
  // if(keyIsPressed) keyPress();
// //   if(mouseIsPressed) mousePress();
// //   else socket.emit('mouseNoPress', false);
// //   /* Draw the sun */
// for (var i = 0; i < planets.length ; i++) {
//   ellipse(planets[i].pos.x,planets[i].pos.y,planets[i].radius*2,planets[i].radius*2);
// }
// }

// function createPlanets(){
//   planets.push( new Planet(420, 400, 75, 750) ); //200
// 	planets.push( new Planet(746, 134, 65, 650) ); //900
// 	planets.push( new Planet(746, 534, 65, 650) ); //900
// 	planets.push( new Planet(946, 334, 75, 750) ); //X
// }

// function mousePressed() {
//   // Draw some white circles
//   fill(255);
//   noStroke();
//   ellipse(mouseX,mouseY,20,20);
//   // Send the mouse coordinates
//   sendmouse(mouseX,mouseY);
// }

function mousePress(){
  // shoot.update();
  // shoot.draw();
  var data = {
    x: mouseX,
    y: mouseY
  };

  // Send that object to the socket
  socket.emit('mousePress', data);
}

function keyPress(){
  // Send that object to the socket
  if(keyCode == 37) socket.emit('keyPressed', -0.04 );
  if(keyCode == 39) socket.emit('keyPressed', +0.04 );
}

// // Function for sending to the socket
// function sendmouse(xpos, ypos) {
//   // We are sending!
//   console.log("sendmouse: " + xpos + " " + ypos);
  
//   // Make a little object with  and y
//   var data = {
//     x: xpos,
//     y: ypos
//   };

//   // Send that object to the socket
//   socket.emit('mouse',data);
// }

function Planet(x,y,r,m) {
	this.pos = {x: 0, y: 0};
	this.pos.x = x;
	this.pos.y = y;
	this.radius = r; //30
	this.mass = m; //1000
}
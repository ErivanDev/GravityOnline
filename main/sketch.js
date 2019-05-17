// ITP Networked Media, Fall 2014
// https://github.com/shiffman/itp-networked-media
// Daniel Shiffman

// Keep track of our socket connection
var socket;
var goku;
var planets = [];
var shoot;

planets = [
  { pos: { x: -400, y:  100 } , radius: 75, mass: 750},
  { pos: { x:  200, y:  160 } , radius: 75, mass: 750},
  { pos: { x: -100, y: -100 } , radius: 75, mass: 750},
  { pos: { x:  300, y: -200 } , radius: 75, mass: 750}
];

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 30, window.innerWidth/window.innerHeight, 0.1, 2000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var players = [];

function init() {
  // Lights
  hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
  hemiLight.position.set( -500, -500, -1000 );
  scene.add( hemiLight );

  bulbLight = new THREE.PointLight( 0xffee88, 1, 1000, 0.2 );
	scene.add( bulbLight );

  scene.background = new THREE.Color(0x231344);

  for(var i=0; i< planets.length; i++){
    var geometry = new THREE.SphereGeometry( 75, 4, 4 );
    var material = new THREE.MeshStandardMaterial( { color: 0xff0000 } );
    planet = new THREE.Mesh( geometry, material );
    // planet.castShadow = true; //default is false
    // planet.receiveShadow = false; //default
    planet.position.set( planets[i].pos.x, planets[i].pos.y, 0 );
    scene.add( planet );
  }

  camera.position.z = 1200;

  window.addEventListener( 'keypress' , function(event){
    if(event.keyCode == 97){
      socket.emit('keyPressed', -0.04 );
    }
    if(event.keyCode == 100){
      socket.emit('keyPressed',  0.04 );
    }
  })

  mousePressed  = false;
  mouseReleased = false;
  document.onmousedown = function(){ mousePressed = true  ; mouseReleased = false; }
  document.onmouseup   = function(){ mousePressed = false ; mouseReleased = true;  }
  document.onmousemove = function(event){ mouse = { x: event.clientX - window.innerWidth/2 , y: (event.clientY - window.innerHeight/2) * -1 } }

  socket = io.connect();

  socket.on('currentPlayers', function(data) { 
  
    pos = [
      { x: -400, y:  100 },
      { x:  200, y:  160 },
      { x: -100, y: -100 },
      { x:  300, y: -200 },
    ];

    var key = Object.keys(data);
    for(x in key){
      var p = data[key[x]];
      // player.x + (cos(player.giro) * player.dist)
      if(players[x] == undefined){
        var geometry = new THREE.SphereGeometry( 20, 4, 4 );
        var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        players[x] = new THREE.Mesh( geometry, material );
        players[x].position.set( p.x + ( Math.cos( p.giro )*95 ) , p.y + ( Math.sin( p.giro )*95 ) , 0);

        var geometry = new THREE.CylinderGeometry( 5, 5, 80, 32 );  
        var material = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
        players[x].arma = new THREE.Mesh( geometry, material );

        var geometry = new THREE.SphereGeometry( 4, 4, 4 );
        var material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
        players[x].bala = new THREE.Mesh( geometry, material );

        scene.add( players[x] );
        scene.add( players[x].arma );
        scene.add( players[x].bala );
      }

      players[x].position.set( p.x + ( Math.cos( p.giro ) * p.dist ) , p.y + ( Math.sin( p.giro ) * p.dist ) , 0);

      players[x].arma.position.set( p.x + ( Math.cos( p.giro ) * p.dist ) , p.y + ( Math.sin( p.giro ) * p.dist ) , 0 );
      players[x].bala.position.set( p.x + ( Math.cos( p.giro ) * p.dist ) , p.y + ( Math.sin( p.giro ) * p.dist ) , 0 );
      
      var pos = { x: p.shooter.currentMouse.x - p.shooter.x2, y: p.shooter.currentMouse.y - p.shooter.y2 };

      var tan = Math.atan(pos.y/pos.x);
      pos.x < 0 ? tan+= Math.PI : pos.x > 0 && pos.y < 0 ? tan+=Math.PI*2 : tan = tan;
      tan += Math.PI/2;

      players[x].arma.rotation.z = tan;

      if( p.arrow != null ) players[x].bala.position.set( p.arrow.pos.x,  p.arrow.pos.y, 0); 

    }

    if(mousePressed){
      var pos = { x: mouse.x, y: mouse.y };
      // Send that object to the socket
      socket.emit('mousePress', pos);
    }
    else{
      socket.emit('mouseNoPress', false);
    }

	  renderer.render( scene, camera );
  });
}

init();
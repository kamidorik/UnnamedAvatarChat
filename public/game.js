var scene, camera, renderer, scene2, audioLoader;
var keyboard = {};

const url = 'ws://localhost:1337'
const socket = new WebSocket(url)
socket.onopen = function(e) {
  	document.getElementById("chatLog").innerHTML += "<p><font color='blue'>[open]</font> Соединение установлено";
  	document.getElementById("chatLog").innerHTML += "Нажмите t для прикола :D";
  	document.getElementById("chatLog").innerHTML += "<p>Игрок "+player.nickname+" зашел в игру";
  	socket.send(JSON.stringify({nickname: player.nickname, status: 'init'}));
};

function update(jscolor) {
	if ((typeof(socket) !== 'undefined') && (typeof(player.id) !== 'undefined')) {
    	socket.send(JSON.stringify({id: player.id, status: 'newColor', color: '#' + jscolor}));
	}
}

function fuckShit(material2, cube, group, gigatest) {
	var loader1 = new THREE.FontLoader();
	loader1.load('helvetiker_regular.typeface.json', function(font) {
		var geometry2 = new THREE.TextGeometry(gigatest, {
			font: font,
    		size: 80,
    		height: 5,
    		curveSegments: 12,
    		bevelEnabled: true,
    		bevelThickness: 10,
    		bevelSize: 8,
    		bevelSegments: 5
		});	

		var mesh = new THREE.Mesh( geometry2, material2 );
		mesh.scale.multiplyScalar(0.01)
		mesh.position.set( cube.position.x-1.5,cube.position.y + 1, cube.position.z );
		group.add( mesh );
	});
}
function makeid(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}
function clearChat() {
	document.getElementById("chatLog").innerHTML = '';
}
var player = {height: 1.8, speed: 0.1, turnSpeed: Math.PI * 0.01, nickname: makeid(5) };
var meshFloor;

function init(){
	var butt = document.getElementById("btn2")
	var newMes = document.getElementById("chatArea");
	var colChanger = document.getElementById("colorPic");
	var colChangerBut = document.getElementById("btn3");
	var butExit = document.getElementById("btn");
	setInterval(clearChat, 120000);
	butExit.addEventListener("click", function() {
		colChanger.style.visibility = 'hidden';
	});
	colChangerBut.addEventListener("click", function() {
		colChanger.style.visibility = 'visible';
	});
	butt.addEventListener("click", function() {
		socket.send(JSON.stringify({nickname: player.nickname, status: 'newMessage', text: newMes.value}));
		newMes.value = '';
	});
	newMes.addEventListener("keyup", function(event) {
    	if (event.key === "Enter") {
    		socket.send(JSON.stringify({nickname: player.nickname, status: 'newMessage', text: newMes.value}));
			newMes.value = '';
    	}
	});
	scene = new THREE.Scene();
	scene2 = new THREE.Scene();

	socket.onmessage = function(event) {
  		//document.getElementById("chatLog").innerHTML += "<p>[message] Данные получены с сервера";
  		newData = JSON.parse(event.data)
  		if (newData.status == 'newUser' && newData.name != player.nickname) {
  			var loader1 = new THREE.FontLoader();
  			var group = new THREE.Group();
  			var geometry = new THREE.BoxGeometry( 1, 1, 1 );
			var material = new THREE.MeshPhongMaterial( { color: 0x0000ff} );
			var cube = new THREE.Mesh( geometry, material );
			cube.castShadow = true;
			cube.receiveShadow = true;
			var col = newData.color;
  			col = parseInt(col, 16);
			cube.material.color.setHex( col );
			cube.name = String(newData['id'] + 'c');
			group.name = String(newData['id']);
			//group.rotation.y = newData['rotation'];
			loader1.load('https://cdn.rawgit.com/mrdoob/three.js/master/examples/fonts/helvetiker_regular.typeface.json', function(font) {

				var geometry = new THREE.TextGeometry(newData['name'], {
					font: font,
    				size: 80,
    				height: 5,
    				curveSegments: 12,
    				bevelEnabled: true,
    				bevelThickness: 10,
    				bevelSize: 8,
    				bevelSegments: 5
				});

				var material = new THREE.MeshPhongMaterial({
					color: 0xF3FFE2
				});

				var mesh = new THREE.Mesh( geometry, material );
				group.position.set( newData['x'],newData['y'], newData['z'] );
				mesh.scale.multiplyScalar(0.01)
				mesh.position.set( cube.position.x-1.5,cube.position.y + 1, cube.position.z );

				group.add( cube );
				group.add( mesh );
						
			} );
			scene.add( group );
  			document.getElementById("chatLog").innerHTML += "<p>Игрок "+newData.name+" зашел в игру";
  		} else if (newData.status == 'newUser' && newData.name == player.nickname) {
  			player.id = newData.id;
  		} else if (newData.status == 'colCha') {
  			if (newData.id != player.id) {
  				myString = String(newData.id + 'c');
  				var selectedObject = scene.getObjectByName(myString);
  				var col = newData.color;
  				col = parseInt(col, 16);
  				selectedObject.material.color.setHex( col );
  			}
  		} else if (newData.status == 'playSound') {
  			const radius = 0.5;
			const geometry = new THREE.DodecahedronBufferGeometry(radius);
			var material = new THREE.MeshPhongMaterial( { color: 0xFFFFFF } );
			var soup = new THREE.Mesh( geometry, material );
			if (newData.id != player.id) {
  				myString = String(newData.id);
  				var selectedObject = scene.getObjectByName(myString);
  				soup.position.set( selectedObject.position.x, 4, selectedObject.position.z );
  				scene.add(soup);
  			}
			var sound = new THREE.PositionalAudio( listener );
  			audioLoader.load( '0743.ogg', function( buffer ) {
				sound.setBuffer( buffer );
				sound.setLoop( false );
				sound.setRefDistance( 20 );
				sound.setVolume( 0.5 );
				sound.play();
			});

			soup.add( sound );
			sound.onEnded = function() {
				scene.remove(soup);
    			this.isPlaying = false; /* sets Three wrapper property correctly */
			};
  		} else if (newData.status == 'error') {
  			if (newData.code == 1) {
  				document.getElementById("chatLog").innerHTML += "<p><font color='red'>[error]</font> Ошибка инициализации";
  			}
  		} else if (newData.status == 'newMes') {
  			var chatText = newData.text;
  			if (chatText.indexOf('/me') != -1) {
  				chatText = chatText.replace('/me','');
  				document.getElementById("chatLog").innerHTML += "<p>"+newData.name+" "+chatText;
  			} else {
  				document.getElementById("chatLog").innerHTML += "<p><font color='red'>"+newData.name+"</font>: "+chatText;
  			}
  		} else if (newData.status == 'remUser') {
  			document.getElementById("chatLog").innerHTML += "<p>Игрок "+newData.name+" вышел из игры";
  			var delet = String(newData.id)
  			var selectedObject = scene.getObjectByName(delet);
  			scene.remove( selectedObject );
  		} else if (newData.status == 'chaPos') {
  			if (newData.id != player.id) {
  				myString = String(newData.id);
  				var selectedObject = scene.getObjectByName(myString);
  				selectedObject.position.set( newData['x'], 1.8, newData['z'] );
  			}
  		} else if (newData.status == 'chaRot') {
  			if (newData.id != player.id) {
  				myString = String(newData.id);
  				var selectedObject = scene.getObjectByName(myString);
  				selectedObject.rotation.y = newData['y'];
  			}
  		} else if (newData.status == 'allUsers') {
  			document.getElementById("chatLog").innerHTML += "<p>На данном сервере "+newData.usArray.length+" людей";
			var arr = newData.usArray;
			var geometry = new THREE.BoxGeometry( 1, 1, 1 );
			for (var i = 0; i < arr.length; i++) { 
				var damn = arr[i];
				if (damn['id'] != player.id) {
					var col = damn.color;
  					col = parseInt(col, 16);
					var material = new THREE.MeshPhongMaterial( { color: 0x0000ff } );
					var group = new THREE.Group();
					var cube = new THREE.Mesh( geometry, material );
					cube.material.color.setHex( col );
					cube.name = String(damn['id'] + 'c');
					cube.castShadow = true;
					cube.receiveShadow = true;
					group.add( cube );
					var geometry2;
					var material2 = new THREE.MeshPhongMaterial({
						color: 0xF3FFE2
					});
					var gigatest = damn['name'];
					group.position.set( damn['x'], damn['y'], damn['z'] );
					group.name = String(damn['id']);
					//group.rotation.y = newData['rotation'];
					scene.add( group );
					fuckShit(material2, cube, group, damn['name']);
				}
			}
  		}
	};

	socket.onclose = function(event) {
		socket.send(JSON.stringify({id: player.id, status: 'remove', name: player.nickname}));
 		if (event.wasClean) {
    		document.getElementById("chatLog").innerHTML += "<font color='red'>[close]</font> Соединение закрыто чисто, код="+event.code+" причина="+event.reason;
  		} else {
    		// например, сервер убил процесс или сеть недоступна
    		// обычно в этом случае event.code 1006
    		document.getElementById("chatLog").innerHTML += "<font color='red'>[close]</font> Соединение прервано";
  		}
	};

	socket.onerror = function(error) {
  		document.getElementById("chatLog").innerHTML += "<font color='red'>[error]</font>"+error.message;
	};
	scene.background = new THREE.Color( 0xf0f0f0 );
	camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );

	renderer = new THREE.WebGLRenderer( {antialias: true});
	var loader = new THREE.FontLoader();


	camera.position.set(0, player.height, -5)
	camera.lookAt(new THREE.Vector3(0, player.height, 0))

	var ambient = new THREE.AmbientLight( 0xffffff, 0.2 );
	scene.add( ambient );
	var light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(-3, 6, -3);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);
	var listener = new THREE.AudioListener();
	camera.add( listener );

	// create a global audio source
	sound = new THREE.Audio( listener );

	// load a sound and set it as the Audio object's buffer
	audioLoader = new THREE.AudioLoader();

	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.BasicShadowMap;
	document.body.appendChild( renderer.domElement );

	meshFloor = new THREE.Mesh( 
		new THREE.PlaneGeometry( 10, 10, 10, 10),
		new THREE.MeshPhongMaterial( { color: 0x0000f} )
	);
	meshFloor.rotation.x -= Math.PI / 2;
	meshFloor.castShadow = true;
	meshFloor.receiveShadow = true;
	scene.add(meshFloor)

	animate();
}
var animate = function () {
	requestAnimationFrame( animate );
	if(keyboard[69]) { //e
		camera.rotation.y += player.turnSpeed;
		socket.send(JSON.stringify({id: player.id, status: 'newRot', y: camera.rotation.y}));
	} else if (keyboard[81]) { //q
		camera.rotation.y -= player.turnSpeed;
		socket.send(JSON.stringify({id: player.id, status: 'newRot', y: camera.rotation.y}));
	} else if (keyboard[87]) { //w
		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
		socket.send(JSON.stringify({id: player.id, status: 'newPos', x: camera.position.x, z: camera.position.z}));
	} else if (keyboard[83]) { //s
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
		socket.send(JSON.stringify({id: player.id, status: 'newPos', x: camera.position.x, z: camera.position.z}));
	} else if (keyboard[68]) { //d
		camera.position.x += Math.sin(camera.rotation.y - Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y - Math.PI/2) * player.speed;
		socket.send(JSON.stringify({id: player.id, status: 'newPos', x: camera.position.x, z: camera.position.z}));
	} else if (keyboard[65]) { //a
		camera.position.x += Math.sin(camera.rotation.y + Math.PI/2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y + Math.PI/2) * player.speed;
		socket.send(JSON.stringify({id: player.id, status: 'newPos', x: camera.position.x, z: camera.position.z}));
	} else if (keyboard[84]) {
		socket.send(JSON.stringify({id: player.id, status: 'newSound'}));
	}
	

	renderer.render( scene, camera );
};

function keyDown(event) {
	keyboard[event.keyCode] = true;
}

function keyUp(event) {
	keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.onload = function() {
	init();
};

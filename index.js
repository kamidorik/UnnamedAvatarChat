var express = require('express');
var path = require("path");
var bodyParser = require('body-parser');
var WebSocket = require('ws');

var id = 0;
var users = [];
var servUsers = [];
var oldStatus = ""; 

const wss = new WebSocket.Server({ port: 1337 });

function noop() {}

function heartbeat() {
  	this.isAlive = true;
}

wss.getUniqueID = function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4();
};

wss.on('connection', function connection(ws) {
  ws.hisId = id;
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  ws.on('close', function(code, reason) {
  	var yeap;
  	for (i = 0; i < users.length; i++) { 
    	if (users[i].id == ws.hisId) { 
    		yeap = i;
   		}
  	}
  	if (typeof(users[yeap]) !== 'undefined') {
  		wss.clients.forEach(function each(client) {
    		if (client.readyState === WebSocket.OPEN) {
    		//if (typeof(users[ws.hisId]) !== 'undefined') {
        			client.send(JSON.stringify({status:'remUser', id: users[yeap].id, name: users[yeap]['name']}));
        	//}
      		}
   		});
    	users[yeap] = null;
    	var damn = users.filter((a) => a != null)
    	users = damn;
    }
    	//ws.terminate();	
  });
  ws.on('message', function incoming(message) {
  	mess = JSON.parse(message);
	if (mess['status'] == 'init'){
		wss.clients.forEach(function each(client) {
      	if (client.readyState === WebSocket.OPEN) {
        	client.send(JSON.stringify({status:'newUser', name: mess['nickname'], x: 0, y:1.8, z:-5, id: id, color: '0000ff'}));
      	}
    	});
      	//ws.send(JSON.stringify({ID:id, x:0, y:1.8, z:-5}));
      	users.push({id: id, name: mess['nickname'], x:0, y:1.8, z:-5, rotation: 1.8, color: '0000ff'});
      	ws.send(JSON.stringify({status:'allUsers', usArray: users}));
      	id += 1;
     } else if (mess['status'] == 'newMessage'){
     	wss.clients.forEach(function each(client) {
      	if (client.readyState === WebSocket.OPEN) {
      		str = mess['text'].replace(/\s/g, '');
      		if (str != '') {
        		client.send(JSON.stringify({status:'newMes', name: mess['nickname'], text: mess['text']}));
        	}
      	}
    	});
     } else if (mess['status'] == 'newSound'){
      if (oldStatus != mess['status']) {
        wss.clients.forEach(function each(client) {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({status:'playSound', id: mess['id']}));
          }
      });
      }
     } else if (mess['status'] == 'newColor'){
     	var current = mess['color'];
     	var current = current.replace("#","");
     	wss.clients.forEach(function each(client) {
      	if (client.readyState === WebSocket.OPEN) {
        		client.send(JSON.stringify({status:'colCha', id: mess['id'], color: current}));
      	}
    	});
    	var damn = mess;
      	var yeap;
    	for (i = 0; i < users.length; i++) { 
    		if (users[i].id == damn.id) { 
    			yeap = i;
   			}
  		}
      	if (typeof(users[yeap]) !== 'undefined') {
      		users[yeap].color = current;
      		console.log(users)
      	} else {
      		ws.send(JSON.stringify({status:'error', code: 1}));
      		ws.terminate();
      	}
     } else if (mess['status'] == 'getUsers'){
     	ws.send(JSON.stringify({status:'allUsers', usArray: users}));
     } else if (mess['status'] == 'remove'){
     	wss.clients.forEach(function each(client) {
      	if (client.readyState === WebSocket.OPEN) {
        	client.send(JSON.stringify({status:'remUser', id: id, name: mess['name']}));
      	}
    	});
     } else if (mess['status'] == 'newPos'){
     	wss.clients.forEach(function each(client) {
      	if (client.readyState === WebSocket.OPEN) {
        	client.send(JSON.stringify({status:'chaPos', id: mess['id'], x: mess['x'], y:1.8, z: mess['z']}));
      	}
    	});
      	//ws.send(JSON.stringify({ID:id+1, x:0, y:1.8, z:-5}));
      	//id += 1;
      	var damn = mess;
      	var yeap;
      	for (i = 0; i < users.length; i++) { 
    		if (users[i].id == damn.id) { 
    			yeap = i;
   			}
  		}
      	if (typeof(users[yeap]) !== 'undefined') {
      		users[yeap].x = damn['x'];
      		users[yeap].z = damn['z'];
      	}  else {
      		ws.send(JSON.stringify({status:'error', code: 1}));
      		ws.terminate();
      	}
      	//console.log(users)
     } else if (mess['status'] == 'newRot'){
     	wss.clients.forEach(function each(client) {
      	if (client.readyState === WebSocket.OPEN) {
        	client.send(JSON.stringify({status:'chaRot', id: mess['id'], y: mess['y']}));
      	}
    	});
      	//ws.send(JSON.stringify({ID:id+1, x:0, y:1.8, z:-5}));
      	//id += 1;
      	var damn = mess;
      	var yeap;
      	for (i = 0; i < users.length; i++) { 
    		if (users[i].id == damn.id) { 
    			yeap = i;
   			}
  		}
      	if (typeof(users[yeap]) !== 'undefined') {
      		users[yeap].rotation = damn['y'];
      	}  else {
      		ws.send(JSON.stringify({status:'error', code: 1}));
      		ws.terminate();
      	}
      } 
      oldStatus = mess['status'];
  });

  //ws.send('something');
});
// WebSocket server

const interval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
    	console.log("ААА")
    	//ws.send(JSON.stringify({status:'remUser', id: id, name: mess['name']}));
    	return ws.terminate();
    }	

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 300);

var app = express();
//conn.connect(function(err) {
//  if (err) throw err;
//  console.log("Connected!");
//});
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/', express.static(path.join(__dirname, 'public')))

app.listen(8080);

console.log('Сервер стартовал!');
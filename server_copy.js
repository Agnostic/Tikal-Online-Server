/*!
* Tikal Online Server v0.1
* http://www.tikalonline.com
*
* Copyright 2012, Gilberto Avalos
*/
var server = require("socket.io").listen(1212);
var con = require('mysql');
var db = con.createClient({
    user:'root',
    password:'a650204'
});

server.set('log level', 1);

db.query("USE TikalOnline");

var usuariosOn = {};
var clientes = {};
var proxId = 0;

var results = {};

server.sockets.on("connection", function(socket){
	
	// Recibir mensaje y reenviarlo
    socket.on("enviarMensaje", function(data){
	    var com = new RegExp("/m ");
	    if(com.test(data)){
		    var str = data.split(" ");
		    //console.log(typeof(str[1]));
		    if(typeof(str[1]) != 'undefined' && typeof(str[2]) != 'undefined'){
		    	if(typeof(usuariosOn[str[1]]) != 'undefined'){
		    		usuariosOn[str[1]].emit('nuevoMensaje', "Mensaje privado.");
				    console.log("Mensaje privado a "+str[1]+": "+str[2]);
				}
			}
	    } else {
	        server.sockets.emit("nuevoMensaje", "<b>"+socket.nick+":</b> "+data+"<br/>");
	    }
    });

	socket.on('loginUsuario', function(data){
		var res;
		var logged = false;
		
		db.query("SELECT usuario FROM cuentas WHERE usuario = '"+data.u+"' ",
			function selectCb(err, results, fields) {
				
                if(typeof(results[0]) == 'undefined'){
					socket.emit("loggedOn", { l: 0, m: "The user does not exist" })
                } else {
	
                    db.query("SELECT * FROM cuentas WHERE usuario = '"+data.u+"' AND password = '"+data.p+"' ",

						function selectCb(err, results, fields) {
							
			                if(typeof(results[0]) == 'undefined'){
			                    socket.emit("loggedOn", { l: 0, m: "Incorrect password, try again." })
			                } else {
				            			                
					        	db.query("SELECT nick, id FROM personajes WHERE cuenta_id = '"+results[0].id+"' ",
						        	function selectCb(err, results, fields) {
							        	if(typeof(results[0]) != 'undefined'){
								        	socket.emit('selectPlayers', results);
								        } else {
									      	socket.emit("loggedOn", { l: 0, m: "You need to create a character." });
								        }
							        
							        });
			                }
						}
					);
                }
			}
		);
		
	});
	
	socket.on('loadPlayer', function(data){
		var datos = {};
		db.query("SELECT * FROM personajes WHERE id = '"+data+"' ",
		function selectCb(err, results, fields) {
			
			if(usuariosOn[results[0].nick]){
				
			 	socket.emit("loggedOn", { l: 0, m: "The user "+results[0].nick+" is already online." });
			 	
			 } else {
			
				socket.emit("loggedOn", { l: 1, m: "Loading, please wait...", id: results[0].id, nick: results[0].nick, x: results[0].x, y: results[0].y, spr: results[0].spr });
	
				// Almacenar usuario en variable para la sesión
				socket.id = results[0].id;
				socket.nick = results[0].nick;
				socket.movido = false;
				socket.spr = results[0].spr;
				socket.x = results[0].x;
				socket.y = results[0].y;
									
				// Agregar el usuario al arrreglo de usuarios globales
				usuariosOn[socket.nick] = socket.id;
				
				// Instanciar personaje
				var u = {};
				u.id = socket.id;
				u.nick = socket.nick;
				u.x = results[0].x;
				u.y = results[0].y;
				u.spr = results[0].spr;
				socket.broadcast.emit('actualizarPlayers', u);
				
				// Enviar mensaje de conectado
				socket.emit('nuevoMensaje', "<b>Welcome to Tikal Online.</b><br/>");
				  					
				// Enviar mensaje a todos los clientes conectados
				socket.broadcast.emit('nuevoMensaje', socket.nick + ' has been connected.<br/>');
				 					
				// Actualizar listado de usuarios conectados
				server.sockets.emit('u_online', usuariosOn);
			}
			
		});
				  					
	});
	
	// Cliente desconectado
	socket.on('disconnect', function(){
	
		// Eliminar usuario del arreglo
		if(typeof(socket.nick) != 'undefined' ){
			delete usuariosOn[socket.nick];
			
			db.query("UPDATE personajes SET x = '"+socket.x+"', y = '"+socket.y+"' WHERE id = "+socket.id);
			console.log("Guardando personaje: "+socket.nick+" en X: "+socket.x+" Y: "+socket.y);
			
			// Actualizar listado en clientes
			server.sockets.emit('u_online', usuariosOn);
				
			// Anunciar que se ha desconectado
			socket.broadcast.emit('nuevoMensaje', socket.nick + ' has been disconnected.<br/>');
			server.sockets.emit('del_player', socket.id);
		}
		
	});
	
	socket.on('moverPlayer', function(data){
		var u = {};
		if(socket.id){
			socket.movido = true;
			u.id = socket.id;
			u.nick = socket.nick;
			u.x = data.pos.x;
			u.spr = socket.spr;
			u.y = data.pos.y;
			socket.x = u.x;
			socket.y = u.y;
			socket.broadcast.emit('actualizarPlayers', u);
		}
	});

	socket.on("sendQuest", function(data){
		db.query("SELECT * FROM logros WHERE id = '"+data.id+"' ",
			function selectCb(err, results, fields) {
				if(typeof(results[0]) != 'undefined'){
					var items = results[0].items;
					console.log("El quest tiene estos items:");
					console.log(items);
					// Si el quest existe
					db.query("SELECT * FROM personajes_logros WHERE id_personaje = '"+socket.id+"' AND id_logro = '"+data.id+"' ",
						function selectCb(err, results, fields) {
							if(typeof(results[0]) != 'undefined'){
								socket.emit('nuevoMensaje', 'You\'ve got this quest done.' );
								console.log("El personaje ya ha completado el Quest: "+data.id);
							} else {
								socket.emit('nuevoMensaje', '<span style=\'color:green;\'>Congratulations!</span>');
								socket.emit('recibeQuest', { items: items });
								db.query("INSERT INTO personajes_logros VALUES('', '"+socket.id+"', '"+data.id+"')");
								console.log("El personaje no había completado el Quest: "+data.id);
							}
					});

				} else {
					socket.emit("nuevoMensaje", "<span class='color:red;'>The Quest ID does not exists, are u cheating?</span> " );
					console.log("El quest no existe");
				}
		});

	});

	
});

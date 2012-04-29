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

db.query("USE TikalOnline");

var usuarios = {};
var proxId = 0;
var logged = false;
var results = {};

server.sockets.on("connection", function(socket){
	var usuario;
	
	// Recibir mensaje y reenviarlo
    socket.on("enviarMensaje", function(data){
        server.sockets.emit("nuevoMensaje", "<b>"+socket.usuario+":</b> "+data+"<br/>");
		console.log("Enviando mensaje: " + socket.usuario + " : "+data);
    });
	
	socket.on('loginUsuario', function(data){		
		db.query("SELECT usuario FROM usuarios WHERE usuario = '"+data.u+"' ",
			function selectCb(err, results, fields) {
				
                if(typeof(results[0]) == 'undefined'){
					socket.emit("loggedOn", { l: 0, m: "Usuario no registrado" })
                } else {
	
                    db.query("SELECT usuario FROM usuarios WHERE usuario = '"+data.u+"' AND password = '"+data.p+"' ",

						function selectCb(err, results, fields) {
							
			                if(typeof(results[0]) == 'undefined'){
			                    socket.emit("loggedOn", { l: 0, m: "Contraseña incorrecta" })
			                } else {
				                if(usuarios[data.u]){
				                	socket.emit("loggedOn", { l: 0, m: "El usuario "+data.u+" ya se encuentra conectado." })
				                } else {
			                    socket.emit("loggedOn", { l: 1, m: "Usuario identificado" })
			
								// Almacenar usuario en variable para la sesión
								socket.usuario = data.u;

								// Agregar el usuario al arrreglo de usuarios globales
								usuarios[data.u] = data.u;

								// Enviar mensaje de conectado
								socket.emit("nuevoMensaje", "<b><span class='smsg'>Bienvenidos a Niburu Online.</b></span><br/>");

								// Enviar mensaje a todos los clientes conectados
								socket.broadcast.emit('nuevoMensaje', socket.usuario + ' se ha conectado.<br/>');

								// Actualizar listado de usuarios conectados
								socket.emit('u_online', usuarios);
								}
			                }
						}
					);
                }
			}
		);
		
	});
	
	// Cliente desconectado
	socket.on('disconnect', function(){
	
		// Eliminar usuario del arreglo
		delete usuarios[socket.usuario];
		console.log("Eliminando usuario "+socket.usuario);
		
		// Actualizar listado en clientes
		server.emit('u_online', usuarios);
			
		// Anunciar que se ha desconectado
		socket.broadcast.emit('nuevoMensaje', socket.usuario + ' se ha desconectado.<br/>');
		socket.emit('del_player', socket.usuario);
		
		
	});
	
	socket.on('moverPlayer', function(data){
		var pos = {};
		if(socket.usuario){
			pos.u = socket.usuario;
			pos.x = data.pos.x;
			pos.y = data.pos.y
			//var datos =  { usuario: socket.usuario, x: data.pos.x, y: data.pos.y};
			socket.broadcast.emit('actualizarPlayers', pos);
		}
	});
	
});

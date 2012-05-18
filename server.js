/*!
* Tikal Online Server v0.2
* http://www.tikalonline.com
*
* Copyright 2012, Gilberto Avalos
*/
var app = require("express").createServer();
var server = app.listen(1212);
var nowjs = require("now");
var clientes = nowjs.initialize(server);
var con = require('mysql');
var db = con.createClient({
    user:'root',
    password:'a650204'
});

// Variables para referencias
var players = {};
var online = {};
var player_id = {};
var version = 0.2

console.log("Tikal Online Server v"+version);

db.query("USE TikalOnline");
var proxId = 0;

// Se conecta un cliente
nowjs.on('connect', function() {
 	console.log("Se ha recibido una conexión");
 	this.now.player = { nick: "", hp: 0, inventario: {} };
});

// Cliente desconectado
nowjs.on('disconnect', function() {

  for(var i in players) {
    if(i == this.user.clientId) {
      delete players[i];
      delete online[player_id[this.user.clientId].id];
      db.query("UPDATE personajes SET x = '"+this.now.player.x+"', y = '"+this.now.player.y+"' WHERE id = "+player_id[this.user.clientId].id);
      console.log("Guardando personaje ID: "+player_id[this.user.clientId].id+" en X: "+this.now.player.x+" Y: "+this.now.player.y)
      clientes.now.nuevoMensaje(this.now.player.nick + ' has been disconnected.<br/>');
      clientes.now.u_online(players);
      clientes.now.del_player(this.now.player.id);
  	  break;

    }
  }

});
	
// Recibir mensaje y reenviarlo
clientes.now.enviarMensaje = function(data){
    clientes.now.nuevoMensaje("<b>"+this.now.player.nick+":</b> "+data+"<br/>");
}

// Login
clientes.now.loginUsuario = function(data){
	var respuesta = 0;
	var resultados;
	loginUsuario = this;
	db.query("SELECT usuario FROM cuentas WHERE usuario = '"+data.u+"' ",
		function selectCb(err, results, fields) {
            if(typeof(results[0]) == 'undefined'){
				loginUsuario.now.loggedOn({ l: 0, m: "The user does not exist" });
            } else {
                db.query("SELECT * FROM cuentas WHERE usuario = '"+data.u+"' AND password = '"+data.p+"' ",
					function selectCb(err, results, fields) {
		                if(typeof(results[0]) == 'undefined'){
		                    loginUsuario.now.loggedOn({ l: 0, m: "Incorrect password, try again." });
		                } else {
				        	db.query("SELECT nick, id FROM personajes WHERE cuenta_id = '"+results[0].id+"' ",
					        	function selectCb(err, results, fields) {
						        	if(typeof(results[0]) != 'undefined'){
							        	respuesta = 3;
							        	loginUsuario.now.selectPlayers(results);
							        } else {
								      	loginUsuario.now.loggedOn({ l: 0, m: "You need to create a character." });
							        }
						        
						        });
		                }
					}
				);
            }
		}
		
	);
}

clientes.now.loadPlayer = function(data){
	loadPlayer = this;
	var datos = {};
	db.query("SELECT * FROM personajes WHERE id = '"+data+"' ",
	function selectCb(err, results, fields) {
		if(typeof(online[results[0].id]) != 'undefined'){
		 	loadPlayer.now.loggedOn({ l: 0, m: "The user "+results[0].nick+" is already online." });
		 	
		 } else {
		
			loadPlayer.now.loggedOn({ l: 1, m: "Loading, please wait...", id: results[0].id, nick: results[0].nick, x: results[0].x, y: results[0].y, spr: results[0].spr });
			
			// Obtener Inventario
			db.query("SELECT * FROM personajes_inventario WHERE personaje_id = '"+results[0].id+"' ",
				function selectCb(err, results, fields) {
				if(typeof(results[0]) != 'undefined'){
					loadPlayer.now.player.inventario = results;
					loadPlayer.now.cargarInventario();
					console.log(results);
				} else {
					loadPlayer.now.player.inventario = {};
				}
			});

			// Usuario online
			online[results[0].id] = 1;

			// Almacenar usuario en variable para la sesión
			player_id[loadPlayer.user.clientId] = { id: results[0].id, admin_level: results[0].admin_level };
			loadPlayer.now.player.id = loadPlayer.user.clientId; // Enviar ID de la sesión, no de la base de datos
			loadPlayer.now.player.nick = results[0].nick;
			loadPlayer.now.player.movido = false;
			loadPlayer.now.player.spr = results[0].spr;
			loadPlayer.now.player.x = results[0].x;
			loadPlayer.now.player.y = results[0].y;
								
			// Agregar el usuario al arrreglo de usuarios globales
			players[loadPlayer.user.clientId] = loadPlayer.now.player;
			
			// Instanciar personaje
			clientes.now.actualizarPlayers(loadPlayer.now.player);
			
			// Enviar mensaje de conectado
			loadPlayer.now.nuevoMensaje("<b>Welcome to Tikal Online.</b><br/>");
			  					
			// Enviar mensaje a todos los clientes conectados
			clientes.now.nuevoMensaje(loadPlayer.now.player.nick + ' has been connected.<br/>');
			 					
			// Actualizar listado de usuarios conectados
			clientes.now.u_online(players);
		}
		
	});

}

clientes.now.moverPlayer = function(data){
	if(this.now.player.id){
		this.now.movido = true;
		this.now.actualizarPlayers(this.now.player);
		this.now.player.x = data.pos.x;
		this.now.player.y = data.pos.y;
		//console.log("Moviendo player ID: "+player_id[this.user.clientId]+" X: "+this.now.player.x+" Y: "+this.now.player.y);
		clientes.now.actualizarPlayers(this.now.player);
	}
}

clientes.now.sendQuest = function(data){
	sendQuest = this;

		db.query("SELECT * FROM logros WHERE id = '"+data.id+"' ",
			function selectCb(err, results, fields) {
				if(typeof(results[0]) != 'undefined'){
					var items = results[0];
					console.log("El quest tiene estos items:");
					console.log(items);
					// Si el quest existe
					db.query("SELECT * FROM personajes_logros WHERE id_personaje = '"+player_id[sendQuest.user.clientId].id+"' AND id_logro = '"+data.id+"' ",
						function selectCb(err, results, fields) {
							if(typeof(results[0]) != 'undefined'){
								sendQuest.now.nuevoMensaje("<b>You've got this quest done.</b><br/>");
								console.log("El personaje ya ha completado el Quest: "+data.id);
							} else {
								var cant_slots = Object.keys(sendQuest.now.player.inventario).length;
								console.log(cant_slots);
								if(cant_slots < 16){
									slot = cant_slots+1;
									sendQuest.now.player.inventario[cant_slots+1] = { item_id: items.item, cantidad: items.cantidad, slot: "slot_"+slot }
									sendQuest.now.nuevoMensaje("<b>Congratulations!</b><br/>");
									
									db.query("INSERT INTO personajes_logros VALUES('', '"+player_id[sendQuest.user.clientId].id+"', '"+data.id+"')");
									db.query("INSERT INTO personajes_inventario VALUES('', '"+items.item+"', '"+items.cantidad+"', '"+player_id[sendQuest.user.clientId].id+"', 'slot_"+slot+"')");
									
									// Actualizar Inventario
									sendQuest.now.cargarInventario();
								}
							}
					});

				} else {
					sendQuest.now.nuevoMensaje("<span class='color:red;'>The Quest ID does not exists, are u cheating?</span><br/>");
					console.log("El quest no existe");
				}
		});

}

clientes.now.addItemInventory = function(item, cantidad, slot){
	var cant_slots = Object.keys(now.player.inventario).length;
	if(slot == 0){
		slot = cant_slots+1;
	}
	if(cant_slots < 16){
		this.now.player.inventario[cant_slots+1] = { item_id: item, cantidad: cantidad, slot: slot }
		db.query("INSERT INTO personajes_inventario VALUES('', '"+item+"', '"+cantidad+"', '"+player_id[this.user.clientId].id+"', '"+slot+"')");
		now.now.cargarInventario();
	} else {
		this.now.nuevoMensaje("<b>You need a free slot in your inventory!</b><br/>");
	}
}

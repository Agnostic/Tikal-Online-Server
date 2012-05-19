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

// Creaturas temporales
var mobs = [{
	x: 200,
	y: 200,
	settings: {
		name: "Dwarf",
		spr: "dwarf",
		map: "tikal",
		level: 1,
		vel: 1
	}
}];

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
      var inv = this.now.player.inventario;
      db.query("UPDATE personajes_inventario SET slot_1 = '"+inv[1].item+"', cantidad_slot_1 = '"+inv[1].cantidad+"', slot_2 = '"+inv[2].item+"', cantidad_slot_2 = '"+inv[2].cantidad+"', slot_3 = '"+inv[3].item+"', cantidad_slot_3 = '"+inv[3].cantidad+"', slot_4 = '"+inv[4].item+"', cantidad_slot_4 = '"+inv[4].item+"', slot_5 = '"+inv[5].item+"', cantidad_slot_5 = '"+inv[5].cantidad+"', slot_6 = '"+inv[6].item+"', cantidad_slot_6 = '"+inv[6].cantidad+"', slot_7 = '"+inv[7].item+"', cantidad_slot_7 = '"+inv[7].cantidad+"', slot_8 = '"+inv[8].item+"', cantidad_slot_8 = '"+inv[8].cantidad+"', slot_9 = '"+inv[9].item+"', cantidad_slot_9 = '"+inv[9].item+"', slot_10 = '"+inv[10].item+"', cantidad_slot_10 = '"+inv[10].cantidad+"', slot_11 = '"+inv[11].item+"', cantidad_slot_11 = '"+inv[11].cantidad+"', slot_12 = '"+inv[12].item+"', cantidad_slot_12 = '"+inv[12].cantidad+"', slot_13 = '"+inv[13].item+"', cantidad_slot_13 = '"+inv[13].item+"', slot_14 = '"+inv[14].item+"', cantidad_slot_14 = '"+inv[14].cantidad+"', slot_15 = '"+inv[15].item+"', cantidad_slot_15 = '"+inv[15].cantidad+"', slot_16 = '"+inv[16].item+"', cantidad_slot_16 = '"+inv[16].cantidad+"' WHERE personaje_id = "+player_id[this.user.clientId].id);
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
	var admin_level = player_id[loadPlayer.user.clientId].admin_level;
	if(admin_level > 0){
		var com = new RegExp("/pos");
		if(com.test(data)){
			this.now.nuevoMensaje("<b>Tu posici&oacute;n es X: "+this.now.player.x+" Y: "+this.now.player.y+" </b><br/>");
		}
	} else { 
    	clientes.now.nuevoMensaje("<b>"+this.now.player.nick+":</b> "+data+"<br/>");
    }

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
			player_id[loadPlayer.user.clientId] = { id: results[0].id, admin_level: results[0].admin_level };
			
			// Obtener Inventario
			db.query("SELECT * FROM personajes_inventario WHERE personaje_id = '"+player_id[loadPlayer.user.clientId].id+"' ",
				function selectCb(err, results, fields) {
				if(typeof(results[0]) != 'undefined'){

					loadPlayer.now.player.inventario[1] = { item: results[0].slot_1, cantidad: results[0].cantidad_slot_1 };
					loadPlayer.now.player.inventario[2] = { item: results[0].slot_2, cantidad: results[0].cantidad_slot_2 };
					loadPlayer.now.player.inventario[3] = { item: results[0].slot_3, cantidad: results[0].cantidad_slot_3 };
					loadPlayer.now.player.inventario[4] = { item: results[0].slot_4, cantidad: results[0].cantidad_slot_4 };
					loadPlayer.now.player.inventario[5] = { item: results[0].slot_5, cantidad: results[0].cantidad_slot_5 };
					loadPlayer.now.player.inventario[6] = { item: results[0].slot_6, cantidad: results[0].cantidad_slot_6 };
					loadPlayer.now.player.inventario[7] = { item: results[0].slot_7, cantidad: results[0].cantidad_slot_7 };
					loadPlayer.now.player.inventario[8] = { item: results[0].slot_8, cantidad: results[0].cantidad_slot_8 };
					loadPlayer.now.player.inventario[9] = { item: results[0].slot_9, cantidad: results[0].cantidad_slot_9 };
					loadPlayer.now.player.inventario[10] = { item: results[0].slot_10, cantidad: results[0].cantidad_slot_10 };
					loadPlayer.now.player.inventario[11] = { item: results[0].slot_11, cantidad: results[0].cantidad_slot_11 };
					loadPlayer.now.player.inventario[12] = { item: results[0].slot_12, cantidad: results[0].cantidad_slot_12 };
					loadPlayer.now.player.inventario[13] = { item: results[0].slot_13, cantidad: results[0].cantidad_slot_13 };
					loadPlayer.now.player.inventario[14] = { item: results[0].slot_14, cantidad: results[0].cantidad_slot_14 };
					loadPlayer.now.player.inventario[15] = { item: results[0].slot_15, cantidad: results[0].cantidad_slot_15 };
					loadPlayer.now.player.inventario[16] = { item: results[0].slot_16, cantidad: results[0].cantidad_slot_16 };
					
					loadPlayer.now.cargarInventario(loadPlayer.now.player.inventario);
				} else {
					db.query("INSERT INTO personajes_inventario VALUES('', '"+player_id[loadPlayer.user.clientId].id+"', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '') ");
					loadPlayer.now.player.inventario[1] = { item: 0, cantidad: 0 };
					loadPlayer.now.player.inventario[2] = { item: 0, cantidad: 0 };
					loadPlayer.now.player.inventario[3] = { item: 0, cantidad: 0 };
					loadPlayer.now.player.inventario[4] = { item: 0, cantidad: 0 };
					loadPlayer.now.player.inventario[5] = { item: 0, cantidad: 0 };
					loadPlayer.now.player.inventario[6] = { item: 0, cantidad: 0 };
					loadPlayer.now.player.inventario[7] = { item: 0, cantidad: 0 };
					loadPlayer.now.player.inventario[8] = { item: 0, cantidad: 0 };
					loadPlayer.now.player.inventario[9] = { item: 0, cantidad: 0 };
					loadPlayer.now.player.inventario[10] = { item: 0, cantidad: 0 };
					loadPlayer.now.player.inventario[11] = { item: 0, cantidad: 0 };
					loadPlayer.now.player.inventario[12] = { item: 0, cantidad: 0 };
					loadPlayer.now.player.inventario[13] = { item: 0, cantidad: 0 };
					loadPlayer.now.player.inventario[14] = { item: 0, cantidad: 0 };
					loadPlayer.now.player.inventario[15] = { item: 0, cantidad: 0 };
					loadPlayer.now.player.inventario[16] = { item: 0, cantidad: 0 };
					loadPlayer.now.cargarInventario(loadPlayer.now.player.inventario);
				}
			});

			// Usuario online
			online[results[0].id] = 1;

			// Almacenar usuario en variable para la sesión
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
		clientes.now.actualizarPlayers(this.now.player);
	}
}

clientes.now.sendQuest = function(data){
	sendQuest = this;

		db.query("SELECT * FROM logros WHERE id = '"+data.id+"' ",
			function selectCb(err, results, fields) {
				if(typeof(results[0]) != 'undefined'){
					var quest_item = results[0];

					// Si el quest existe
					db.query("SELECT * FROM personajes_logros WHERE id_personaje = '"+player_id[sendQuest.user.clientId].id+"' AND id_logro = '"+data.id+"' ",
						function selectCb(err, results, fields) {
							if(typeof(results[0]) != 'undefined'){
								sendQuest.now.nuevoMensaje("<b>You've got this quest done.</b><br/>");
							} else {

								// Obtener cantidad de objetos en el inventario
								var i = 1;
								while(i <= 16) {
									if(sendQuest.now.player.inventario[i].item == 0)
										break;
									i++;
								}

								// Si la cantidad es menor al máximo permitido
								if(i <= 16){
									slot = i;
									console.log(slot);
									sendQuest.now.player.inventario[i] = { item: quest_item.item, cantidad: quest_item.cantidad }
									sendQuest.now.nuevoMensaje("<b>Congratulations!</b><br/>");
									
									db.query("INSERT INTO personajes_logros VALUES('', '"+player_id[sendQuest.user.clientId].id+"', '"+data.id+"')");
									db.query("UPDATE personajes_inventario SET slot_"+slot+" = '"+quest_item.item+"', cantidad_slot_"+slot+" = '"+quest_item.cantidad+"' WHERE personaje_id = '"+player_id[sendQuest.user.clientId].id+"' ");
									
									// Actualizar Inventario
									sendQuest.now.cargarInventario(sendQuest.now.player.inventario);
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
	var cant_slots = 1;
	while(cant_slots <= 16) {
		if(this.now.player.inventario[cant_slots].item == 0)
			break;
		cant_slots++;
	}
	if(cant_slots <= 16){
		this.now.player.inventario[cant_slots+1] = { item: item, cantidad: cantidad };
		db.query("UPDATE personajes_inventario SET slot_"+cant_slots+" = '"+item+"' cantidad_slot_"+cant_slots+" = '"+cantidad+"' WHERE personaje_id = '"+player_id[sendQuest.user.clientId].id+"' ");
		now.now.cargarInventario();
	} else {
		this.now.nuevoMensaje("<b>You need a free slot in your inventory!</b><br/>");
	}
}

clientes.now.mobManager = function(mobId, player){

}


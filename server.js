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

var players = {};
var fecha = new Date();
var porcentajeExpFromMobs = {};
//var minutos = fecha.getMinutes();

// Creaturas temporales
var pos_origen = {};
var mobs = [{
	x: 543,
	y: 289,
	exp: 50,
	type: "npc",
	deathTime: 0,
	settings: {
		name: "Dwarf",
		id: 1,
		image: "c13",
		map: "tikal",
		maxhp: 100,
		hp: 100,
		vel: 1,
	},
	attr: {
		nivel: 1,
		agi: 1,
		dex: 1,
		def: 1
	}
},
{
	x: 401,
	y: 671,
	exp: 100,
	type: "npc",
	deathTime: 0,
	settings: {
		name: "Bat",
		id: 2,
		image: "c15",
		map: "tikal",
		maxhp: 100,
		hp: 100,
		vel: 1
	},
	attr: {
		nivel: 1,
		agi: 1,
		dex: 1,
		def: 1
	}
},
{
	x: 918,
	y: 556,
	exp: 150,
	type: "npc",
	deathTime: 0,
	settings: {
		name: "Gilberto",
		id: 3,
		image: "c12",
		map: "tikal",
		maxhp: 100,
		hp: 100,
		vel: 1
	},
	attr: {
		nivel: 1,
		agi: 1,
		dex: 1,
		def: 1
	}
},{
	x: 742,
	y: 572,
	exp: 20,
	atacante: "",
	type: "creature",
	deathTime: 0,
	settings: {
		name: "Slime",
		id: 4,
		image: "mostri2",
		map: "tikal",
		maxhp: 100,
		hp: 100,
		vel: 2
	},
	attr: {
		nivel: 1,
		fue: 5,
		agi: 1,
		dex: 5,
		def: 1
	}
},{
	x: 1171,
	y: 482,
	exp: 20,
	atacante: "",
	type: "creature",
	deathTime: 0,
	settings: {
		name: "Slime",
		id: 5,
		image: "mostri2",
		map: "tikal",
		maxhp: 100,
		hp: 100,
		vel: 2
	},
	attr: {
		nivel: 1,
		fue: 5,
		agi: 1,
		dex: 5,
		def: 1
	}
},{
	x: 1492,
	y: 752,
	exp: 20,
	atacante: "",
	type: "creature",
	deathTime: 0,
	settings: {
		name: "Slime",
		id: 6,
		image: "mostri2",
		map: "tikal",
		maxhp: 100,
		hp: 100,
		vel: 2
	},
	attr: {
		nivel: 1,
		fue: 5,
		agi: 1,
		dex: 5,
		def: 1
	}
},{
	x: 1355,
	y: 472,
	exp: 20,
	atacante: "",
	type: "creature",
	deathTime: 0,
	settings: {
		name: "Slime",
		id: 7,
		image: "mostri2",
		map: "tikal",
		maxhp: 100,
		hp: 100,
		vel: 2
	},
	attr: {
		nivel: 1,
		fue: 5,
		agi: 1,
		dex: 5,
		def: 1
	}
}];

clientes.now.mobs = mobs;

// Variables para referencias
var online = {};
var player_id = {};
var version = 0.2;

console.log("Tikal Online Server v"+version);

db.query("USE TikalOnline");

// Se conecta un cliente
nowjs.on('connect', function() {
 	console.log("Se ha recibido una conexión");
 	this.now.player = {};
 	this.now.player = { nick: "", hp: 0, inventario: {} };
 	this.now.player.hp = 0;
	this.now.player.inventario = {};

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
      delete player_id[this.user.clientId];
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
					// Generar inventario
					db.query("INSERT INTO personajes_inventario(personaje_id) VALUES('"+player_id[loadPlayer.user.clientId].id+"')");
					var i_ = 1;
					while(i_ <= 16){
						loadPlayer.now.player.inventario[i_] = { item: 0, cantidad: 0 };	
					}
					loadPlayer.now.cargarInventario(loadPlayer.now.player.inventario);
				}
			});
			
			// Cargar atributos
			db.query("SELECT * FROM personajes_atributos WHERE personaje_id = '"+player_id[loadPlayer.user.clientId].id+"' ",
				function selectCb(err, results, fields) {
					if(typeof(results[0]) != 'undefined'){
						loadPlayer.now.player.attr = results[0];
						loadPlayer.now.player.attr.hp = loadPlayer.now.player.attr.maxhp;
					} else {
						db.query("INSERT INTO personajes_atributos(personaje_id) VALUES('"+player_id[loadPlayer.user.clientId].id+"')");
						db.query("SELECT * FROM personajes_atributos WHERE personaje_id = '"+player_id[loadPlayer.user.clientId].id+"' ",
							function selectCb(err, results, fields) {
							if(typeof(results) != 'undefined'){
								loadPlayer.now.player.attr = results[0];
								loadPlayer.now.player.attr.hp = loadPlayer.now.player.attr.maxhp;
								console.log("Inicializado HP: "+loadPlayer.now.player.attr.hp);
							}
						});
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

clientes.now.getPlayers = function(){
	for(var i in players){
		if(players[i].id != this.user.clientId)
			this.now.actualizarPlayers(players[i]);
	}
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

clientes.now.getStats = function(){

	var porcentaje = (this.now.player.attr.hp*100)/this.now.player.attr.maxhp;
	var attr = {
	 			hp_txt: this.now.player.attr.hp, 
	 			hp_por: porcentaje,
	 			st_hp: this.now.player.attr.hp+"/"+this.now.player.attr.maxhp,
	 			level: this.now.player.attr.nivel,
	 			exp: this.now.player.attr.exp+"/"+(50*(1+this.now.player.attr.nivel^1.5)),
	 			st_mana: this.now.player.attr.mana+"/"+this.now.player.attr.maxmana,
	 			mana_por: (this.now.player.attr.mana*100)/this.now.player.attr.maxmana,
	 			mana_txt: this.now.player.attr.mana
	 		};

	this.now.updateStats(attr);

}

clientes.now.useItem = function(item){

	var item = items[item];

	// Si es consumible
	switch(item.type){

		// Healing / Comida
		case 1:
			this.now.player.attr.hp += hp_;
			if(this.now.player.attr.hp > this.now.player.attr.maxhp)
				this.now.player.attr.hp = this.now.player.attr.maxhp;
		break;

		// Mana potion
		case 2:
			this.now.player.attr.mana += hp_;
			if(this.now.player.attr.mana > this.now.player.attr.maxmana)
				this.now.player.attr.mana = this.now.player.attr.maxmana;
		break;
	}

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
		this.now.cargarInventario();
	} else {
		this.now.nuevoMensaje("<b>You need a free slot in your inventory!</b><br/>");
	}
}

// Mob Manager
var mobManager = setInterval(function(){
	var online = 0;
	for(var i in players) {
		online++;
	}
	if(online > 0){
		console.log("Usuarios conectados: "+online);
		for (var i in clientes.now.mobs){
			// Guardar posición de origen
			if(typeof(pos_origen[i]) == 'undefined'){
				pos_origen[i] = { x: clientes.now.mobs[i].x, y: clientes.now.mobs[i].y };
				clientes.now.mobs[i].settings.id_ = i;
			}

			var newPosx = 0;
			var newPosy = 0;
			if(clientes.now.mobs[i].settings.name != "" && clientes.now.mobs[i].settings.hp > 0 && clientes.now.mobs[i].atacante == ""){

				// Modificar X?
				if((Math.round(Math.random()*1)*2-1) == 1)
					newPosx = Math.floor((Math.random()*70)+5);
					newPosx = newPosx*(Math.round(Math.random()*1)*2-1);

				// Modificar Y?
				if((Math.round(Math.random()*1)*2-1) == 1)
					newPosy = Math.floor((Math.random()*70)+5);
					nowPosy = newPosy*(Math.round(Math.random()*1)*2-1);

				// Si no excede un límite de 120
				if((clientes.now.mobs[i].x+newPosx) < (pos_origen[i].x+120) && (clientes.now.mobs[i].x+newPosx) > (pos_origen[i].x-120))
					clientes.now.mobs[i].x += newPosx;
				if((clientes.now.mobs[i].y+newPosy) < (pos_origen[i].y+120) && (clientes.now.mobs[i].y+newPosy) > (pos_origen[i].y-120))
					clientes.now.mobs[i].y += newPosy;

				//console.log("Mob ID: "+clientes.now.mobs[i].settings.id+", "+clientes.now.mobs[i].settings.name+" X: "+clientes.now.mobs[i].x+" Y: "+clientes.now.mobs[i].y+" HP: "+clientes.now.mobs[i].settings.hp);
			} else if(clientes.now.mobs[i].atacante != ""){
			if(typeof(player_id[clientes.now.mobs[i].atacante]) != "undefined"){

					clientes.now.mobs[i].x = players[clientes.now.mobs[i].atacante].x;
					clientes.now.mobs[i].y = players[clientes.now.mobs[i].atacante].y;

				} else {
					clientes.now.mobs[i].atacante = "";
				}
			} else {

				for (var i in clientes.now.mobs){
					if(typeof(pos_origen[i]) != 'undefined' && clientes.now.mobs[i].settings.hp < 1){
						clientes.now.mobs[i].x = pos_origen[i].x;
						clientes.now.mobs[i].y = pos_origen[i].y;
					}
				}

			}
			
		}
	} else {
		//console.log("Esperando usuarios...");
		for (var i in clientes.now.mobs){
			if(typeof(pos_origen[i]) != 'undefined'){
				clientes.now.mobs[i].x = pos_origen[i].x;
				clientes.now.mobs[i].y = pos_origen[i].y;
			}
		}
	}
}, 600);

clientes.now.updateMob = function(id_, pos){
	clientes.now.mobs[id_].x = pos.x;
	clientes.now.mobs[id_].y = pos.y;
	
}

clientes.now.attack = function(id, target){
	var tiempoActual = new Date();

	// Rango de tiempo para ataque
	if(tiempoActual.getTime() > fecha.getTime() + 1000){

		var factor = Math.random(); // Full: 1 Balanceado 0.75 - Defensa 0.5
		var armaAtk = 5;
		var atacanteNivel = this.now.player.attr.nivel;
		var fuerza = this.now.player.attr.atk;
		fecha = tiempoActual;
		if(factor < 0.1)
				factor = 0.15;

		var damage = 0.085*factor*armaAtk*fuerza+atacanteNivel/5;
		damage = parseInt(damage);

		if(target == 0){ // TODO: Validar distancia menor a 40 entre el personaje y el mob.

			var mobDamage = 0.085*Math.random()*(clientes.now.mobs[id].attr.nivel+5/2)*clientes.now.mobs[id].attr.fue+clientes.now.mobs[id].attr.nivel/2;
			console.log(mobDamage);
			mobDamage = parseInt(mobDamage);

			if(mobDamage != 0){
				this.now.player.attr.hp = parseInt(this.now.player.attr.hp)-mobDamage;
				this.now.nuevoMensaje("Has perdido "+mobDamage+" puntos de vida por un ataque de "+clientes.now.mobs[id].settings.name+"<br/>");
			}
			
			if(damage != 0){

				if(clientes.now.mobs[id].atacante == "")
					clientes.now.mobs[id].atacante = this.user.clientId;

				// Acumular experiencia ganada
				var porcentaje_exp = (damage/clientes.now.mobs[id].settings.maxhp)*100;
				porcentaje_exp = clientes.now.mobs[id].exp*(porcentaje_exp/100);
				
				if(typeof(porcentajeExpFromMobs[id]) == "undefined"){
					porcentajeExpFromMobs[id] = {};
					porcentajeExpFromMobs[id][this.user.clientId] = 0;
					porcentajeExpFromMobs[id][this.user.clientId] += porcentaje_exp;
				} else {
					if(typeof(porcentajeExpFromMobs[id][this.now.player.id]) == "undefined")
						porcentajeExpFromMobs[id][this.user.clientId] = 0;
					porcentajeExpFromMobs[id][this.user.clientId] += porcentaje_exp;
				}

				var actualHP = parseInt(clientes.now.mobs[id].settings.hp);
				clientes.now.mobs[id].settings.hp = actualHP - damage;
				this.now.nuevoMensaje("Has causado "+damage+" de da&ntilde;o a "+clientes.now.mobs[id].settings.name+".<br/>");
			} else {
				this.now.nuevoMensaje("Ha fallado tu ataque a "+clientes.now.mobs[id].settings.name+".<br/>");
			}

			if(clientes.now.mobs[id].settings.hp <= 0){
				var muertoFecha = new Date();
				clientes.now.mobs[id].deathTime = muertoFecha.getTime();

				for(index in porcentajeExpFromMobs[id]){
					var p_id = player_id[index].id;

					if(typeof(players[index]) != "undefined"){
						if(this.now.player.id == index){
							this.now.player.attr.exp = this.now.player.attr.exp+parseInt(porcentajeExpFromMobs[id][index]);
							this.now.nuevoMensaje("Gained experience: "+parseInt(porcentajeExpFromMobs[id][index])+"<br/>");
							db.query("UPDATE personajes_atributos SET exp = '"+this.now.player.attr.exp+"' WHERE personaje_id = '"+p_id+"' ");

							// Sube de nivel?
							var xpForLevel = 50 * (1+this.now.player.attr.nivel^1.5);
							if(this.now.player.attr.exp >= xpForLevel){
								var nuevoLevel = this.now.player.attr.nivel+1;
								db.query("UPDATE personajes_atributos SET nivel = '"+nuevoLevel+"' WHERE personaje_id = '"+p_id+"' ");
								this.now.nuevoMensaje("<b>You advanced from level "+this.now.player.attr.nivel+" to level "+nuevoLevel+".</b><br/>");
								this.now.player.attr.nivel = nuevoLevel;
							}
						}
					}

				}

				clientes.now.delMob(clientes.now.mobs[id].settings.id);
			} else {
				clientes.now.updateMob_(clientes.now.mobs[id]);
			}

		} else {

			// Ataque a otro personaje
			

		}

	}
	
}

// Función Update
var respawner = setInterval(function(){
	var online = 0;
	for(var i in players) {
		online++;
	}
	if(online > 0){
		var tiempoActual = new Date();
		for (var i in clientes.now.mobs){
			if(clientes.now.mobs[i].settings.hp < 1){
				if(tiempoActual.getTime() > (clientes.now.mobs[i].deathTime + 52000)){
					clientes.now.mobs[i].settings.hp = clientes.now.mobs[i].settings.maxhp;
				}
			}

		}
	}

},1000);



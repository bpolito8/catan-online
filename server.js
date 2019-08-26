var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.set( 'port', ( process.env.PORT || 8000 ));


server.listen(app.get( 'port' ), function() {
	console.log( 'Node server is running on port ' + app.get( 'port' ));
	});
	
// WARNING: app.listen(80) will NOT work here!

var players = [];
var sockets = [];
var productiveSpots = []
var hexTiles = {};
var colors = [
	"#3333ff",
	"#ffffff",
	"#339933",
	"#cc3300"
]
var spots = [
	[0, 1],
	[1, 1],
	[2, 1],
	[3, 1],
	[4, 1],
	[5, 1],

	[0, 3],
	[1, 3],
	[2, 3],
	[3, 3],
	[4, 3],

	[0, 5],
	[1, 5],
	[2, 5],
	[3, 5],


	[0, -1],
	[1, -1],
	[2, -1],
	[3, -1],
	[4, -1],
	[5, -1],

	[0, -3],
	[1, -3],
	[2, -3],
	[3, -3],
	[4, -3],

	[0, -5],
	[1, -5],
	[2, -5],
	[3, -5],


	[-0, -1],
	[-1, -1],
	[-2, -1],
	[-3, -1],
	[-4, -1],
	[-5, -1],

	[-0, -3],
	[-1, -3],
	[-2, -3],
	[-3, -3],
	[-4, -3],

	[-0, -5],
	[-1, -5],
	[-2, -5],
	[-3, -5],


	[-0, 1],
	[-1, 1],
	[-2, 1],
	[-3, 1],
	[-4, 1],
	[-5, 1],

	[-0, 3],
	[-1, 3],
	[-2, 3],
	[-3, 3],
	[-4, 3],

	[-0, 5],
	[-1, 5],
	[-2, 5],
	[-3, 5]
]

var spotToUserDict = {
	'[1, 0]': 0,
	'[1, 1]': null,
	'[1, 2]': null,
	'[1, 3]': null,
	'[1, 4]': null,
	'[1, 5]': null,
		
	'[3, 0]': null,
	'[3, 1]': null,
	'[3, 2]': null,
	'[3, 3]': null,
	'[3, 4]': null,
		
	'[5, 0]': null,
	'[5, 1]': null,
	'[5, 2]': null,
	'[5, 3]': null,
		
	'[-1, 0]': 0,
	'[-1, 1]': null,
	'[-1, 2]': null,
	'[-1, 3]': null,
	'[-1, 4]': null,
	'[-1, 5]': null,
		
	'[-3, 0]': null,
	'[-3, 1]': 1,
	'[-3, 2]': null,
	'[-3, 3]': null,
	'[-3, 4]': null,
		
	'[-5, 1]': null,
	'[-5, 2]': null,
	'[-5, 3]': null,
		
	'[-1, -1]': null,
	'[-1, -2]': null,
	'[-1, -3]': null,
	'[-1, -4]': null,
	'[-1, -5]': null,
		

	'[-3, -1]': null,
	'[-3, -2]': null,
	'[-3, -3]': null,
	'[-3, -4]': null,

	'[-5, -1]': null,
	'[-5, -2]': null,
	'[-5, -3]': null,
		
		
	'[1, -1]': null,
	'[1, -2]': null,
	'[1, -3]': null,
	'[1, -4]': null,
	'[1, -5]': null,

	'[3, -1]': 1,
	'[3, -2]': null,
	'[3, -3]': null,
	'[3, -4]': null,
		
	'[5, -1]': null,
	'[5, -2]': null,
'[5, -3]': null,


};

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});
app.get('/images/clay.png', function (req, res) {
	res.sendFile(__dirname + '/images/clay.png');
});

app.get('/test', function (req, res) {
	res.send("hello world");
});
app.get('/api/restartGame', function (req, res) {
	console.log("restarting...")
	startGame()
	console.log("restarted")
});

var startGame = function(){
	var players = [];
	var sockets = [];
	var productiveSpots = []
	var hexTiles = {};
	var colors = [
		"#3333ff",
		"#ffffff",
		"#339933",
		"#cc3300"
	]
	var spots = [
		[0, 1],
		[1, 1],
		[2, 1],
		[3, 1],
		[4, 1],
		[5, 1],

		[0, 3],
		[1, 3],
		[2, 3],
		[3, 3],
		[4, 3],

		[0, 5],
		[1, 5],
		[2, 5],
		[3, 5],


		[0, -1],
		[1, -1],
		[2, -1],
		[3, -1],
		[4, -1],
		[5, -1],

		[0, -3],
		[1, -3],
		[2, -3],
		[3, -3],
		[4, -3],

		[0, -5],
		[1, -5],
		[2, -5],
		[3, -5],


		[-0, -1],
		[-1, -1],
		[-2, -1],
		[-3, -1],
		[-4, -1],
		[-5, -1],

		[-0, -3],
		[-1, -3],
		[-2, -3],
		[-3, -3],
		[-4, -3],

		[-0, -5],
		[-1, -5],
		[-2, -5],
		[-3, -5],


		[-0, 1],
		[-1, 1],
		[-2, 1],
		[-3, 1],
		[-4, 1],
		[-5, 1],

		[-0, 3],
		[-1, 3],
		[-2, 3],
		[-3, 3],
		[-4, 3],

		[-0, 5],
		[-1, 5],
		[-2, 5],
		[-3, 5]
	]

	var spotToUserDict = {
		'[1, 0]': 0,
		'[1, 1]': null,
		'[1, 2]': null,
		'[1, 3]': null,
		'[1, 4]': null,
		'[1, 5]': null,
			
		'[3, 0]': null,
		'[3, 1]': null,
		'[3, 2]': null,
		'[3, 3]': null,
		'[3, 4]': null,
			
		'[5, 0]': null,
		'[5, 1]': null,
		'[5, 2]': null,
		'[5, 3]': null,
			
		'[-1, 0]': 0,
		'[-1, 1]': null,
		'[-1, 2]': null,
		'[-1, 3]': null,
		'[-1, 4]': null,
		'[-1, 5]': null,
			
		'[-3, 0]': null,
		'[-3, 1]': 1,
		'[-3, 2]': null,
		'[-3, 3]': null,
		'[-3, 4]': null,
			
		'[-5, 1]': null,
		'[-5, 2]': null,
		'[-5, 3]': null,
			
		'[-1, -1]': null,
		'[-1, -2]': null,
		'[-1, -3]': null,
		'[-1, -4]': null,
		'[-1, -5]': null,
			

		'[-3, -1]': null,
		'[-3, -2]': null,
		'[-3, -3]': null,
		'[-3, -4]': null,

		'[-5, -1]': null,
		'[-5, -2]': null,
		'[-5, -3]': null,
			
			
		'[1, -1]': null,
		'[1, -2]': null,
		'[1, -3]': null,
		'[1, -4]': null,
		'[1, -5]': null,

		'[3, -1]': 1,
		'[3, -2]': null,
		'[3, -3]': null,
		'[3, -4]': null,
			
		'[5, -1]': null,
		'[5, -2]': null,
	'[5, -3]': null,


	};
	var minSessions = 2;
	var gameRunning = false;

	io.on('connection', function (socket) {
		socket.emit('serverMessage', "connection successful");
		socket.emit("setUserId", players.length + 1, colors[players.length]);
		console.log(colors[players.length]);
		socket.on('message', function (data) {
			console.log(data);
			io.emit('message', data);//send to all clients
		});
		app.get('/api/buildRoad', function(req, res){
			console.log(req.query);
			players[req.query.playerId - 1].roads.push({
				gridX: req.query.x,
				gridY: req.query.y * -1
			});
			players[req.query.playerId - 1].resources.wood--;
			players[req.query.playerId - 1].resources.clay--;
			io.emit("post-turn", productiveSpots, players);
		  });
		app.get('/api/buildSettlement', function(req, res){
			console.log(req.query);
			players[req.query.playerId - 1].settlements.push({
				gridX: req.query.x,
				gridY: req.query.y * -1
			});
			players[req.query.playerId - 1].resources.wood--;
			players[req.query.playerId - 1].resources.clay--;
			players[req.query.playerId - 1].resources.wool--;
			players[req.query.playerId - 1].resources.grain--;
			io.emit("post-turn", productiveSpots, players);
		  });
		//var oi = io.listen(server);
		//sessionIds.push(socket.id);
		sockets.push(socket);
		players.push({
			num: players.length,
			settlements: [
				{
					gridY: players.length,
					gridX: 1 + (2 * players.length)
				},
				{
					gridY: -1 * players.length,
					gridX: -1 - (2 * players.length)
				}
			],
			roads: [
				{
					gridY: players.length + 0.5,
					gridX: 1 + (2 * players.length)
				},
				{
					gridY: -1 * players.length + 0.5,
					gridX: -1 - (2 * players.length)
				}
			],
			devCards: {
				used: [],
				unused: []
			},
			resources: {
				ore: 0,
				clay: 1,
				wool: 0,
				wood: 1,
				grain: 0,
	
			},
			strokeStyle: colors[players.length]
		});
	
		debugger;
	
		// if(hexTiles.length > 0){
		// 	socket.emit('board', hexTiles);
		// }
		if (players.length >= minSessions && !gameRunning) {
			console.log(players.length + " players have joined, starting game");
			game(socket);
		}
		
	
	
	
	});
	async function game(socket) {
		gameRunning = true;
	
		//load board
		hexTiles = loadBoard();
		io.emit('initialboard', hexTiles);
		io.emit('players', hexTiles);
		console.log("Board data sent to clients");
	
		//process turns
		while (gameRunning) {
			for (var i = 0; i < players.length; i++) {
				var playerNum = players[i].num + 1;
				console.log("The current player is Player " + playerNum);
				console.log(players.length)
				io.emit('turnUpdate', (players[i].num + 1));
				var turnOver = false;
	
	
				runTurn(players[i]);
	
	
				sockets[i].on("endTurn", function (data) {
					//console.log(data == i + 1);
					//console.log(data + " " + i + 1);
					if (data - 1 == i) {
						turnOver = true;
					}
				}); //event listener, can be called on client to execute on server
				
				var q = 0;
				while (!turnOver) {
					q++;
					await sleep(1000)
				};
				//console.log("Player " + players[i].num + " turn over in " + q + " seconds");
			}
	
		}
		socket.broadcast("serverMessage", "game over");
	
	
	}

	const sleep = (milliseconds) => {
		return new Promise(resolve => setTimeout(resolve, milliseconds))
	}
	
	function runTurn(player) {
		if (player.devCards.unused.length > 0) {
			//TODO: prompt the user to see if they want to use dev cards
		}
		var diceRoll = rollDice();
		var playerNum = player.num + 1;
		io.emit("serverMessage", "Player " + playerNum + " rolled a " + diceRoll);
		io.emit("diceRoll", diceRoll)
		var xOffset = 1;
		var yOffset = 1;
		var xMax = 5;
		var xMin = -5
		var yMax = 5;
		var yMin = -5;
		productiveSpots = [];
		if (diceRoll == 7) {
			
			//TODO: run robber stuff
		} else {
			console.log("tileCoords");
		var gameRunning = false;
			console.log(hexTiles[0].gridX);
			
			for (var i = 0; i < hexTiles.length; i++) {
				//check if the tile has the appropriate number
				if (hexTiles[i].number == diceRoll) {
					
					var y = hexTiles[i].gridY * -1;
					var x = hexTiles[i].gridX;
					productiveSpots.push([x, y]);
					console.log("There is an " + diceRoll + " at [" + x + ", " + y + "]");
					//check all six possible spots in relation to this tile
					var spotsToCheck = [
						[x + xOffset, y + yOffset],
						[x + xOffset, y],
						[x + xOffset, y - yOffset],
						[x - xOffset, y - yOffset],
						[x - xOffset, y + yOffset],
						[x - xOffset, y],
					];
					//console.log(spotsToCheck);
	
					var keys = [];
					for(var h = 0; h < spotsToCheck.length; h++){
						keys.push("[" + spotsToCheck[h][0] + ", " + spotsToCheck[h][1] + "]");
					}
					
					console.log(keys);
					for (j in keys) {
						var player = players[spotToUserDict[keys[j]]];
						if(player){
							player.resources[hexTiles[i].resourceType]++;
						}
					}
					// players[spotToUserDict["[" + hexTiles.gridX + ", " + hexTiles.gridY + yOffset + "]"]][hexTiles.resourceType]++;
					// players[spotToUserDict["[" + hexTiles.gridX +  xOffset+ ", " + hexTiles.gridY + yOffset + "]"]][hexTiles.resourceType]++;
					// players[spotToUserDict["[" + hexTiles.gridX + xOffset+ ", " + hexTiles.gridY - yOffset + "]"]][hexTiles.resourceType]++;
					// players[spotToUserDict["[" + hexTiles.gridX+ ", " + hexTiles.gridY - yOffset + "]"]][hexTiles.resourceType]++;
					// players[spotToUserDict["[" + hexTiles.gridX - xOffset+ ", " + hexTiles.gridY - yOffset + "]"]][hexTiles.resourceType]++;
					// players[spotToUserDict["[" + hexTiles.gridX - xOffset+ ", " + hexTiles.gridY + yOffset + "]"]][hexTiles.resourceType]++;
				}
			}
			
		}
		io.emit("post-turn", productiveSpots, players);
			console.log(players);
	}
	function rollDice() {
		var dice1 = Math.floor((Math.random() * 6) + 1);
		var dice2 = Math.floor((Math.random() * 6) + 1);
		return dice1 + dice2;
	
	}
	function addSettlement(player, x, y){
		player.settlements.push({
			gridX: x,
			gridY: y
		});
	}
}

startGame()




/*
*
*
*CATAN RANDOMIZER CODE
*
*
*/

// ----- Canvas globals -----

var mapCanvas;
var drawingContext;

var canvasCenterX;
var canvasCenterY;

// ----- Hexagon drawing parameters -----

var mapStyle = "retro";

var size = null;
var defaultFillStyle = "#ffffff";
var strokeStyle = "#000000";
var lineWidth = 3;
var resourceTypeToColor = {
	"ore": "#363636",
	"clay": "#E83200",
	"wool": "#98E82E",
	"wood": "#0A7300",
	"grain": "#E0E000",
	"desert": "#F2F0A0",
	"none": "#ffffff"
};
var resourceTypeToImageCanvas = {
	"ore": null,
	"clay": null,
	"wool": null,
	"wood": null,
	"grain": null,
	"desert": null
};

//var allImagesLoaded = false;

// ----- Grid layout globals -----

var dx = size * (1 + Math.cos(Math.PI / 3)) / 2;
var dy = size * Math.sin(Math.PI / 3);

/*
 * Formula:
 * 
 * Height = (coordSpacing + 2) * dy
 *        = (coordSpacing + 2) * Math.sin(Math.PI/3) * size
 * Size = Height / ( (coordSpacing + 2) * Math.sin(Math.PI/3) )
 * 
 * Width = (coordSpacing * dx) + (2 * size)
 *       = (coordSpacing * (1 + Math.cos(Math.PI/3)) / 2 * size) + (2 * size)
 *       = ( (coordSpacing * (1 + Math.cos(Math.PI/3)) / 2) + 2 ) * size
 * Size = Width / ( (coordSpacing * (1 + Math.cos(Math.PI/3)) / 2) + 2 )
*/

// ----- Map definition globals -----

var catanMap = new CatanMap();

var normalMap = new MapDefinition();

// ----- FUNCTIONS -----

function loadBoard() {

	// loadImages(function() {
	// 	return generate();
	// });

	// addCanvas();
	//generate();
	var resourceDict = {
		"desert": 1,
		"wood": 4,
		"clay": 3,
		"wool": 4,
		"grain": 4,
		"ore": 3
	};

	var normalMap = {};
	normalMap.resourceDict = {
		"desert": 1,
		"wood": 4,
		"clay": 3,
		"wool": 4,
		"grain": 4,
		"ore": 3
	};
	normalMap.numberDict = {
		2: 1,
		3: 2,
		4: 2,
		5: 2,
		6: 2,
		8: 2,
		9: 2,
		10: 2,
		11: 2,
		12: 1
	}
	normalMap.coordinatesArray = [
		[-4, 2], [-4, 0], [-4, -2],
		[-2, 3], [-2, 1], [-2, -1], [-2, -3],
		[0, 4], [0, 2], [0, 0], [0, -2], [0, -4],
		[2, 3], [2, 1], [2, -1], [2, -3],
		[4, 2], [4, 0], [4, -2]
	];

	coordToTile = {};
	var mapDefinition = normalMap;

	var hexTiles = [];

	var numTiles = mapDefinition.coordinatesArray.length;

	var tileCoordinates = mapDefinition.coordinatesArray.copy();

	var tileNumbers = [];
	for (var key in mapDefinition.numberDict) {
		for (var i = 0; i < mapDefinition.numberDict[key]; i += 1) {
			tileNumbers.push(parseInt(key));
		}
	}

	var tileTypes = [];
	for (var key in mapDefinition.resourceDict) {
		if (key != "desert") {
			for (var i = 0; i < mapDefinition.resourceDict[key]; i += 1) {
				tileTypes.push(key);
			}
		}
	}

	var newCoords = null;
	var numDeserts = mapDefinition.resourceDict["desert"];

	for (var i = 0; i < numDeserts; i += 1) {
		var desertHexTile = new HexTile();
		newCoords = tileCoordinates.random(true);
		desertHexTile.setCoordinate.apply(
			desertHexTile,
			newCoords
		);
		desertHexTile.setResourceType("desert");
		hexTiles.push(desertHexTile);
		coordToTile[newCoords.toString()] = desertHexTile;
	}

	// Move all highly productive tile number (6 and 8) to the front
	// of the tileNumbers array
	var highlyProductiveIdx = [];
	highlyProductiveIdx = highlyProductiveIdx.concat(
		tileNumbers.indexOfArray(6),
		tileNumbers.indexOfArray(8)
	);
	for (var i = 0; i < highlyProductiveIdx.length; i += 1) {
		tileNumbers.swap(i, highlyProductiveIdx[i]);
	}

	// Handle all other tiles
	for (var i = 0; i < (numTiles - numDeserts); i += 1) {

		var newHexTile = new HexTile();
		newHexTile.setNumber(tileNumbers[i]);
		newHexTile.setResourceType(tileTypes.random(true));

		var invalid;

		if (newHexTile.isHighlyProductive()) {
			var tmpCoords = [];
			do {
				newCoords = tileCoordinates.random(true);
				newHexTile.setCoordinate.apply(
					newHexTile,
					newCoords
				);
				invalid = false;// hasHighlyProductiveNeighbors(newHexTile);
				if (invalid) {
					tmpCoords.push(newCoords);
				}
			} while (invalid);
			tileCoordinates = tileCoordinates.concat(tmpCoords);
		} else {
			newCoords = tileCoordinates.random(true);
			newHexTile.setCoordinate.apply(
				newHexTile,
				newCoords
			);
		}

		hexTiles.push(newHexTile);
		coordToTile[newCoords.toString()] = newHexTile;

	} // end for loop
	console.log(hexTiles);
	return hexTiles;

	//console.log(coordToTile);

}

function preloadImages(arr, callback) {
	//http://www.javascriptkit.com/javatutors/preloadimagesplus.shtml

	var newimages = [], loadedimages = 0;
	var postaction = function () { };
	var arr = (typeof arr != "object") ? [arr] : arr;
	function imageloadpost() {
		loadedimages++;
		if (loadedimages == arr.length) {
			callback(newimages); //call postaction and pass in newimages array as parameter
		}
	}
	for (var i = 0; i < arr.length; i++) {
		newimages[i] = new Image();
		newimages[i].src = arr[i];
		newimages[i].onload = function () {
			imageloadpost();
		}
		newimages[i].onerror = function () {
			imageloadpost();
		}
	}

}

function loadImages(callback) {

	var rTypes = [];
	var imgPaths = [];
	for (var key in resourceTypeToImageCanvas) {
		rTypes.push(key);
		imgPaths.push("images/" + key + ".png");
	}

	preloadImages(imgPaths, function (images) {

		for (var i = 0; i < imgPaths.length; i += 1) {
			//resourceTypeToImage[ rTypes[i] ] = images[i];
			var img = images[i];
			var imgCanvas = document.createElement("canvas");
			var imgContext = imgCanvas.getContext("2d");

			imgCanvas.width = img.width;
			imgCanvas.height = img.height;
			imgContext.drawImage(img, 0, 0);

			resourceTypeToImageCanvas[rTypes[i]] = imgCanvas;
		}

		callback();

	});

}

function MapDefinition() {
	this.resourceDict = null;
	this.numberDict = null;
	this.coordinatesArray = null;
}

function CatanMap() {

	this.mapDefinition = null;
	this.hexTiles = null;
	this.coordToTile = {};
	this.coordSpan = [0, 0];

}
CatanMap.prototype.getAdjacentTiles = function (tile) {

	var tileX = tile.gridX;
	var tileY = tile.gridY;

	var adjTiles = [];

	// (+0,+2), (+2,+1), (+2,-1), (+0,-2), (-2,-1), (-2,1)
	xshift = [0, 2, 2, 0, -2, -2];
	yshift = [2, 1, -1, -2, -1, 1];

	for (var i = 0; i < 6; i += 1) {
		var adjTile = this.coordToTile[
			[tileX + xshift[i], tileY + yshift[i]].toString()
		];
		// Will be null if no hex tile found at that coordinate
		if (adjTile) {
			adjTiles.push(adjTile);
		}
	}

	return adjTiles;

}
function checkIfUserHasSettlementOnSpot(x, y, settlements){
	for(i = 0; i < settlements.length; i++){
		if(settlements[i].gridX == x && settlements[i].gridY == y);
	}
	return false;
}

function hasHighlyProductiveNeighbors(tile) {
	var adjacentTiles = this.getAdjacentTiles(tile);
	for (var i = 0; i < adjacentTiles.length; i += 1) {
		if (adjacentTiles[i].isHighlyProductive()) {
			return true;
		}
	}
	return false;
}

function HexTile() {
	this.gridX;
	this.gridY;
	this.xCenter;
	this.yCenter;
	this.resourceType = "none";
	this.fillStyle = defaultFillStyle;
	this.number;
}
HexTile.prototype.strokeStyle = strokeStyle;
HexTile.prototype.lineWidth = lineWidth;
HexTile.prototype.hexColorMap = resourceTypeToColor;
HexTile.prototype.size = size;
HexTile.prototype.setResourceType = function (resourceType) {
	if (this.hexColorMap[resourceType]) {
		this.resourceType = resourceType;
		this.fillStyle = this.hexColorMap[resourceType];
	} else {
		console.log("Unrecognized resource type:", resourceType);
	}
}
HexTile.prototype.isHighlyProductive = function () {
	return ((this.number == 6) || (this.number == 8));
}
HexTile.prototype.setNumber = function (number) {
	this.number = number;
}
HexTile.prototype.setCoordinate = function (x, y) {
	this.gridX = x;
	this.gridY = y;
}

Array.prototype.random = function (removeElem) {
	var idx = Math.floor(Math.random() * this.length);
	var val = this[idx];
	if (removeElem) {
		this.splice(idx, 1);
	}
	return val;
}
Array.prototype.copy = function () {
	return this.slice();
}
Array.prototype.indexOfArray = function (val) {
	var arr = [];
	var sIdx = 0;
	var tmpCopy = this.copy();
	do {
		var rIdx = tmpCopy.indexOf(val);
		var valid = (rIdx >= 0);
		if (valid) {
			tmpCopy.splice(0, rIdx + 1);
			arr.push(sIdx + rIdx);
			sIdx += rIdx + 1;
		}
	} while (valid);
	return arr;
}
Array.prototype.swap = function (idx1, idx2) {
	var tmp = this[idx1];
	this[idx1] = this[idx2];
	this[idx2] = tmp;
}


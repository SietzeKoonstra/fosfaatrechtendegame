import Tractor  from "./tractor.js";
import Enemy  from "./enemy.js";
let config = { 
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                x: 0,
                y: 0
            }            
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

let game = new Phaser.Game(config); //aanmaken van game object.
let map; //variabele waar we de map in gaan opslaan.
let mapLayer1; //layer met de muren.
let mapLayer2; //layer met de grond.
let tractor; //variabele voor tractor
let fosfaatRechten; //hier wordt de fosfatengroup in opgeslagen.
let score = 0; //de score variabele
let oldScore = -1; //variabele voor het checken of de score ook veranderd. anders beginnen er dingen spastisch te doen..
let numberOfFosfaatRechtenInMap = 0; //het aantal fosfaten dat in de map is gezet.
let numberOfFosfaatRechten = 0; //het aantal fosfaatrechten dat verzameld is.
let enemys = []; //een array waar de enemys in worden opgeslagen.
let cursors; //een variabele waar de cursors worden opgeslagen.
let enemysActive = false; //een variabele om makkelijk te checken of alle enemys niet al eens op active zijn gezet.
let gotFosfaatRechten = false; //boolean voor opslaan of er al een fosfaatrecht is gepakt.

function preload()
{
	this.load.tilemapTiledJSON("map", "map.json"); //ophalen map.
	this.load.image("tiles", "tiles.png"); //ophalen tiles.
	this.load.image("grassTiles", "grassTiles.png"); // ophalen van grassTiles
	this.load.image("tractor", "dikketrekker.png"); //ophalen afbeelding trekker.
	this.load.image("tjeerd", "tjeerd.png"); //ophallen afbeelding tjeerd.
	this.load.image("jesse", "jesse.png"); //ophalen afbeelding jesse.
	this.load.image("fosfaatRecht", "fosfaatRecht.png"); //ophalen afbeelding fosfaatRecht.
}

function create() {
	map = this.make.tilemap({ key: "map", tileWidth: 32, tileHeight: 32}); //aanmaken map van tiles.
	const tilesCollectie = map.addTilesetImage("tiles"); //toevoegen van afbeelding die gebruikt gaat worden voor de tiles voor muren.
	const grassTilesCollectie = map.addTilesetImage("grassTiles"); //toevoegen van afbeelding die gebruikt gaat worden voor de tiles voor gras.
	mapLayer1 = map.createStaticLayer("Tile Layer 1", tilesCollectie, 0, 0);//maken van statische layer: is statisch zodat objecten niet kunnen verplaatst worden.
	map.setCollision(20); //set collision by index. De index van de muur tile is 20.
	mapLayer2 = map.createStaticLayer("Tile Layer 2", grassTilesCollectie, 0, 0);
	

	//toevoegen van trekker.
	let tractorObjMap = map.findObject("Objectlaag 1", obj => obj.name === "Tractor"); //ophalen van tractor object in map.
	let location = new Phaser.Geom.Point(tractorObjMap.x + 16, tractorObjMap.y - 16); //maken van locatie van tractor.
	this.tractor = new Tractor(this, location, "tractor"); //aanmaken van tractor object.
	tractor = this.tractor; //toevoegen van tractor aan de globale variabele.
	
	//toevoegen van fosfaatRechten.
	let scene = this; //variabele waar de huidige scene wordt opgeslagen, dit is een workaround voor regel 71.
	fosfaatRechten = this.physics.add.group();
	map.filterObjects("Objectlaag 1", function(object, index, array) { //haal alle objecten op uit de map en loop erdoor heen
		if (object.name == "FosfaatRecht") { //check of de objectnaam gelijk is aan "FosfaatRecht"
			let fosfaatRecht = scene.physics.add.sprite(object.x + 16, object.y - 16, "fosfaatRecht"); //voeg een sprite toe aan de coordinaten van het object
			fosfaatRechten.add(fosfaatRecht); //voeg dit object toe aan de array fosfaatrechten.
			numberOfFosfaatRechtenInMap++; //increment de variable fosfaatRechten in map.
		}
	});
	// console.log(numberOfFosfaatRechtenInMap);

	//toevoegen van eneymys
	let jesseGroup = this.physics.add.group(); //aanmaken van jesse groep.
	let tjeerdGroup = this.physics.add.group();//aanmaken van tjeerd groep.
	map.filterObjects("Objectlaag 1", function(object, index, array){ //haal alle objecten op uit de map en loop erdoorheen.
		if (object.name === "Jesse") { //checken of de object naam gelijk is aan Jesse.
			let spriteName = 'jesse'; //zet de sprite naam.
			let location = new Phaser.Geom.Point(object.x + 16, object.y - 16); //maak een point object voor de coordianten van het object in de map.
			let enemy = new Enemy(scene, location, spriteName) //maak een nieuwe enemy met de meegegeven variabelen.
			enemys.push(enemy); //voeg nieuwe enemy toe aan de enemies array.
			jesseGroup.add(enemy.sprite); //voeg de sprite toe aan de jesseGroep.
		}
		if (object.name === "Tjeerd") {
			let spriteName = 'tjeerd';
			let location = new Phaser.Geom.Point(object.x + 16, object.y - 16);
			let enemy = new Enemy(scene, location, spriteName)
			enemys.push(enemy);
			tjeerdGroup.add(enemy.sprite);
		}
	});

	//add coliders voor tussen enemy met map en tractor met map.
	this.physics.add.collider(this.tractor.getSprite(), mapLayer1);
	this.physics.add.collider(jesseGroup, mapLayer1);
	this.physics.add.collider(tjeerdGroup, mapLayer1);

	//add een overlap voor tractor en fosfaatrecht.
	this.physics.add.overlap(this.tractor.getSprite(), fosfaatRechten, function(tractorSprite, fosfaatRecht){
		fosfaatRecht.disableBody(true, true); //als de tractor een fosfaatrecht aanraakt, is het fosfaatrecht niet meer zichtbaar.
		numberOfFosfaatRechten++; //increment het aantal gepakte fosfaatrechten.
		score += 20; //increment de score met 20.
		gotFosfaatRechten = true; //zet de variabele dat er een fosfaatrecht gepakt is op true.
		if (numberOfFosfaatRechtenInMap == numberOfFosfaatRechten) { //checken of het aantal gepakte fosfaatrechten gelijk is aan de fosfaatrechten in de map.
			resetFosfaatRechten(); //reset alle fosfaatrechten.
		}
	}, null, this);

	//add overlap tussen enemys en tractor.
	this.physics.add.overlap(this.tractor.getSprite(), tjeerdGroup, function(){
		gepaktDoorTjeerd();
		this.tractor.respawn();
	}, null, this);
	this.physics.add.overlap(this.tractor.getSprite(), jesseGroup, function(){
		gepaktDoorJesse();
		this.tractor.respawn();
	}, null, this);

	//maken van variabele voor cursors.
	cursors = this.input.keyboard.createCursorKeys();

}

function update(){
	if(oldScore !== score){ //checken of de score veranderd is. Als we dit niet doen, wordt de score vaker dan nodig gezet.
		// console.log(score);
		document.getElementById("score").innerHTML = "<p>FosfaatrechtenScore: " + score + "</p>";
		oldScore = score;//zet de oldscore variabele.
	}

	if (this.tractor.getOldLives() !== this.tractor.getLives()) { //checken of de tractorlives veranderd is. Als we dit niet doen, worden de lives vaker dan nodig gezet.
		// console.log(this.tractor.lives);
		document.getElementById("levens").innerHTML = "<p>levens: " + this.tractor.getLives() + "</p>";
		this.tractor.getOldLives(this.tractor.getLives()); //zet de tractorlives variabele.
	}

	if(this.tractor.lives <= 0){
		alert("Dood!\n Je score: " + score);
		location.reload(true);
		this.tractor.setLives(3);
		gotFosfaatRechten = false;
		numberOfFosfaatRechten = 0;
		score = 0;
	}

	if(gotFosfaatRechten && score < 20){
		alert("Te weinig fosfaatrechten!\n Je score: " + score);
		location.reload(true);
		this.tractor.setLives(3);
		gotFosfaatRechten = false;
		numberOfFosfaatRechten = 0;
		score = 0;
	}
	
	//zetten van environment van tractor.
	let tractorEnvironment = getEnvironTiles(this.tractor.getSprite());
	this.tractor.setEnvironment(tractorEnvironment);
	// console.log(this.tractor.environment);
	for(let enemy of enemys){
		let enemyEnvironment = getEnvironTiles(enemy.getSprite());
		enemy.setEnvironment(enemyEnvironment);
	}

	//zet de currentPoints voor de verschillende sprites
	this.tractor.setCurrentPoint(getCurrentPoint(this.tractor.getSprite()));

	for(let enemy of enemys){
		enemy.setCurrentPoint(getCurrentPoint(enemy.getSprite()));
	}

	//afvangen of er cursors zijn ingedrukt.
	if (cursors.left.isDown)
    {
        this.tractor.setTwistAround(Phaser.LEFT); //het zetten van de twistaround variabele van de tractor.
        setEnemysActive(); //voor de setEnemysActive functie uit.
        // console.log("left");
    }
    else if (cursors.right.isDown)
    {
        this.tractor.setTwistAround(Phaser.RIGHT);
        setEnemysActive();
        // console.log("right");
    }   
    else if (cursors.up.isDown)
    {
        this.tractor.setTwistAround(Phaser.UP);
        setEnemysActive();
        // console.log("up");
    }
    else if (cursors.down.isDown)
    {
        this.tractor.setTwistAround(Phaser.DOWN);
        setEnemysActive();
        // console.log("down");
    }
    else
    {
        this.tractor.setTwistAround(Phaser.NONE);   

    }

    //ververs alle objecten.
    this.tractor.refresh()

    for(let enemy of enemys){
    	enemy.refresh()
    }

}

//een methode om de tiles die om de huidige locatie heen zitten op te halen.
function getEnvironTiles(object){

	let environment = []; //aanmaken van environment array.

	let objectX = Phaser.Math.FloorTo(object.x); //ophalen en afronden van huidige x coordinaat.
	let objectY = Phaser.Math.FloorTo(object.y); //ophalen en afronden van huidige y coordinaat.

	let tile = map.getTileAtWorldXY(objectX, objectY); //We halen hier de tile met behulp van de world coördinaten zodat we later gemakkelijk de naastgelegentiles kunnen ophalen. 

	environment[Phaser.LEFT] = map.getTileAt(tile.x-1, tile.y, true, mapLayer1); //ophalen van tile aan linkerkant en in array stoppen.
	environment[Phaser.RIGHT] = map.getTileAt(tile.x+1, tile.y, true, mapLayer1); //ophalen van tile aan rechterkant en in array stoppen.
	environment[Phaser.UP] = map.getTileAt(tile.x, tile.y-1, true, mapLayer1); //ophalen van tile aan bovenkant en in array stoppen.
	environment[Phaser.DOWN] = map.getTileAt(tile.x, tile.y+1, true, mapLayer1); //ophalen van tile aan onderkant en in array stoppen.

	return environment; //return environment variabele.
}
 //haal de currentpoint variabele op van een object, de parameter moet een sprite zijn.
function getCurrentPoint(object){
	let currentPoint = new Phaser.Geom.Point(); //aanmaken van nieuwe currentPoint variabele.

	let objectX=Phaser.Math.FloorTo(object.x); //ophalen en afronden van huidige x coördinaat van object.
    let objectY=Phaser.Math.FloorTo(object.y); //ophalen en afronden van huidige y coördinaat van object.
    /*
	Als we gewoon de coördinaten van de sprite returnen, levert dit problemen op bij het bewegen tussen obstakels. Dit komt doordat tile coördinaten en world coördinaten verschillen.
	Daarom halen we eerst de tile op op dat coordinaat, en returnen we deze waarden.
    */
    let tile = map.getTileAtWorldXY(objectX, objectY); //ophalen van tile op dat  world coördinaat.
    //https://photonstorm.github.io/phaser3-docs/Phaser.Tilemaps.Tile.html#pixelX__anchor
	currentPoint.x = tile.pixelX + 16; //De pixelX menmber van een tile is het x coordinaat van de tile van linksboven gezien, daarom doe ik +16 om in het midden te komen.
	currentPoint.y = tile.pixelY + 16; //De pixelY menmber van een tile is het y coordinaat van de tile van linksboven gezien, daarom doe ik +16 om in het midden te komen.

	return currentPoint; // return de currentPoint variabele.
}

function setEnemysActive(){ //zet alle enmys op active.
	if(enemysActive === false){ //chec of deze geen true is.
		for(let enemy of enemys){ //loop door de enemies
			if (enemy.getActive() !== true) { //als de enemys nog niet active is.
				enemy.setActive(); //zet de enemy op active.
			}
		}
		enemysActive = true; //zet de globale variabele op true.
	}
}

function gepaktDoorJesse(){
	tractor.die();
}

function gepaktDoorTjeerd(){
	score = Phaser.Math.FloorTo(score/2); //halveer de score.
	tractor.die();
}

function resetFosfaatRechten(){
	for(let fosfaatrecht of fosfaatRechten.getChildren()){ //loop door de fosfaatrechten
		fosfaatrecht.enableBody(false, fosfaatrecht.x, fosfaatrecht.y, true, true); //maak de fosfaatrechten weer zichtbaar.
		numberOfFosfaatRechten = 0;
	}
}
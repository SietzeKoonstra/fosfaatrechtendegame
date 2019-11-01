export default class Tractor{
	constructor(scene, location, spriteName){
		this.sprite = scene.physics.add.sprite(location.x, location.y, spriteName).setScale(0.90); //setScale verkleint de sprite, anders problemen met manouvreren tussen muren.
		this.location = location; //de begin locatie
		this.environment = [] //de omliggende tiles
		this.currentPoint = new Phaser.Geom.Point(); //het huidige punt.
		this.direction = Phaser.NONE; //huidige richting.
		this.twistAround = Phaser.NONE; //de nieuwe richting waar naar toe te bewegen.
		this.lives = 3; //het aantal levens.
		this.oldLives = -1; //een variabele om te zorgen dat de levens niet vaker dan nodig worden uitgeprint.
		this.nextPoint = new Phaser.Geom.Point(); //het punt waar naar toe te bewegen.
	}
	getSprite(){
		return this.sprite;
	}
	setLives(numberOfLives){
		this.lives = numberOfLives;
	}
	getLives(){
		return this.lives;
	}
	//zet de oldLives variabele
	setOldLives(numberOfLives){
		this.oldLives = numberOfLives;
	}
	getOldLives(){
		return this.oldLives;
	}
	//zet de environment variabele
	setEnvironment(environment) {
		this.environment = environment;
	}
	//zet de currentPoint
	setCurrentPoint(point){
		this.currentPoint = point;
	}
	//als de tractor doodgaat
	die() {
		this.lives--
	}
	//als de tractor respawned
	respawn(){
		// console.log("tractor respawn");
        this.sprite.setPosition(this.location.x, this.location.y); //zet de positie van de sprite naar de begin locatie.
        this.twistAround = Phaser.NONE;
        this.direction = Phaser.NONE;
        this.nextPoint = new Phaser.Geom.Point();
	}

	refresh(){
		this.sprite.setVelocity(this.nextPoint.x * 80,  this.nextPoint.y * 80); //beweeeg met een snelheid van 80 naar het volgende punt;
		this.move();
	}

	setTwistAround(direction)
    {
		if(direction !== Phaser.NONE){ //checken of de gezette direction niet gelijk is aan phaser.NONE, anders krijgen we problem bij het checken of de tile geen collide tile is
			if(this.environment[direction].index !== 20){//checken of de tile een muur is of niet.
				if (this.twistAround !== direction) { //als de huidige aangegeven draai gelijk is aan de nieuwe richting hoeft deze niet gezet te worden.
					if (this.direction !== direction) {//als de huidige richting gelijk is aan de nieuwe richting hoeft deze niet gezet te worden.
						this.twistAround = direction;
					}
				}
			}
		}
    }

	move()
    {
    	if(this.twistAround !== Phaser.NONE){ //als de er geen nieuwe richting is, hoeft deze functie niet te worden uitgevoerd.
    		this.sprite.setPosition(this.currentPoint.x, this.currentPoint.y);//zet de sprite op de afgeronde huidige locatie.
	        this.direction = this.twistAround; //update de huidige richting naar de nieuwe.

	        if (this.direction === Phaser.LEFT) { //als de (nieuwe richting links is)
	        	this.sprite.flipX = false; //flip de sprite.
	        	this.nextPoint.x=-1; //zet de x voor het punt waar naar toe moet worden bewogen.
        		this.nextPoint.y=0; //zet de y voor het punt waar naar toe moet worden bewogen.
	        } else if (this.direction === Phaser.RIGHT){
	        	this.sprite.flipX = true;
	        	this.nextPoint.x=1;
        		this.nextPoint.y=0;
	        } else if (this.direction === Phaser.UP){
	        	this.nextPoint.x=0;
        		this.nextPoint.y=-1;
	        } else if (this.direction === Phaser.DOWN){
	        	this.nextPoint.x=0;
        		this.nextPoint.y=1;
	        }
	        this.twistAround = Phaser.NONE;
        }
    }
}
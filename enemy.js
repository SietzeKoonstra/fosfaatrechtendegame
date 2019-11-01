export default class Enemy{
	constructor(scene, location, spriteName){
		this.sprite = scene.physics.add.sprite(location.x, location.y, spriteName).setScale(0.9); //setScale verkleint de sprite, anders problemen met manouvreren door muren.
		this.location = location; //de locatie van de enemy bij aanmaken
		// this.spriteName = spriteName; //de naam van de sprite
		this.environment = [] //de omliggende tiles
		this.currentPoint = new Phaser.Geom.Point();//huidige punt
		this.direction = Phaser.NONE; //huidige richting
		this.twistAround = Phaser.NONE; //nieuwe richting
		this.nextPoint = new Phaser.Geom.Point(); //het volgende punt waar naar toe moet worden bewogen.
		this.twistTimes = [8, 16, 32, 64]; //het aantal keren waarna er een een randomTwist moet worden gedaan
		this.randomGenerator = new Phaser.Math.RandomDataGenerator(); //een random data generator.
		this.twistTime = this.randomGenerator.pick(this.twistTimes); //een willekeurige waarde uit de twistTimes array
		this.numberOfTwists = 0; // het aantal twists dat gedaan is.
		this.active = false; //boolean of de enemy active is.
	}
	setActive(){
		this.active = true;
	}
	getActive(){
		return this.active;
	}
	getSprite(){
		return this.sprite;
	}
	//zet de environment variabele
	setEnvironment(environment) {
		this.environment = environment;
		//console.log("setEnvironment gelukt!")
	}
	//zet de currentPoint
	setCurrentPoint(point){
		this.currentPoint = point;
	}

	refresh(){
		if (this.active !== false) {
			this.sprite.setVelocity(this.nextPoint.x * 90,  this.nextPoint.y * 90);
			this.move();
			if(this.direction !== Phaser.NONE){ //check of huidige aangegeven richting niet gelijk is aan Phaser.NONE.
				if(this.environment[this.direction].index === 20){ //check of tile voor sprite geen muur is. Zo ja, takeRandomTwist.
					this.randomTwistAround();
				}
			}
		}
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

    randomTwistAround(){
    	let possibleDirections = []; //Maak een nieuwe variabele voor de mogelijke nieuwe richtingen
    	if (this.direction !== Phaser.RIGHT) { //Dit zorgt ervoor dat de enemies niet iedere spastisch heen en weer gaan en iets besluitvaster bewegen.
	    	if (this.environment[Phaser.LEFT].index !== 20) { //Als er in deze richting geen muur is, is dit een mogelijke nieuwe richting.
	    		possibleDirections.push(Phaser.LEFT); //toevoegen van nieuwe richting.
	    	}
	    }
	    if (this.direction !== Phaser.LEFT) {//Dit zorgt ervoor dat de enemies niet iedere spastisch heen en weer gaan en iets besluitvaster bewegen.
	    	if (this.environment[Phaser.RIGHT].index !== 20) {//Als er in deze richting geen muur is, is dit een mogelijke nieuwe richting.
	    		possibleDirections.push(Phaser.RIGHT);//toevoegen van nieuwe richting.
	    	}
	    }
	    if (this.direction !== Phaser.DOWN) {//Dit zorgt ervoor dat de enemies niet iedere spastisch heen en weer gaan en iets besluitvaster bewegen.
	    	if (this.environment[Phaser.UP].index !== 20) {//Als er in deze richting geen muur is, is dit een mogelijke nieuwe richting.
	    		possibleDirections.push(Phaser.UP);//toevoegen van nieuwe richting.
	    	}
	    }
	    if (this.direction !== Phaser.UP) {//Dit zorgt ervoor dat de enemies niet iedere spastisch heen en weer gaan en iets besluitvaster bewegen.
	    	if (this.environment[Phaser.DOWN].index !== 20) {//Als er in deze richting geen muur is, is dit een mogelijke nieuwe richting.
	    		possibleDirections.push(Phaser.DOWN);//toevoegen van nieuwe richting.
	    	}
	    }

    	let newDirection = this.randomGenerator.pick(possibleDirections);
    	//Door er voor te zorgen dat de enemies iets besluitvaster te laten bewegen kan bij een doodlopend stuk de variabele newDirection undefined zijn. met de volgende switch case handel ik dit af
    	//zodat de enemies weer uit het doodlopende stuk kunnen komen.
    	if (!newDirection) { //als newDirection undefined is.
    		switch(this.direction){
    			case Phaser.LEFT :  //als de huidige richting left is,
    				newDirection = Phaser.RIGHT; //zet nieuwe richting right.
    				break;
    			case Phaser.RIGHT : //als de huidige richting right is,
    				newDirection = Phaser.LEFT; //zet nieuwe richting left.
    				break;
				case Phaser.UP : //als de huidige richting up is,
					newDirection = Phaser.DOWN; //zet nieuwe richting down.
					break;
				case Phaser.DOWN : //als de huidige richting down is,
					newDirection = Phaser.UP; //zet nieuwe richting up.
					break;
    		}
    	}
	    this.setTwistAround(newDirection);

    	this.numberOfTwists = 0;
    	this.twistTime = this.randomGenerator.pick(this.twistTimes);

    }

    move(direction){
    	if (this.numberOfTwists === this.twistTime) {
    		this.randomTwistAround();
    	}
    	this.numberOfTwists++
    	if(this.twistAround !== Phaser.NONE){
	        this.sprite.setPosition(this.currentPoint.x, this.currentPoint.y);
	    	this.direction = this.twistAround; //

	        if (this.direction === Phaser.LEFT) {
	        	this.sprite.angle = -90; //zorgt ervoor dat de hoofden draaien.
	        	this.nextPoint.x=-1;
        		this.nextPoint.y=0;
	        } else if (this.direction === Phaser.RIGHT){
	        	this.sprite.angle = 90;
	        	this.nextPoint.x=1;
        		this.nextPoint.y=0;
	        } else if (this.direction === Phaser.UP){
	        	this.sprite.angle = 0;
	        	this.nextPoint.x=0;
        		this.nextPoint.y=-1;
	        } else if (this.direction === Phaser.DOWN){
	        	this.sprite.angle = 180;
	        	this.nextPoint.x=0;
        		this.nextPoint.y=1;
	        } 
	    }
	    this.twistAround = Phaser.NONE; //reset de huidige aangegeven draai variabele.
        this.currentPoint = new Phaser.Geom.Point(); //reset de currentpoint
    }
}
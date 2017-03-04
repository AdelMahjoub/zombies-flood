
var spriteObject = {
    type: "",
    sourceX: 0,
    sourceY: 0,
    sourceWidth: 64,
    sourceHeight: 64,
    x: 0,
    y: 0,
    width: 64,
    height: 64,
    vx: 0,
    vy: 0,
    vOffset: 1,
    angle: 0,
    visible: true,
    centerX: function(){
        return this.x + this.width / 2;
    },
    centerY: function(){
        return this.y + this.height / 2;
    },
    halfWidth: function(){
        return this.width / 2; 
    },
    halfHeight: function(){
        return this.height / 2;
    }
};

var stageObject = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
};

var messageObject =
{
  x: 0,
  y: 0,
  visible: true,
  text: "Message",
  font: "normal bold 20px Helvetica",
  fillStyle: "red",
  textBaseline: "top"
};

var cameraObject = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    vx: 0,
    previousX: 0,
    initPosition: function(sprite){
        this.x = Math.floor(sprite.x + sprite.width / 2 - this.width / 2);
        this.y = Math.floor(sprite.y + sprite.height / 2 - this.height / 2);
    },
    innerTopBoundry: function(){
        return Math.floor(this.y + this.height * 0.25);
    },
    innerBottomBoundry: function(){
        return Math.floor(this.y + this.height * 0.75);
    },
    innerLeftBoundry: function(){
        return Math.floor(this.x + this.width * 0.25);
    },
    innerRightBoundry: function(){
        return Math.floor(this.x + this.width * 0.75);
    },
    updatePosition: function(sprite, stage){
        if(sprite.x  < this.innerLeftBoundry()){
            this.x = Math.floor(sprite.x - this.width * 0.25);
        }
        if(sprite.y < this.innerTopBoundry()){
            this.y = Math.floor(sprite.y - this.height * 0.25);
        }
        if(sprite.x + sprite.width > this.innerRightBoundry()){
            this.x = Math.floor(sprite.x + sprite.width - this.width * 0.75);
        }
        if(sprite.y + sprite.height > this.innerBottomBoundry()){
            this.y = Math.floor(sprite.y + sprite.height - this.height * 0.75);
        }
        this.x = Math.max(0, Math.min(
                this.x, stage.width + stage.x - this.width
        ));
        this.y = Math.max(0, Math.min(
            this.y, stage.height + stage.y - this.height
        ));
    }
}

///////////////////////////////////////////////////////////////////////////

var playerTorso = Object.create(spriteObject);
playerTorso.maxHp = 1000;
playerTorso.hp = 1000;
playerTorso.type = "officerTorso";
playerTorso.sourceX = 64;
playerTorso.x = WIDTH / 2 - playerTorso.halfWidth();
playerTorso.y = HEIGHT / 2 - playerTorso.halfHeight();


var playerLegs = Object.create(spriteObject);
playerLegs.type = "officerLegs";
playerLegs.x = WIDTH / 2 - playerLegs.halfWidth();
playerLegs.y = HEIGHT / 2 - playerLegs.halfHeight();
playerLegs.walkingCounter = 0;
playerLegs.walkingMod = 0.2;
playerLegs.walk = false;
playerLegs.update = function(){
    this.walkingCounter += this.walkingMod;
    this.walk = this.vx !==0 || this.vy !== 0;
    if(this.walk){
        this.sourceX = 
            this.sourceWidth * (Math.floor(this.walkingCounter) % 4);
    }
    if(this.walkingCounter > 100)
        this.walkingCounter = 0;
}

var zombiObject = Object.create(spriteObject);
zombiObject.type = "zombi";
zombiObject.sourceX = 128;
zombiObject.walkingCounter = 0;
zombiObject.animMod = 0;
zombiObject.hitPoint = 40;
zombiObject.spdX = 2;
zombiObject.spdY = 2;
zombiObject.ATTACK = 2;
zombiObject.WALK = 4;
zombiObject.state = zombiObject.WALK;
zombiObject.update = function(){
    if(this.hitPoint > 0){
        this.vx = this.centerX() - playerTorso.centerX();
        this.vy = this.centerY() - playerTorso.centerY();
        this.angle = Math.atan2(this.vy, this.vx) + Math.PI / 2;
        this.dx = Math.cos(this.angle + Math.PI / 2);
        this.dy = Math.sin(this.angle + Math.PI / 2);
        this.x += this.dx * this.spdX;
        this.y += this.dy * this.spdY;
        this.walkingCounter += 0.15;
        this.animMod = Math.floor(this.walkingCounter % this.state);
        switch(this.state){
            case this.ATTACK:
                this.sourceX = this.sourceWidth * this.animMod;
                break;
            case this.WALK:
                this.sourceX = this.sourceWidth * (2 + this.animMod);
                break;
            default:
        }
        if(this.walkingCounter > 100)
            this.walkingCounter = 0;
    }else{
        
    }
}

var bulletObject = Object.create(spriteObject);
bulletObject.type = "bullet";
bulletObject.sourceX = 78;
bulletObject.sourceY = 22;
bulletObject.sourceWidth = 12;
bulletObject.sourceHeight = 34;
bulletObject.width = 3;
bulletObject.height = 8;
bulletObject.rangeX = 20 + bulletObject.x;
bulletObject.rangeY = 20 + bulletObject.y;
bulletObject.spdX = 10;
bulletObject.spdY = 10;
bulletObject.update = function(){
    this.angle = playerTorso.angle ;
    this.dx = Math.cos(this.angle - Math.PI / 2);
    this.dy = Math.sin(this.angle - Math.PI / 2); 
    this.vx = this.dx * this.spdX;
    this.vy = this.dy * this.spdY; 
    this.x = playerTorso.centerX() + this.dx * playerTorso.halfWidth() - this.halfWidth(); 
    this.y = playerTorso.centerY() + this.dy * playerTorso.halfHeight() - this.halfHeight();
}

var machineGun = Object.create(spriteObject);
machineGun.type = "machineGun";
machineGun.update = function(){
    this.angle = playerTorso.angle ;
    this.dx = Math.cos(this.angle - Math.PI / 2);
    this.dy = Math.sin(this.angle - Math.PI / 2); 
    this.x = this.dx * playerTorso.halfWidth() + playerTorso.centerX() - this.halfWidth();
    this.y = this.dy * playerTorso.halfHeight() + playerTorso.centerY() - this.halfHeight();
}

var shootEffect = Object.create(spriteObject);
shootEffect.type = "flash";
shootEffect.visible = false;
shootEffect.animCounter = 0;
shootEffect.animMod = 0;
shootEffect.update = function(){
    this.angle = playerTorso.angle - Math.PI / 2;
    this.dx = Math.cos(this.angle);
    this.dy = Math.sin(this.angle);
    this.x = machineGun.centerX() + this.dx * machineGun.halfWidth() - this.halfWidth(); 
    this.y = machineGun.centerY() + this.dy * machineGun.halfHeight() - this.halfHeight();
    this.animCounter ++;
    this.animMod = Math.floor(this.animCounter % 3);
    this.sourceX = this.animMod * this.sourceWidth;
    this.sourceY = this.animMod === 2 ? this.sourceHeight : 0;
}

var splatterEffet = Object.create(spriteObject);
splatterEffet.type = "splatter";
splatterEffet.animCounter = 0;
splatterEffet.update = function(){
    this.animCounter += 0.15;
    this.animMod = Math.floor(this.animCounter % 3);
    this.sourceX = this.animMod * this.sourceWidth;
    this.sourceY = this.animMod === 2 ? this.sourceHeight : 0;
}




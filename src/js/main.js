(function(){
    var camera = Object.create(cameraObject);

    var gameWorld = Object.create(stageObject);
    gameWorld.width = WIDTH;
    gameWorld.height = HEIGHT;

    var bg = Object.create(spriteObject);
    bg.type = "map";
    bg.sourceWidth = WIDTH;
    bg.sourceHeight = HEIGHT;
    bg.width = WIDTH;
    bg.height = HEIGHT;

    var sprites = [],
        assetsToLoad = [],
        assetsLoaded = 0,
        bullets = [],
        zombies = [],
        effects = [],
        spawn = ["top", "right", "bottom", "left"];

    sprites.push(bg, playerLegs, playerTorso,machineGun, shootEffect);

    var devMap = new Image();
    devMap.addEventListener("load", loadHandler, false);
    devMap.src = "./assets/images/maps/map.png";
    assetsToLoad.push(devMap);

    var officerLegsImg = new Image();
    officerLegsImg.addEventListener("load", loadHandler, false);
    officerLegsImg.src = "./assets/images/sprites/officer/officer-legs.png";
    assetsToLoad.push(officerLegsImg);

    var officerTorsoImg = new Image();
    officerTorsoImg.addEventListener("load", loadHandler, false);
    officerTorsoImg.src = "./assets/images/sprites/officer/officer-torso.png";
    assetsToLoad.push(officerTorsoImg);

    var flashImg = new Image();
    flashImg.addEventListener("load", loadHandler, false);
    flashImg.src = "./assets/images/sprites/effects/flash.png";
    assetsToLoad.push(flashImg);
    
    var splatterImg = new Image();
    splatterImg.addEventListener("load", loadHandler, false);
    splatterImg.src = "./assets/images/sprites/effects/splatter.png";
    assetsToLoad.push(splatterImg);

    var bulletImg = new Image();
    bulletImg.addEventListener("load", loadHandler, false);
    bulletImg.src = "./assets/images/sprites/ballistic/bullets.png";
    assetsToLoad.push(bulletImg);

    var zombieImg = new Image();
    zombieImg.addEventListener("load", loadHandler, false);
    zombieImg.src = "./assets/images/sprites/zombies/zombi-sprites.png";
    assetsToLoad.push(zombieImg);

    var machineGunImg = new Image();
    machineGunImg.addEventListener("load", loadHandler, false);
    machineGunImg.src = "./assets/images/sprites/weapons/2h_machinegun.png";
    assetsToLoad.push(machineGunImg);
    

    var LOADING = 0,
        PLAYING = 1,
        OVER = 2,
        gameState = LOADING,
        shoot = false,
        shootCounter = 6,
        spawnTimer = 0;
        spawnFreq = 100,
        totalKills = 0,
        hitCounter = 0,
        hitFrequency = 5,
        topKills = [0],
        maxKills = 0;

    if (typeof(Storage) !== "undefined") {
        if(localStorage.length !== 0) {
            maxKills = localStorage.topScore;
        } else {
            localStorage.setItem("topScore", 0);
        }
    }

    function reset() {
        topKills.push(totalKills);
        maxKills = Math.max(...topKills);
        // Save top score
        if(maxKills > localStorage.getItem("topScore")) {
            localStorage.setItem("topScore", maxKills);
        }
        totalKills = 0;
        playerTorso.hp = playerTorso.maxHp;
        spawnTimer = 0;
        spawnFreq = 100;
        sprites = [];
        zombies = [];
        sprites.push(bg, playerLegs, playerTorso,machineGun, shootEffect);
        gameState = PLAYING;
    }

    function loadHandler(){
        assetsLoaded++;
        if(assetsLoaded === assetsToLoad.length){
            gameState = PLAYING;
            camera.initPosition(playerTorso);
        }
    }

    function update(){
        window.requestAnimationFrame(update, canvas);
        switch(gameState){
            case LOADING:  
                 break;
            case PLAYING:
                playGame();
                break;
            case OVER:
                endGame();
                break;
            default:
        }
        camera.updatePosition(playerTorso, gameWorld);
        render();
    }

    function render(){
        if(gameState === PLAYING) {
            ctx.clearRect(0, 0, WIDTH, HEIGHT);
            ctx.save();
            ctx.translate(-camera.x, -camera.y);
            if(sprites.length !== 0 ){
                sprites.forEach(function(sprite){
                    var image;
                    switch(sprite.type){
                        case "map":
                            image = devMap;
                            break;
                        case "officerLegs":
                            image = officerLegsImg;
                            break;
                        case "officerTorso":
                            image = officerTorsoImg;
                            break;
                        case "zombi":
                            image = zombieImg;
                            break;
                        case "bullet":
                            image = bulletImg;
                            break;
                        case "flash":
                            image = flashImg;
                            break;
                        case "splatter":
                            image = splatterImg;
                            break;
                        case "machineGun":
                            image = machineGunImg;
                            break;
                        default:
                    }
                    if(sprite.visible){
                        ctx.save();
                        ctx.translate(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2);
                        ctx.rotate(sprite.angle);
                        ctx.drawImage(
                            image,
                            sprite.sourceX, sprite.sourceY,
                            sprite.sourceWidth, sprite.sourceHeight,
                            Math.floor(-sprite.width / 2), Math.floor(-sprite.height / 2), sprite.width, sprite.height
                        );
                        ctx.restore();
                    }
                });
            }
            ctx.restore();

            //Draw UI
            ctx.save();
                ctx.fillStyle = "goldenrod";
                ctx.font = "14px Audiowide";
                // Hp message
                ctx.beginPath();
                    ctx.textAlign = "left";
                    ctx.textBaseline = "top"; 
                    ctx.fillText("HP " + playerTorso.hp + " / " + playerTorso.maxHp, 2, 2);
                ctx.closePath();
                // Hp bar
                ctx.beginPath();
                    var length = ctx.measureText("HP " + playerTorso.hp + " / " + playerTorso.maxHp);
                    ctx.save();
                        ctx.fillStyle = "red";
                        ctx.fillRect(2, 28, (playerTorso.hp / playerTorso.maxHp) * 134, 14);
                    ctx.restore();
                    ctx.strokeRect(2, 28, 134, 14);
                ctx.closePath();
                // Score message
                ctx.beginPath();
                    ctx.textAlign = "right";
                    ctx.textBaseline = "top"; 
                    ctx.fillText("SCORE", ~~(canvas.width / 2), 2);
                    ctx.fillText(totalKills, ~~(canvas.width / 2), 28);
                ctx.closePath();
                //Top score
                ctx.beginPath();
                    ctx.textAlign = "right";
                    ctx.textBaseline = "top"; 
                    ctx.fillText("TOP SCORE", ~~(canvas.width - 2), 2);
                    ctx.fillText(maxKills, ~~(canvas.width  - 2), 28);
                ctx.closePath();
            ctx.restore();
        } else if(gameState === OVER) {
            ctx.clearRect(0, 0, WIDTH, HEIGHT);
                ctx.save();
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.font = "24px Audiowide";
                ctx.textAlign = "center";
                ctx.textBaseline = "bottom"; 
                ctx.fillStyle = "Red";
                ctx.fillText("Game Over", ~~(canvas.width / 2 ), ~~(canvas.height / 2));
                ctx.fillStyle = "darkgoldenrod";
                ctx.fillText("Press [ENTER] to Replay", ~~(canvas.width / 2 ), ~~(canvas.height / 2) + 32);
            ctx.restore();
        }
    }

    function playGame(){
        controls.updateVelocity(playerTorso, playerTorso.vOffset);
        controls.updateVelocity(playerLegs, playerLegs.vOffset);
        playerLegs.update();
        machineGun.update();
        playerTorso.x = playerLegs.x = Math.max(0, Math.min(playerTorso.x, WIDTH - playerTorso.width));
        playerTorso.y = playerLegs.y = Math.max(0, Math.min(playerTorso.y, HEIGHT - playerTorso.height));
        shootCounter--;
        if(shoot){
            playerTorso.vOffset = 0.2;
            playerLegs.vOffset = 0.2;
            playerLegs.walkingMod = 0.05;
            controls.updateDirection(playerTorso, camera.x, camera.y);
            controls.updateDirection(playerLegs, camera.x, camera.y);
            if(shootCounter <= 0){
                shootEffect.visible = true;
                shootEffect.update();
                shootBullet();
                shootCounter = 6;
            }else{
                shootEffect.visible = false;
            }
        }else{
            playerTorso.vOffset = 1;
            playerLegs.vOffset = 1;
                playerLegs.walkingMod = 0.2;
            if(playerTorso.vx !== 0 || playerTorso.vy !== 0){
                playerTorso.angle = playerLegs.angle = Math.atan2(playerTorso.vy, playerTorso.vx) + Math.PI / 2;
            }
        }
  
        for(var i = 0; i < bullets.length; i++){
            var bullet = bullets[i];
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            var remove = 
                bullet.x < 0 || bullet.x > WIDTH 
                || bullet.y < 0 || bullet.y > HEIGHT;
            if(remove){
                removeObject(bullet, bullets);
                removeObject(bullet, sprites);
                i--;
            }
        }

        spawnTimer++;
        if(spawnTimer === spawnFreq){
            spawnZombi();
            spawnTimer = 0;
            if(spawnFreq > 2){
                spawnFreq--;
            }
        }
        for(var i = 0; i < zombies.length; i++){
            var zombi = zombies[i];
            sprites.forEach(function(sprite){
                if(sprite !== zombi && sprite.type === "zombi"){
                    blockCircle(zombi, sprite, sprite.halfWidth());
                }
            });
            zombi.update();
            if(zombi.hitPoint > 0){
                blockCircle(zombi, playerTorso, playerTorso.halfWidth());
                if(hitTestCircle(zombi, playerTorso)){
                    zombi.state = zombi.ATTACK;
                    hitCounter ++;
                    if(hitCounter >= hitFrequency) {
                        playerTorso.hp -= 2;
                        hitCounter = 0;
                    }
                    if(playerTorso.hp === 0) {
                        gameState = OVER;
                    }
                }else{
                    zombi.state = zombi.WALK;
                }
            }
        }

        for(var i = 0; i < zombies.length; i++){
            var zombi = zombies[i];
            for(var j = 0; j < bullets.length; j++){
                var bullet = bullets[j];
                if(zombi.hitPoint > 0 && hitTestRectangle(zombi, bullet)){
                    zombi.hitPoint--;
                }
                if(zombi.hitPoint <= 0){
                    var splatter = Object.create(splatterEffet);
                    sprites.push(splatter);
                    effects.push(splatter);
                    splatter.x = zombi.x;
                    splatter.y = zombi.y;
                    destroyZombi(zombi);
                    totalKills ++;
                    cleanEffect(splatter);
                }
            }
        }

        effects.forEach(function(effect){
            effect.update();
        })

    }

    window.addEventListener("mousedown", mouseDownHandler, false);
    window.addEventListener("mouseup", mouseUpHandler, false);

    function mouseDownHandler(e){
        shoot = true;
    }

    function mouseUpHandler(e){
        shoot = false;
        shootEffect.visible = false;
    }

    function shootBullet(){
        var bullet = Object.create(bulletObject);
        bullet.update();
        bullets.push(bullet);
        sprites.push(bullet);
    }

    function spawnZombi(){
        if(zombies.length < 100){
            var zombi = Object.create(zombiObject);
            var spawnSide = Math.floor(Math.random() * 3),
                randomPosition;
            switch(spawn[spawnSide]){
                case "top":
                    zombi.y = 0;
                    randomPosition = Math.floor(Math.random() * WIDTH / zombi.width);
                    zombi.x = randomPosition * zombi.width;
                    break;
                case "right":
                    zombi.x = WIDTH;
                    randomPosition = Math.floor(Math.random() * HEIGHT / zombi.height);
                    zombi.y = randomPosition * zombi.height;
                    break;
                case "bottom":
                    zombi.y = HEIGHT;
                    randomPosition = Math.floor(Math.random() * WIDTH / zombi.width);
                    zombi.x = randomPosition * zombi.width;
                    break;
                case "left":
                    zombi.x = 0;
                    randomPosition = Math.floor(Math.random() * HEIGTH / zombi.height);
                    zombi.y = randomPosition * zombi.height;
                    break;
            }
            sprites.push(zombi);
            zombies.push(zombi);
        }
    }

    function destroyZombi(zombi){
        removeObject(zombi, zombies);
        removeObject(zombi, sprites);
    }

    function cleanEffect(effect){
       setTimeout(function(){
           removeObject(effect, effects);
           removeObject(effect, sprites);
       }, 300);
    }

    var replayHandler = function(e) {
        if(e.keyCode === 13) {
            reset();
            window.removeEventListener("keydown", replayHandler); 
        }
    }

    function endGame(){
        window.addEventListener("keydown",replayHandler)
    }

    //Remove an object from an array of objects
    function removeObject(objectToRemove, array){
        var i = array.indexOf(objectToRemove);
        if(i !== -1){
            array.splice(i, 1);
        }
    }

    window.focus();
    update();
})();
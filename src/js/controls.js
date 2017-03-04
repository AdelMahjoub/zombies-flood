var controls = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
    mouseX: 0,
    mouseY: 0,
    up: false,
    down: false,
    left: false,
    right: false,
    updateVelocity: function(sprite, vOffset){
        if(this.up && !this.down){
            sprite.vy = -4;
        }
        if(this.down && !this.up){
            sprite.vy = 4;
        }
        if(this.left && !this.right){
            sprite.vx = -4;
        }
        if(this.right && !this.left){
            sprite.vx = 4;
        }
        if(!this.up && !this.down){
            sprite.vy = 0;
        }
        if(!this.left && !this.right){
            sprite.vx = 0;
        }
        sprite.x += (sprite.vx * sprite.vOffset);
        sprite.y += (sprite.vy * sprite.vOffset);
    },
    updateDirection: function(sprite, offsetX, offsetY){
        var dx = sprite.centerX() - (this.mouseX + offsetX),
            dy = sprite.centerY() - (this.mouseY + offsetY);
        
        sprite.angle = Math.atan2(dy, dx) - Math.PI / 2;
    }

}

canvas.addEventListener("mousemove", moveHandler, false);
window.addEventListener("keydown", keyDownHandler, false);
window.addEventListener("keyup", keyUpHandler, false);

function moveHandler(e){
    controls.mouseX = e.offsetX,
    controls.mouseY = e.offsetY;
}

function keyDownHandler(e){
    switch(e.keyCode){
        case controls.UP:
            controls.up = true;
            break;
        case controls.DOWN:
            controls.down = true;
            break;
        case controls.LEFT:
            controls.left = true;
            break;
        case controls.RIGHT:
            controls.right = true;
            break;
        default:
    }
}

function keyUpHandler(e){
    switch(e.keyCode){
        case controls.UP:
            controls.up = false;
            break;
        case controls.DOWN:
            controls.down = false;
            break;
        case controls.LEFT:
            controls.left = false;
            break;
        case controls.RIGHT:
            controls.right = false;
            break;
        default:
    }
}


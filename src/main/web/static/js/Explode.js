define(function () {
    var obj = function(main, point) {
        this._main = main;
        this._image = new createjs.Sprite(new createjs.SpriteSheet({
            images: [main.getSpritesheet()],
            frames: [
                [256, 192, 32, 32, 0, 16, 16],
                [288, 192, 32, 32, 0, 16, 16],
                [320, 192, 32, 32, 0, 16, 16],
                [320, 224, 32, 32, 0, 16, 16]
            ],
            animations: {
                first: {
                    frames: [0, 1, 2, 3],
                    speed: 0.33
                }
            }
        }));
        
        this._image.x = point.x;
        this._image.y = point.y;
        this._image.gotoAndPlay('first');
        
        this._main.addChild(this._image);
        this._main.registerTick(this);
    };
    
    obj.prototype.tick = function(event) {
        if(this._image.currentFrame == 3) {
            this._main.removeChild(this._image);
            this._main.unregisterTick(this);
            this._image.stop();
        }
    };
    
    return obj;
});

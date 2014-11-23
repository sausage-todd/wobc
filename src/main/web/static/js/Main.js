define(
    [
        'World', 'DebugGrid', 'renderer/TankRenderer', 'renderer/BulletRenderer', 'renderer/BlockRenderer', 'Socket',
        'Tank', 'Key', 'Direction'
    ],
    function (World, DebugGrid, TankRenderer, BulletRenderer, BlockRenderer, Socket, Tank, Key, Direction) {
        var obj = function () {
        };

        obj.prototype._tick = function (event) {
            this._fps.text = '' + (Math.round(createjs.Ticker.getMeasuredFPS() * 100) / 100) + ' FPS';

            this._stage.update();
        };

        obj.prototype.init = function () {
            this._stage = new createjs.Stage('canvas');

            this._ticks = [];
            this._bullets = {};
            this._tanks = {};

            this._spritesheet = document.getElementById('spritesheet');

            this._world = new World(this);

            this._border = new createjs.Shape();
            this._border.graphics.beginStroke('white');
            this._border.graphics.drawRect(0, 0, 800, 576);
            this._stage.addChild(this._border);

            this._grid = new DebugGrid(this);

            this._fps = this._stage.addChild(new createjs.Text("", "14px monospace", "#fff"));
            this._fps.lineHeight = 15;
            this._fps.x = this._stage.canvas.width - 80;
            this._fps.y = 10;

            //this._comet = new Comet(this);

            this._tank = new Tank(this, new createjs.Point(32, 32), 0);

            this._tankRenderer = new TankRenderer(this);
            this._bulletRenderer = new BulletRenderer(this);
            this._blockRenderer = new BlockRenderer(this);

            this._socket = new Socket(this);

            var that = this;
            createjs.Ticker.addEventListener(
                'tick',
                function (event) {
                    that._tick(event);
                    that._ticks.forEach(function (tick) {
                        tick.tick(event);
                    });
                }
            );
            createjs.Ticker.setFPS(60);

            document.onkeydown = function () {
                that._handleKeyDown();
            };
            document.onkeyup = function () {
                that._handleKeyUp();
            };
        };

        obj.prototype.getTank = function () {
            return this._tank;
        };

        obj.prototype.addTank = function (playerId, x, y) {
            this._tanks[playerId] = new Tank(this, new createjs.Point(x, y), playerId);
        };

        obj.prototype.removeTank = function (playerId) {
            var tank = this._tanks[playerId];
            tank.remove();
            delete this._tanks[playerId];
        };

        obj.prototype.createTank = function (playerId, x, y) {
            this._tank = new Tank(this, new createjs.Point(x, y), playerId);
        };

        obj.prototype.stop = function () {
            //this._comet.disconnect(this._tank.getPlayerId());
        };

        obj.prototype.collidesWith = function (entity) {
            return this._world.collidesWith(entity);
        };

        obj.prototype.addBullet = function (bullet, playerId) {
            this._bullets[playerId] = bullet;
        };

        obj.prototype.removeBullet = function (playerId) {
            delete this._bullets[playerId];
        };

        obj.prototype.getSpritesheet = function () {
            return this._spritesheet;
        };

        obj.prototype.getWidth = function () {
            return this._stage.canvas.width;
        };

        obj.prototype.getHeight = function () {
            return this._stage.canvas.height;
        };

        obj.prototype.addChild = function (child) {
            this._stage.addChild(child);
        };

        obj.prototype.addChildAt = function (child, index) {
            this._stage.addChildAt(child, index);
        };

        obj.prototype.removeChild = function (child) {
            this._stage.removeChild(child);
        };

        obj.prototype.removeChildAt = function (index) {
            this._stage.removeChildAt(index);
        };

        obj.prototype.registerTick = function (tick) {
            this._ticks.push(tick);
        };

        obj.prototype.unregisterTick = function (tick) {
            var index = this._ticks.indexOf(tick);
            if (index >= 0) {
                this._ticks.splice(index, 1);
            }
        };

        obj.prototype._handleKeyDown = function (e) {
            e = e || event;

            var playerId = this._tank.getPlayerId();

            console.log('keyDown', e.keyCode);

            switch (e.keyCode) {
                case Key.KEYCODE_SPACE:
                    if (this._bullets.length <= playerId || !this._bullets[playerId]) {
                        this._tank.shoot();
                        //this._comet.send({playerId: playerId, type: 'shoot'});
                    }
                    e.preventDefault();
                    return false;
                case Key.KEYCODE_A:
                case Key.KEYCODE_LEFT:
                case Key.KEYCODE_D:
                case Key.KEYCODE_RIGHT:
                case Key.KEYCODE_W:
                case Key.KEYCODE_UP:
                case Key.KEYCODE_S:
                case Key.KEYCODE_DOWN:
                    var direction = Direction.fromKey(e.keyCode);
                    var result = this._tank.rotate(direction);

                    if (result) {
                        /*this._comet.send({
                         playerId: playerId,
                         type: 'move',
                         direction: direction.toString()
                         });*/
                    }
                    e.preventDefault();
                    return false;
            }
        };

        obj.prototype._handleKeyUp = function (e) {
            e = e || event;

            console.log('keyUp', e.keyCode);

            switch (e.keyCode) {
                case Key.KEYCODE_A:
                case Key.KEYCODE_LEFT:
                case Key.KEYCODE_D:
                case Key.KEYCODE_RIGHT:
                case Key.KEYCODE_W:
                case Key.KEYCODE_UP:
                case Key.KEYCODE_S:
                case Key.KEYCODE_DOWN:
                    if (this._tank.getDirection() == Direction.fromKey(e.keyCode)) {
                        this._tank.stopMoving();
                        var playerId = this._tank.getPlayerId();
                        //this._comet.send({playerId: playerId, type: 'stop'});
                    }
                case Key.KEYCODE_SPACE:
                    e.preventDefault();
                    return false;
            }
        };

        obj.prototype.performAction = function (data) {
            var playerId = data.playerId;
            if (this._tank.getPlayerId() != playerId) {
                var tank = this._tanks[playerId];
                switch (data.type) {
                    case 'shoot':
                        tank.shoot();
                        break;
                    case 'move':
                        tank.rotate(Direction.fromStr(data.direction));
                        break;
                    case 'stop':
                        tank.stopMoving();
                        break;
                }
            }
        };

        return new obj();
    }
);

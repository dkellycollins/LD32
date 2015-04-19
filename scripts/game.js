///<reference path="lib\jquery.d.ts" />
///<reference path="lib\lodash.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var $gameWindow;
var activeObjs = [];
var gameObj = (function () {
    function gameObj(data) {
        this._$elem = $('<div></div>');
        this._$elem.addClass(data.type);
        this._boundBox = {
            left: data.position[0],
            top: data.position[1],
            height: data.height,
            width: data.width
        };
        this._$elem.css(this._boundBox);
        this.ID = gameObj._nextID++;
    }
    gameObj.prototype.update = function (deltaTime) {
    };
    gameObj.prototype.onCollision = function (obj) {
        return true;
    };
    gameObj.prototype.getElement = function () {
        return this._$elem;
    };
    gameObj.prototype.position = function (position, checkCollision) {
        if (checkCollision === void 0) { checkCollision = true; }
        if (!!position) {
            var origPosition = [
                this._boundBox.left,
                this._boundBox.top
            ];
            this._boundBox.left = position[0];
            this._boundBox.top = position[1];
            this._$elem.css(this._boundBox);
            if (checkCollision && !this.checkCollisions()) {
                this.position(origPosition, false);
            }
        }
        return [
            this._boundBox.left,
            this._boundBox.top
        ];
    };
    gameObj.prototype.checkCollisions = function () {
        var _this = this;
        if (!this.isInGameWindow()) {
            return false;
        }
        var result = true;
        _.each(activeObjs, function (obj) {
            if (_this.isColliding(obj) && !obj.onCollision(_this)) {
                result = false;
            }
        });
        return result;
    };
    gameObj.prototype.isInGameWindow = function () {
        return this._boundBox.left >= 0 && this._boundBox.top >= 0 && this._boundBox.left + this._boundBox.width <= $gameWindow.width() && this._boundBox.top + this._boundBox.height <= $gameWindow.height();
    };
    gameObj.prototype.isCollidingX = function (obj) {
    };
    gameObj.prototype.isCollidingY = function (obj) {
    };
    gameObj.prototype.isColliding = function (obj) {
        var thisRect = {
            top: this._boundBox.top,
            bottom: this._boundBox.top + this._boundBox.height,
            left: this._boundBox.left,
            right: this._boundBox.left + this._boundBox.width
        };
        var objRect = {
            top: obj._boundBox.top,
            bottom: obj._boundBox.top + obj._boundBox.height,
            left: obj._boundBox.left,
            right: obj._boundBox.left + obj._boundBox.width
        };
        var yCol = (thisRect.left > objRect.left && thisRect.left < objRect.right) || (thisRect.right < objRect.right && thisRect.right > objRect.left);
        var xCol = (thisRect.top > objRect.top && thisRect.top < objRect.bottom) || (thisRect.bottom < objRect.bottom && thisRect.bottom > objRect.top);
        return yCol && xCol;
    };
    gameObj.prototype.destroy = function () {
    };
    gameObj._nextID = 0;
    return gameObj;
})();
var grass = (function (_super) {
    __extends(grass, _super);
    function grass(data) {
        _super.call(this, data);
    }
    grass.prototype.onCollision = function (obj) {
        return false;
    };
    return grass;
})(gameObj);
var trigger = (function (_super) {
    __extends(trigger, _super);
    function trigger(data) {
        _super.call(this, data);
        this._$buttonElem = $('.target[target=' + this.target + ']');
        this._$buttonElem.enabled = true;
        this._$buttonElem.click(_.bind(this.onClick, this));
        this.target = data.target;
    }
    trigger.prototype.active = function (isActive) {
        if (typeof isActive !== 'undefined') {
            this._isActive = isActive;
        }
        return this._isActive;
    };
    trigger.prototype.onClick = function () {
        this._isActive = true;
    };
    return trigger;
})(grass);
var spawn = (function (_super) {
    __extends(spawn, _super);
    function spawn(data) {
        _super.call(this, data);
        this.enemies = [];
        this.enemies = data.enemies;
        this.timeout = data.timeout;
        this.timer = 0;
    }
    spawn.prototype.update = function (deltaTime) {
        if (this.enemies.length == 0) {
            return;
        }
        this.timer += deltaTime;
        if (this.timer > this.timeout) {
            this.spawnNextEnemy();
            this.timer = 0;
        }
    };
    spawn.prototype.spawnNextEnemy = function () {
        var pos = this.position();
        var enemy = gameObjFactory({
            type: this.enemies.pop(),
            position: pos
        });
        $gameWindow.append(enemy.getElement());
    };
    return spawn;
})(gameObj);
var spike = (function (_super) {
    __extends(spike, _super);
    function spike(data) {
        _super.call(this, data);
    }
    spike.prototype.onCollision = function (obj) {
        removeGameObj(obj);
        return true;
    };
    return spike;
})(gameObj);
var base = (function (_super) {
    __extends(base, _super);
    function base(data) {
        _super.call(this, data);
        this.health = 100;
    }
    base.prototype.onCollision = function (obj) {
        this.health -= 10;
        removeGameObj(obj);
        return true;
    };
    return base;
})(gameObj);
var enemy = (function (_super) {
    __extends(enemy, _super);
    function enemy(data) {
        _super.call(this, data);
        this._speed = 10;
        this._gravity = 10;
        this._direction = 1;
        this._$elem.css({
            'z-index': 10
        });
        enemy.Count++;
    }
    enemy.prototype.update = function (deltaTime) {
        var pos = this.position();
        this.position([
            pos[0] + (this._speed * this._direction),
            pos[1] + (this._gravity)
        ]);
    };
    enemy.prototype.onTransform = function () {
    };
    enemy.prototype.destroy = function () {
        enemy.Count--;
    };
    enemy.Count = 0;
    return enemy;
})(gameObj);
var grunt = (function (_super) {
    __extends(grunt, _super);
    function grunt(data) {
        _super.call(this, {
            type: 'grunt',
            height: 30,
            width: 30,
            position: data.position
        });
    }
    return grunt;
})(enemy);
var bomber = (function (_super) {
    __extends(bomber, _super);
    function bomber(data) {
        _super.call(this, {
            type: 'bomber',
            height: 30,
            width: 30,
            position: data.position
        });
    }
    return bomber;
})(enemy);
var berzerker = (function (_super) {
    __extends(berzerker, _super);
    function berzerker(data) {
        _super.call(this, {
            type: 'berzerker',
            height: 30,
            width: 30,
            position: data.position
        });
    }
    return berzerker;
})(enemy);
function checkEndState() {
    var base = _.find(activeObjs, function (activeObj) {
        return typeof activeObj === 'base';
    });
    if (base.health <= 0) {
        levelLost();
    }
    else if (enemy.Count == 0) {
        levelWon();
    }
}
function removeGameObj(obj) {
    obj.destroy();
    activeObjs = _.reject(activeObjs, function (activeObj) {
        return obj.ID == activeObj.ID;
    });
    checkEndState();
}
function onTransformButtonClick() {
}
function gameObjFactory(data, isActive) {
    if (isActive === void 0) { isActive = true; }
    var obj = new window[data.type](data);
    if (isActive) {
        activeObjs.push(obj);
    }
    return obj;
}
function init() {
    $gameWindow = $('.game-window');
    $('.button').click(onTransformButtonClick);
    loadLevel('one');
}
function loadLevel(levelName) {
    $.get('scripts/levels/' + levelName + '.json').done(buildLevel);
}
function buildLevel(levelData) {
    document.title = levelData.name;
    _.each($('.target'), function ($target) {
        $target.disabled = false;
    });
    _.each(levelData.map, function (data) {
        var obj = gameObjFactory(data);
        $gameWindow.append(obj.getElement());
    });
    update(0);
}
function update(deltaTime) {
    _.each(activeObjs, function (obj) {
        obj.update(deltaTime);
    });
    setTimeout(function () {
        update(500);
    }, 500);
}
function levelLost() {
}
function levelWon() {
}
$(init);

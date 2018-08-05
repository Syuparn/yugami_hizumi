(function() {
  var Dimension = (function() {
    // constractor
    var Dimension = function(pos, min, max, movingstep) {
      if(!(this instanceof Dimension)) {
        return new Dimension(pos, min, max, movingstep);
      }
      this.pos = pos;
      this.max = max;
      this.min = min;
      this.movingstep = movingstep;
      // value which will added to pos
      this.toMove = 0;
    };
    
    var p = Dimension.prototype;
    
    p.escapeFromEdge = function() {
      if(this.pos < this.min) {
        this.toMove = 0;
        this.pos = this.min + this.movingstep;
        return true;
      } else if(this.x > this.max) {
        this.toMove = 0;
        this.x = this.max - this.movingstep;
        return true;
      }
      return false;
    };
    
    p.move = function() {
      var distance = this.movingstep * Math.sign(this.toMove);
      this.pos += distance;
      this.toMove -= distance;
      this.escapeFromEdge();
    };
    
    p.isNear = function(other) {
      return Math.abs(this.pos - other.pos) < this.movingstep;
    };
    
    return Dimension;
  })();
  
  var MovingText = (function() {
    // constractor
    var MovingText = function(id, x, z) {
      if(!(this instanceof MovingText)) {
        return new MovingText(id, x, z);
      }
      this.id = id;
      //                    (pos, min, max, movingstep)
      this.x = new Dimension(x, 0, 800, 20);
      this.z = new Dimension(z + 50, 10, 80, 7);
      // move to initial position in a moment
      this.move(1);
    }
    
    var p = MovingText.prototype;
    
    p.move = function(duration){
      this.x.move();
      this.z.move();
      this.id.animate({
        'marginLeft': this.x.pos + 'px',
        'fontSize': this.z.pos + 'pt'
      }, duration);
      console.log(this.z.pos, this.z.toMove);
    };
    
    p.addDirection = function(dx, dz) {
      this.x.toMove += dx;
      this.x.escapeFromEdge();
      this.z.toMove += dz;
      this.z.escapeFromEdge();
    };
    
    p.isNear = function(other) {
      return this.x.isNear(other.x) && this.z.isNear(other.z);
    };
    
    p.stop = function() {
      // stop animation immediately and cancel reserved next animation
      this.id.stop(true, false).animate();
    };
    return MovingText;
  })();
  
  var random = function(min, max) {
    return Math.floor(Math.random() * (max + 1 - min) + min);
  };
  var upperText = new MovingText($('#moji1'), 500 + random(-300, 300),
                                 random(-10, 10));
  var lowerText = new MovingText($('#moji2'), 500 + random(-300, 300),
                                 random(-10, 10));
  var intervalMs = 100;
  var timeMs = 30000;
  var point = 0;
  var nUpperPutKey = 0;
  var nLowerPutKey = 0;
  
  // run by each interval
  var intervalId = setInterval(function() {
    upperText.addDirection(random(-10, 10), random(-3, 3));
    lowerText.addDirection(random(-10, 10), random(-3, 3));
    upperText.move(intervalMs);
    lowerText.move(intervalMs);
    timeMs -= intervalMs;
    point += upperText.isNear(lowerText) * (1 + 0.01 * nUpperPutKey * nLowerPutKey);
    $('#time').text((timeMs / 1000).toFixed(1));
    $('#point').text(point.toFixed(2));
    if(timeMs === 0){
      clearInterval(intervalId);
      upperText.stop();
      lowerText.stop();
    }
  }, intervalMs);
  
  // handle key events
  $(window).keydown(function(e){
    var sensitivity = {'x': 20, 'z': 5};
    var eventUpper = ({37: 'left', 38: 'up', 39: 'right', 40: 'down'})[e.keyCode];
    var eventLower = ({65: 'left', 87: 'up', 68: 'right', 83: 'down'})[e.keyCode];
    var direction = {'left': {'dx': -sensitivity.x, 'dz': 0},
                     'up': {'dx': 0, 'dz': -sensitivity.z},
                     'right': {'dx': sensitivity.x, 'dz': 0},
                     'down': {'dx': 0, 'dz': sensitivity.z},
                     undefined: {'dx': 0, 'dz': 0}
    };
    upperText.addDirection(direction[eventUpper].dx, direction[eventUpper].dz);
    lowerText.addDirection(direction[eventLower].dx, direction[eventLower].dz);
    nUpperPutKey += (eventUpper !== undefined);
    nLowerPutKey += (eventLower !== undefined);
  });
})();

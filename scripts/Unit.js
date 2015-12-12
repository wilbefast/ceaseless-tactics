// ----------------------------------------------------------------------------
// UNIT CLASS
// ----------------------------------------------------------------------------

function Unit(args) {
  this.hex = args.hex;
  this.hex.contents = this;

  this.team = args.team;
  this.image = this.team.images.Unit;

  this.path = [];

  this.max_moves = 4;

  objects.add(this);

  return this;
}

Unit.prototype.draw_w = 40
Unit.prototype.draw_h = 40

Unit.prototype.draw = function(x, y) {
  x = (x || 0);
  y = (y || 0);

  // draw path only if it's this unit's turn
  if(turn.currentTeam == this.team)
  {
    if(this.path.length > 0)
    {
      ctx.beginPath();
      var hex = this.hex;
      ctx.lineWidth = 2;
      ctx.strokeStyle = this.path.isCharge ? 'red' : 'white';
      ctx.moveTo(hex.draw_x + hex.draw_size*0.5, hex.draw_y + hex.draw_size*0.5);
      for(var i = 0; i < this.path.length; i++)
      {
        hex = this.path[i];
        ctx.lineTo(hex.draw_x + hex.draw_size*0.5, hex.draw_y + hex.draw_size*0.5);
      }
      ctx.stroke();
    } 
  }

  // always draw sprite
  ctx.drawImage(this.image, this.draw_x + x, this.draw_y + y, this.draw_w, this.draw_h);
}

Unit.prototype.update = function(dt) {
  this.draw_x = this.hex.draw_x + (this.hex.draw_size - this.draw_w)*0.5;
  this.draw_y = this.hex.draw_y + (this.hex.draw_size - this.draw_h)*0.5;
}

Unit.prototype.setHex = function(hex) {
  this.hex.contents = null;
  this.hex = hex;
  hex.contents = this;
}

Unit.prototype.setPath = function(path) {
  this.path = path;
}

Unit.prototype.isEnemyOf = function(unit) {
  return (unit.team != this.team);
}

Unit.prototype.canCharge = function(unit) {
  return this.isEnemyOf(unit)
}

Unit.prototype.isCombat = function(hex) {
  var unit = this;
  if(hex.contents && unit.isEnemyOf(hex.contents))
    return true;
  return hex.hasNeighbourSuchThat(function(hex) {
    return hex.contents && unit.isEnemyOf(hex.contents);
  });
}

Unit.prototype.canEnter = function(hex) {
  return !(hex.contents);
}

Unit.prototype.canLeave = function(hex) {
  return !this.isCombat(hex);
}

Unit.prototype.pathingCost = function(hex) {
  if(!this.canEnter(hex))
    return Infinity;
  else
    return 1;
}
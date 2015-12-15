// ----------------------------------------------------------------------------
// HEX CLASS
// ----------------------------------------------------------------------------

function Hex(grid, col, row) {
  this.grid = grid;

  this.x = col;
  this.y = -col - row;
  this.z = row;

  this.col = col;
  this.row = row;

  this.draw_x = 0;
  this.draw_y = 0;

  this.isHill = (Math.random() > 0.9);
  if(this.isHill)
    this.hill_image = this.hill_images[Math.floor(Math.random()*this.hill_images.length)];

  this.hash = this.hash();

  this.image = this.images[Math.floor(Math.random()*this.images.length)];

  return this;
}

Hex.prototype.images = [
  document.getElementById("img_hex_1"),
  document.getElementById("img_hex_2"),
  document.getElementById("img_hex_3"),
  document.getElementById("img_hex_4")
];

Hex.prototype.hill_images = [
  document.getElementById("img_hill_1"),
  document.getElementById("img_hill_2"),
  document.getElementById("img_hill_3")
];

Hex.prototype.image_highlight = document.getElementById("img_hex_highlight");
Hex.prototype.image_preview_combat = document.getElementById("img_hex_preview_combat");
Hex.prototype.image_preview_march = document.getElementById("img_hex_preview_march");
Hex.prototype.image_preview_retreat = document.getElementById("img_hex_preview_retreat");
Hex.prototype.image_preview_normal = document.getElementById("img_hex_preview_normal");

Hex.prototype.spacing = 0.7;

Hex.prototype.draw_size = 64;

Hex.prototype.update = function(dt) {
  this.draw_x  = this.grid.draw_x + this.draw_size * (Math.sqrt(3) - 0.5) * (this.col + this.row/2) * this.spacing;
  this.draw_y = this.grid.draw_y + this.draw_size * this.row  * this.spacing;
}

Hex.prototype.draw = function() {
  if(cursor.hex == this)
    ctx.drawImage(this.image_highlight, this.draw_x, this.draw_y, this.draw_size, this.draw_size);
  else
    ctx.drawImage(this.image, this.draw_x, this.draw_y, this.draw_size, this.draw_size);
  if(this.isHill)
    ctx.drawImage(this.hill_image, this.draw_x, this.draw_y, this.draw_size, this.draw_size);
  if(this.preview)
    this.draw_preview();
}

Hex.prototype.draw_preview = function() {
  if(!cursor.selection)
    return;
    
  if(!cursor.selection.isInCombat() && !cursor.selection.canEnter(this))
    return;

  ctx.globalAlpha  = 0.75;
  if(cursor.selection.isInCombat(this))
    ctx.drawImage(this.image_preview_combat, this.draw_x, this.draw_y, this.draw_size, this.draw_size);
  else if(cursor.selection.isRetreating() || cursor.selection.isInCombat())
    ctx.drawImage(this.image_preview_retreat, this.draw_x, this.draw_y, this.draw_size, this.draw_size);
  else if(this.canUnitMarch)
    ctx.drawImage(this.image_preview_march, this.draw_x, this.draw_y, this.draw_size, this.draw_size);
  else
    ctx.drawImage(this.image_preview_normal, this.draw_x, this.draw_y, this.draw_size, this.draw_size);
  ctx.globalAlpha = 1;
}

Hex.prototype.isNeighbourOf = function(hex) {
  for(var i = 0; i < this.neighbours.length; i++)
  {
    var neighbour = this.neighbours[i];
    if(neighbour && neighbour == hex)
      return true;
  }
  return false;
}

Hex.prototype.distanceTo = function(hex) {
  return (Math.abs(this.x - hex.x) + Math.abs(this.y - hex.y) + Math.abs(this.z - hex.z))*0.5;
}

Hex.prototype.isWithinRangeOf = function(hex, radius) {
  if (radius < 1)
    return (this == hex);
  else
    return (this.distanceTo(hex) <= radius);
}

Hex.prototype.hasNeighbourSuchThat = function(predicate) {
  for(var i = 0; i < this.neighbours.length; i++)
  {
    var neighbour = this.neighbours[i];
    if(neighbour && predicate(neighbour))
      return true;
  }
  return false;
}

Hex.prototype.mapToNeighbours = function(f) {
  for(var i = 0; i < this.neighbours.length; i++)
  {
    var neighbour = this.neighbours[i];
    if(neighbour)
    {
      var result = f(neighbour);
      if(result)
        return result;
    }
  }
}

Hex.prototype.hash = function() {
  return this.col + (this.grid.n_cols + this.grid.n_rows)*this.row
}
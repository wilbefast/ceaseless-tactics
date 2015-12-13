// ----------------------------------------------------------------------------
// UNIT CLASS
// ----------------------------------------------------------------------------

function Unit(args) {

  // depends on the type of unit
  this.unitType = args.type;
  var name = args.type.name;
  this.head_image = args.team.images[name].head;
  this.body_image = args.team.images[name].body;
  this.weapon_image = args.team.images[name].weapon;
  this.offhand_image = args.team.images[name].offhand;
  this.speed = this.unitType.speed + Math.random()*0.1;
  this.damage = this.unitType.damage;
  this.hitpoints = this.unitType.hitpoints;
  this.attackRange = this.unitType.attackRange;

  // same for all units
  this.max_moves = Math.max(1, Math.floor(this.speed / 4));
  this.hex = args.hex;
  this.hex.contents = this;
  this.team = args.team;
  this.path = [];
  this.transition = 0;
  objects.add(this);

  // depends on team
  this.facing = this.team.initialFacing;

  // breath animation
  this.breath = Math.random();

  return this;
}

Unit.prototype.draw_w = 32
Unit.prototype.draw_h = 64


Unit.prototype.shadow_image = document.getElementById("img_unit_shadow");

Unit.prototype.path_normal_image = document.getElementById("img_unit_path_normal");
Unit.prototype.path_normal_image_end = document.getElementById("img_unit_path_normal_end");
Unit.prototype.path_charge_image = document.getElementById("img_unit_path_charge");
Unit.prototype.path_charge_image_end = document.getElementById("img_unit_path_charge_end");
Unit.prototype.path_retreat_image = document.getElementById("img_unit_path_retreat");
Unit.prototype.path_retreat_image_end = document.getElementById("img_unit_path_retreat_end");

Unit.prototype.path_images = {
  charge : {
    node : Unit.prototype.path_charge_image,
    end : Unit.prototype.path_charge_image_end
  },
  retreat : {
    node : Unit.prototype.path_retreat_image,
    end : Unit.prototype.path_retreat_image_end
  }
}

Unit.prototype.archer = {
  name : "archer",
  speed : 4,
  hitpoints : 10,
  damage : 10,
  attackRange : 3
}

Unit.prototype.cavalry = {
  name : "cavalry",
  speed : 16,
  damage : 10,
  hitpoints : 25,
  attackRange : 1
}

Unit.prototype.infantry = {
  name : "infantry",
  speed : 8,
  damage : 15,
  hitpoints : 40,
  attackRange : 1
}

Unit.prototype.draw = function(x, y) {
  x = (x || 0);
  y = (y || 0);

  // draw path only if it's this unit's turn
  if(!turn.currentTeam || (turn.currentTeam == this.team))
  {
    if(this.path.length > 0)
    {
      var prev_hex = this.hex;
      var image_node = (this.path_images[this.path.type] && this.path_images[this.path.type].node || this.path_normal_image);
      var image_end = (this.path_images[this.path.type] && this.path_images[this.path.type].end || this.path_normal_image_end);
      for(var i = 0; i < this.path.length; i++)
      {
        hex = this.path[i];
        ctx.drawImage(image_node, 
          (hex.draw_x + prev_hex.draw_x)/2 + hex.draw_size*0.5 - 6, 
          (hex.draw_y - (hex.isHill ? 12 : 0) + prev_hex.draw_y - (prev_hex.isHill ? 12 : 0))/2 + hex.draw_size*0.5 - 6, 
          11, 
          11);
        if(i == this.path.length - 1)
          ctx.drawImage(image_end, 
              hex.draw_x + hex.draw_size*0.5 - 11, 
              hex.draw_y + hex.draw_size*0.5 - (hex.isHill ? 12 : 0) - 11, 
              22, 
              22);
        else
          ctx.drawImage(image_node, 
            hex.draw_x + hex.draw_size*0.5 - 6, 
            hex.draw_y + hex.draw_size*0.5 - (hex.isHill ? 12 : 0) - 6, 
            11, 
            11);
        prev_hex = hex;
      }
    } 
  }

  // always draw sprite
  var off_y = Math.cos(this.breath*Math.PI*2);
  var bounce_y = 3*Math.sin(this.transition*Math.PI*2);
  ctx.save();
  ctx.scale(this.facing, 1);
    ctx.drawImage(this.shadow_image, 
      this.facing*this.draw_x + x - (this.facing < 0 ? this.draw_w : 0), 
      this.draw_y + y + 40 - (this.hex.isHill ? 12 : 0), 
      this.draw_w, 
      this.draw_h / 3);
    ctx.drawImage(this.weapon_image, 
      this.facing*this.draw_x + x - (this.facing < 0 ? this.draw_w : 0), 
      this.draw_y + y + bounce_y - 8 - (this.hex.isHill ? 12 : 0) - off_y, 
      this.draw_w, 
      this.draw_h);
    ctx.drawImage(this.body_image, 
      this.facing*this.draw_x + x - (this.facing < 0 ? this.draw_w : 0), 
      this.draw_y + y + bounce_y - 8 - (this.hex.isHill ? 12 : 0), 
      this.draw_w, 
      this.draw_h);
    ctx.drawImage(this.head_image, 
      this.facing*this.draw_x + x - (this.facing < 0 ? this.draw_w : 0), 
      this.draw_y + y + bounce_y - 8 - (this.hex.isHill ? 12 : 0) + off_y, 
      this.draw_w, 
      this.draw_h);
    ctx.drawImage(this.offhand_image, 
      this.facing*this.draw_x + x - (this.facing < 0 ? this.draw_w : 0), 
      this.draw_y + y + bounce_y - 8 - (this.hex.isHill ? 12 : 0) - off_y, 
      this.draw_w, 
      this.draw_h);
  ctx.restore();


  ctx.fillText(this.hitpoints+"", this.draw_x, this.draw_y);
}

Unit.prototype.update = function(dt) {
  
  if(this.next_hex)
  {
    this.draw_x = useful.lerp(this.hex.draw_x, this.next_hex.draw_x, this.transition) + (this.hex.draw_size - this.draw_w)*0.5;
    this.draw_y = useful.lerp(this.hex.draw_y, this.next_hex.draw_y, this.transition) + this.hex.draw_size*0.5 - this.draw_h*0.75;
  }
  else
  {
    this.draw_x = this.hex.draw_x + (this.hex.draw_size - this.draw_w)*0.5;
    this.draw_y = this.hex.draw_y + this.hex.draw_size*0.5 - this.draw_h*0.75;
  }

  this.breath += dt;
  if(this.breath > 1)
    this.breath -= 1;
}

Unit.prototype.setHex = function(hex) {
  this.hex.contents = null;
  this.hex = hex;
  this.next_hex = null;
  this.transition = 0;
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

Unit.prototype.isInCombat = function(hex) {
  hex = (hex || this.hex);
  var unit = this;
  if(hex.contents && unit.isEnemyOf(hex.contents))
    return true;
  return hex.hasNeighbourSuchThat(function(hex) {
    return hex.contents && unit.isEnemyOf(hex.contents);
  });
}

Unit.prototype.isCharging = function() {
  return (this.path.type == "charge");
}

Unit.prototype.isRetreating = function() {
  return (this.path.type == "retreat");
}

Unit.prototype.canEnter = function(hex) {
  if(hex.contents)
    return false;
  if(this.isRetreating())
    return !this.isInCombat(hex);
  else
    return true;
}

Unit.prototype.canLeave = function(hex) {
  hex = (hex || this.hex);
  if(this.path.type != "retreat")
    return !this.isInCombat(hex);
  else
    return true;
}

Unit.prototype.pathingCost = function(hex) {
  if(!this.canEnter(hex))
    return Infinity;
  else if(hex.isHill)
    return 1.9999;
  else
    return 1;
}
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
  this.speed = this.unitType.speed;// + Math.random()*0.1;
  this.damage = this.unitType.damage;
  this.hitpoints = this.unitType.hitpoints;
  this.attackRange = this.unitType.attackRange;
  this.minRange = this.unitType.minRange;

  // same for all units
  this.max_moves = Math.max(1, Math.floor(this.speed / 4));
  this.hex = args.hex;
  this.hex.contents = this;
  this.team = args.team;
  this.path = [];
  this.transition = 0;
  objects.add(this);
  this.pain = 0;

  // depends on team
  this.facing = this.team.initialFacing;

  // breath animation
  this.breath = Math.random();

  return this;
}

Unit.prototype.draw_w = 32
Unit.prototype.draw_h = 64

Unit.prototype.surrounded_image = document.getElementById("img_unit_surrounded");

Unit.prototype.shadow_image = document.getElementById("img_unit_shadow");
Unit.prototype.shadow_selected_image = document.getElementById("img_unit_shadow_selected");

Unit.prototype.path_normal_image = document.getElementById("img_unit_path_normal");
Unit.prototype.path_normal_end_image = document.getElementById("img_unit_path_normal_end");
Unit.prototype.path_charge_image = document.getElementById("img_unit_path_charge");
Unit.prototype.path_charge_end_image = document.getElementById("img_unit_path_charge_end");
Unit.prototype.path_retreat_image = document.getElementById("img_unit_path_retreat");
Unit.prototype.path_retreat_end_image = document.getElementById("img_unit_path_retreat_end");
Unit.prototype.path_march_image = document.getElementById("img_unit_path_march");
Unit.prototype.path_march_end_image = document.getElementById("img_unit_path_march_end");

Unit.prototype.attack_combat_image = document.getElementById("img_attack_combat");
Unit.prototype.attack_ranged_image = document.getElementById("img_attack_ranged");
Unit.prototype.attack_node_image = document.getElementById("img_attack_node");


Unit.prototype.path_images = {
  charge : {
    node : Unit.prototype.path_charge_image,
    end : Unit.prototype.path_charge_end_image
  },
  retreat : {
    node : Unit.prototype.path_retreat_image,
    end : Unit.prototype.path_retreat_end_image
  },
  march : {
    node : Unit.prototype.path_march_image,
    end : Unit.prototype.path_march_end_image
  }
}

Unit.prototype.archer = {
  name : "archer",
  speed : 8,
  hitpoints : 20,
  damage : 10,
  attackRange : 4,
  minRange : 2,
}

Unit.prototype.cavalry = {
  name : "cavalry",
  speed : 16,
  damage : 10,
  hitpoints : 30,
  attackRange : 1
}

Unit.prototype.infantry = {
  name : "infantry",
  speed : 10,
  damage : 20,
  hitpoints : 40,
  attackRange : 1
}

Unit.prototype.draw = function(x, y) {
  x = (x || 0);
  y = (y || 0);

  // draw path only if it's this unit's turn
  var previewPath = false;
  if(turn.currentTeam == this.team)
    previewPath = true;
  else if(!turn.currentTeam && !turn.currentUnit)
    previewPath = true;
  else if(!turn.currentTeam && !this.path && !turn.currentUnit.path)
    previewPath = true;
  else if(!turn.currentTeam && this.path && turn.currentUnit.path && this.path.type == turn.currentUnit.path.type)
    previewPath = true;

  if(previewPath)
  {
    // path
    if(this.path.length > 0)
    {
      var prev_hex = this.hex;
      var image_node = (this.path_images[this.path.type] && this.path_images[this.path.type].node || this.path_normal_image);
      var image_end = (this.path_images[this.path.type] && this.path_images[this.path.type].end || this.path_normal_end_image);
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

    // target
    if(this.hasTarget())
    {
      var distance = this.hex.distanceTo(this.target.hex);
      var tx = useful.lerp(this.hex.draw_x, this.target.hex.draw_x, 0.5 / (distance));
      var ty = useful.lerp(this.hex.draw_y, this.target.hex.draw_y, 0.5 / (distance));
      ctx.drawImage(this.attackRange > 1 ? this.attack_ranged_image : this.attack_combat_image, 
        tx + this.hex.draw_size*0.5 - 11, 
        ty + this.hex.draw_size*0.5 - (this.hex.isHill ? 12 : 0) - 11, 
        22, 
        22);

      for(var i = 0; i < 1; i += 1.0/distance)
      {
        var nx = useful.lerp(this.hex.draw_x, this.target.hex.draw_x, i);
        var ny = useful.lerp(this.hex.draw_y, this.target.hex.draw_y, i);
        ctx.drawImage(this.attack_node_image, 
          nx + this.hex.draw_size*0.5 - 4, 
          ny + this.hex.draw_size*0.5 - (this.hex.isHill ? 12 : 0) - 4, 
          9, 
          9);
      }
      
    }
  }

  // always draw sprite... unless flashing from pain
  if(!(this.pain & 2))
  {
    var off_y = this.attacking || (this.pain > 0) ? 0 : Math.cos(this.breath*Math.PI*2);
    var bounce_y = 3*Math.sin(this.transition*Math.PI*2);
    ctx.save();
    ctx.scale(this.facing, 1);
      ctx.drawImage(cursor.selection == this ? this.shadow_selected_image : this.shadow_image, 
        this.facing*this.draw_x + x - (this.facing < 0 ? this.draw_w : 0), 
        this.draw_y + y + 40 - (this.hex.isHill ? 12 : 0), 
        this.draw_w, 
        this.draw_h / 3);
      ctx.save();
        ctx.translate(
          this.facing*this.draw_x + x - (this.facing < 0 ? this.draw_w : 0) - 18,
          this.draw_y + y + bounce_y - 8 - (this.hex.isHill ? 12 : 0) - off_y - 52);
        if(this.attacking)
        {
          ctx.translate(142, 64);
          ctx.rotate(Math.PI/2);
        }
        if(this.hitpoints > 0)
          ctx.drawImage(this.weapon_image, 
            18, 
            52, 
            this.draw_w, 
            this.draw_h);
       ctx.restore();
      ctx.drawImage(this.body_image, 
        this.facing*this.draw_x + x - (this.facing < 0 ? this.draw_w : 0), 
        this.draw_y + y + bounce_y - 8 - (this.hex.isHill ? 12 : 0), 
        this.draw_w, 
        this.draw_h);
      if(this.hitpoints > 0 || this.pain > 3)
        ctx.drawImage(this.head_image, 
          this.facing*this.draw_x + x - (this.facing < 0 ? this.draw_w : 0), 
          this.draw_y + y + bounce_y - 8 - (this.hex.isHill ? 12 : 0) + off_y, 
          this.draw_w, 
          this.draw_h);
      if(this.hitpoints > this.unitType.hitpoints*0.5)
        ctx.drawImage(this.offhand_image, 
          this.facing*this.draw_x + x - (this.facing < 0 ? this.draw_w : 0), 
          this.draw_y + y + bounce_y - 8 - (this.hex.isHill ? 12 : 0) - off_y, 
          this.draw_w, 
          this.draw_h);
    ctx.restore();
  }

  // surrounded
  if(this.isSurrounded())
  {
    ctx.drawImage(this.surrounded_image, 
      this.draw_x + this.hex.draw_size*0.5 - 24, 
      this.draw_y + this.hex.draw_size*0.5 - (this.hex.isHill ? 12 : 0) - 24, 
      16, 
      16);
  }

  if(this.isSelected())
  {  
    ctx.fillRect(this.draw_x - 1, this.draw_y + 64, 34, 4);
    ctx.fillStyle = '#6bff21';
    ctx.fillRect(this.draw_x, this.draw_y + 65, 32*this.hitpoints/this.unitType.hitpoints, 2);
    ctx.fillStyle = 'black';
  }
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

Unit.prototype.isFallingBack = function() {
  return (this.path.type == "march");
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

Unit.prototype.doAttack = function(target) {
  if(!target || !this.canTarget(target))
    return;

  var self = this;
  babysitter.add(function*(dt) {
    self.attacking = true;
    yield * babysitter.waitForSeconds(0.2);
    if(self.purge)
      return;
    self.attacking = false;

    var damage = self.damage;
    if(target.isSurrounded())
      damage *= 2;
    if(target.hex.isHill && !self.hex.isHill)
      damage *= 0.5;
    target.takeDamage(damage);
    self.target = null;
  });
}

Unit.prototype.takeDamage = function(amount) {
  this.hitpoints -= amount;

  this.pain = 7;
  var self = this;
  babysitter.add(function*(dt) {
    while(self.pain > 0)
    {
      yield * babysitter.waitForSeconds(0.1);
      self.pain--;
    }
    if(self.hitpoints <= 0)
      self.purge = true;
  });
}

Unit.prototype.canTarget = function(unit) {
  if(!this.isEnemyOf(unit))
    return false;
  else if(this.hex.distanceTo(unit.hex) > this.attackRange)
    return false;
  else if(this.hex.distanceTo(unit.hex) < (this.minRange || 1))
    return false;
  else
    return true;
}

Unit.prototype.setTarget = function(unit) {
  this.path = [];
  this.target = unit;
}

Unit.prototype.hasTarget = function() {
  return (this.target && !this.target.purge);
}

Unit.prototype.setPath = function(path) {
  this.target = null;

  if(path[0] == this.hex)
    path.shift();

  this.path.length = 0;
  var totalCost = 0;
  while(path.length > 0 && ((totalCost += this.pathingCost(path[0])) <= this.max_moves))
    this.path.push(path.shift());
  path = this.path;

  var path_tip = (path.length == 0) ? this.hex : path[path.length - 1];
  if(path.type != "retreat")
  {
    if(this.canMarchTo(path_tip))
      path.type = "march";
    else
    {
      var self = this;
      var is_charge = path_tip.hasNeighbourSuchThat(function(hex) {
        return hex.contents && self.canCharge(hex.contents);
      });
      if(is_charge)
        path.type = "charge";
      else
        path.type = null;
    }
  }
  var sign = Math.sign(path_tip.draw_x - this.hex.draw_x);
  this.facing = sign || this.team.initialFacing;
}

Unit.prototype.onPurge = function() {
  this.hex.contents = null;
  this.hex = null;

  // check for win or for loss
  var teams = {}
  var team_count = 0;
  objects.map({
    f : function(object) {
      if(object.hitpoints >= 0)
      {
        if(!teams[object.team.name])
        {
          teams[object.team.name] = true;
          team_count++;
        }
      }
    }
  });
  if(team_count < 2)
    window.location = window.location;
}

Unit.prototype.isSelected = function() {
  return (this == cursor.selection);
}

Unit.prototype.isSurrounded = function() {
  var self = this;
  return !this.hex.hasNeighbourSuchThat(function(hex) {
    return !self.isInCombat(hex);
  });
}

Unit.prototype.pathingCostTo = function(hex) {
  var path = grid.hexPath({
    startHex : this.hex, 
    endHex : hex, 
    unit : this
  });
  return path.cost;
}

Unit.prototype.withinMoveRange = function(hex) {
  return (this.pathingCostTo(hex) <= this.max_moves);
}

Unit.prototype.withinChargeRange = function(hex) {
  var self = this;
  return hex.hasNeighbourSuchThat(function(neighbour_hex) {
    return (self.withinMoveRange(neighbour_hex));
  });
}

Unit.prototype.canMarchTo = function(hex) {
  var canMarch = true;
  var self = this;
  objects.map({ f : function(object) {
    if(object.isEnemyOf(self) && object.withinChargeRange(hex))
    {
      canMarch = false;
      return true;
    }
  }});
  return canMarch;
}
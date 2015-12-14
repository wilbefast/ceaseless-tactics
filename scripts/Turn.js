// ----------------------------------------------------------------------------
// TURN LOGIC
// ----------------------------------------------------------------------------

var turn = {
  button_image : document.getElementById("img_button"),
  button_highlight_image : document.getElementById("img_button_highlight"),
  count : 1
}

turn.draw = function() {
  ctx.font = "30px Arial";
  ctx.textAlign = "right";
  
  if(turn.currentTeam)
  {
    //ctx.fillText((turn.currentTeam.name + " turn " + turn.count + " / 6").firstToUpper(), ctx.canvas.width - 32, 64);

    ctx.drawImage(turn.buttonHovered 
      ? turn.button_highlight_image 
      : turn.button_image, 
      ctx.canvas.width - 228, 88, 196, 64);
    ctx.fillText("End turn?", ctx.canvas.width - 64, 128);
  }
  else
  {
    ctx.fillText("Resolution", ctx.canvas.width - 32, 64);
  }
}

turn.end = function() {
  if(!turn.currentTeam)
    return;

  cursor.clearSelection();

  var next_i = turn.currentTeam.i + 1;
  if(next_i >= Team.prototype.all.length) 
  {
    turn.currentTeam = null;
    turn.count++;
    next_i = 0;

    // sort units by speed
    var units = [];
    objects.map({ 
      orderBy : function(a, b) { 
        // resolve attacks first
        if(a.hasTarget() && !b.hasTarget())
          return -a.speed;
        else if(b.hasTarget() && !a.hasTarget())
          return b.speed;
        // resolve all charges next
        else if(a.isCharging() && !b.isCharging())
          return -a.speed;
        else if(b.isCharging() && !a.isCharging())
          return b.speed;
        // resolve all retreats next
        else if(a.isRetreating() && !b.isRetreating())
          return -a.speed;
        // resolve all moves last
        else if(b.isRetreating() && !a.isRetreating())
          return b.speed;
        else
          return b.speed - a.speed; 
      },
      f : function(unit) { units.push(unit); }
    });

    babysitter.add(function*(dt) {

      yield * babysitter.waitForSeconds(1.5);

      for(var i = 0; i < units.length; i++)
      {
        var unit = units[i];

        if(unit.path.length > 0 || unit.hasTarget())
          yield * babysitter.waitForSeconds(0.3);
        if(unit.purge || unit.hitpoints <= 0)
          continue;

        // pop path nodes as far as we can
        while(unit.path.length > 0)
        {
          // make sure it's actually possible to leave the current tile
          if(!unit.canLeave())
            break;

          // move to the next tile
          var hex = unit.path[0];
          if(unit.canEnter(hex) && (!unit.isInCombat(hex) || unit.isCharging()))
          {
            unit.next_hex = hex;
            unit.transition = 0;

            yield * babysitter.doForSeconds(0.2, function(t) {
              unit.transition = t;
            });
            if(unit.purge || unit.hitpoints <= 0)
              break;

            unit.setHex(hex);
            unit.path.shift();
          }
          else
            unit.path.length = 0;
        }
        if(unit.purge || unit.hitpoints <= 0)
          continue;

        // interrupt actions at target destination
        if((unit.isInCombat() && unit.isCharging() || unit.hasTarget()))
        {
          var target = unit.target;
          unit.hex.mapToNeighbours(function(hex) {
            if(hex.contents && hex.contents.isInCombat() && unit.isEnemyOf(hex.contents))
            {
              if(!hex.contents.isRetreating())
                hex.contents.path.length = 0;
              if(!target)
                target = hex.contents;
            } 
          });

          // combat attack
          unit.doAttack(target);
          yield * babysitter.waitForSeconds(0.3);
          if(unit.purge || unit.hitpoints <= 0)
            continue;
        }
        else if(unit.hasTarget())
        {
          // ranged attack
          unit.doAttack(target);
          yield * babysitter.waitForSeconds(0.3);
          if(unit.purge || unit.hitpoints <= 0)
            continue;
        }
      }

      // clear all orders
      objects.map({ 
        f : function(object) {
          object.setTarget(null);
          object.path = [];
        }
      });

      // switch back to the first team
      turn.currentTeam = Team.prototype.all[next_i];
      if(turn.currentTeam.aiControlled)
      {
        ai.takeTurnForTeam(turn.currentTeam);
        turn.end();
      }
    });
  }
  else
  {
    // switch to the next team
    turn.currentTeam = Team.prototype.all[next_i];
    if(turn.currentTeam.aiControlled)
    {
      ai.takeTurnForTeam(turn.currentTeam);
      turn.end();
    }
  }
}

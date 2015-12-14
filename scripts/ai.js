// ----------------------------------------------------------------------------
// ARTIFICIAL INTELLIGENCE FOR OPPONENT
// ----------------------------------------------------------------------------

var ai = {}

ai.takeTurnForTeam = function(team)
{
  ai.tabouHexes = {}

  objects.map({
    f : function(unit) { 
      if(unit.team == team)
        ai.takeTurnForUnit(unit); 
    }
  });
}

ai.takeTurnForUnit = function(unit)
{
  var startHex = unit.hex;

  var bestPath = null;
  var bestPathValue = -Infinity;

  var bestTarget = null;
  var bestTargetValue = -Infinity;


  grid.map(function(hex) {

    // try to grab a target
    if(hex.contents && unit.canTarget(hex.contents))
    {
      bestTarget = hex.contents;
      bestTargetValue = 0;
    }

    // don't bother with paths if we have a target
    if(!bestTarget)
    {
      var path = grid.hexPath({
        startHex : startHex, 
        endHex : hex, 
        unit : unit
      });

      var pathValue = -Infinity;

      // within range
      if(path.cost <= unit.max_moves)
      {
        pathValue = 0;

        var path_tip = (path.length == 0) ? unit.hex : path[path.length - 1];

        // add 1 point for each unit we would be charging
        if(path_tip.mapToNeighbours(function(hex) {
          if(hex.contents && unit.canCharge(hex.contents))
            pathValue++;
        }));

        // would we be near someone?
        var closestDistance = Infinity;
        objects.map({
          f : function(other_unit) { 
            if(unit.isEnemyOf(other_unit))
            {
              var distance = path_tip.distanceTo(other_unit.hex);

              if(distance < closestDistance)
                closestDistance = distance;
            }
          }
        });
        pathValue += 1/closestDistance/closestDistance;

        // multiply for hills
        if(path_tip.isHill)
          pathValue *= 2;
      }

      // is this path the best of the best
      if(pathValue > bestPathValue)
      {
        bestPath = path;
        bestPathValue = pathValue;
      }
    }

  });

  if(bestTarget)
    unit.setTarget(bestTarget)
  else if(bestPath)
    unit.setPath(bestPath);
}
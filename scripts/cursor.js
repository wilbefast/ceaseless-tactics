// ----------------------------------------------------------------------------
// CURSOR
// ----------------------------------------------------------------------------

var cursor = {
  x : 0,
  y : 0,
  image : document.getElementById("img_cursor")
}

cursor.moveTo = function(x, y) {

  cursor.x = x;
  cursor.y = y;

  // hover over hexes
  var new_hex = grid.pixelToHex(cursor.x, cursor.y);
  if(new_hex != cursor.hex)
  {
    cursor.hex = new_hex;
    if(cursor.selection && (cursor.selection.team == turn.currentTeam) && cursor.path && new_hex)
    {
      var selectedUnit = cursor.selection;
      var path = cursor.path;

      var new_path = grid.hexPath({
        startHex : selectedUnit.hex, 
        endHex : new_hex, 
        unit : selectedUnit
      });

      path.length = 0;
      for(var i = 0; i <= Math.min(new_path.length - 1, selectedUnit.max_moves); i++)
        path[i] = new_path[i];
      var path_tip = (path.length == 0) ? selectedUnit.hex : path[path.length - 1];
      if(path.type != "retreat")
      {
        var is_charge = path_tip.hasNeighbourSuchThat(function(hex) {
          return hex.contents && selectedUnit.canCharge(hex.contents);
        });
        if(is_charge)
          path.type = "charge"; 
      }
      var sign = Math.sign(path_tip.draw_x - selectedUnit.hex.draw_x);
      selectedUnit.facing = sign || selectedUnit.team.initialFacing;
    }
  }

  // hover over UI elements
  ui.hover(cursor.x, cursor.y);
}

cursor.draw = function() {
  ctx.drawImage(cursor.image, cursor.x, cursor.y, 32, 32); 
}

cursor.leftClick = function() {
  // select units
  if(cursor.hex)
  {
    var selection = cursor.hex.contents;

    // deselect current unit
    if(cursor.selection && selection != cursor.selection)
      cursor.clearSelection();

    if(selection)
    {
      cursor.selection = selection;

      // start a new path for units under my control
      if(selection.team == turn.currentTeam)
        cursor.path = selection.path = [];

      // for the purpose of calculating the preview we need to set the path type
      if(selection.isInCombat())
        selection.path.type = "retreat";

      // preview possible destinations for unit, whether allied or not
      grid.map(function(hex) {
        var preview_path = grid.hexPath({
          startHex : selection.hex, 
          endHex : hex, 
          unit : selection
        });
        hex.preview = (preview_path.cost <= selection.max_moves);
      });
      
    }
    else
    {
      cursor.selection = cursor.path = null;
    }
  }

  // press UI elements
  ui.leftClick(cursor.x, cursor.y);
}

cursor.rightClick = function() {
  // order units
  if(cursor.selection)
  {
    cursor.selection = cursor.path = null;
  }
}

cursor.clearSelection = function() {
  if(cursor.selection)
  {
    cursor.selection.path = [];
    cursor.selection = null;
  }
  cursor.path = [];
}

cursor.isInRect = function(x, y, w, h) {
  if(cursor.x < x || cursor.x > x + w)
    return false; 
  if(cursor.y < y || cursor.y > y + h)
    return false; 
  return true;
}
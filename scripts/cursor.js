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

      if(new_hex.contents)
      {
        if(selectedUnit.canTarget(new_hex.contents))
          selectedUnit.setTarget(cursor.hex.contents);
      }
      else
      {
        cursor.path = grid.hexPath({
          startHex : selectedUnit.hex, 
          endHex : new_hex, 
          unit : selectedUnit
        });
        selectedUnit.setPath(cursor.path);
      }
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
      {
        selection.setTarget(null);
        cursor.path = selection.path = [];
      }

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
    if(cursor.hex.contents && cursor.selection.canTarget(cursor.hex.contents))
      cursor.selection.setTarget(cursor.hex.contents);

    cursor.selection = cursor.path = null;
  }
}

cursor.clearSelection = function() {
  if(cursor.selection)
  {
    cursor.selection.setTarget(null);
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
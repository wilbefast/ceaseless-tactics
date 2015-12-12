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
    if(cursor.selection && cursor.path && new_hex)
    {
      var selectedUnit = cursor.selection;
      var path = cursor.path;

      if(new_hex == selectedUnit.hex)
      {
        path.length = 0;
        path.isCharge = false;
      }
      else for(i = 0; i < path.length; i++)
      {
        var old_hex = path[i];
        if(old_hex == new_hex)
        {
          path.length = i;
          path.isCharge = false;
          break;
        }
      }

      var path_tip = (path.length == 0) ? selectedUnit.hex : path[path.length - 1];
      if(!path.isCharge && !new_hex.contents && (selectedUnit.max_moves - path.length > 0) && path_tip.isNeighbourOf(new_hex))
      {
        path.push(new_hex);
        path.isCharge = new_hex.hasNeighbourSuchThat(function(hex) {
          return hex.contents && selectedUnit.canCharge(hex.contents);
        });

      }
      else
      {
        var new_path = grid.hexPath(selectedUnit.hex, new_hex, selectedUnit);

        path.length = 0;
        for(var i = 0; i <= Math.min(new_path.length - 1, selectedUnit.max_moves); i++)
          path[i] = new_path[i];
        var path_tip = (path.length == 0) ? selectedUnit.hex : path[path.length - 1];
        path.isCharge = path_tip.hasNeighbourSuchThat(function(hex) {
          return hex.contents && selectedUnit.canCharge(hex.contents);
        });

      }
    }
  }

  // hover over UI elements
  turn.buttonHovered = cursor.isInRect(ctx.canvas.width - 256, 96, 256, 64);

}

cursor.draw = function() {
  ctx.drawImage(cursor.image, cursor.x, cursor.y, 32, 32);

  if(cursor.path && cursor.path.length > 0)
  {
    ctx.beginPath();
    var hex = cursor.selection.hex;
    ctx.lineWidth = 5;
    ctx.strokeStyle = cursor.path.isCharge ? 'red' : 'white';
    ctx.moveTo(hex.draw_x + hex.draw_size*0.5, hex.draw_y + hex.draw_size*0.5);
    for(var i = 0; i < cursor.path.length; i++)
    {
      hex = cursor.path[i];
      ctx.lineTo(hex.draw_x + hex.draw_size*0.5, hex.draw_y + hex.draw_size*0.5);
    }
    ctx.stroke();
  } 

  if(cursor.hex && cursor.selection)
    grid.map(function(hex) {
      if(hex.isWithinRangeOf(cursor.selection.hex, cursor.selection.max_moves))
        hex.draw_preview();
    });
}

cursor.press = function() {
  // select units
  if(cursor.hex)
  {
    var selection = cursor.hex.contents;
    if(selection && selection.team == turn.currentTeam)
    {

      cursor.selection = selection;
      cursor.path = cursor.selection.path = [];
    }
  }

  // press UI elements
  if(turn.buttonHovered)
    turn.end();
}

cursor.release = function() {
  if(cursor.selection)
  {
    if(cursor.path)
    {
      cursor.selection.setPath(cursor.path);
      cursor.path = null;
    }
    cursor.selection = null;
  }
}

cursor.isInRect = function(x, y, w, h) {
  if(cursor.x < x || cursor.x > x + w)
    return false; 
  if(cursor.y < y || cursor.y > y + h)
    return false; 
  return true;
}
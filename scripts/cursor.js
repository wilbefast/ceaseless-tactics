// ----------------------------------------------------------------------------
// CURSOR
// ----------------------------------------------------------------------------

var cursor = {
  x : 0,
  y : 0,
  image : document.getElementById("img_cursor")
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

cursor.isInRect = function(x, y, w, h) {
  if(cursor.x < x || cursor.x > x + w)
    return false; 
  if(cursor.y < y || cursor.y > y + h)
    return false; 
  return true;
}
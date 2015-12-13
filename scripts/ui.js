// ----------------------------------------------------------------------------
// USER INTERFACE
// ----------------------------------------------------------------------------

var ui = {}

ui.hover = function(x, y)
{
  turn.buttonHovered = cursor.isInRect(ctx.canvas.width - 256, 96, 256, 64);
}

ui.leftClick = function(x, y)
{
  if(turn.buttonHovered)
    turn.end();
}

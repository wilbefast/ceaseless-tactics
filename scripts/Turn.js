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
  ctx.fillText((turn.currentTeam.name + " turn " + turn.count + " / 6").firstToUpper(), ctx.canvas.width - 32, 64);

  ctx.drawImage(turn.buttonHovered 
    ? turn.button_highlight_image 
    : turn.button_image, 
    ctx.canvas.width - 228, 88, 196, 64);
  ctx.fillText("End turn?", ctx.canvas.width - 64, 128);
}

turn.end = function() {
  var next_i = turn.currentTeam.i + 1;
  if(next_i >= Team.prototype.all.length) 
  {
    turn.count++;
    next_i = 0;

    objects.map({ f : function(unit) {
      if(unit.path.length > 0)
      {
        unit.setHex(unit.path[unit.path.length - 1]);
        unit.path.length = 0;
      }
    }});
  }
  turn.currentTeam = Team.prototype.all[next_i];
}

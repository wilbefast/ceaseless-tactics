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
    ctx.fillText((turn.currentTeam.name + " turn " + turn.count + " / 6").firstToUpper(), ctx.canvas.width - 32, 64);

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
  var next_i = turn.currentTeam.i + 1;
  if(next_i >= Team.prototype.all.length) 
  {
    turn.currentTeam = null;
    turn.count++;
    next_i = 0;

    // sort units by speed
    var units = [];
    objects.map({ 
      orderBy : function(a, b) { return a.speed - b.speed; },
      f : function(unit) { units.push(unit); }
    });

    babysitter.add(function*(dt) {
      for(var i = 0; i < units.length; i++)
      {
        var unit = units[i];

        // wait for 1 second
        var start_t = Date.now();
        while(Date.now() - start_t < 300)  
          dt = yield undefined;

        for(var j = 0; j < unit.path.length; j++)
        {
          // wait for 0.1 seconds
          var start_t = Date.now();
          while(Date.now() - start_t < 100)  
            dt = yield undefined;

          // move to the next tile
          console.log(unit.path, j);
          unit.setHex(unit.path[j]);
        } 
        unit.path.length = 0;
      }
      turn.currentTeam = Team.prototype.all[next_i];
    });
  }
  else
    turn.currentTeam = Team.prototype.all[next_i];
}

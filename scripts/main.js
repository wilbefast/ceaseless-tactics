
var main = function() {

  // ----------------------------------------------------------------------------
  // INITIALISE
  // ----------------------------------------------------------------------------

  grid = new Grid(12, 12, Hex);

  Team.red = new Team({
    name : "red",
    images : {
      Unit : document.getElementById("img_unit_red")
    }
  });

  Team.blue = new Team({
    name : "blue",
    images : {
      Unit : document.getElementById("img_unit_blue")
    }
  });

  turn.currentTeam = Team.red;

  // red team units
  new Unit({
    hex : grid.orthoToHex(1, Math.floor(grid.n_rows / 2) - 2),
    team : Team.red
  });
  new Unit({
    hex : grid.orthoToHex(1, Math.floor(grid.n_rows / 2)),
    team : Team.red
  });
  new Unit({
    hex : grid.orthoToHex(1, Math.floor(grid.n_rows / 2) + 2),
    team : Team.red
  });

  // blue team units
  new Unit({
    hex : grid.orthoToHex(grid.n_cols - 1, Math.floor(grid.n_rows / 2) - 2),
    team : Team.blue
  });
  new Unit({
    hex : grid.orthoToHex(grid.n_cols - 1, Math.floor(grid.n_rows / 2)),
    team : Team.blue
  });
  new Unit({
    hex : grid.orthoToHex(grid.n_cols - 1, Math.floor(grid.n_rows / 2) + 2),
    team : Team.blue
  });

  ctx.canvas.addEventListener('mousemove', function(event) {
    var rect = ctx.canvas.getBoundingClientRect();
    cursor.x = event.clientX - rect.left;
    cursor.y = event.clientY - rect.top;

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
      
  }, false);

  ctx.canvas.addEventListener('mousedown', function(event) {

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

  }, false);

  ctx.canvas.addEventListener('mouseup', function(event) {
    if(cursor.selection)
    {
      if(cursor.path)
      {
        cursor.selection.setPath(cursor.path);
        cursor.path = null;
      }
      cursor.selection = null;
    }
  }, false);

  // ----------------------------------------------------------------------------
  // ANIMATE
  // ----------------------------------------------------------------------------

  function update(dt) { 
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    grid.update(dt);
    objects.update(dt);
  }

  function draw() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    grid.draw();
    objects.draw();
    turn.draw();
    cursor.draw();
  }
  var lastFrameTime = Date.now();
  function nextFrame() {
    var deltaTime = Date.now() - lastFrameTime;
    update(deltaTime);
    draw(deltaTime);
    requestAnimationFrame(nextFrame);
  }
  nextFrame();

} // main
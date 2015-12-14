// ----------------------------------------------------------------------------
// SETUP AND MAIN LOOP
// ----------------------------------------------------------------------------

var main = function() {

  // ----------------------------------------------------------------------------
  // INITIALISE
  // ----------------------------------------------------------------------------

  grid = new Grid(10, 9, Hex);

  turn.currentTeam = Team.red;

  // red team units
  for(var i = 0; i < 6; i++)
  {
    var hex = null;
    while(!hex)
    {
      hex = grid.orthoToHex(Math.floor(Math.random()*3), Math.floor(Math.random()*grid.n_rows));
      if(hex.contents)
        hex = null;
    }
    var type = (Math.random() > 0.5 ? Unit.prototype.infantry : (Math.random() > 0.5 ? Unit.prototype.archer : Unit.prototype.cavalry));
    new Unit({
      hex : hex,
      team : Team.red,
      type : type
    });
  }

  // blue team units
  for(var i = 0; i < 6; i++)
  {
    var hex = null;
    while(!hex)
    {
      hex = grid.orthoToHex(grid.n_cols - Math.ceil(Math.random()*3), Math.floor(Math.random()*grid.n_rows));
      if(hex.contents)
        hex = null;
    }
    var type = (Math.random() > 0.5 ? Unit.prototype.infantry : (Math.random() > 0.5 ? Unit.prototype.archer : Unit.prototype.cavalry));
    new Unit({
      hex : hex,
      team : Team.blue,
      type : type
    });
  }
  /*
  // red team units
  new Unit({
    hex : grid.orthoToHex(1, Math.floor(grid.n_rows / 2) - 2),
    team : Team.red,
    type : Unit.prototype.infantry
  });
  new Unit({
    hex : grid.orthoToHex(1, Math.floor(grid.n_rows / 2)),
    team : Team.red,
    type : Unit.prototype.infantry
  });
  new Unit({
    hex : grid.orthoToHex(1, Math.floor(grid.n_rows / 2) + 2),
    team : Team.red,
    type : Unit.prototype.infantry
  });

  // blue team units
  new Unit({
    hex : grid.orthoToHex(grid.n_cols - 2, Math.floor(grid.n_rows / 2) - 2),
    team : Team.blue,
    type : Unit.prototype.infantry
  });
  new Unit({
    hex : grid.orthoToHex(grid.n_cols - 2, Math.floor(grid.n_rows / 2)),
    team : Team.blue,
    type : Unit.prototype.infantry
  });
  new Unit({
    hex : grid.orthoToHex(grid.n_cols - 2, Math.floor(grid.n_rows / 2) + 2),
    team : Team.blue,
    type : Unit.prototype.infantry
  });
*/

  ctx.canvas.addEventListener('mousemove', function(event) {
    var rect = ctx.canvas.getBoundingClientRect();
    cursor.moveTo(event.clientX - rect.left, event.clientY - rect.top);      
  }, false);

  ctx.canvas.addEventListener('click', function(event) {
    if(event.button == 0)
      cursor.leftClick();
  }, false);

  ctx.canvas.addEventListener('contextmenu', function(event) {
    cursor.rightClick();
    event.preventDefault();
  }, false);

  // ----------------------------------------------------------------------------
  // ANIMATE
  // ----------------------------------------------------------------------------

  function update(dt) { 
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    grid.update(dt);
    objects.update(dt);
    babysitter.update(dt);
  }

  function draw() {

    // force off smoothing (it keeps turning itself back on)
    ctx.imageSmoothingEnabled       = false;
    ctx.mozImageSmoothingEnabled    = false;
    ctx.msImageSmoothingEnabled     = false;
    ctx.oImageSmoothingEnabled      = false;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    grid.draw();
    objects.draw();
    turn.draw();
    cursor.draw();
  }

  var lastFrameTime = Date.now();
  function nextFrame() {
    var thisFrameTime = Date.now();
    var deltaTime = thisFrameTime - lastFrameTime;
    lastFrameTime = thisFrameTime;
    update(deltaTime / 1000);
    draw();
    requestAnimationFrame(nextFrame);
  }
  nextFrame();

} // main
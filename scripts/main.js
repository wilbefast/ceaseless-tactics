
var main = function() {

  // ----------------------------------------------------------------------------
  // INITIALISE
  // ----------------------------------------------------------------------------

  grid = new Grid(6, 12, Hex);

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
    hex : grid.orthoToHex(grid.n_cols - 2, Math.floor(grid.n_rows / 2) - 2),
    team : Team.blue
  });
  new Unit({
    hex : grid.orthoToHex(grid.n_cols - 2, Math.floor(grid.n_rows / 2)),
    team : Team.blue
  });
  new Unit({
    hex : grid.orthoToHex(grid.n_cols - 2, Math.floor(grid.n_rows / 2) + 2),
    team : Team.blue
  });

  ctx.canvas.addEventListener('mousemove', function(event) {
    var rect = ctx.canvas.getBoundingClientRect();
    cursor.moveTo(event.clientX - rect.left, event.clientY - rect.top);      
  }, false);

  ctx.canvas.addEventListener('mousedown', function(event) {
    cursor.press();
  }, false);

  ctx.canvas.addEventListener('mouseup', function(event) {
    cursor.release();
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
    update(deltaTime);
    draw(deltaTime);
    requestAnimationFrame(nextFrame);
  }
  nextFrame();

} // main
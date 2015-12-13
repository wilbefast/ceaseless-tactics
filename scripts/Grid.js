// ----------------------------------------------------------------------------
// GRID CLASS
// ----------------------------------------------------------------------------

function Grid(n_cols, n_rows, hex_class) {

  this.hex_class = hex_class;

  this.draw_order = [];

  // build hexes
  this.n_cols = n_cols;
  this.n_rows = n_rows;
  this.hexes = [];
  for(var col = 0; col < (this.n_cols + this.n_rows); col++) {
    for(var row = 0; row < this.n_rows; row++) {
      if(this.isValidAxial(col, row)) {
        this.hexes[col + (this.n_cols + this.n_rows)*row] = new hex_class(this, col, row);
        this.draw_order.push(col + (this.n_cols + this.n_rows)*row);
      }
    }
  }
  this.draw_order.shuffle();

  // cache neighbourhoods
  for(var i = 0; i < this.hexes.length; i++)
  {
    var hex = this.hexes[i];
    if(hex)
    {
      hex.E = this.cubeToHex(hex.x + 1, hex.y - 1, hex.z);
      hex.NE = this.cubeToHex(hex.x + 1, hex.y, hex.z - 1);
      hex.NW = this.cubeToHex(hex.x, hex.y + 1, hex.z - 1);
      hex.W = this.cubeToHex(hex.x - 1, hex.y + 1, hex.z);
      hex.SW = this.cubeToHex(hex.x - 1, hex.y, hex.z + 1);
      hex.SE = this.cubeToHex(hex.x, hex.y - 1, hex.z + 1);

      hex.neighbours = [ hex.E, hex.NE, hex.NW, hex.W, hex.SW, hex.SE ];
    }
  }

  this.update(0);

  return this;
}

Grid.prototype.isValidAxial = function(col, row) {
  return ((2*col + row >= this.n_rows) && (col + row/2 < this.n_cols + this.n_rows*0.5));
}

Grid.prototype.axialToHex = function(col, row) {
  if(!this.isValidAxial(col, row))
    return null;
  else
    return this.hexes[col + (this.n_cols + this.n_rows)*row];
};

Grid.prototype.cubeToHex = function(x, y, z) {
  return this.axialToHex(x, z)
};

Grid.prototype.orthoToHex = function(col, row) {
  col += Math.ceil((this.n_rows - row)/2);
  return this.axialToHex(col, row);
};

Grid.prototype.pixelToHex = function(x, y) {

  x -= this.draw_x;
  y -= this.draw_y;
  
  // cube coordinates
  var cx = 0.8 * (x - y*2/3) / Hex.prototype.draw_size / Hex.prototype.spacing;
  var cz = 0.9 * y / Hex.prototype.draw_size / Hex.prototype.spacing;
  var cy = -cx - cz;

  // rounded cube coordinates
  var rx = Math.round(cx);
  var ry = Math.round(cy);
  var rz = Math.round(cz);

  // difference between the original and the rounded version
  var x_diff = Math.abs(rx - cx);
  var y_diff = Math.abs(ry - cy);
  var z_diff = Math.abs(rz - cz);

  if (x_diff > y_diff && x_diff > z_diff)
    rx = -ry - rz;
  else if (y_diff > z_diff)
    ry = -rx - rz;
  else
    rz = -rx - ry;

  return this.cubeToHex(rx, ry, rz);
};


Grid.prototype.draw = function() {
  for(var i = 0; i < this.draw_order.length; i++)
    var hex = this.hexes[this.draw_order[i]].draw();
};

Grid.prototype.update = function(dt) {

  // global scaling
  var scale = Math.max(1, Math.round(Math.min(window.innerWidth / this.n_cols, window.innerHeight / this.n_rows) / 64));
  Hex.prototype.draw_size = 64 * scale;


  Unit.prototype.draw_w = 32 * scale;
  Unit.prototype.draw_h = 64 * scale;


  this.draw_w = this.n_cols*this.hex_class.prototype.draw_size*2;
  this.draw_h = this.n_rows*this.hex_class.prototype.draw_size*0.75;

  this.draw_x = (window.innerWidth - this.draw_w)*0.5;
  this.draw_y = (window.innerHeight - this.draw_h)*0.5;

  for(var i = 0; i < this.hexes.length; i++)
  {
    var hex = this.hexes[i];
    if(hex)
      hex.update(dt);
  }
};

Grid.prototype.map = function(f) {
  for(var i = 0; i < this.hexes.length; i++)
  {
    var hex = this.hexes[i];
    if(hex)
    {
      var result = f(hex);
      if(result)
        return result;
    }
  }
};

Grid.prototype.hexPath = function(args) {

  var startHex = args.startHex;
  var endHex = args.endHex;
  var unit = args.unit;
  var map = args.map;

  var _estimatePathCost = function(startHex, endHex) {
    return startHex.distanceTo(endHex);
  }

  var _setPathStatePrevious = function(pathState, previousPathState) {
    pathState.previousPathState = previousPathState
    pathState.currentCost = previousPathState.currentCost + unit.pathingCost(pathState.currentHex);
  }
  
  var _createPathState = function(currentHex, goalHex, previousPathState) {
    var pathState = {
      currentHex : currentHex,
      goalHex : goalHex,
      opened : false,
      closed : false,
    };

    if(previousPathState) 
      _setPathStatePrevious(pathState, previousPathState);
    else
      pathState.currentCost = 0;

    if(goalHex)
      pathState.remainingCostEstimate = _estimatePathCost(pathState.currentHex, pathState.goalHex);
    else
      pathState.remainingCostEstimate = 0

    pathState.totalCostEstimate = pathState.currentCost + pathState.remainingCostEstimate;

    return pathState;
  }

  var startState = _createPathState(startHex, endHex);
  var openStates = [ startState ];
  var allStates = { startHex : startState };

  var _expandPathState = function(pathState) {

    var __canExpandTo = function(hex) {
      if(!hex || !unit.canEnter(hex))
        return false;
      else
        return true;
    }

    var __expandTo = function(hex) {
      if (!__canExpandTo(hex))
        return;

      // find or create the neighbour state
      var neighbourState = allStates[hex.hash];

      if(!neighbourState)
      {
        neighbourState = _createPathState(hex, pathState.goalHex, pathState);
        allStates[hex.hash] = neighbourState;
      }
      // do nothing if the state is closed
      if (!neighbourState.closed)
      {
        if(!neighbourState.opened)
        {
          // always open states that have not yet been opened and create a link
          _setPathStatePrevious(neighbourState, pathState);
          neighbourState.opened = true;
          openStates.push(neighbourState);
        }
        else if(pathState.currentCost < neighbourState.currentCost)
        {
          // create a link with already open states provided the cost would be improved
          _setPathStatePrevious(neighbourState, pathState);
        }
      }
    }

    // try to expand to each neighbour
    var hex = pathState.currentHex;
    if(unit.canLeave(hex))
      for(var i = 0; i < hex.neighbours.length; i++)
        __expandTo(hex.neighbours[i]);
  }

  var fallback = null;

  while (openStates.length > 0)
  {
    // expand from the open state that is currently cheapest
    var state = openStates.pop();
    // have we reached the end?
    if(state.currentHex == endHex)
    {
      var path = [];
      path.cost = state.currentCost;
      // read back and return the result
      while(state)
      {
        path.unshift(state.currentHex);
        state = state.previousPathState;
      }
      return path;
    }

    // try to expand each neighbour
    _expandPathState(state);

    // remember to close the state now that all connections have been expanded
    state.closed = true;
    if(map)
      map(state.currentHex, state.currentCost);

    // keep the best closed state, just in case the target is inaccessible
    if (!fallback || _estimatePathCost(state.currentHex, endHex) < _estimatePathCost(fallback.currentHex, endHex))
      fallback = state;

    // sort the lowest cost states the the end of the table, they will be popped first
    openStates.sort(function(a, b) {
      return (b.totalCostEstimate - a.totalCostEstimate);
    });
  }

  // fail!
  var path = [];
  path.cost = Infinity;
  if(fallback)
  {
    // fallback on the best we can do
    var state = fallback;
    while(state)
    {
      path.unshift(state.currentHex);
      state = state.previousPathState;
    }
  }

  return path;
}
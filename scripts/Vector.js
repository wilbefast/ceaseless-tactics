// ----------------------------------------------------------------------------
// VECTOR MATH
// ----------------------------------------------------------------------------

var Vector = {}

Vector.len2 = function(x, y) {
  return x*x + y*y;
}

Vector.len = function(x, y) {
  return Math.sqrt(x*x + y*y)
}

Vector.normalise = function(x, y) {
  var l = Math.sqrt(x*x + y*y);
  if (l > 0)
  {
    x = x/l;
    y = y/l;
  }
  return { x : x, y : y, originalLength : l };
}

Vector.dist2 = function(x1, y1, x2, y2) {
  var x = x2 - x1;
  var y = y2 - y1;
  return x*x + y*y;
}

Vector.dist = function(x1, y1, x2, y2) {
  var x = x2 - x1;
  var y = y2 - y1;
  return Math.sqrt(x*x + y*y);
}

Vector.dot = function(x1, y1, x2, y2) {
  return x1*x2 + y1*y2;
}

Vector.det = function(x1, y1, x2, y2) {
  return x1*y2 - y1*x2;
}

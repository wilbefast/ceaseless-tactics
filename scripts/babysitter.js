// ----------------------------------------------------------------------------
// COROUTINE MANAGER
// ----------------------------------------------------------------------------

var babysitter = {
  coroutines : []
}

babysitter.add = function(c)
{
  // add a new coroutine to be "babysat"
  babysitter.coroutines.push(c());
}

babysitter.clear = function()
{
  // remove all the coroutines, start afresh
  babysitter.coroutines.length = 0;
}

babysitter.countRunning = function()
{
  return babysitter.coroutines.length;
}

babysitter.waitForSeconds = function* (duration_s)
{
  var duration_ms = duration_s*1000;
  var start_ms = Date.now();
  var dt = 0.0;
  while(Date.now() - start_ms < duration_ms)  
    dt = yield undefined;
  return dt;
}

babysitter.doForSeconds = function* (duration_s, f)
{
  var duration_ms = duration_s*1000;
  var start_ms = Date.now();
  var dt = 0.0;
  while(Date.now() - start_ms < duration_ms)
  {
    var t = (Date.now() - start_ms) / duration_ms;
    f(t);
    dt = yield undefined;
  }
  return dt;
}

babysitter.update = function(dt)
{
  // this is where I'd really love J. Blow's 'remove' primitive...
  var i = 0;
  while(i < babysitter.coroutines.length)
  {
    var c = babysitter.coroutines[i];
    // this passes delta-time to the coroutine using Lua magic
    var done = c.next(dt).done;
    // remove any couroutines that have finished
    if(done)
      babysitter.coroutines.splice(i, 1);
    else
      i++;
  }
}
// ----------------------------------------------------------------------------
// OBJECT MANAGER
// ----------------------------------------------------------------------------

var objects = {
  updateList : [],
  drawList : []
}

objects.update = function(dt) {
  for(var i = 0; i < objects.updateList.length; i++) {
    objects.updateList[i].update(dt);
  }
}

objects.draw = function() {
  for(var i = 0; i < objects.drawList.length; i++) {
    objects.drawList[i].draw();
  }
}

objects.add = function(object) {
  if(object.draw)
    objects.drawList.push(object);
  if(object.update)
    objects.updateList.push(object);
}

objects.map = function(args) {
  if(args.orderBy)
    objects.updateList.sort(args.orderBy);

  var f = args.f;
  for(var i = 0; i < objects.updateList.length; i++) {
    f(objects.updateList[i], i);
  }
}

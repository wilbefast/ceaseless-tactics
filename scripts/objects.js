// ----------------------------------------------------------------------------
// OBJECT MANAGER
// ----------------------------------------------------------------------------

var objects = {
  updateList : [],
  drawList : []
}

objects.update = function(dt) {
  var i = 0;
  while(i < objects.updateList.length) {
    var object = objects.updateList[i];
    object.update(dt);
    if(object.purge) {
      objects.updateList.splice(i, 1);
      if(object.onPurge)
        object.onPurge();
    }
    else
      i++;
  }
}

objects.draw = function() {
  var i = 0;
  while(i < objects.drawList.length) {
    var object = objects.drawList[i];
    object.draw();
    if(object.purge)
      objects.drawList.splice(i, 1);
    else
      i++;
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

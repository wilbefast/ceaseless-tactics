
// ----------------------------------------------------------------------------
// USEFUL STUFF
// ----------------------------------------------------------------------------

var useful = {}

String.prototype.firstToUpper = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

Array.prototype.shuffle = function() {
  var currentIndex = this.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = this[currentIndex];
    this[currentIndex] = this[randomIndex];
    this[randomIndex] = temporaryValue;
  }
  return this;
}

useful.clamp = function(value, min, max)
{
  return Math.max(min, Math.min(value, max));
}

useful.lerp = function(a, b, amount)
{
  useful.clamp(amount, 0, 1)
  return ((1-amount)*a + amount*b);
}
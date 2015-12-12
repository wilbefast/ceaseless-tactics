// ----------------------------------------------------------------------------
// TEAM CLASS
// ----------------------------------------------------------------------------

function Team(args) {
  this.all.push(this);
  this.i = this.all.length - 1;

  this.name = args.name;
  this.images = args.images;

  return this;
}

Team.prototype.all = [];
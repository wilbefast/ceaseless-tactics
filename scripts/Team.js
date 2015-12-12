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

Team.red = new Team({
  name : "red",
  images : {
    pawn : document.getElementById("img_unit_red_pawn"),
    knight : document.getElementById("img_unit_red_knight")
  }
});

Team.blue = new Team({
  name : "blue",
  images : {
    pawn : document.getElementById("img_unit_blue_pawn"),
    knight : document.getElementById("img_unit_blue_knight")
  }
});
// ----------------------------------------------------------------------------
// TEAM CLASS
// ----------------------------------------------------------------------------

function Team(args) {
  this.all.push(this);
  this.i = this.all.length - 1;

  this.name = args.name;
  this.images = args.images;
  this.initialFacing = args.initialFacing;
  this.aiControlled = args.aiControlled;

  return this;
}

Team.prototype.all = [];

Team.red = new Team({
  name : "red",
  initialFacing : 1,
  images : {
    infantry : {
      head : document.getElementById("img_unit_red_infantry_head"),
      body : document.getElementById("img_unit_red_infantry_body"),
      weapon : document.getElementById("img_unit_red_infantry_weapon"),
      offhand : document.getElementById("img_unit_red_infantry_offhand")
    },
    cavalry : {
      head : document.getElementById("img_unit_red_cavalry_head"),
      body : document.getElementById("img_unit_red_cavalry_body"),
      weapon : document.getElementById("img_unit_red_cavalry_weapon"),
      offhand : document.getElementById("img_unit_red_cavalry_offhand")
    },
    archer : {
      head : document.getElementById("img_unit_red_archer_head"),
      body : document.getElementById("img_unit_red_archer_body"),
      weapon : document.getElementById("img_unit_red_archer_weapon"),
      offhand : document.getElementById("img_unit_red_archer_offhand")
    }
  }
});

Team.blue = new Team({
  name : "blue",
  aiControlled : true,
  initialFacing : -1,
  images : {
    infantry : {
      head : document.getElementById("img_unit_blue_infantry_head"),
      body : document.getElementById("img_unit_blue_infantry_body"),
      weapon : document.getElementById("img_unit_blue_infantry_weapon"),
      offhand : document.getElementById("img_unit_blue_infantry_offhand")
    },
    cavalry : {
      head : document.getElementById("img_unit_blue_cavalry_head"),
      body : document.getElementById("img_unit_blue_cavalry_body"),
      weapon : document.getElementById("img_unit_blue_cavalry_weapon"),
      offhand : document.getElementById("img_unit_blue_cavalry_offhand")
    },
    archer : {
      head : document.getElementById("img_unit_blue_archer_head"),
      body : document.getElementById("img_unit_blue_archer_body"),
      weapon : document.getElementById("img_unit_blue_archer_weapon"),
      offhand : document.getElementById("img_unit_blue_archer_offhand")
    }
  }
});
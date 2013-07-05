// paper dimensions
var height    = 600, 
    width     = 800;

// there is no line function in raphael o.o
Raphael.fn.line = function(sx, sy, ex, ey) {
  return this.path('M' + sx + ' ' + sy + ' L' + ex + ' ' + ey);
}

function Tree(paper,x,y,r,color) {
  this.paper = paper;
  this.x = x;
  this.y = y;
  this.r = r;
  this.color = color;
  this.tree = null;
}

Tree.prototype.setGraveyard = function(graveyard,isLeft) {
  this.graveyard = graveyard;
  this.isLeft = isLeft;
}

Tree.prototype.setTreasure = function(treasure) {
  this.treasure = treasure;
}

Tree.prototype.draw = function() {
  if (this.tree) {
    this.tree.attr('cx', this.x);
    this.tree.attr('cy', this.y);
  } else {
    this.tree = this.paper.circle(this.x,this.y,this.r);
    this.tree.attr('fill', this.color);
    this._setHandlers()
  }
  if (this.graveyard) {
    if (this.graveLine) {
      this.graveLine.remove();
      this.graveCircle.remove();
      this.treasureLine.remove();
    }
    this.graveLine = this.paper.line(this.x,this.y,this.graveyard.cx,this.graveyard.cy);
    this.graveLine.attr('stroke', '#0f0');
    // rotate graveyard 90 degrees clockwise or anticlockwise
    var dx = this.graveyard.cx - this.x,
        dy = this.graveyard.cy - this.y;

    if (this.isLeft) {
      // ccw
      // (x,y) => (-y,x) is  ccw 90 about origin
      rotx = -dy;
      roty = dx;
    } else {
      // (x,y) => (y,-x)
      rotx = dy;
      roty = -dx;
    }
    this.edgex = this.x+rotx;
    this.edgey = this.y+roty;
    this.treasureLine = this.paper.line(this.x,this.y,this.edgex,this.edgey);
    this.treasureLine.attr('stroke', '#fff');

    var dist = Math.sqrt(dx*dx + dy*dy);
    this.graveCircle = this.paper.circle(this.x, this.y, dist);
    this.graveCircle.attr('stroke','#aaa');
  }
  this.tree.toFront();

  if (this.treasure) this.treasure.draw();
}

Tree.prototype._setHandlers = function() {
  var self = this,
      startX = -1,
      startY = -1;
  this.tree.drag(function(dx,dy,x,y) {
    self.x = startX + dx;
    self.y = startY + dy;
    self.draw();
  },
  // start
  function(x,y) {
    startX = self.x;
    startY = self.y;
  });
}

function Graveyard(paper,cx,cy,d,color) {
  this.paper = paper;
  this.cx = cx;
  this.cy = cy;
  this.d = d;
  this.color = color;
  this.grave = null
}

Graveyard.prototype.setTrees = function(leftTree, rightTree) {
  this.lt = leftTree;
  this.lt.setGraveyard(this, true);
  this.rt = rightTree;
  this.rt.setGraveyard(this, false);
}

Graveyard.prototype.setTreasure = function(treasure) {
  this.treasure = treasure;
}

Graveyard.prototype.draw = function() {
  var x = this.cx - (this.d/2),
      y = this.cy - (this.d/2);
  console.log("x: " + x + ", y: " + y);
  if (this.grave) {
    this.grave.attr('x', x);
    this.grave.attr('y', y);
  } else {
    this.grave = this.paper.rect(x, y,this.d,this.d);
    this.grave.attr('fill',this.color);
    this._setHandlers();
  }
}

Graveyard.prototype._setHandlers = function() {
  var self = this,
      startX = -1,
      startY = -1;
  this.grave.drag(function(dx,dy,x,y) {
    console.log("Drag");
    self.cx = startX + dx;
    self.cy = startY + dy;
    console.log("cx: " + self.cx + "; cy: " + self.cy);
    self.draw();
    self.lt.draw();
    self.rt.draw();
    self.treasure.draw();
  },
  // start
  function(x, y) {
    console.log("Drag start");
    startX = self.cx;
    startY = self.cy;
  });
}

function Treasure(paper,color,r,tree1,tree2,grave) {
  this.paper = paper;
  this.color = color;
  this.r = r;
  this.t1 = tree1;
  this.t2 = tree2;
  this.grave = grave;
  this.grave.setTreasure(this);
  tree1.setTreasure(this);
  tree2.setTreasure(this);
}

Treasure.prototype.draw = function() {
  if (this.treasure) {
    this.treasure.attr('cx', (this.t1.edgex+this.t2.edgex)/2);
    this.treasure.attr('cy', (this.t1.edgey+this.t2.edgey)/2);
  } else {
    this.treasure = this.paper.circle((this.t1.edgex+this.t2.edgex)/2,(this.t1.edgey+this.t2.edgey)/2,this.r);
    this.treasure.attr('fill',this.color);
  }
}

$(function() {
  var docWidth  = $(document).width(),
      docHeight = $(document).height(),
      paper = Raphael((docWidth - width)/2,(docHeight-height)/2,width,height);

  var rect = paper.rect(0,0,width,height);
  rect.attr('fill', '#000');

  var grave = new Graveyard(paper, width/2, height/2, 20, '#ccc');
  grave.draw();

  var tree1 = new Tree(paper,width/5,height/2, 10,'#f00','#d00');
  var tree2 = new Tree(paper,width*4/5, height/2, 10,'#0ff', '#0dd');

  grave.setTrees(tree1,tree2);

  tree1.draw();
  tree2.draw();

  var treasure = new Treasure(paper, '#FAEC25', 10, tree1, tree2, grave);
  treasure.draw();

  grave.grave.toFront();
});

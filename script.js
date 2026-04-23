var Input = {
  keys: [],
  mouse: {
    left: false,
    right: false,
    middle: false,
    x: 0,
    y: 0
  }
};
for (var i = 0; i < 230; i++) {
  Input.keys.push(false);
}
document.addEventListener("keydown", function (event) {
  Input.keys[event.keyCode] = true;
});
document.addEventListener("keyup", function (event) {
  Input.keys[event.keyCode] = false;
});
document.addEventListener("mousedown", function (event) {
  if ((event.button = 0)) {
    Input.mouse.left = true;
  }
  if ((event.button = 1)) {
    Input.mouse.middle = true;
  }
  if ((event.button = 2)) {
    Input.mouse.right = true;
  }
});
document.addEventListener("mouseup", function (event) {
  if ((event.button = 0)) {
    Input.mouse.left = false;
  }
  if ((event.button = 1)) {
    Input.mouse.middle = false;
  }
  if ((event.button = 2)) {
    Input.mouse.right = false;
  }
});
document.addEventListener("mousemove", function (event) {
  Input.mouse.x = event.clientX;
  Input.mouse.y = event.clientY;
});
//Sets up canvas
var canvas = document.createElement("canvas");
document.body.appendChild(canvas);
canvas.width = Math.max(window.innerWidth, window.innerWidth);

//canvas.height = Math.max(window.innerWidth, window.innerWidth);

canvas.height = window.innerHeight;
canvas.style.position = "absolute";
canvas.style.left = "0px";
canvas.style.top = "0px";
document.body.style.overflow = "hidden";
var ctx = canvas.getContext("2d");
//Necessary classes
var segmentCount = 0;
class Segment {
  constructor(parent, size, angle, range, stiffness) {
    segmentCount++;
    this.isSegment = true;
    this.parent = parent; //Segment which this one is connected to
    if (typeof parent.children == "object") {
      parent.children.push(this);
    }
    this.children = []; //Segments connected to this segment
    this.size = size; //Distance from parent
    this.relAngle = angle; //Angle relative to parent
    this.defAngle = angle; //Default angle relative to parent
    this.absAngle = parent.absAngle + angle; //Angle relative to x-axis
    this.range = range; //Difference between maximum and minimum angles
    this.stiffness = stiffness; //How closely it conforms to default angle
    this.type = 'body'; // Default type
    this.updateRelative(false, true);
  }
  setType(type) {
    this.type = type;
    return this;
  }
  updateRelative(iter, flex) {
    this.relAngle =
      this.relAngle -
      2 *
      Math.PI *
      Math.floor((this.relAngle - this.defAngle) / 2 / Math.PI + 1 / 2);
    if (flex) {
      //		this.relAngle=this.range/
      //				(1+Math.exp(-4*(this.relAngle-this.defAngle)/
      //				(this.stiffness*this.range)))
      //			  -this.range/2+this.defAngle;
      this.relAngle = Math.min(
        this.defAngle + this.range / 2,
        Math.max(
          this.defAngle - this.range / 2,
          (this.relAngle - this.defAngle) / this.stiffness + this.defAngle
        )
      );
    }
    this.absAngle = this.parent.absAngle + this.relAngle;
    this.x = this.parent.x + Math.cos(this.absAngle) * this.size; //Position
    this.y = this.parent.y + Math.sin(this.absAngle) * this.size; //Position
    if (iter) {
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].updateRelative(iter, flex);
      }
    }
  }
  draw(iter, depth = 0) {
    let mode = window.currentCreatureType || 'random_lizard';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (mode === 'snake') {
      ctx.strokeStyle = `hsl(140, 50%, ${Math.max(20, 60 - depth * 0.3)}%)`;
      ctx.lineWidth = Math.max(3, 22 - depth * 0.25);
    } else if (mode === 'centipede') {
      if (this.type === 'leg') {
        ctx.strokeStyle = '#E67E22';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = depth % 2 === 0 ? '#873600' : '#D35400';
        ctx.lineWidth = Math.max(8, 16 - depth * 0.1);
      }
    } else if (mode === 'spider') {
      ctx.strokeStyle = depth < 3 ? '#111' : '#222';
      ctx.lineWidth = Math.max(2, 10 - depth * 0.5);
    } else if (mode === 'tentacle') {
      ctx.strokeStyle = `hsl(280, 80%, ${Math.max(20, 50 - depth * 1.2)}%)`;
      ctx.lineWidth = Math.max(2, 25 - depth * 1.5);
    } else if (mode === 'random_lizard') {
      if (this.type === 'leg') {
        ctx.strokeStyle = '#2ecc71';
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = depth % 2 === 0 ? '#1E8449' : '#27AE60';
        ctx.lineWidth = Math.max(6, 18 - depth * 0.5);
      }
    } else {
      ctx.strokeStyle = 'white';
      ctx.lineWidth = Math.max(1, 10 - depth * 0.2);
    }

    ctx.beginPath();
    ctx.moveTo(this.parent.x, this.parent.y);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();

    // Add some volume/meat to the body
    if (this.type === 'spine' || this.type === 'body') {
        if (depth % 2 === 0) {
            ctx.fillStyle = ctx.strokeStyle;
            ctx.beginPath();
            ctx.arc(this.x, this.y, ctx.lineWidth / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    if (iter) {
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].draw(true, depth + 1);
      }
    }
  }
  follow(iter) {
    var x = this.parent.x;
    var y = this.parent.y;
    var dist = ((this.x - x) ** 2 + (this.y - y) ** 2) ** 0.5;
    this.x = x + this.size * (this.x - x) / dist;
    this.y = y + this.size * (this.y - y) / dist;
    this.absAngle = Math.atan2(this.y - y, this.x - x);
    this.relAngle = this.absAngle - this.parent.absAngle;
    this.updateRelative(false, true);
    //this.draw();
    if (iter) {
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].follow(true);
      }
    }
  }
}
class LimbSystem {
  constructor(end, length, speed, creature) {
    this.end = end;
    this.length = Math.max(1, length);
    this.creature = creature;
    this.speed = speed;
    creature.systems.push(this);
    this.nodes = [];
    var node = end;
    for (var i = 0; i < length; i++) {
      this.nodes.unshift(node);
      //node.stiffness=1;
      node = node.parent;
      if (!node.isSegment) {
        this.length = i + 1;
        break;
      }
    }
    this.hip = this.nodes[0].parent;
  }
  moveTo(x, y) {
    this.nodes[0].updateRelative(true, true);
    var dist = ((x - this.end.x) ** 2 + (y - this.end.y) ** 2) ** 0.5;
    var len = Math.max(0, dist - this.speed);
    for (var i = this.nodes.length - 1; i >= 0; i--) {
      var node = this.nodes[i];
      var ang = Math.atan2(node.y - y, node.x - x);
      node.x = x + len * Math.cos(ang);
      node.y = y + len * Math.sin(ang);
      x = node.x;
      y = node.y;
      len = node.size;
    }
    for (var i = 0; i < this.nodes.length; i++) {
      var node = this.nodes[i];
      node.absAngle = Math.atan2(
        node.y - node.parent.y,
        node.x - node.parent.x
      );
      node.relAngle = node.absAngle - node.parent.absAngle;
      for (var ii = 0; ii < node.children.length; ii++) {
        var childNode = node.children[ii];
        if (!this.nodes.includes(childNode)) {
          childNode.updateRelative(true, false);
        }
      }
    }
    //this.nodes[0].updateRelative(true,false)
  }
  update() {
    this.moveTo(Input.mouse.x, Input.mouse.y);
  }
}
class LegSystem extends LimbSystem {
  constructor(end, length, speed, creature) {
    super(end, length, speed, creature);
    this.goalX = end.x;
    this.goalY = end.y;
    this.step = 0; //0 stand still, 1 move forward,2 move towards foothold
    this.forwardness = 0;

    //For foot goal placement
    this.reach =
      0.9 *
      ((this.end.x - this.hip.x) ** 2 + (this.end.y - this.hip.y) ** 2) ** 0.5;
    var relAngle =
      this.creature.absAngle -
      Math.atan2(this.end.y - this.hip.y, this.end.x - this.hip.x);
    relAngle -= 2 * Math.PI * Math.floor(relAngle / 2 / Math.PI + 1 / 2);
    this.swing = -relAngle + (2 * (relAngle < 0) - 1) * Math.PI / 2;
    this.swingOffset = this.creature.absAngle - this.hip.absAngle;
    //this.swing*=(2*(relAngle>0)-1);
  }
  update(x, y) {
    this.moveTo(this.goalX, this.goalY);
    //this.nodes[0].follow(true,true)
    if (this.step == 0) {
      var dist =
        ((this.end.x - this.goalX) ** 2 + (this.end.y - this.goalY) ** 2) **
        0.5;
      if (dist > 1) {
        this.step = 1;
        //this.goalX=x;
        //this.goalY=y;
        this.goalX =
          this.hip.x +
          this.reach *
          Math.cos(this.swing + this.hip.absAngle + this.swingOffset) +
          (2 * Math.random() - 1) * this.reach / 2;
        this.goalY =
          this.hip.y +
          this.reach *
          Math.sin(this.swing + this.hip.absAngle + this.swingOffset) +
          (2 * Math.random() - 1) * this.reach / 2;
      }
    } else if (this.step == 1) {
      var theta =
        Math.atan2(this.end.y - this.hip.y, this.end.x - this.hip.x) -
        this.hip.absAngle;
      var dist =
        ((this.end.x - this.hip.x) ** 2 + (this.end.y - this.hip.y) ** 2) **
        0.5;
      var forwardness2 = dist * Math.cos(theta);
      var dF = this.forwardness - forwardness2;
      this.forwardness = forwardness2;
      if (dF * dF < 1) {
        this.step = 0;
        this.goalX = this.hip.x + (this.end.x - this.hip.x);
        this.goalY = this.hip.y + (this.end.y - this.hip.y);
      }
    }
    //	ctx.strokeStyle='blue';
    //	ctx.beginPath();
    //	ctx.moveTo(this.end.x,this.end.y);
    //	ctx.lineTo(this.hip.x+this.reach*Math.cos(this.swing+this.hip.absAngle+this.swingOffset),
    //				this.hip.y+this.reach*Math.sin(this.swing+this.hip.absAngle+this.swingOffset));
    //	ctx.stroke();
    //	ctx.strokeStyle='black';
  }
}
class Creature {
  constructor(
    x,
    y,
    angle,
    fAccel,
    fFric,
    fRes,
    fThresh,
    rAccel,
    rFric,
    rRes,
    rThresh
  ) {
    this.x = x; //Starting position
    this.y = y;
    this.absAngle = angle; //Staring angle
    this.fSpeed = 0; //Forward speed
    this.fAccel = fAccel; //Force when moving forward
    this.fFric = fFric; //Friction against forward motion
    this.fRes = fRes; //Resistance to motion
    this.fThresh = fThresh; //minimum distance to target to keep moving forward
    this.rSpeed = 0; //Rotational speed
    this.rAccel = rAccel; //Force when rotating
    this.rFric = rFric; //Friction against rotation
    this.rRes = rRes; //Resistance to rotation
    this.rThresh = rThresh; //Maximum angle difference before rotation
    this.children = [];
    this.systems = [];
  }
  follow(x, y) {
    var dist = ((this.x - x) ** 2 + (this.y - y) ** 2) ** 0.5;
    var angle = Math.atan2(y - this.y, x - this.x);
    //Update forward
    var accel = this.fAccel;
    if (this.systems.length > 0) {
      var sum = 0;
      for (var i = 0; i < this.systems.length; i++) {
        sum += this.systems[i].step == 0;
      }
      accel *= sum / this.systems.length;
    }
    this.fSpeed += accel * (dist > this.fThresh);
    this.fSpeed *= 1 - this.fRes;
    this.speed = Math.max(0, this.fSpeed - this.fFric);
    //Update rotation
    var dif = this.absAngle - angle;
    dif -= 2 * Math.PI * Math.floor(dif / (2 * Math.PI) + 1 / 2);
    if (Math.abs(dif) > this.rThresh && dist > this.fThresh) {
      this.rSpeed -= this.rAccel * (2 * (dif > 0) - 1);
    }
    this.rSpeed *= 1 - this.rRes;
    if (Math.abs(this.rSpeed) > this.rFric) {
      this.rSpeed -= this.rFric * (2 * (this.rSpeed > 0) - 1);
    } else {
      this.rSpeed = 0;
    }

    //Update position
    this.absAngle += this.rSpeed;
    this.absAngle -=
      2 * Math.PI * Math.floor(this.absAngle / (2 * Math.PI) + 1 / 2);
    this.x += this.speed * Math.cos(this.absAngle);
    this.y += this.speed * Math.sin(this.absAngle);
    this.absAngle += Math.PI;
    for (var i = 0; i < this.children.length; i++) {
      this.children[i].follow(true, true);
    }
    for (var i = 0; i < this.systems.length; i++) {
      this.systems[i].update(x, y);
    }
    this.absAngle -= Math.PI;
    this.draw(true);
  }
  draw(iter) {
    let mode = window.currentCreatureType || 'random_lizard';
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.fillStyle = 'transparent';

    if (mode === 'snake') {
      ctx.strokeStyle = '#4CAF50';
      ctx.fillStyle = '#1B5E20';
    } else if (mode === 'centipede') {
      ctx.strokeStyle = '#d35400';
      ctx.fillStyle = '#5D2300';
    } else if (mode === 'spider') {
      ctx.strokeStyle = '#000';
      ctx.fillStyle = '#111';
    } else if (mode === 'tentacle') {
      ctx.strokeStyle = 'hsl(280, 80%, 40%)';
      ctx.fillStyle = 'hsl(280, 80%, 30%)';
    } else if (mode === 'random_lizard') {
      ctx.strokeStyle = '#1E8449';
      ctx.fillStyle = '#27AE60';
    }

    var r = 7;
    if (mode === 'spider') r = 18;
    else if (mode === 'tentacle') r = 20;
    else if (mode === 'snake') r = 16;
    else if (mode === 'centipede') r = 14;
    else if (mode === 'random_lizard') r = 14;

    // Head shape
    ctx.beginPath();
    if (mode === 'snake') {
      // Diamond/Triangular snake head
      let headLen = r * 1.5;
      let ang = this.absAngle;
      ctx.moveTo(this.x + Math.cos(ang) * headLen, this.y + Math.sin(ang) * headLen);
      ctx.lineTo(this.x + Math.cos(ang + 2) * r, this.y + Math.sin(ang + 2) * r);
      ctx.lineTo(this.x + Math.cos(ang - 2) * r, this.y + Math.sin(ang - 2) * r);
      ctx.closePath();
    } else if (mode === 'spider') {
      // Two-part spider body (head part)
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    } else if (mode === 'random_lizard') {
      // Elongated lizard head
      let ang = this.absAngle;
      ctx.ellipse(this.x, this.y, r * 1.2, r * 0.8, ang, 0, Math.PI * 2);
    } else {
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
    }

    if (ctx.fillStyle !== 'transparent') ctx.fill();
    ctx.stroke();

    // Eyes and Details
    if (mode === 'snake' || mode === 'random_lizard' || mode === 'spider' || mode === 'centipede') {
      let eyeColor = 'white';
      let pupilColor = 'black';
      if (mode === 'spider') {
          eyeColor = '#ff3333';
          pupilColor = 'white';
      }

      var eyeDist = 0.5;
      var eyeSize = 3;
      var headOffset = r * 0.5;

      if (mode === 'snake') {
          eyeDist = 0.8;
          eyeSize = 2.5;
          headOffset = r * 0.6;
          eyeColor = '#FFD700'; // Yellow snake eyes
      }

      // Draw eyes
      const drawEye = (angleOffset, size, dist) => {
          let ex = this.x + Math.cos(this.absAngle + angleOffset) * dist;
          let ey = this.y + Math.sin(this.absAngle + angleOffset) * dist;
          ctx.fillStyle = eyeColor;
          ctx.beginPath();
          ctx.arc(ex, ey, size, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = pupilColor;
          ctx.beginPath();
          ctx.arc(ex + Math.cos(this.absAngle) * size * 0.4, ey + Math.sin(this.absAngle) * size * 0.4, size * 0.5, 0, Math.PI * 2);
          ctx.fill();
      };

      if (mode === 'spider') {
          // 8 eyes for spider
          for(let i=-2; i<=2; i++) {
              if (i===0) continue;
              drawEye(i*0.3, 2, r * 0.7);
              drawEye(i*0.6, 1.5, r * 0.5);
          }
      } else {
          drawEye(-eyeDist, eyeSize, headOffset);
          drawEye(eyeDist, eyeSize, headOffset);
      }

      // Snake tongue
      if (mode === 'snake' && Math.random() > 0.8) {
        ctx.strokeStyle = '#ff4d4d';
        ctx.lineWidth = 2;
        let tx = this.x + Math.cos(this.absAngle) * (r * 1.5);
        let ty = this.y + Math.sin(this.absAngle) * (r * 1.5);
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        let flick = Math.sin(Date.now() * 0.1) * 5;
        ctx.lineTo(tx + Math.cos(this.absAngle) * 12, ty + Math.sin(this.absAngle) * 12 + flick);
        ctx.stroke();
      }
    }

    if (iter) {
      for (var i = 0; i < this.children.length; i++) {
        this.children[i].draw(true, 1);
      }
    }
  }
}
//Initializes and animates
var critter;
var currentInterval = null;

function startAnimation(updateFn) {
  if (currentInterval) clearInterval(currentInterval);
  currentInterval = setInterval(updateFn, 33);
}

function setupSimple() {
  //(x,y,angle,fAccel,fFric,fRes,fThresh,rAccel,rFric,rRes,rThresh)
  critter = new Creature(
    window.innerWidth / 2,
    window.innerHeight / 2,
    0,
    12,
    1,
    0.5,
    16,
    0.5,
    0.085,
    0.5,
    0.3
  );
  var node = critter;
  //(parent,size,angle,range,stiffness)
  for (var i = 0; i < 128; i++) {
    var node = new Segment(node, 8, 0, 3.14159 / 2, 1);
  }
  startAnimation(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    critter.follow(Input.mouse.x, Input.mouse.y);
  });
}
function setupTentacle() {
  //(x,y,angle,fAccel,fFric,fRes,fThresh,rAccel,rFric,rRes,rThresh)
  critter = new Creature(
    window.innerWidth / 2,
    window.innerHeight / 2,
    0,
    12,
    1,
    0.5,
    16,
    0.5,
    0.085,
    0.5,
    0.3
  );
  var node = critter;
  //(parent,size,angle,range,stiffness)
  for (var i = 0; i < 20; i++) {
    var node = new Segment(node, 8, 0, 2, 1).setType('tentacle');
  }
  //(end,length,speed,creature)
  var tentacle = new LimbSystem(node, 20, 12, critter);
  startAnimation(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    critter.follow(canvas.width / 2, canvas.height / 2);
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.arc(Input.mouse.x, Input.mouse.y, 4, 0, 6.283);
    ctx.fill();
  });
}
function setupArm() {
  //(x,y,angle,fAccel,fFric,fRes,fThresh,rAccel,rFric,rRes,rThresh)
  var critter = new Creature(
    window.innerWidth / 2,
    window.innerHeight / 2,
    0,
    12,
    1,
    0.5,
    16,
    0.5,
    0.085,
    0.5,
    0.3
  );
  var node = critter;
  //(parent,size,angle,range,stiffness)
  for (var i = 0; i < 3; i++) {
    var node = new Segment(node, 80, 0, 3.1416, 1);
  }
  var tentacle = new LimbSystem(node, 3, 20, critter);
  startAnimation(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    critter.follow(canvas.width / 2, canvas.height / 2);
    ctx.beginPath();
    ctx.arc(Input.mouse.x, Input.mouse.y, 2, 0, 6.283);
    ctx.fill();
  });
}

function setupTestSquid(size, legs) {
  //(x,y,angle,fAccel,fFric,fRes,fThresh,rAccel,rFric,rRes,rThresh)
  critter = new Creature(
    window.innerWidth / 2,
    window.innerHeight / 2,
    0,
    size * 10,
    size * 3,
    0.5,
    16,
    0.5,
    0.085,
    0.5,
    0.3
  );
  var legNum = legs;
  var jointNum = 12;
  for (var i = 0; i < legNum; i++) {
    var node = critter;
    var ang = Math.PI / 2 * (i / (legNum - 1) - 0.5);
    for (var ii = 0; ii < jointNum; ii++) {
      var node = new Segment(
        node,
        size * 40 / jointNum,
        ang * (ii == 0),
        3.1416,
        1.2
      ).setType('leg');
    }
    //(end,length,speed,creature,dist)
    var leg = new LegSystem(node, jointNum, size * 30, critter);
  }
  startAnimation(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    critter.follow(Input.mouse.x, Input.mouse.y);
  });
}
function setupLizard(size, legs, tail) {
  var s = size;
  //(x,y,angle,fAccel,fFric,fRes,fThresh,rAccel,rFric,rRes,rThresh)
  critter = new Creature(
    window.innerWidth / 2,
    window.innerHeight / 2,
    0,
    s * 10,
    s * 2,
    0.5,
    16,
    0.5,
    0.085,
    0.5,
    0.3
  );
  var spinal = critter;
  //(parent,size,angle,range,stiffness)
  //Neck
  for (var i = 0; i < 4; i++) {
    spinal = new Segment(spinal, s * 6, 0, 1.1, 1).setType('spine');
  }
  //Torso and legs
  for (var i = 0; i < legs; i++) {
    //Vertebrae between legs
    for (var ii = 0; ii < 4; ii++) {
      spinal = new Segment(spinal, s * 6, 0, 1.1, 1).setType('spine');
    }
    //Legs
    for (var ii = -1; ii <= 1; ii += 2) {
      var node = new Segment(spinal, s * 8, ii * 1.2, 0.1, 4).setType('leg'); // Hip
      node = new Segment(node, s * 10, -ii * 1.2, 0.5, 2).setType('leg'); // Knee
      node = new Segment(node, s * 8, ii * 1.2, 0.5, 2).setType('leg'); // Ankle
      new LegSystem(node, 3, s * 12, critter);
    }
  }
  //Tail
  for (var i = 0; i < tail; i++) {
    spinal = new Segment(spinal, s * 6, 0, 1.1, 1).setType('spine');
  }
  startAnimation(function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    critter.follow(Input.mouse.x, Input.mouse.y);
  });
}

canvas.style.backgroundColor = "black";
ctx.strokeStyle = "white";

// Provide a global UI interface function
window.setMode = function (mode) {
  window.currentCreatureType = mode;
  if (mode === 'random_lizard') {
    var legNum = Math.floor(2 + Math.random() * 2); // 2 or 3 pairs
    setupLizard(
      1.2,
      legNum,
      12
    );
  } else if (mode === 'snake') {
    setupLizard(1.4, 0, 40); // 0 legs, long tail
  } else if (mode === 'centipede') {
    setupLizard(0.8, 12, 4); // moderate legs, short tail
  } else if (mode === 'spider') {
    setupTestSquid(2.5, 8); // 8 legs 
  } else if (mode === 'tentacle') {
    setupTentacle();
  } else if (mode === 'simple') {
    setupSimple();
  }
};

// Start with random lizard as default
window.setMode('random_lizard');

// Adjust canvas size on resize
window.addEventListener("resize", function () {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx.strokeStyle = "white"; // Re-assert the stroke color
});

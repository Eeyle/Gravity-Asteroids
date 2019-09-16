var balls;
const ballSize = 1;

var bullets;
var bulletTime = 0;

const G = 2;

var player;
var firstTime;
var startTime;
var time;
var date;

function setup() {
  createCanvas(500, 500);
  
  balls = [];
  bullets = [];
  
  for(let i = 0; i < 4; i++) {
    balls.push(new Particle(random(ballSize, width-ballSize), 
                            random(ballSize,height-ballSize), 
                            random(-0.1, 0.1), 
                            random(-0.1, 0.1), 16));
  }
  for(let i = 0; i < 3; i++) {
    balls.push(new Particle(random(ballSize, width-ballSize), 
                            random(ballSize,height-ballSize), 
                            random(0), 
                            random(0), 64));
  }
  for(let i = 0; i < balls.length; i++) {
    for(let j = 0; j < balls.length; j++) {
      if (i != j) {
        while(balls[i].collidesWith(balls[j])) {
          balls[i] = new Particle(random(ballSize, width-ballSize), 
                            random(ballSize,height-ballSize), 
                            random(1), 
                            random(1), balls[i].mass);
        }
      }
    }
  }
  
  player = new Player(width/2, height/2, 0, 0, 0, 1);
  
  stroke(255);
  textAlign(LEFT, TOP);
  textSize(32);
  fill(255);
  
  date = new Date();
  firstTime = date.getTime();
  startTime = date.getTime();
}

function draw() {
  background(0);
  
  date = new Date();
    
  let totalKineticEnergy = 0;
  let totalPotentialEnergy = 0;
  
  for(let i = 0; i < balls.length; i++) {
    for(let j = 0; j < balls.length; j++) { if (i != j) {
      balls[i].checkCollision(balls[j]);
      balls[i].gravity(balls[j]);
    }}
    balls[i].update();
    balls[i].draw();
  }
  
  player.checkCollision(balls);
  player.update();
  player.draw();
  
  for (let i = 0; i < bullets.length; i++) {
    bullets[i].update();
    bullets[i].draw();
    if (bullets[i].checkOutOfBounds()) {
      bullets.splice(i, 1);
      i -= 1;
      continue;
    }
    
    for (let j = 0; j < balls.length; j++) {
      if (bullets[i].checkCollision(balls[j])) { // it hit
        player.killCount += 1;
        
        bullets.splice(i, 1); // delete the bullet
        //i -= 1;
        
        /*if (balls[j].mass < 5) {
          balls.splice(j, 1); // delete one
          ballsToAdd += 1; // add an extra one
          j -= 1;
        } else {
          balls.splice(j, 1, new Particle(
            random() > 0.5 ? ballSize + 10 : width-ballSize-10, 
            random() > 0.5 ? ballSize + 10 : height-ballSize-10, 
            random(-0.2, 0.2), 
            random(-0.2, 0.2), balls[j].mass)); //replace one
          ballsToAdd += 2; // add an extra two
        }*/
        
        // all balls break into two half-size balls on death
        if (balls[j].mass >= 4) {
          for (let k = 0; k < 2; k++) {
            balls.push(new Particle(
              balls[j].pos.x, balls[j].pos.y,
              (random()>5? 1 : -1 )*random(0.5, 2), 
              (random()>5? 1 : -1 )*random(0.5, 2), 
              balls[j].mass/2))
          }
        }
        balls.splice(j, 1);
        
        break;
      }
    }
  }
  
  strokeWeight(2);
  text(player.deathCount.toString() + " death" + (player.deathCount === 1 ? "" : "s"), 0, 0);
  text(player.killCount.toString() + " kill" + (player.killCount === 1 ? "" : "s"), 196, 0);
  time = date.getTime(); 
  text(((time-firstTime)/1000).toString().substr(0,4) + " s", 0, 32);
  text(((time-startTime)/1000).toString().substr(0,4) + " s total", 196, 32);
  
  if (keyIsDown(87)) { // w
    player.accAmt = keyIsDown(16) /*shift*/ ? 0.15 : 0.05;
  } 
  else {
    if (player.accAmt <= 0.01) {
      player.accAmt = 0;
    } else {
      player.accAmt = 0.95*player.accAmt;
    }
  }
  
  if (keyIsDown(65)) { // s
    player.ori.rotate(-0.06);
  } 
  if (keyIsDown(68)) { // d
    player.ori.rotate(0.06);
  }
  
  if (keyIsDown(32)) { // spacebar
    if (bulletTime < 1) {
      bullets.push(new Bullet(player.pos.x, player.pos.y, -3*player.ori.x, -3*player.ori.y));
      bulletTime = 30;
    } 
  }
  bulletTime -= 1;
}

function keyPressed() {
  //console.log(keyCode);
  /*if (keyCode === 32) { // spacebar
    player.accAmt += 0.06;
    player.accelerate();
  }*/
}

class Particle {
  constructor(x, y, vx, vy, m) {
    this.pos = createVector(x, y);
    this.vel = createVector(vx, vy);
    this.acc = createVector(0, 0);
    this.mass = m;
    this.contact = false;
  }
  
  update() {
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.acc.mult(0);
    
    this.vel.limit(5);
  }
  
  draw() {
    strokeWeight(this.mass * ballSize * 2);
    stroke(255, 255, 255, 200);
    point(this.pos.x, this.pos.y);
  }
  
  checkCollision(ball) {
    if(this.pos.x < -ballSize*this.mass) {
      this.pos = createVector(width + ballSize*this.mass, this.pos.y);
      //this.vel = createVector(-this.vel.x, this.vel.y);
    }
    else if (this.pos.x > width + ballSize*this.mass) {
      this.pos = createVector(-ballSize*this.mass, this.pos.y);
      //this.vel = createVector(-this.vel.x, this.vel.y);
    }
    if(this.pos.y < -ballSize*this.mass) {
      this.pos = createVector(this.pos.x, height + ballSize*this.mass);
      //this.vel = createVector(this.vel.x, -this.vel.y);
    }
    else if (this.pos.y > height + ballSize*this.mass) {
      this.pos = createVector(this.pos.x, -ballSize*this.mass);
      //this.vel = createVector(this.vel.x, -this.vel.y);
    }
    
    /*if(this.collidesWith(ball)) {
      if(!this.contact) {
        this.vel.mult(-1);
        this.pos.add(this.vel);
      }
      this.contact = true;
    } 
    else {
      this.contact = false;
    }*/
  }
  collidesWith(ball) {
    let diff = p5.Vector.sub(this.pos, ball.pos);
    if (diff.mag() < ballSize*2) { return true; }
  }
  
  gravity(ball) {
    let diff = p5.Vector.sub(ball.pos, this.pos);
    if (diff.magSq() && this.mass) {
      diff.mult(ball.mass / diff.magSq() / this.mass);
    }
    this.acc.add(diff);
  }
  
  kineticEnergy() {
    return 1/2*this.mass*this.vel.magSq();
  }
  
  potentialEnergy(ball) {
    return -G*this.mass*ball.mass / (p5.Vector.sub(ball.pos,this.pos).mag());
  }
}

class Player {
  constructor(x, y, vx, vy, ox, oy) {
    this.pos = createVector(x, y);
    this.vel = createVector(vx, vy);
    this.ori = createVector(ox, oy).setMag(1);
    this.acc = createVector(0, 0);
    this.accAmt = 0;
    this.deathCount = 0;
    this.killCount = 0;
    this.encircle = 0;
  }
  
  update() {
    this.accelerate();
    this.pos.add(this.vel);
    this.vel.add(this.acc);
    this.ori.setMag(1);
    this.acc.mult(0);
    
    if (this.encircle <= 0) {
      this.encircle = 0;
    } else {
      this.encircle -= 1;
    }
  }
  
  checkCollision(balls) {
    if(this.pos.x < 0) {
      this.pos = createVector(width, this.pos.y);
      //this.vel = createVector(-this.vel.x, this.vel.y);
    }
    else if (this.pos.x > width) {
      this.pos = createVector(0, this.pos.y);
      //this.vel = createVector(-this.vel.x, this.vel.y);
    }
    if(this.pos.y < 0) {
      this.pos = createVector(this.pos.x, height);
      //this.vel = createVector(this.vel.x, -this.vel.y);
    }
    else if (this.pos.y > height) {
      this.pos = createVector(this.pos.x, 0);
      //this.vel = createVector(this.vel.x, -this.vel.y);
    }
    
    for(let i = 0; i < balls.length; i++) {
      if (this.collidesWith(balls[i])) {
        this.deathCount += 1;
        this.encircle = 50;
        //time = 0;
        firstTime = date.getTime(); 
      
        
        let tooClose = true;
        while (tooClose) {
          this.pos = createVector(random(width/8, width*7/8), random(height/8, height*7/8));
          
          tooClose = false;
          for (let j = 0; j < balls.length; j++) {
            if (p5.Vector.sub(this.pos, balls[j].pos).mag() < 
                ballSize*balls[j].mass*2) {
              tooClose = true; 
            }
          }
        }
        
        this.vel = createVector(0, 0);
        this.acc = createVector(0, 0);
        this.accAmt = 0;
      }
    }
  }
  collidesWith(ball) {
    return (p5.Vector.sub(this.pos, ball.pos).mag() < ballSize*ball.mass);
  }
  
  draw() {
    strokeWeight(4);
    stroke(255);
    noFill();
    
    beginShape();
    let v = p5.Vector.add(this.pos, p5.Vector.mult(this.ori, -5));
    vertex(v.x, v.y);
    vertex(this.pos.x, this.pos.y); // center
    endShape();
    
    stroke(255, 0, 0);
    beginShape();
    let v2 = p5.Vector.add(this.pos, p5.Vector.mult(this.ori, 200*this.accAmt));
    vertex(v2.x, v2.y);
    vertex(this.pos.x, this.pos.y);
    endShape();
    
    if (this.encircle > 0) {
      strokeWeight(2);
      circle(this.pos.x, this.pos.y, this.encircle);
    }
  }
  
  accelerate() {
    this.vel.add(p5.Vector.mult(this.ori, -this.accAmt));
  }
}


class Bullet {
  constructor(x, y, vx, vy) {
    this.pos = createVector(x, y); 
    this.vel = createVector(vx, vy);
  }
  
  update() {
    this.pos.add(this.vel);
  }
  
  checkCollision(ball) {
    return (p5.Vector.sub(this.pos, ball.pos).mag() < ballSize*ball.mass);
  }
  
  checkOutOfBounds() {
    return (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height);
  }
  
  draw() {
    strokeWeight(4);
    stroke(255, 0, 0);
    point(this.pos.x, this.pos.y);
  }
}







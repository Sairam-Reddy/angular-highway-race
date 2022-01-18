import { Car } from './car.model';
import { TractorTrailer } from './tractor-trailer.model';
import { Truck } from './truck.model';

export class Vehicle {
  public color;
  public x;
  public z;
  public width;
  public height;
  public depth;
  public speed;
  public acceleration;
  public model;
  public name;
  public maxSpeed;
  public isSteering;
  public steerAngle;
  public maxSteerAngle;
  public steerSpeed;
  public steerDir;
  public xLimit;
  public crashed;
  public deceleration;

  constructor(args, scene) {
    this.color = args.color || this.randomInt(0x171717, 0xcccccc);
    this.x = args.x || 0;
    this.z = args.z || 0;
    this.width = 1;
    this.height = 1;
    this.depth = 1;
    this.speed = args.speed || 1;
    this.acceleration = args.acceleration || 0;
    this.model = null;
    this.name = args.name || '';

    this.maxSpeed = 4;
    this.isSteering = false;
    this.steerAngle = 0;
    this.maxSteerAngle = 30;
    this.steerSpeed = 0.15;
    this.steerDir = '';
    this.xLimit = 20;
    this.crashed = false;
    this.deceleration = 0.01;

    // 0: car, 1: truck, 2: tractor trailer
    let modelID = args.modelID;

    if (modelID === undefined) modelID = Math.round(Math.random() * 2);

    // dimensions refer to hitbox
    switch (modelID) {
      case 1:
        this.width = 5;
        this.height = 5;
        this.depth = 10;
        this.model = new Truck(this.color, this.x, this.z, this.name, scene);
        break;
      case 2:
        this.width = 5;
        this.height = 8;
        this.depth = 18;
        this.model = new TractorTrailer(
          this.color,
          this.x,
          this.z,
          this.name,
          scene
        );
        break;
      default:
        this.width = 5;
        this.height = 4;
        this.depth = 10;
        this.model = new Car(this.color, this.x, this.z, this.name, scene);
        break;
    }
  }

  accelerate() {
    if (this.speed < this.maxSpeed) {
      this.speed += this.acceleration;
      this.speed = +this.speed.toFixed(3);
    }
  }

  decelerate() {
    if (this.speed > 0) {
      this.speed -= this.deceleration;
      this.speed = +this.speed.toFixed(3);

      if (this.speed < 0) this.speed = 0;
    }
  }

  move(game) {
    let mesh = this.model.mesh;

    // normal forward direction
    this.z -= this.speed;
    mesh.position.z = this.z;

    // handle steering
    if (this.isSteering && !this.crashed) {
      if (this.steerDir == 'left') {
        this.x -= this.steerSpeed;

        if (this.steerAngle < this.maxSteerAngle) ++this.steerAngle;
      } else if (this.steerDir == 'right') {
        this.x += this.steerSpeed;

        if (this.steerAngle > -this.maxSteerAngle) --this.steerAngle;
      }

      // undo steering
    } else if (!this.crashed) {
      if (this.steerAngle > 0) {
        --this.steerAngle;
        this.x -= this.steerSpeed;
      } else if (this.steerAngle < 0) {
        ++this.steerAngle;
        this.x += this.steerSpeed;
      }
    }

    // auto crash if out of bounds
    if (this.x < -this.xLimit || this.x > this.xLimit) {
      this.crashed = true;
      game.over = true;
    }

    mesh.position.x = this.x;
    mesh.rotation.y = (this.steerAngle * Math.PI) / 180;

    if (!this.crashed) {
      mesh.getObjectByName('FL').rotation.y = mesh.rotation.y;
      mesh.getObjectByName('FR').rotation.y = mesh.rotation.y;
    }
  }

  steer(dir) {
    this.isSteering = true;
    this.steerDir = dir;
  }

  straighten() {
    this.isSteering = false;
    this.steerDir = '';
  }

  private randomInt(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
  }
}

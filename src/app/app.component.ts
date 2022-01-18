import { AfterViewInit, Component } from '@angular/core';
import * as THREE from 'three';
import { Game } from './models/game.model';
import { RoadChunk } from './models/road-chunk.model';
import { Spark } from './models/spark.model';
import { Vehicle } from './models/vehicle.model';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  private header;
  private difSelect;
  private difButtons;
  private tutorialBox;
  private replayButton;

  private scene;
  private camera;
  private renderer;
  private hemiLight;
  private pointLight;
  private touch = { hold: false, x: 0 };

  public difSelectActive = false;
  public scoreCounterActive = false;
  public replayBtnActive = false;

  private game = null;
  private skyColor = 0x69c6d0;
  private pointLightZ = -60;
  private cameraY = 45;
  private cameraYMin = 7;
  private renderDistance = 8;
  private roadChunks = [];

  public ngAfterViewInit(): void {
    this.header = document.querySelector('header');
    this.difSelect = document.querySelector('.difficulty-select');
    this.difButtons = this.difSelect.querySelectorAll('button');
    this.tutorialBox = document.querySelector('.tutorial');
    this.replayButton = document.querySelector('.replay');

    this.init();
    this.update();

    window.addEventListener('resize', this.adjustWindow.bind(this));

    // steering
    var downEvent =
        'ontouchstart' in document.documentElement ? 'touchstart' : 'mousedown',
      moveEvent =
        'ontouchmove' in document.documentElement ? 'touchmove' : 'mousemove',
      upEvent =
        'ontouchend' in document.documentElement ? 'touchend' : 'mouseup';

    document.addEventListener('keydown', this.steerVehicle.bind(this));
    document.addEventListener('keyup', this.straightenVehicle.bind(this));
    document.addEventListener(downEvent, this.getTouchHold.bind(this));
    document.addEventListener(moveEvent, this.steerVehicle.bind(this));
    document.addEventListener(upEvent, this.straightenVehicle.bind(this));

    // difficulty buttons
    for (let b of this.difButtons) {
      b.addEventListener(
        'click',
        (() => {
          this.toggleDifMenu();

          let t = b;
          setTimeout(() => {
            this.startGame(t.getAttribute('data-difficulty'));
          }, 1600);
        }).bind(this)
      );
    }

    // replay button
    this.replayButton.addEventListener(
      'click',
      (() => {
        this.game.preparingNew = true;
        this.toggleScoreCounter();
        this.toggleReplayBtn();
        setTimeout(this.toggleDifMenu.bind(this), 250);
      }).bind(this)
    );
  }

  private init() {
    // I. Setting Up Scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    );
    this.renderer = new THREE.WebGLRenderer({
      logarithmicDepthBuffer: true,
    });
    this.renderer.setClearColor(new THREE.Color(this.skyColor));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;

    // II. Lighting
    // A. Ambient
    var ambientLight = new THREE.AmbientLight(0xffffff);
    ambientLight.name = 'Ambient Light';
    this.scene.add(ambientLight);

    // B. Hemisphere
    this.hemiLight = new THREE.HemisphereLight(0x0044ff, 0xffffff, 0.5);
    this.hemiLight.name = 'Hemisphere Light';
    this.hemiLight.position.set(0, 5, 0);
    this.scene.add(this.hemiLight);

    // C. Point
    this.pointLight = new THREE.PointLight(0xffffff, 0.5);
    this.pointLight.name = 'Point Light';
    this.pointLight.position.set(0, 60, this.pointLightZ);
    this.pointLight.castShadow = true;
    this.pointLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    this.scene.add(this.pointLight);

    // III. Scenery
    // A. Road
    for (let r = 1; r > -this.renderDistance; --r) {
      this.roadChunks.push(new RoadChunk(r, this.scene));
    }

    // B. Grass
    var firstChunkSize = this.roadChunks[0].chunkSize,
      grassDepth = firstChunkSize * (this.renderDistance + 1),
      grassGeo = new THREE.PlaneBufferGeometry(400, grassDepth),
      grassMat = new THREE.MeshLambertMaterial({
        color: 0xbbe868,
      }),
      grass = new THREE.Mesh(grassGeo, grassMat);

    grass.name = 'Grass';
    grass.rotation.x = -Math.PI / 2;
    grass.position.set(0, -0.05, -grassDepth / 2 + firstChunkSize * 1.5);
    grass.receiveShadow = true;
    this.scene.add(grass);

    // C. Fog
    this.scene.fog = new THREE.Fog(
      this.skyColor,
      0.01,
      grassDepth - firstChunkSize * 2
    );

    // IV. Camera
    this.camera.position.set(0, this.cameraYMin, 30);
    this.camera.lookAt(this.scene.position);

    // V. Rendering
    document.body.appendChild(this.renderer.domElement);
  }

  private checkCollision(a, b) {
    if (!a.crashed && !b.crashed && a.name != b.name) {
      let A_left = a.x - a.width / 2,
        A_right = a.x + a.width / 2,
        A_front = a.z - a.depth / 2,
        A_back = a.z + a.depth / 2,
        B_left = b.x - b.width / 2,
        B_right = b.x + b.width / 2,
        B_front = b.z - b.depth / 2,
        B_back = b.z + b.depth / 2;

      // right hits left, left hits right
      let touchedX_RL = A_left <= B_right && A_left >= B_left,
        touchedX_LR = A_right >= B_left && A_right <= B_right,
        // front hits back, back hits front
        touchedZ_FB = A_front <= B_back && A_front >= B_front,
        touchedZ_BF = A_back >= B_front && A_back <= B_back;

      if ((touchedX_RL || touchedX_LR) && (touchedZ_FB || touchedZ_BF)) {
        var newMomentum =
          (a.model.mass * a.speed + b.model.mass * b.speed) /
          (a.model.mass + b.model.mass);

        a.speed = newMomentum;
        b.speed = newMomentum;

        let sx = 0,
          sz = 0;

        // x-center the spark between crashing ends
        if (A_left <= B_right) sx = (A_left + B_right) / 2;
        else if (A_right >= B_left) sx = (A_right + B_left) / 2;

        // then z-center it
        if (A_front <= B_back) sz = (A_front + B_back) / 2;
        else if (A_back >= B_front) sz = (A_back + B_front) / 2;

        // trigger spark for player vehicle
        if (a.name == 'Vehicle 0') {
          a.crashed = true;
          this.game.over = true;
          this.game.spark = new Spark(
            sx,
            a.height / 2,
            sz,
            A_front - B_back < 1,
            this.scene
          );
        }
      }
    }
  }

  private toggleDifBtnStates() {
    for (let b of this.difButtons) b.disabled = !b.disabled;
  }

  private toggleDifMenu() {
    this.difSelectActive = !this.difSelectActive;

    let activeClass = 'menu-active',
      inactiveClass = 'menu-inactive';

    if (this.difSelectActive) {
      this.difSelect.classList.remove(inactiveClass);
      void this.difSelect.offsetWidth;
      this.difSelect.classList.add(activeClass);
      setTimeout(this.toggleDifBtnStates.bind(this), 1500);
    } else {
      this.difSelect.classList.remove(activeClass);
      void this.difSelect.offsetWidth;
      this.difSelect.classList.add(inactiveClass);
      this.toggleDifBtnStates();
    }
  }

  private toggleScoreCounter() {
    this.scoreCounterActive = !this.scoreCounterActive;

    // let activeClass = 'score-active';

    // if (this.scoreCounterActive) {
    //   this.header.classList.add(activeClass);
    // } else {
    //   this.header.classList.remove(activeClass);
    // }
  }

  private toggleReplayBtn() {
    this.replayBtnActive = !this.replayBtnActive;
    this.replayButton.disabled = !this.replayBtnActive;

    let activeClass = 'replay-active';

    if (this.replayBtnActive) {
      this.replayButton.classList.add(activeClass);
    } else {
      this.replayButton.classList.remove(activeClass);
    }
  }

  private showTutorial() {
    if (this.game.tutorial) {
      this.tutorialBox.classList.add('tutorial-active');
    }
  }

  private hideTutorial() {
    if (this.game.tutorial) {
      this.game.tutorial = false;
      this.tutorialBox.classList.remove('tutorial-active');
    }
  }

  private startGame(difficulty) {
    if (this.game != null && this.game.over) {
      // remove spark
      if (this.game.spark != null) {
        let sparkName = this.scene.getObjectByName(this.game.spark.name);
        this.scene.remove(sparkName);
      }
      // remove all vehicles
      for (let v of this.game.vehicles) {
        let vehicleName = this.scene.getObjectByName(v.name);
        this.scene.remove(vehicleName);
      }
    }

    // first time or starting anew
    if (this.game == null || this.game.over) {
      this.game = new Game(
        {
          difficulty: difficulty,
          tutorial: this.game == null,
        },
        this.scene
      );
      this.header.innerHTML = this.game.score;
      this.toggleScoreCounter();
      this.showTutorial();
    }
  }

  private update() {
    // intro sequence
    if (this.cameraY > this.cameraYMin) {
      this.cameraY -= 0.5;
      if (this.cameraY == this.cameraYMin) {
        this.toggleDifMenu();
      }
    }

    // normal game function
    if (this.game != null && this.cameraY == this.cameraYMin) {
      let firstChunkSize = this.roadChunks[0].chunkSize,
        vehicleCtrld = this.game.vehicles[this.game.vehicleIDCtrld];

      // push all vehicles forward one chunk when player reaches that distance
      if (vehicleCtrld.z <= -firstChunkSize) {
        let vehiclesBehind = [];
        this.game.vehicles.forEach((e, i) => {
          e.z += firstChunkSize;

          // mark for removal if no longer seen
          if (e.z - e.depth / 2 > vehicleCtrld.z + firstChunkSize / 2) {
            vehiclesBehind.push({
              index: i,
              name: e.name,
            });
          }
        });
        // remove vehicles way behind, score
        vehiclesBehind.sort((a, b) => b.index - a.index);
        for (let v of vehiclesBehind) {
          let objectName = this.scene.getObjectByName(v.name);
          this.scene.remove(objectName);
          this.game.vehicles.splice(v.index, 1);

          // score points for passing without using shoulder
          if (Math.abs(vehicleCtrld.x) < this.game.noScoreXZone) {
            ++this.game.score;
            this.header.innerHTML = this.game.score;
          }
        }

        // and then spawn 0–3 new ones
        if (
          this.game.vehicles.length < this.game.vehicleLimit &&
          !this.game.tutorial
        ) {
          let spawnTries = 3;
          while (spawnTries--) {
            if (Math.random() < 0.05 + this.game.difficulty * 0.025) {
              this.game.vehicles.push(
                new Vehicle(
                  {
                    x: (-1 + spawnTries) * 10,
                    z: -this.renderDistance * firstChunkSize - spawnTries * 15,
                    name: 'Vehicle ' + this.game.vehicleSpawns,
                  },
                  this.scene
                )
              );
              ++this.game.vehicleSpawns;
            }
          }
        }
      }

      // move vehicles
      let vehiclesAhead = [];
      this.game.vehicles.forEach((e, i) => {
        e.move();

        for (let v of this.game.vehicles) {
          this.checkCollision(e, v);
        }

        if (!this.game.tutorial) {
          if (!e.crashed) e.accelerate();
          else {
            e.decelerate();

            // spinout if steering
            if (e.steerAngle > 0) e.steerAngle += e.speed * e.steerSpeed;
            else if (e.steerAngle < 0) e.steerAngle -= e.speed * e.steerSpeed;
          }
        }

        // mark for removal if no longer seen
        if (e.z < (-this.renderDistance - 1.5) * firstChunkSize) {
          vehiclesAhead.push({
            index: i,
            name: e.name,
          });
        }
      });
      // remove vehicles way ahead
      vehiclesAhead.sort((a, b) => b.index - a.index);
      for (let v of vehiclesAhead) {
        let objectName = this.scene.getObjectByName(v.name);
        this.scene.remove(objectName);
        this.game.vehicles.splice(v.index, 1);
      }

      // spark from crash
      if (this.game.spark != null) {
        this.game.spark.moveParticles();
        this.game.spark.center.position.z =
          vehicleCtrld.z -
          (this.game.spark.isHorz ? vehicleCtrld.depth / 2 : 0);
      }

      // show difficulty menu on game over
      if (
        vehicleCtrld.speed <= 0 &&
        this.game.over &&
        !this.game.preparingNew &&
        !this.replayBtnActive
      )
        this.toggleReplayBtn();

      // center spotlight and camera on player vehicle
      this.pointLight.position.z = vehicleCtrld.z + this.pointLightZ;
      this.camera.position.set(0, this.cameraY, vehicleCtrld.z + 30);
    } else {
      this.pointLight.position.z = this.pointLightZ;
      this.camera.position.set(0, this.cameraY, 30);
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.update.bind(this));
  }

  private adjustWindow() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private steerVehicle(e) {
    if (this.game != null && !this.game.over && this.game.vehicles.length) {
      let playerVehicle = this.game.vehicles[this.game.vehicleIDCtrld];

      // left arrow, A, or drag left
      if (
        (e.keyCode && (e.keyCode == 37 || e.keyCode == 65)) ||
        (this.touch.hold && e.pageX < this.touch.x)
      ) {
        playerVehicle.steer('left');
        this.hideTutorial();

        // right arrow, D, or drag right
      } else if (
        (e.keyCode && (e.keyCode == 39 || e.keyCode == 68)) ||
        (this.touch.hold && e.pageX > this.touch.x)
      ) {
        playerVehicle.steer('right');
        this.hideTutorial();
      }
    }
  }

  private straightenVehicle() {
    if (this.game != null && !this.game.over && this.game.vehicles.length) {
      this.game.vehicles[this.game.vehicleIDCtrld].straighten();
    }
    this.touch.hold = false;
  }

  private getTouchHold(e) {
    this.touch.hold = true;
    this.touch.x = e.pageX;
  }

  private randomInt(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
  }
}

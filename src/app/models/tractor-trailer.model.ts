import * as THREE from 'three';

export class TractorTrailer {
  public mass;
  public mesh;

  public constructor(color, x, z, name, scene) {
    // I. Group
    this.mass = 12;
    this.mesh = new THREE.Object3D();
    this.mesh.name = name;
    this.mesh.position.set(x, 4, z);
    scene.add(this.mesh);

    // II. Cab
    var cabPt1Geo = new THREE.BoxBufferGeometry(5, 4, 5),
      cabPt1Mat = new THREE.MeshLambertMaterial({
        color: color,
      }),
      cabPt1 = new THREE.Mesh(cabPt1Geo, cabPt1Mat);
    cabPt1.position.set(0, 1, -6.5);
    cabPt1.castShadow = true;
    this.mesh.add(cabPt1);

    var cabPt2Geo = new THREE.BoxBufferGeometry(5, 2, 0.5),
      cabPt2Mat = cabPt1Mat,
      cabPt2 = new THREE.Mesh(cabPt2Geo, cabPt2Mat);
    cabPt2.position.set(0, -2, -8.75);
    cabPt2.castShadow = true;
    this.mesh.add(cabPt2);

    var cabPt3Geo = new THREE.BoxBufferGeometry(3, 2, 8.25),
      cabPt3Mat = new THREE.MeshLambertMaterial({
        color: 0x3f3f3f,
      }),
      cabPt3 = new THREE.Mesh(cabPt3Geo, cabPt3Mat);
    cabPt3.position.set(0, -2, -4.375);
    cabPt3.castShadow = true;
    this.mesh.add(cabPt3);

    var cabLeftWindowGeo = new THREE.PlaneBufferGeometry(2.5, 2),
      cabLeftWindowMat = new THREE.MeshLambertMaterial({
        color: 0x171717,
      }),
      cabLeftWindow = new THREE.Mesh(cabLeftWindowGeo, cabLeftWindowMat);
    cabLeftWindow.position.set(-2.51, 1, -7.75);
    cabLeftWindow.rotation.y = -0.5 * Math.PI;
    cabLeftWindow.receiveShadow = true;
    this.mesh.add(cabLeftWindow);

    var cabRightWindow = cabLeftWindow.clone();
    cabRightWindow.position.x = -cabLeftWindow.position.x;
    cabRightWindow.rotation.y = -cabLeftWindow.rotation.y;
    this.mesh.add(cabRightWindow);

    var cabFrontWindowGeo = new THREE.PlaneBufferGeometry(5, 2),
      cabFrontWindowMat = cabLeftWindowMat,
      cabFrontWindow = new THREE.Mesh(cabFrontWindowGeo, cabFrontWindowMat);
    cabFrontWindow.position.set(0, 1, -9.01);
    cabFrontWindow.rotation.y = Math.PI;
    cabFrontWindow.receiveShadow = true;
    this.mesh.add(cabFrontWindow);

    var lightGeo = new THREE.PlaneBufferGeometry(1, 1),
      lightMat = new THREE.MeshLambertMaterial({
        color: 0xf1f1f1,
      }),
      light = new THREE.Mesh(lightGeo, lightMat);

    light.rotation.y = Math.PI;

    var leftLight = light.clone();
    leftLight.position.set(-1.5, -1.5, -9.01);
    this.mesh.add(leftLight);

    var rightLight = light.clone();
    rightLight.position.set(1.5, -1.5, -9.01);
    this.mesh.add(rightLight);

    // III. Metal Cylinders
    var cabLeftCylinderGeo = new THREE.CylinderBufferGeometry(
        0.75,
        0.75,
        2.25,
        16,
        16,
        false
      ),
      cabLeftCylinderMat = new THREE.MeshLambertMaterial({
        color: 0x7f7f7f,
      }),
      cabLeftCylinder = new THREE.Mesh(cabLeftCylinderGeo, cabLeftCylinderMat);
    cabLeftCylinder.position.set(-2.25, -1.875, -3.875);
    cabLeftCylinder.rotation.x = -0.5 * Math.PI;
    cabLeftCylinder.castShadow = true;
    this.mesh.add(cabLeftCylinder);

    var cabRightCylinder = cabLeftCylinder.clone();
    cabRightCylinder.position.x = -cabLeftCylinder.position.x;
    this.mesh.add(cabRightCylinder);

    // IV. Trailer
    var trailerGeo = new THREE.BoxBufferGeometry(5, 5, 12),
      trailerMat = new THREE.MeshLambertMaterial({
        color: 0xffffff,
      }),
      trailer = new THREE.Mesh(trailerGeo, trailerMat);
    trailer.position.set(0, 1.5, 3);
    trailer.castShadow = true;
    this.mesh.add(trailer);

    var trailerBottomGeo = new THREE.BoxBufferGeometry(3, 2, 2),
      trailerBottomMat = cabPt3Mat,
      trailerBottom = new THREE.Mesh(trailerBottomGeo, trailerBottomMat);
    trailerBottom.position.set(0, -2, 7);
    trailerBottom.castShadow = true;
    this.mesh.add(trailerBottom);

    // V. Wheels
    var wheelGeo = new THREE.CylinderBufferGeometry(1.5, 1.5, 1, 24, 24, false),
      wheelMat = new THREE.MeshLambertMaterial({
        color: 0x242424,
      }),
      wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.castShadow = true;
    wheel.rotation.z = -0.5 * Math.PI;

    var wheelPos = [
      { x: -2, y: -2.5, z: 7, name: 'BL' },
      { x: 2, y: -2.5, z: 7, name: 'BR' },
      { x: -2, y: -2.5, z: -1, name: 'ML' },
      { x: 2, y: -2.5, z: -1, name: 'MR' },
      { x: -2, y: -2.5, z: -6.75, name: 'FL' },
      { x: 2, y: -2.5, z: -6.75, name: 'FR' },
    ];
    for (let p of wheelPos) {
      var w = wheel.clone();
      w.name = p.name;
      w.position.set(p.x, p.y, p.z);
      this.mesh.add(w);
    }
  }
}

import * as THREE from 'three';

export class Truck {
  public mass;
  public mesh;

  public constructor(color, x, z, name, scene) {
    // I. Group
    this.mass = 4;
    this.mesh = new THREE.Object3D();
    this.mesh.name = name;
    this.mesh.position.set(x, 2.5, z);
    scene.add(this.mesh);

    // II. Body
    var truckBodyBase = new THREE.Mesh(new THREE.BoxBufferGeometry(5, 4, 10)),
      cutFront = new THREE.Mesh(new THREE.BoxBufferGeometry(5, 1.5, 2.5)),
      cutBack = new THREE.Mesh(new THREE.BoxBufferGeometry(5, 1.5, 4.5)),
      frontTireHoles = new THREE.Mesh(
        new THREE.CylinderBufferGeometry(1.2, 1.2, 5, 16, 16, false)
      ),
      backTireHoles = frontTireHoles.clone(),
      trunk = new THREE.Mesh(new THREE.BoxBufferGeometry(4.4, 1.5, 4));

    cutFront.position.set(0, 1.25, -3.75);
    cutBack.position.set(0, 1.25, 3);

    frontTireHoles.position.set(0, -2, -3);
    frontTireHoles.rotation.z = (90 * Math.PI) / 180;

    backTireHoles.position.set(0, -2, 3);
    backTireHoles.rotation.z = frontTireHoles.rotation.z;

    trunk.position.set(0, 0.1, 2.75);

    truckBodyBase.updateMatrix();
    cutFront.updateMatrix();
    cutBack.updateMatrix();
    frontTireHoles.updateMatrix();
    backTireHoles.updateMatrix();
    trunk.updateMatrix();

    var truckBodyBase_BSP = CSG.fromMesh(truckBodyBase),
      cutFront_BSP = CSG.fromMesh(cutFront),
      cutBack_BSP = CSG.fromMesh(cutBack),
      frontTireHoles_BSP = CSG.fromMesh(frontTireHoles),
      backTireHoles_BSP = CSG.fromMesh(backTireHoles),
      trunk_BSP = CSG.fromMesh(trunk),
      truckBody_BSP = truckBodyBase_BSP
        .subtract(cutFront_BSP)
        .subtract(cutBack_BSP)
        .subtract(frontTireHoles_BSP)
        .subtract(backTireHoles_BSP)
        .subtract(trunk_BSP),
      truckBody = CSG.toMesh(truckBody_BSP, truckBodyBase.matrix);

    truckBody.material = new THREE.MeshLambertMaterial({
      color: color,
    });
    truckBody.position.set(0, 0.5, 0);
    truckBody.castShadow = true;
    this.mesh.add(truckBody);

    // III. Wheels
    var wheelGeo = new THREE.CylinderBufferGeometry(1, 1, 0.5, 24, 24, false),
      wheelMat = new THREE.MeshLambertMaterial({
        color: 0x171717,
      }),
      wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.castShadow = true;
    wheel.rotation.z = -0.5 * Math.PI;

    var wheelPos = [
      { x: -2.25, y: -1.5, z: 3, name: 'BL' },
      { x: 2.25, y: -1.5, z: 3, name: 'BR' },
      { x: -2.25, y: -1.5, z: -3, name: 'FL' },
      { x: 2.25, y: -1.5, z: -3, name: 'FR' },
    ];
    for (let p of wheelPos) {
      var w = wheel.clone();
      w.name = p.name;
      w.position.set(p.x, p.y, p.z);
      this.mesh.add(w);
    }

    // IV. Windows
    var windowMat = new THREE.MeshLambertMaterial({
        color: 0x171717,
      }),
      horzWindowGeo = new THREE.PlaneBufferGeometry(4.4, 1.2),
      horzWindowMat = windowMat,
      horzWindow = new THREE.Mesh(horzWindowGeo, horzWindowMat),
      midFrontWindowGeo = new THREE.PlaneBufferGeometry(1.4, 1.2),
      midFrontWindowMat = windowMat,
      midFrontWindow = new THREE.Mesh(midFrontWindowGeo, midFrontWindowMat),
      midBackWindowGeo = new THREE.PlaneBufferGeometry(1, 1.2),
      midBackWindowMat = windowMat,
      midBackWindow = new THREE.Mesh(midBackWindowGeo, midBackWindowMat);

    horzWindow.receiveShadow = true;
    midFrontWindow.receiveShadow = true;
    midBackWindow.receiveShadow = true;

    var leftMFWindow = midFrontWindow.clone();
    leftMFWindow.position.set(-2.51, 1.55, -1.55);
    leftMFWindow.rotation.y = -0.5 * Math.PI;
    this.mesh.add(leftMFWindow);

    var rightMFWindow = midFrontWindow.clone();
    rightMFWindow.position.set(2.51, 1.55, -1.55);
    rightMFWindow.rotation.y = 0.5 * Math.PI;
    this.mesh.add(rightMFWindow);

    var leftMBWindow = midBackWindow.clone();
    leftMBWindow.position.set(-2.51, 1.55, -0.05);
    leftMBWindow.rotation.y = -0.5 * Math.PI;
    this.mesh.add(leftMBWindow);

    var rightMBWindow = midBackWindow.clone();
    rightMBWindow.position.set(2.51, 1.55, -0.05);
    rightMBWindow.rotation.y = 0.5 * Math.PI;
    this.mesh.add(rightMBWindow);

    var frontWindow = horzWindow.clone();
    frontWindow.position.set(0, 1.55, -2.51);
    frontWindow.rotation.y = Math.PI;
    this.mesh.add(frontWindow);

    var backWindow = horzWindow.clone();
    backWindow.position.set(0, 1.55, 0.76);
    this.mesh.add(backWindow);

    /// V. Lights
    var lightGeo = new THREE.PlaneBufferGeometry(0.75, 1),
      frontLightMat = new THREE.MeshLambertMaterial({
        color: 0xf1f1f1,
      }),
      frontLight = new THREE.Mesh(lightGeo, frontLightMat),
      backLightMat = new THREE.MeshLambertMaterial({
        color: 0xf65555,
      }),
      backLight = new THREE.Mesh(lightGeo, backLightMat);

    frontLight.rotation.y = Math.PI;

    var frontLeftLight = frontLight.clone();
    frontLeftLight.position.set(-2.125, 0.25, -5.01);
    this.mesh.add(frontLeftLight);

    var frontRightLight = frontLight.clone();
    frontRightLight.position.set(2.125, 0.25, -5.01);
    this.mesh.add(frontRightLight);

    var backLeftLight = backLight.clone();
    backLeftLight.position.set(-2.125, 0.25, 5.01);
    this.mesh.add(backLeftLight);

    var backRightLight = backLight.clone();
    backRightLight.position.set(2.125, 0.25, 5.01);
    this.mesh.add(backRightLight);
  }
}

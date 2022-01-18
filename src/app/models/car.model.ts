export class Car {
  public mass;
  public mesh;

  constructor(color, x, z, name, scene) {
    // I. Group
    this.mass = 3;
    this.mesh = new THREE.Object3D();
    this.mesh.name = name;
    this.mesh.position.set(x, 2, z);
    scene.add(this.mesh);

    // II. Body
    var carBodyBase = new THREE.Mesh(new THREE.BoxBufferGeometry(5, 3, 10)),
      cutFront = new THREE.Mesh(new THREE.BoxBufferGeometry(5, 1, 3)),
      cutBack = new THREE.Mesh(new THREE.BoxBufferGeometry(5, 1, 2)),
      frontTireHoles = new THREE.Mesh(
        new THREE.CylinderBufferGeometry(1.2, 1.2, 5, 16, 16, false)
      ),
      backTireHoles = frontTireHoles.clone();

    cutFront.position.set(0, 1, -3.5);
    cutBack.position.set(0, 1, 4);

    frontTireHoles.position.set(0, -1.5, -3);
    frontTireHoles.rotation.z = (90 * Math.PI) / 180;

    backTireHoles.position.set(0, -1.5, 3);
    backTireHoles.rotation.z = frontTireHoles.rotation.z;

    carBodyBase.updateMatrix();
    cutFront.updateMatrix();
    cutBack.updateMatrix();
    frontTireHoles.updateMatrix();
    backTireHoles.updateMatrix();

    var carBodyBase_BSP = CSG.fromMesh(carBodyBase),
      cutFront_BSP = CSG.fromMesh(cutFront),
      cutBack_BSP = CSG.fromMesh(cutBack),
      frontTireHoles_BSP = CSG.fromMesh(frontTireHoles),
      backTireHoles_BSP = CSG.fromMesh(backTireHoles),
      carBody_BSP = carBodyBase_BSP
        .subtract(cutFront_BSP)
        .subtract(cutBack_BSP)
        .subtract(frontTireHoles_BSP)
        .subtract(backTireHoles_BSP),
      carBody = CSG.toMesh(carBody_BSP, carBodyBase.matrix);

    carBody.material = new THREE.MeshLambertMaterial({
      color: color,
    });
    carBody.position.set(0, 0.5, 0);
    carBody.castShadow = true;
    this.mesh.add(carBody);

    // III. Wheels
    var wheelGeo = new THREE.CylinderBufferGeometry(1, 1, 0.5, 24, 24, false),
      wheelMat = new THREE.MeshLambertMaterial({
        color: 0x171717,
      }),
      wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.castShadow = true;
    wheel.rotation.z = -0.5 * Math.PI;

    var wheelPos = [
      { x: -2.25, y: -1, z: 3, name: 'BL' },
      { x: 2.25, y: -1, z: 3, name: 'BR' },
      { x: -2.25, y: -1, z: -3, name: 'FL' },
      { x: 2.25, y: -1, z: -3, name: 'FR' },
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
      horzWindowGeo = new THREE.PlaneBufferGeometry(4.4, 0.8),
      horzWindowMat = windowMat,
      horzWindow = new THREE.Mesh(horzWindowGeo, horzWindowMat),
      midFrontWindowGeo = new THREE.PlaneBufferGeometry(2.3, 0.8),
      midFrontWindowMat = windowMat,
      midFrontWindow = new THREE.Mesh(midFrontWindowGeo, midFrontWindowMat),
      midBackWindowGeo = new THREE.PlaneBufferGeometry(1.5, 0.8),
      midBackWindowMat = windowMat,
      midBackWindow = new THREE.Mesh(midBackWindowGeo, midBackWindowMat);

    horzWindow.receiveShadow = true;
    midFrontWindow.receiveShadow = true;
    midBackWindow.receiveShadow = true;

    var leftMFWindow = midFrontWindow.clone();
    leftMFWindow.position.set(-2.51, 1.4, -0.4);
    leftMFWindow.rotation.y = -0.5 * Math.PI;
    this.mesh.add(leftMFWindow);

    var rightMFWindow = midFrontWindow.clone();
    rightMFWindow.position.set(2.51, 1.4, -0.4);
    rightMFWindow.rotation.y = 0.5 * Math.PI;
    this.mesh.add(rightMFWindow);

    var leftMBWindow = midBackWindow.clone();
    leftMBWindow.position.set(-2.51, 1.4, 1.9);
    leftMBWindow.rotation.y = -0.5 * Math.PI;
    this.mesh.add(leftMBWindow);

    var rightMBWindow = midBackWindow.clone();
    rightMBWindow.position.set(2.51, 1.4, 1.9);
    rightMBWindow.rotation.y = 0.5 * Math.PI;
    this.mesh.add(rightMBWindow);

    var frontWindow = horzWindow.clone();
    frontWindow.position.set(0, 1.4, -2.01);
    frontWindow.rotation.y = Math.PI;
    this.mesh.add(frontWindow);

    var backWindow = horzWindow.clone();
    backWindow.position.set(0, 1.4, 3.01);
    this.mesh.add(backWindow);

    // V. Lights
    var lightGeo = new THREE.PlaneBufferGeometry(1, 0.5),
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
    frontLeftLight.position.set(-2, 0.25, -5.01);
    this.mesh.add(frontLeftLight);

    var frontRightLight = frontLight.clone();
    frontRightLight.position.set(2, 0.25, -5.01);
    this.mesh.add(frontRightLight);

    var backLeftLight = backLight.clone();
    backLeftLight.position.set(-2, 0.25, 5.01);
    this.mesh.add(backLeftLight);

    var backRightLight = backLight.clone();
    backRightLight.position.set(2, 0.25, 5.01);
    this.mesh.add(backRightLight);
  }
}

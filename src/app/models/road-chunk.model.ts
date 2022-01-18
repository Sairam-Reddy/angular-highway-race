export class RoadChunk {
  public chunkSize;
  public surfaceGeo;
  public surfaceMat;
  public surface;

  public constructor(zSpaces, scene) {
    let chunkSize = 40,
      lineWidth = 1,
      lineHeight = 4,
      dotLines = 3;

    this.chunkSize = chunkSize;
    // surface
    this.surfaceGeo = new THREE.PlaneBufferGeometry(chunkSize, chunkSize);
    this.surfaceMat = new THREE.MeshLambertMaterial({
      color: 0x575757,
    });
    this.surface = new THREE.Mesh(this.surfaceGeo, this.surfaceMat);
    this.surface.name = 'Road Chunk';
    this.surface.rotation.x = -Math.PI / 2;
    this.surface.position.set(0, 0, zSpaces * chunkSize);
    this.surface.receiveShadow = true;
    scene.add(this.surface);

    // shoulder lines
    let lineGeo = new THREE.PlaneBufferGeometry(lineWidth, chunkSize),
      lineMat = new THREE.MeshLambertMaterial({
        color: 0xffffff,
      }),
      line = new THREE.Mesh(lineGeo, lineMat);
    line.receiveShadow = true;

    let leftShoulder = line.clone();
    leftShoulder.position.set(-chunkSize * 0.375, 0, 0.01);
    this.surface.add(leftShoulder);

    let rightShoulder = line.clone();
    rightShoulder.position.set(chunkSize * 0.375, 0, 0.01);
    this.surface.add(rightShoulder);

    // dotted lines
    let dotLineGeo = new THREE.PlaneBufferGeometry(lineWidth, lineHeight),
      dotLineMat = new THREE.MeshLambertMaterial({
        color: 0xffffff,
      }),
      dotLine = new THREE.Mesh(dotLineGeo, dotLineMat);

    for (let l = 0; l < dotLines; ++l) {
      let y = chunkSize / 2 - (chunkSize / dotLines) * l - lineHeight / 2;

      let leftLine = dotLine.clone();
      leftLine.position.set(-chunkSize * 0.125, y, 0.01);
      this.surface.add(leftLine);

      let rightLine = dotLine.clone();
      rightLine.position.set(chunkSize * 0.125, y, 0.01);
      this.surface.add(rightLine);
    }
  }
}

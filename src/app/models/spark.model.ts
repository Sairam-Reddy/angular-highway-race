export class Spark {
  public center;
  public isHorz;
  public particles;

  public constructor(x, y, z, isHorz = false, scene) {
    this.center = new THREE.Object3D();
    this.center.name = 'Spark';
    this.center.position.set(x, y, z);
    scene.add(this.center);

    this.isHorz = isHorz;
    this.particles = [];

    // populate particles
    let particleGeo = new THREE.SphereBufferGeometry(1, 16, 16),
      particleMat = new THREE.MeshBasicMaterial({
        color: 0xffff00,
      }),
      particleMesh = new THREE.Mesh(particleGeo, particleMat);

    for (var m = 0; m < this.randomInt(6, 8); ++m) {
      this.particles.push({
        x: 0,
        y: 0,
        z: 0,
        size: 1,
        speed: 0.2,
        decay: 0.04,
        angle: this.randomInt(0, 359),
        mesh: particleMesh.clone(),
      });
      this.center.add(this.particles[m].mesh);
    }
  }

  moveParticles() {
    // shrink particles as they move
    for (let p of this.particles) {
      if (p.size > 0) {
        p.size -= p.decay;

        if (this.isHorz === true) {
          p.x += p.speed * Math.sin((p.angle * Math.PI) / 180);
          p.mesh.position.x = p.x;
        } else {
          p.z += p.speed * Math.sin((p.angle * Math.PI) / 180);
          p.mesh.position.z = p.z;
        }

        p.y += p.speed * Math.cos((p.angle * Math.PI) / 180);
        p.mesh.position.y = p.y;

        p.mesh.scale.x = p.size;
        p.mesh.scale.y = p.size;
        p.mesh.scale.z = p.size;
      }
    }
  }

  private randomInt(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
  }
}

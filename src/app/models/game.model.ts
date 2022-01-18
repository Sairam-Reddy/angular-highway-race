import { Vehicle } from './vehicle.model';

export class Game {
  public difficulty;
  public tutorial;
  public over;
  public preparingNew;
  public score;
  public noScoreXZone;
  public vehicles;
  public vehicleSpawns;
  public vehicleLimit;
  public vehicleIDCtrld;
  public spark;

  public constructor(args) {
    // 0: easy, 1: medium (default), 2: hard, 3: brutal
    let d = args.difficulty;
    this.difficulty = d >= 0 && d <= 3 ? d : 1;

    this.tutorial = args.tutorial === true;
    this.over = false;
    this.preparingNew = false;
    this.score = 0;
    this.noScoreXZone = 15;
    this.vehicles = [
      new Vehicle({
        color: 0xff1717,
        x: 0,
        z: 0,
        modelID: 0,
        speed: 1,
        acceleration: 0.001 * 2 ** d,
        name: 'Vehicle 0',
      }),
    ];
    this.vehicleSpawns = this.vehicles.length;
    this.vehicleLimit = 9;
    this.vehicleIDCtrld = 0;
    this.spark = null;
  }
}

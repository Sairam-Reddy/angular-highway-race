import { AfterViewInit, Component } from '@angular/core';

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

  private difSelectActive = false;
  private scoreCounterActive = false;
  private replayBtnActive = false;

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
  }

  private randomInt(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
  }
}

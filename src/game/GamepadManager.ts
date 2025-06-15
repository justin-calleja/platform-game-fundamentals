export class GamepadManager {
  protected previousButtonStates: { [key: number]: boolean } = {};

  constructor(public pad: Phaser.Input.Gamepad.Gamepad) {}

  isButtonJustPressed(buttonIndex: number): boolean {
    const currentState = this.pad.isButtonDown(buttonIndex);
    const previousState = this.previousButtonStates[buttonIndex] || false;
    this.previousButtonStates[buttonIndex] = currentState;
    return currentState && !previousState;
  }

  //   update() {
  //     // Update button states
  //     for (let i = 0; i < this.pad.buttons.length; i++) {
  //       this.previousButtonStates[i] = this.pad.isButtonDown(i);
  //     }
  //   }
}

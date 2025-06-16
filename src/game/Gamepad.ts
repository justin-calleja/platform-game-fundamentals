import { Input } from "phaser";

export class Gamepad {
  protected _pad: Phaser.Input.Gamepad.Gamepad;
  protected previousButtonStates: { [key: number]: boolean } = {};

  public leftStick: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  public rightStick: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 0);
  public isButtonDown: (typeof this._pad)["isButtonDown"] = () => false;

  protected get pad() {
    return this._pad;
  }

  protected set pad(pad: Phaser.Input.Gamepad.Gamepad) {
    if (pad === this._pad) {
      return;
    }

    this.initPad(pad, this._pad);
  }

  constructor(gamepadPlugin: Input.Gamepad.GamepadPlugin) {
    if (gamepadPlugin.total === 0) {
      gamepadPlugin.once("connected", (pad: Phaser.Input.Gamepad.Gamepad) => {
        this.pad = pad;
      });
    } else {
      this.pad = gamepadPlugin.pad1;
    }
  }

  initPad(
    pad: Phaser.Input.Gamepad.Gamepad,
    oldPad?: Phaser.Input.Gamepad.Gamepad
  ) {
    oldPad?.off("down", this.logKeys);

    pad.on("down", this.logKeys);
    this._pad = pad;
    this.leftStick = pad.leftStick;
    this.rightStick = pad.rightStick;
    this.isButtonDown = pad.isButtonDown;
  }

  logKeys() {
    this.pad.on("down", (index: any, value: any, button: any) => {
      console.log(
        `on "down": index: ${index}, value: ${value}, button: ${button}`
      );
      window.lastPressedButton = button;
    });
  }

  /*
    Frame 1: Button not pressed
        - currentState = false
        - previousState = false (initial state)
        - Result: false (button wasn't just pressed)

    Frame 2: Button pressed
        - currentState = true
        - previousState = false (from Frame 1)
        - Result: true (button was just pressed!)

    Frame 3: Button still held
        - currentState = true
        - previousState = true (from Frame 2)
        - Result: false (button was already pressed)

    Frame 4: Button released
        - currentState = false
        - previousState = true (from Frame 3)
        - Result: false (button was released, not pressed)
  */
  isButtonJustPressed(buttonIndex: number): boolean {
    if (!this.pad) {
      return false;
    }

    const currentState = this.pad.isButtonDown(buttonIndex);
    const previousState = this.previousButtonStates[buttonIndex] || false;
    this.previousButtonStates[buttonIndex] = currentState;
    return currentState && !previousState;
  }
}

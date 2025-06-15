export class GamepadManager {
  protected previousButtonStates: { [key: number]: boolean } = {};

  // TODO: type this so it only requires an isButtonDown
  // Or: create a utility that requires being passed a type that implements isButtonDown
  // and button index and do away with this class.
  constructor(public pad: Phaser.Input.Gamepad.Gamepad) {}

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
    const currentState = this.pad.isButtonDown(buttonIndex);
    const previousState = this.previousButtonStates[buttonIndex] || false;
    this.previousButtonStates[buttonIndex] = currentState;
    return currentState && !previousState;
  }
}

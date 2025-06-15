import Phaser from "phaser";
import { Game } from "./scenes/Game";
import { Preloader } from "./scenes/Preloader";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game-container",
  backgroundColor: "#33A5E7",
  scale: {
    width: 500,
    height: 320,
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: true,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 750 },
      debug: false,
      debugShowVelocity: true,
      debugShowBody: true,
      debugShowStaticBody: true,
    },
  },
  scene: [Preloader, Game],
};

const StartGame = (parent: string) => {
  return new Phaser.Game({ ...config, parent });
};

export default StartGame;

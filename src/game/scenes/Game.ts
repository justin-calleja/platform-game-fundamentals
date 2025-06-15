import { Scene } from "phaser";
import Hero from "../entities/Hero";
import { GamepadManager } from "../GamepadManager";

export class Game extends Scene {
  cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;
  map: Phaser.Tilemaps.Tilemap;
  //   map: Phaser.Tilemaps.TilemapLayer;
  hero: Hero;
  spawnPos: { x: number; y: number };
  spikeGroup: Phaser.Physics.Arcade.Group;

  pad: any;
  gamepadManager: GamepadManager;

  constructor() {
    super("Game");
  }

  create() {
    this.cursorKeys = this.input.keyboard!.createCursorKeys();

    this.addMap();

    this.addHero();

    this.addController();

    this.cameras.main.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );

    window.scene = this;
  }

  addController() {
    if (!this.input.gamepad) {
      throw new Error(
        "You are probably missing `input.gamepad = true` config setting in Phaser.Types.Core.GameConfig"
      );
    }

    if (this.input.gamepad.total === 0) {
      console.log("this.input.gamepad.total === 0", this.input.gamepad.total);
      this.input.gamepad.once(
        "connected",
        (pad: Phaser.Input.Gamepad.Gamepad) => {
          window.pad = pad;

          console.log("omg we actually managed to connect");
          this.pad = pad;
          this.gamepadManager = new GamepadManager(pad);

          this.hero.setGamepadManager(this.gamepadManager);

          this.pad.on("down", (index: any, value: any, button: any) => {
            console.log(
              `Connected after create on connected event. index: ${index}, value: ${value}, button: ${button}`
            );
            window.lastPressedButton = button;
          });
        }
      );
    } else {
      console.log("this.input.gamepad.total !== 0", this.input.gamepad.total);
      this.pad = this.input.gamepad.pad1;
      this.gamepadManager = new GamepadManager(this.pad);

      this.pad.on("down", (index: any, value: any, button: any) => {
        console.log(
          `Connected on create. index: ${index}, value: ${value}, button: ${button}`
        );
      });
    }
  }

  addHero() {
    this.hero = new Hero(this, this.spawnPos.x, this.spawnPos.y);

    this.cameras.main.startFollow(this.hero);

    const foregroundLayer = this.map.getLayer("Foreground")?.tilemapLayer;
    if (!foregroundLayer) {
      throw new Error("Foreground layer not found");
    }

    this.children.moveTo(this.hero, this.children.getIndex(foregroundLayer));

    const groundLayer = this.map.getLayer("Ground")?.tilemapLayer;
    if (!groundLayer) {
      throw new Error("Ground layer not found");
    }

    const groundCollider = this.physics.add.collider(this.hero, groundLayer);

    const spikesCollider = this.physics.add.overlap(
      this.hero,
      this.spikeGroup,
      () => {
        this.hero.kill();
      }
    );

    this.hero.on("died", () => {
      groundCollider.destroy();
      spikesCollider.destroy();
      this.hero.body.setCollideWorldBounds(false);
      this.cameras.main.stopFollow();
    });
  }

  addMap() {
    this.map = this.make.tilemap({ key: "level-1" });
    const groundTiles = this.map.addTilesetImage("world-1", "world-1-sheet");
    if (!groundTiles) {
      throw new Error("Could not add tileset world image");
    }
    const backgroundTiles = this.map.addTilesetImage("clouds", "clouds-sheet");
    if (!backgroundTiles) {
      throw new Error("Could not add tileset cloud image");
    }

    const backgroundLayer = this.map.createLayer("Background", backgroundTiles);
    if (!backgroundLayer) {
      throw new Error("Background layer could not be created");
    }

    backgroundLayer.setScrollFactor(0.6);

    const groundLayer = this.map.createLayer("Ground", groundTiles);
    if (!groundLayer) {
      throw new Error("Ground layer could not be created");
    }
    groundLayer.setCollision([1, 2, 4], true);

    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels
    );
    this.physics.world.setBoundsCollision(true, true, false, true);

    this.spikeGroup = this.physics.add.group({
      immovable: true,
      allowGravity: false,
    });

    this.map.getObjectLayer("Objects")?.objects.forEach((object) => {
      if (object.name === "Start") {
        this.spawnPos = { x: object.x!, y: object.y! };
      }
      if (object.gid === 7) {
        const spike = this.spikeGroup.create(
          object.x,
          object.y,
          "world-1-sheet",
          object.gid - 1
        );
        spike.setOrigin(0, 1);
        // @ts-ignore
        spike.setSize(object.width - 10, object?.height - 10);
        spike.setOffset(5, 10);
      }
    });

    this.map.createLayer("Foreground", groundTiles);

    // const debugGraphics = this.add.graphics();
    // groundLayer.renderDebug(debugGraphics);
  }

  update(_time: number, _delta: number) {
    const cameraBottom = this.cameras.main.getWorldPoint(
      0,
      this.cameras.main.height
    ).y;

    // if (this.pad) {
    //   if (this.pad.isDown(Phaser.Input.Gamepad.GamepadButton.DPAD_UP)) {
    //     this.hero.body.velocity.y = -100;
    //   }
    // }

    /*
    const pads = this.input.gamepad.gamepads;

    for (let i = 0; i < pads.length; i++)
    {
        const gamepad = pads[i];

        if (!gamepad)
        {
            continue;
        }

        const sprite = this.sprites[i];

        if (gamepad.left)
        {
            sprite.x -= 4;
            sprite.flipX = false;
        }
        else if (gamepad.right)
        {
            sprite.x += 4;
            sprite.flipX = true;
        }

        if (gamepad.up)
        {
            sprite.y -= 4;
        }
        else if (gamepad.down)
        {
            sprite.y += 4;
        }
    }
}
    */

    if (this.hero.isDead() && this.hero.getBounds().top > cameraBottom + 100) {
      this.hero.destroy();
      this.addHero();
    }
  }
}

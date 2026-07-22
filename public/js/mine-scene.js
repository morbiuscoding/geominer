export class MineScene extends Phaser.Scene {

    constructor() {

        super("mine");

        this.group = null;
        this.glow = null;
        this.parts = [];

    }

    preload() {
        this.load.image("active-miner", "assets/active-miner.png");
    }

    /* ==========================================================
       CREATE
    ========================================================== */

    create() {

        this.createCrystal();
        this.createAnimations();
        this.registerInput();

        this.miner = this.add.image(150, 275, "active-miner")
            .setDisplaySize(116, 116)
            .setVisible(false);

        this.minerSwing = this.tweens.add({
            targets: this.miner,
            angle: -10,
            duration: 360,
            yoyo: true,
            repeat: -1,
            ease: "Sine.inOut",
            paused: true
        });

    }

    /* ==========================================================
       CRYSTAL
    ========================================================== */

    createCrystal() {

        const { width, height } = this.scale;

        this.group = this.add.container(
            width / 2,
            height / 2
        );

        this.glow = this.add.circle(
            0,
            0,
            100,
            0x5debd0,
            0.12
        );

        this.group.add(this.glow);

        this.parts = [];

        const pieces = [

            [0, -90, 0x8fffea],
            [-52, -16, 0x54d8cc],
            [50, -15, 0x6df0d5],
            [-30, 55, 0x2e9e9e],
            [32, 55, 0x318f94],
            [0, 17, 0x42bfc0]

        ];

        pieces.forEach(([x, y, color]) => {

            const polygon = this.add.polygon(

                x,
                y,

                [
                    0, -70,
                    36, -8,
                    22, 50,
                    -25, 47,
                    -38, -8
                ],

                color

            );

            polygon.setStrokeStyle(

                2,
                0xc2fff4,
                0.65

            );

            this.group.add(polygon);

            this.parts.push(polygon);

        });

        this.group
            .setSize(230, 245)
            .setInteractive({
                useHandCursor: true
            });

    }

    /* ==========================================================
       INPUT
    ========================================================== */

    registerInput() {

        this.group.on(
            "pointerdown",
            pointer => this.mine(pointer)
        );

    }

    /* ==========================================================
       ANIMATIONS
    ========================================================== */

    createAnimations() {

        this.tweens.add({

            targets: this.group,

            y: "+=7",

            duration: 1800,

            ease: "Sine.inOut",

            yoyo: true,

            repeat: -1

        });

        this.tweens.add({

            targets: this.glow,

            scale: 1.25,

            alpha: 0.25,

            duration: 1200,

            yoyo: true,

            repeat: -1

        });

    }

    /* ==========================================================
       CHANGE CRYSTAL COLOR
    ========================================================== */

    setMine(color) {

        const hex = Phaser.Display.Color
            .HexStringToColor(color)
            .color;

        this.parts.forEach((part, index) => {

            part.setFillStyle(

                hex,

                index === 0
                    ? 0.95
                    : 0.72

            );

        });

    }

    setPickActive(pickId) {

        if (!this.miner) return;

        const colors = {
            bronze: 0xd89562,
            silver: 0xcadce8,
            gold: 0xffd45f,
            platinum: 0x96e9df,
            diamond: 0x7fd6ff,
            titanium: 0xb49aff
        };

        const active = Boolean(pickId);
        this.miner.setVisible(active);

        if (active) {
            this.miner.setTint(colors[pickId] || 0xffffff);
            this.minerSwing.play();
        } else {
            this.minerSwing.pause();
        }

    }

    /* ==========================================================
       CLICK
    ========================================================== */

    mine(pointer) {
        // Se llama directamente desde main.js: no depende del ciclo de inicio de Phaser.
        window.geoMine?.(pointer);

        this.hitAnimation();

    }

    hitAnimation() {

        this.tweens.add({

            targets: this.group,

            scaleX: 0.94,
            scaleY: 0.94,

            duration: 45,

            yoyo: true

        });

    }

    /* ==========================================================
       FLOATING TEXT
    ========================================================== */

    float(value, pointer, superior = false) {

        const x = pointer?.x ?? this.scale.width / 2;
        const y = pointer?.y ?? this.scale.height / 2;

        const label = this.add.text(

            x,
            y,

            `${superior ? "SUPER " : ""}+${value}`,

            {

                fontFamily: "Arial",

                fontSize: "20px",

                fontStyle: "bold",

                color: superior
                    ? "#ffdb61"
                    : "#d7fff7",

                stroke: "#174955",

                strokeThickness: 4

            }

        );

        label.setOrigin(0.5);

        this.tweens.add({

            targets: label,

            y: y - 46,

            alpha: 0,

            duration: 550,

            ease: "Cubic.out",

            onComplete: () => label.destroy()

        });

    }

}

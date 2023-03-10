var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update,
    }
};

var user;
var pumkin;
var hantu;
var rumput;
var api;
var arah;
var point = 0;
var gameOver = false;
var pointText;

var game = new Phaser.Game(config);

function preload() {
    this.load.image('angker', 'assets/img/angker.jpg');
    this.load.image('rumput', 'assets/img/tanah.png');
    this.load.image('api', 'assets/img/api.png');
    this.load.image('pumkin', 'assets/img/pumkin1.png');
    this.load.image('hantu', 'assets/uiii.png');
    this.load.spritesheet('dude', 'assets/img/reika.png', { frameWidth: 155, frameHeight: 158 });
}

function create() {
    //  A simple background for our game
    this.add.image(400, 300, 'angker');

    //  The rumput group contains the ground and the 2 ledges we can jump on
    rumput = this.physics.add.staticGroup();
    api = this.physics.add.staticGroup();

    //  Here we create the ground.
    //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
    api.create(650, 568, 'api').setScale(1).refreshBody();
    rumput.create(50, 568, 'rumput').setScale(1).refreshBody();
    rumput.create(150, 568, 'rumput').setScale(1).refreshBody();
    rumput.create(250, 568, 'rumput').setScale(1).refreshBody();
    rumput.create(350, 568, 'rumput').setScale(1).refreshBody();
    rumput.create(450, 568, 'rumput').setScale(1).refreshBody();
    rumput.create(550, 568, 'rumput').setScale(1).refreshBody();
    rumput.create(750, 568, 'rumput').setScale(1).refreshBody();

    //  Now let's create some ledges
    rumput.create(600, 400, 'rumput');
    rumput.create(50, 250, 'rumput');
    rumput.create(250, 300, 'rumput');
    rumput.create(750, 220, 'rumput');

    // The user and its settings
    user = this.physics.add.sprite(100, 450, 'dude');
    user.setScale(0.6)

    //  user physics properties. Give the little guy a slight bounce.
    user.setBounce(0.2);
    user.setCollideWorldBounds(true);

    //  Our user animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 0 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //  Input Events
    arah = this.input.keyboard.createCursorKeys();

    //  Some pumkin to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
    pumkin = this.physics.add.group({
        key: 'pumkin',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });


    pumkin.children.iterate(function (child) {

        //  Give each star a slightly different bounce
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });

    hantu = this.physics.add.group();
    api = this.physics.add.group();

    //  The point
    pointText = this.add.text(16, 16, 'point: 0', { fontSize: '32px', fill: 'white' });

    //  Collide the user and the pumkin with the rumput
    this.physics.add.collider(user, rumput);
    this.physics.add.collider(pumkin, rumput);
    this.physics.add.collider(hantu, rumput);
    this.physics.add.collider(api, rumput);

    //  Checks to see if the user overlaps with any of the pumkin, if he does call the collectStar function
    this.physics.add.overlap(user, pumkin, collectStar, null, this);

    this.physics.add.collider(user, hantu, hithantu, null, this);
    this.physics.add.overlap(user, api, jurang, null, this);
}

function update() {
    if (gameOver) {
        alert('game over');
        gameOver = false;
        newgame();
        // return;
    }
    if (arah.left.isDown) {
        user.setVelocityX(-160);

        user.anims.play('left', true);
    }
    else if (arah.right.isDown) {
        user.setVelocityX(160);

        user.anims.play('right', true);
    }
    else {
        user.setVelocityX(0);

        user.anims.play('turn');
    }

    if (arah.up.isDown && user.body.touching.down) {
        user.setVelocityY(-330);
    }
}

function newgame() {
    pumkin.remove();
    user = this.physics.add.sprite(100, 450, 'dude');

    //  user physics properties. Give the little guy a slight bounce.
    user.setBounce(0.2);
    user.setCollideWorldBounds(true);
    pumkin.children.iterate(function (child) {

        child.enableBody(true, child.x, 0, true, true);

    });

}

function collectStar(user, star) {
    star.disableBody(true, true);

    //  Add and update the point
    point += 1;
    pointText.setText('point: ' + point);

    // var x = (user.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    if (pumkin.countActive(true) === 0) {
        //  A new batch of pumkin to collect
        pumkin.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);

        });

        var x = (user.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
        var hant = hantu.create(x, 10, 'hantu');
        hant.setBounce(1);
        hant.setCollideWorldBounds(true);
        hant.setVelocity(Phaser.Math.Between(-200, 200), 20);
        hant.allowGravity = false;

    }
}

function hithantu(user, hantu) {
    this.physics.pause();

    user.setTint(0xff0000);

    user.anims.play('turn');

    gameOver = true;
}


function jurang(user, api) {
    this.physics.pause();

    user.setTint(0xff0000);

    user.anims.play('turn');

    gameOver = true;
}

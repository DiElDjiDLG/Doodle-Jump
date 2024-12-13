//board
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

//doodler
let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth / 2 - doodlerWidth / 2;
let doodlerY = boardHeight * 7 / 8 - doodlerHeight;
let doodlerRightImg;
let doodlerLeftImg;

let doodler = {
    img: null,
    x: doodlerX,
    y: doodlerY,
    width: doodlerWidth,
    height: doodlerHeight
}

//physics
let velocityX = 0;
let velocityY = 0; //doodler jump speed
let initialVelocityY = -8; //starting velocity y
let gravity = 0.3;

//platforms
let platformArr = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

let brokenPlatformImg;

let score = 0;
let maxScore = 0;
let gameOver = false;
let brokenScore = 3000;

window.onload = function () {
    board = document.getElementById('board');
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext('2d'); // drawing on the board

    //draw doodler
    /*context.fillStyle = "green";
    context.fillRect(doodler.x, doodler.y, doodler.width, doodler.height);
    */ 

    //load images
    doodlerRightImg = new Image();
    doodlerRightImg.src = './doodler-right.png';
    doodler.img = doodlerRightImg;
    doodlerRightImg.onload = function () {
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    }
    doodlerLeftImg = new Image();
    doodlerLeftImg.src = './doodler-left.png';

    platformImg = new Image();
    platformImg.src = "./platform.png";

    brokenPlatformImg = new Image();
    brokenPlatformImg.src = './platform-broken.png';

    velocityY = initialVelocityY;
    placePlatforms();
    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler)
}

const update = () => {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    //doodler
    doodler.x += velocityX;
    if (doodler.x > boardWidth) {
        doodler.x = 0;
    } else if (doodler.x + doodler.width < 0) {
        doodler.x = boardWidth;
    }

    velocityY += gravity;
    doodler.y += velocityY
    if (doodler.y > board.height) {
        gameOver = true;
    }
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    //platforms
    for (let i = 0; i < platformArr.length; i++) {
        let platform = platformArr[i];
        if (velocityY < 0 && doodler.y < boardHeight * 3 / 4) {
            platform.y -= initialVelocityY; //slice platform down
        }
        if (detectCollision(doodler, platform) && velocityY >= 0) {
            velocityY = initialVelocityY;
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    //clear platforms and add new platform
    while (platformArr.length > 0 && platformArr[0].y >= boardHeight) {
        platformArr.shift();
        newPlatform();
    }

    //score
    updateScore();
    context.fillStyle = "black";
    context.font = "16px sans-serif";
    context.fillText(score, 5, 20);

    if (gameOver) {
        context.fillText("Game Over: Press 'Space' to restart", boardWidth / 7, boardHeight * 7 / 8)
    }
}

const moveDoodler = (e) => {
    if (e.code == 'ArrowRight' || e.code == 'KeyD') {
        velocityX = 4;
        doodler.img = doodlerRightImg;
    } else if (e.code == 'ArrowLeft' || e.code == 'KeyA') {
        velocityX = -4;
        doodler.img = doodlerLeftImg;
    }
    else if (e.code == "Space" && gameOver) {
        //reset
        doodler = {
            img: doodlerRightImg,
            x: doodlerX,
            y: doodlerY,
            width: doodlerWidth,
            height: doodlerHeight
        }
        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0;
        maxScore = 0;
        gameOver = false;
        placePlatforms();
    }
}

const placePlatforms = () => {
    platformArr = [];

    //starting platforms
    let platform = {
        img: platformImg,
        x: boardWidth / 2,
        y: boardHeight - 50,
        width: platformWidth,
        height: platformHeight
    }

    platformArr.push(platform);

    /*platform = {
        img: platformImg,
        x: boardWidth/2,
        y: boardHeight - 150,
        width: platformWidth,
        height: platformHeight
    } 

    platformArr.push(platform);*/

    for (let i = 0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * boardWidth * 3 / 4);
        let platform = {
            img: platformImg,
            x: randomX,
            y: boardHeight - 75 * i - 150,
            width: platformWidth,
            height: platformHeight
        }
        platformArr.push(platform);
    }
}

const newBrokenPlatform = () => {
    let randomX = Math.floor(Math.random() * boardWidth * 3 / 4);
    return {
        img: brokenPlatformImg,
        x: randomX,
        y: -platformHeight,
        width: platformWidth,
        height: platformHeight
    }
}

const newPlatform = () => {
    let randomX = Math.floor(Math.random() * boardWidth * 3 / 4);
    let platform;

    // If score has reached or exceeded the brokenScore threshold, generate a broken platform
    if (score >= brokenScore) {
        platform = newBrokenPlatform();
        brokenScore += 3000;  // Increment brokenScore so that another broken platform is created later
    } else {
        platform = {
            img: platformImg,
            x: randomX,
            y: -platformHeight,
            width: platformWidth,
            height: platformHeight
        }
    }

    platformArr.push(platform);
}

const detectCollision = (a, b) => {
    return a.x < b.x + b.width && // a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x && // a's top right corner passes b's top left corner
        a.y < b.y + b.height && //a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y; //a's bottom left corner passes b's top left corner
}

const updateScore = () => {
    let points = Math.floor(50 * Math.random());
    if (velocityY < 0) {
        maxScore += points;
        if (score < maxScore) {
            score = maxScore;
        }
    }
    else if (velocityY >= 0) {
        maxScore -= points;
    }
}
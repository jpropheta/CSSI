
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const attackerSpacing = 10;  // Adjusted from 40 to 10
const attackerSpeed = 07; // You can adjust this value to your liking
let spacecraftImage = new Image();
spacecraftImage.src = 'space.png'; 
canvas.width = 800; // Set the canvas width
canvas.height = 600; // Set the canvas height


let images = []; // array to hold the image objects
for (let i = 0; i < 15; i++) {
    images[i] = new Image();
    images[i].src = `act${i}.png`; // change to actual path
    images[i].onload = function() {
        // You might keep track of how many images have loaded here,
        // and only start the game/drawing loop once all have loaded.
    };
}


// Settings and constants
const attackerColumnCount = 5;
const attackerWidth = 40;
const attackerHeight = 30;


const attackerRowCount = 5;
const playerWidth = 40;
const playerHeight = 20;
const playerSpeed = 25;
const bulletSpeed = 7;
const bulletWidth = 3;
const bulletHeight = 10;
const attackerFireRate = 0.10;
const maxAttackerBullets = 5;



// Game variables
let shouldMoveDownAttackers = false;
let playerX = (canvas.width - playerWidth) / 2;
let playerY = canvas.height - playerHeight;  // 'let' instead of 'const'
playerY -= 30;  // Adjust this value to move the player up by the desired amount.

let bulletX = playerX + playerWidth / 2 - bulletWidth / 2;
let bulletY = playerY;
let bulletFired = false;


let attackersDirection = 1;
let moveDown = false;
let lives = 3;
let gamePaused = false;
let attackerBulletCooldown = 0;

let bulletsFired = 0;
let canShoot = true;






let playerBullets = [];
let attackerBullets = [];
let protectionBlocks = [];

const attackerCharacters = [" ? "];
const spacecraftCharacter = "¯\\_(ツ)_/¯";


const protectionBlockWidth = 40;
const protectionBlockHeight = 20;
const protectionBlockRowCount = 1;
const protectionBlockColumnCount = 7;
const protectionBlockSpacing = 30;

for (let c = 0; c < protectionBlockColumnCount; c++) {
    protectionBlocks[c] = [];
    for (let r = 0; r < protectionBlockRowCount; r++) {
        protectionBlocks[c][r] = { x: 0, y: 0, strength: 3 };
    }
}


let score = 0; // Initialize score


function createAttackerBullet(attackerX, attackerY) {
    attackerBullets.push({ x: attackerX + attackerWidth / 2, y: attackerY + attackerHeight, width: 3, height: 10 });
}

function moveAttackerBullets() {
    for (let i = 0; i < attackerBullets.length; i++) {
        attackerBullets[i].y += bulletSpeed;

        if (pointInRectangle(attackerBullets[i].x, attackerBullets[i].y, playerX, playerY, playerWidth, playerHeight)) {
            attackerBullets.splice(i, 1);
            i--;
            lives--;
            showBoomAnimation(playerX, playerY, () => {
                if (lives <= 0) {
                    alert("Game Over!");
                    document.location.reload();
                }
            });
            return;
        }

        if (attackerBullets[i].y > canvas.height) {
            attackerBullets.splice(i, 1);
            i--;
        }
    }
}



function drawProtectionBlocks() {
    for (let c = 0; c < protectionBlockColumnCount; c++) {
        for (let r = 0; r < protectionBlockRowCount; r++) {
            const block = protectionBlocks[c][r];
            if (block.strength > 0) {
                ctx.fillStyle = `rgb(${255 - block.strength * 40}, ${255 - block.strength * 40}, ${255 - block.strength * 40})`;
                ctx.fillRect(
                    c * (protectionBlockWidth + protectionBlockSpacing) + protectionBlockSpacing, 
                    canvas.height - 100 + r * protectionBlockHeight + r * protectionBlockSpacing, 
                    protectionBlockWidth, 
                    protectionBlockHeight
                );
            }
        }
    }
}




function allImagesAreLoaded(images) {
    return images.every(img => img.complete);
}

function drawScore() {
    ctx.font = "24px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Score: " + score, 10, 25); // Change coordinates as you see fit
}


function drawAttackerBullets() {
    ctx.fillStyle = "white";
    for (let i = 0; i < attackerBullets.length; i++) {
        ctx.fillRect(attackerBullets[i].x - attackerBullets[i].width / 2, attackerBullets[i].y, attackerBullets[i].width, attackerBullets[i].height);
    }
}

function attackersShoot() {
    for (let c = 0; c < attackerColumnCount; c++) {
        for (let r = 0; r < attackerRowCount; r++) {
            const attacker = attackers[c][r];
            if (attacker.alive && Math.random() < attackerFireRate && attackerBullets.length < maxAttackerBullets && !gamePaused) {
                createAttackerBullet(attacker.x, attacker.y);
            }
        }
    }
}

function moveAttackers() {
    for (let c = 0; c < attackerColumnCount; c++) {
        for (let r = 0; r < attackerRowCount; r++) {
            const attacker = attackers[c][r];
            if (attacker.alive) {
                attacker.x += attackersDirection * attackerSpeed;
                if (attacker.x + attackerWidth > canvas.width || attacker.x < 0) {
                    shouldMoveDownAttackers = true;
                }
            }
        }
    }
    if (shouldMoveDownAttackers) {
        for (let c = 0; c < attackerColumnCount; c++) {
            for (let r = 0; r < attackerRowCount; r++) {
                const attacker = attackers[c][r];
                attacker.y += attackerSpacing;
            }
        }
        attackersDirection = -attackersDirection;
        shouldMoveDownAttackers = false;
    }
}


document.addEventListener("keyup", (e) => {
    // TODO: Handle keyup events if necessary
});

// ... [previous code declarations and functions here]

function pointInRectangle(px, py, rx, ry, rw, rh) {
    return (px > rx && px < rx + rw && py > ry && py < ry + rh);
}

function showBoomAnimation(x, y, callback) {
    // A simple "explosion" effect that just flashes a red rectangle
    ctx.fillStyle = "red";
    ctx.fillRect(x, y, playerWidth, playerHeight);
    setTimeout(() => {
        ctx.clearRect(x, y, playerWidth, playerHeight);
        callback();
    }, 200);
}

function drawAttackers(ctx, attackers, images) {
    for (let c = 0; c < attackerColumnCount; c++) {
        for (let r = 0; r < attackerRowCount; r++) {
            let attacker = attackers[c][r];
            if (attacker.alive) {
                // Check if the image object is defined and complete (fully loaded)
                if (images[attacker.imageIndex] && images[attacker.imageIndex].complete) {
                    ctx.drawImage(
                        images[attacker.imageIndex], // make sure this is an Image object
                        attacker.x,
                        attacker.y,
                        attackerWidth,
                        attackerHeight
                    );
                }
            }
        }
    }
}

function drawPlayer() {
    ctx.drawImage(spacecraftImage, playerX, playerY, playerWidth, playerHeight);
}


function drawPlayerBullet() {
    ctx.fillStyle = "white";
    for (let i = 0; i < playerBullets.length; i++) {
        let bullet = playerBullets[i];
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }
}


const attackers = [];

// Populate the attackers array with valid attacker objects
for (let c = 0; c < attackerColumnCount; c++) {
    attackers[c] = [];
    for (let r = 0; r < attackerRowCount; r++) {
        attackers[c][r] = {
            x: c * (attackerWidth + attackerSpacing), // Adjust this as needed
            y: r * (attackerHeight + attackerSpacing), // Adjust this as needed
            alive: true, // Set the initial status of the attacker
            imageIndex: Math.floor(Math.random() * images.length), // Assign a random image index
            // Add other properties as needed for your game
        };
    }
}

function startGame() {
    playerX = canvas.width / 2 - playerWidth / 2;
    // Removed re-declaration of playerY
    attackerBullets = [];
    playerBullets = [];
    lives = 3;
    requestAnimationFrame(draw);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if(allImagesAreLoaded(images)) { 
        drawAttackers(ctx, attackers, images);
        drawPlayer();
        drawPlayerBullet();
        drawAttackerBullets();
        moveAttackers();
        movePlayerBullets();
        moveAttackerBullets();
        attackersShoot();
        //drawProtectionBlocks(); // Ensure protection blocks are drawn in every frame
        drawScore(); // Draw the current score
        requestAnimationFrame(draw);
    }
}




document.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "ArrowRight":
            if (playerX + playerWidth < canvas.width) {
                playerX += playerSpeed;
            }
            break;
        case "ArrowLeft":
            if (playerX > 0) {
                playerX -= playerSpeed;
            }
            break;
        case " ":
            if (canShoot) { // Check if spacecraft can shoot
                playerBullets.push({ 
                    x: playerX + playerWidth / 2 - bulletWidth / 2, 
                    y: playerY - bulletHeight, 
                    width: bulletWidth, 
                    height: bulletHeight 
                });
                canShoot = false; // Disable shooting until a bullet goes out of bounds or hits an enemy
            }
            break;
    }
});




  
function movePlayerBullets() {
    for (let i = 0; i < playerBullets.length; i++) {
        let bullet = playerBullets[i];
        bullet.y -= bulletSpeed;

        if (bullet.y < 0) {
            playerBullets.splice(i, 1);
            i--;
            canShoot = true; // Enable shooting since the bullet is out of bounds
            continue;
        }

        // Check for bullet hitting any attacker
        for (let c = 0; c < attackerColumnCount; c++) {
            for (let r = 0; r < attackerRowCount; r++) {
                let attacker = attackers[c][r];
                // Only check for collision if attacker is alive
                if (attacker.alive) {
                    if (bullet.x > attacker.x && bullet.x < attacker.x + attackerWidth && bullet.y > attacker.y && bullet.y < attacker.y + attackerHeight) {
                        // Collision detected
                        attacker.alive = false; // Set the attacker's status to inactive
                        playerBullets.splice(i, 1); // Remove this bullet from the array
                        i--; // Decrement i since we removed an element from the array
                        score += 100; // Increase the score
                        canShoot = true; // Enable shooting since the bullet hit an enemy
                        break; // No need to check other attackers since bullet is destroyed
                    }
                }
            }
        }
    }
}



function allImagesAreLoaded(imagesArray) {
    for(let img of imagesArray) {
        if(!img.complete) {
            return false;
        }
    }
    return true;
}



// Initialize the game
startGame();

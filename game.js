class SpaceInvaders {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.livesElement = document.getElementById('lives');
        this.gameOverElement = document.getElementById('game-over');
        this.finalScoreElement = document.getElementById('final-score');
        this.restartButton = document.getElementById('restart-button');

        this.gameWidth = this.canvas.width;
        this.gameHeight = this.canvas.height;

        this.init();
        this.bindEvents();
    }

    init() {
        this.score = 0;
        this.lives = 3;
        this.gameRunning = true;
        this.keys = {};

        this.player = {
            x: this.gameWidth / 2 - 25,
            y: this.gameHeight - 50,
            width: 50,
            height: 30,
            speed: 5,
            color: '#00ff00'
        };

        this.bullets = [];
        this.invaders = [];
        this.invaderBullets = [];
        
        this.invaderDirection = 1;
        this.invaderDropDistance = 20;
        this.invaderSpeed = 1;
        this.invaderShootChance = 0.001;

        this.createInvaders();
        this.gameLoop();
    }

    createInvaders() {
        const rows = 5;
        const cols = 10;
        const invaderWidth = 40;
        const invaderHeight = 30;
        const spacing = 50;
        const startX = 50;
        const startY = 50;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.invaders.push({
                    x: startX + col * spacing,
                    y: startY + row * spacing,
                    width: invaderWidth,
                    height: invaderHeight,
                    color: row < 2 ? '#ff0000' : row < 4 ? '#ffff00' : '#00ffff',
                    points: row < 2 ? 30 : row < 4 ? 20 : 10
                });
            }
        }
    }

    bindEvents() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        this.restartButton.addEventListener('click', () => {
            this.restart();
        });
    }

    update() {
        if (!this.gameRunning) return;

        this.updatePlayer();
        this.updateBullets();
        this.updateInvaders();
        this.updateInvaderBullets();
        this.checkCollisions();
        this.checkGameConditions();
    }

    updatePlayer() {
        if (this.keys['ArrowLeft'] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['ArrowRight'] && this.player.x < this.gameWidth - this.player.width) {
            this.player.x += this.player.speed;
        }
        if (this.keys['Space']) {
            this.shoot();
        }
    }

    shoot() {
        if (this.bullets.length < 3) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 2,
                y: this.player.y,
                width: 4,
                height: 10,
                speed: 7,
                color: '#ffffff'
            });
        }
    }

    updateBullets() {
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > 0;
        });
    }

    updateInvaders() {
        let shouldDrop = false;
        
        for (let invader of this.invaders) {
            invader.x += this.invaderSpeed * this.invaderDirection;
            
            if (invader.x <= 0 || invader.x >= this.gameWidth - invader.width) {
                shouldDrop = true;
            }

            if (Math.random() < this.invaderShootChance) {
                this.invaderBullets.push({
                    x: invader.x + invader.width / 2 - 2,
                    y: invader.y + invader.height,
                    width: 4,
                    height: 10,
                    speed: 3,
                    color: '#ff0000'
                });
            }
        }

        if (shouldDrop) {
            this.invaderDirection *= -1;
            for (let invader of this.invaders) {
                invader.y += this.invaderDropDistance;
            }
            this.invaderSpeed += 0.1;
        }
    }

    updateInvaderBullets() {
        this.invaderBullets = this.invaderBullets.filter(bullet => {
            bullet.y += bullet.speed;
            return bullet.y < this.gameHeight;
        });
    }

    checkCollisions() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.invaders.length - 1; j >= 0; j--) {
                if (this.isColliding(this.bullets[i], this.invaders[j])) {
                    this.score += this.invaders[j].points;
                    this.bullets.splice(i, 1);
                    this.invaders.splice(j, 1);
                    break;
                }
            }
        }

        for (let i = this.invaderBullets.length - 1; i >= 0; i--) {
            if (this.isColliding(this.invaderBullets[i], this.player)) {
                this.invaderBullets.splice(i, 1);
                this.lives--;
                if (this.lives <= 0) {
                    this.gameOver();
                }
                break;
            }
        }

        for (let invader of this.invaders) {
            if (invader.y + invader.height >= this.player.y) {
                this.gameOver();
                break;
            }
        }
    }

    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }

    checkGameConditions() {
        if (this.invaders.length === 0) {
            this.createInvaders();
            this.invaderSpeed += 0.5;
        }
    }

    gameOver() {
        this.gameRunning = false;
        this.finalScoreElement.textContent = this.score;
        this.gameOverElement.classList.remove('hidden');
    }

    restart() {
        this.gameOverElement.classList.add('hidden');
        this.init();
    }

    render() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.gameWidth, this.gameHeight);

        this.ctx.fillStyle = this.player.color;
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);

        for (let bullet of this.bullets) {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }

        for (let bullet of this.invaderBullets) {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }

        for (let invader of this.invaders) {
            this.ctx.fillStyle = invader.color;
            this.ctx.fillRect(invader.x, invader.y, invader.width, invader.height);
        }

        this.scoreElement.textContent = `スコア: ${this.score}`;
        this.livesElement.textContent = `残機: ${this.lives}`;
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

window.addEventListener('load', () => {
    new SpaceInvaders();
});
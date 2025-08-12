class SpaceInvaders {
    static WAVE_FREQUENCY = 0.5;
    static WAVE_AMPLITUDE = 20;

    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.stageElement = document.getElementById('stage');
        this.hpElement = document.getElementById('hp');
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
        this.stage = 1;
        this.hp = 5;
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
        
        this.stageConfigs = {
            1: { rows: 5, cols: 10, formations: 'standard' },
            2: { rows: 6, cols: 8, formations: 'diamond' },
            3: { rows: 7, cols: 12, formations: 'wave' }
        };
        
        this.destroyedInvaders = new Set();

        this.createInvaders();
        this.gameLoop();
    }

    getOriginalInvaderIndex(currentIndex) {
        return this.invaders[currentIndex].originalIndex || currentIndex;
    }
    
    createInvaders() {
        const config = this.stageConfigs[this.stage] || this.stageConfigs[1];
        const invaderWidth = 40;
        const invaderHeight = 30;
        const spacing = 50;
        
        this.invaders = [];
        this.originalInvaderCount = 0;
        
        switch (config.formations) {
            case 'standard':
                this.createStandardFormation(config.rows, config.cols, invaderWidth, invaderHeight, spacing);
                break;
            case 'diamond':
                this.createDiamondFormation(config.rows, config.cols, invaderWidth, invaderHeight, spacing);
                break;
            case 'wave':
                this.createWaveFormation(config.rows, config.cols, invaderWidth, invaderHeight, spacing);
                break;
        }
    }
    
    createStandardFormation(rows, cols, width, height, spacing) {
        const startX = 50;
        const startY = 50;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const originalIndex = this.originalInvaderCount++;
                const invaderType = row < 2 ? 'heavy' : row < 4 ? 'medium' : 'light';
                const color = row < 2 ? '#ff0000' : row < 4 ? '#ff8000' : '#ffff00';
                this.invaders.push({
                    x: startX + col * spacing,
                    y: startY + row * spacing,
                    width: width,
                    height: height,
                    color: color,
                    points: row < 2 ? 30 : row < 4 ? 20 : 10,
                    originalIndex: originalIndex,
                    type: invaderType,
                    bulletPower: row < 2 ? 4 : row < 4 ? 3 : 2,
                    bulletSpeed: row < 2 ? 6 : row < 4 ? 5 : 4,
                    shootInterval: row < 2 ? 0.004 : row < 4 ? 0.003 : 0.002,
                    maxHp: row < 2 ? 3 : row < 4 ? 2 : 1,
                    hp: row < 2 ? 3 : row < 4 ? 2 : 1
                });
            }
        }
    }
    
    createDiamondFormation(rows, cols, width, height, spacing) {
        const centerX = this.gameWidth / 2;
        const startY = 50;
        
        for (let row = 0; row < rows; row++) {
            const rowWidth = Math.min(row + 1, rows - row) * 2;
            for (let col = 0; col < rowWidth && col < cols; col++) {
                const x = centerX - (rowWidth * spacing / 2) + col * spacing;
                if (x > 0 && x < this.gameWidth - width) {
                    const originalIndex = this.originalInvaderCount++;
                    const invaderType = row < 2 ? 'elite' : row < 4 ? 'guard' : 'scout';
                    const color = row < 2 ? '#ff00ff' : row < 4 ? '#00ff00' : '#00ffff';
                    this.invaders.push({
                        x: x,
                        y: startY + row * spacing,
                        width: width,
                        height: height,
                        color: color,
                        points: row < 2 ? 50 : row < 4 ? 30 : 20,
                        originalIndex: originalIndex,
                        type: invaderType,
                        bulletPower: row < 2 ? 5 : row < 4 ? 3 : 2,
                        bulletSpeed: row < 2 ? 7 : row < 4 ? 5 : 4,
                        shootInterval: row < 2 ? 0.005 : row < 4 ? 0.003 : 0.002,
                        maxHp: row < 2 ? 4 : row < 4 ? 2 : 1,
                        hp: row < 2 ? 4 : row < 4 ? 2 : 1
                    });
                }
            }
        }
    }
    
    createWaveFormation(rows, cols, width, height, spacing) {
        const startX = 30;
        const startY = 50;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const waveOffset = Math.sin(col * SpaceInvaders.WAVE_FREQUENCY) * SpaceInvaders.WAVE_AMPLITUDE;
                const x = startX + col * (spacing * 0.8);
                if (x > 0 && x < this.gameWidth - width) {
                    const originalIndex = this.originalInvaderCount++;
                    const invaderType = col % 3 === 0 ? 'bomber' : col % 3 === 1 ? 'sniper' : 'rapid';
                    const color = col % 3 === 0 ? '#ff4444' : col % 3 === 1 ? '#4444ff' : '#ff0088';
                    this.invaders.push({
                        x: x,
                        y: startY + row * spacing + waveOffset,
                        width: width,
                        height: height,
                        color: color,
                        points: col % 3 === 0 ? 40 : col % 3 === 1 ? 30 : 25,
                        originalIndex: originalIndex,
                        type: invaderType,
                        bulletPower: col % 3 === 0 ? 6 : col % 3 === 1 ? 3 : 2,
                        bulletSpeed: col % 3 === 0 ? 4 : col % 3 === 1 ? 8 : 7,
                        shootInterval: col % 3 === 0 ? 0.003 : col % 3 === 1 ? 0.002 : 0.006,
                        maxHp: col % 3 === 0 ? 3 : col % 3 === 1 ? 1 : 2,
                        hp: col % 3 === 0 ? 3 : col % 3 === 1 ? 1 : 2
                    });
                }
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
                color: '#00ff00'
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

            const shootChance = invader.shootInterval || this.invaderShootChance;
            if (Math.random() < shootChance) {
                const bulletColor = this.getBulletColor(invader.type, invader.bulletPower);
                const bulletPower = invader.bulletPower || 1;
                const bulletSize = Math.max(3, bulletPower * 2);
                this.invaderBullets.push({
                    x: invader.x + invader.width / 2 - bulletSize / 2,
                    y: invader.y + invader.height,
                    width: bulletSize,
                    height: bulletSize * 2,
                    speed: invader.bulletSpeed || 3,
                    color: bulletColor,
                    power: bulletPower
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

    getBulletColor(invaderType, bulletPower) {
        const colorMap = {
            'heavy': '#ff0000',
            'medium': '#ff8000',
            'light': '#ffff00',
            'elite': '#ff00ff',
            'guard': '#00ff00',
            'scout': '#00ffff',
            'bomber': '#ff4444',
            'sniper': '#4444ff',
            'rapid': '#ff0088'
        };
        
        return colorMap[invaderType] || '#ff0000';
    }

    getDamagedColor(invaderType, damageRatio) {
        const baseColors = {
            'heavy': '#ff0000',
            'medium': '#ff8000',
            'light': '#ffff00',
            'elite': '#ff00ff',
            'guard': '#00ff00',
            'scout': '#00ffff',
            'bomber': '#ff4444',
            'sniper': '#4444ff',
            'rapid': '#ff0088'
        };
        
        const baseColor = baseColors[invaderType] || '#ff0000';
        
        // ダメージを受けるほど暗くなる
        return baseColor.replace(/[0-9a-f]{2}/g, (match) => {
            const value = parseInt(match, 16);
            const newValue = Math.floor(value * damageRatio);
            return newValue.toString(16).padStart(2, '0');
        });
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
                    this.bullets.splice(i, 1);
                    
                    const invader = this.invaders[j];
                    invader.hp--;
                    
                    if (invader.hp <= 0) {
                        this.score += invader.points;
                        const originalIndex = this.getOriginalInvaderIndex(j);
                        this.destroyedInvaders.add(originalIndex);
                        this.invaders.splice(j, 1);
                    } else {
                        // ダメージを受けた時の色変化
                        const damageRatio = invader.hp / invader.maxHp;
                        invader.color = this.getDamagedColor(invader.type, damageRatio);
                    }
                    break;
                }
            }
        }

        for (let i = this.invaderBullets.length - 1; i >= 0; i--) {
            if (this.isColliding(this.invaderBullets[i], this.player)) {
                const bullet = this.invaderBullets[i];
                this.invaderBullets.splice(i, 1);
                this.hp -= bullet.power || 1;
                if (this.hp <= 0) {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.hp = 5;
                        this.resetInvaderPositions();
                    }
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

    resetInvaderPositions() {
        this.invaderBullets = [];
        this.bullets = [];
        this.createInvaders();
        
        const destroyedArray = Array.from(this.destroyedInvaders);
        for (let i = destroyedArray.length - 1; i >= 0; i--) {
            const index = destroyedArray[i];
            if (index < this.invaders.length) {
                this.invaders.splice(index, 1);
            }
        }
    }
    
    checkGameConditions() {
        if (this.invaders.length === 0) {
            this.stage++;
            if (this.stage > 3) {
                this.stage = 1;
            }
            this.hp = 5;
            this.destroyedInvaders.clear();
            this.createInvaders();
            this.invaderSpeed += 0.5;
            this.invaderShootChance += 0.0005;
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
        this.stageElement.textContent = `ステージ: ${this.stage}`;
        this.hpElement.textContent = `HP: ${this.hp}`;
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
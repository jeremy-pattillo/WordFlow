const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let game;

class Game {
    constructor() {
        this.players = [];
        this.ball = null;
        this.score = { team1: 0, team2: 0 };
        this.keys = {};
        this.gameRunning = true;
        this.gameWon = false;
        this.recentShots = [];
        
        console.log('Game initializing...');
        this.init();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    init() {
        console.log('Initializing game objects...');
        
        this.ball = new Ball(400, 300);
        
        this.players = [
            new Player(150, 200, 1, true, '#0066ff'),   // BYU player (you)
            new Player(100, 300, 1, false, '#0066ff'),  // BYU AI
            new Player(200, 400, 1, false, '#0066ff'),  // BYU AI
            new Player(650, 200, 2, false, '#ff0000'),  // Utah AI
            new Player(700, 300, 2, false, '#ff0000'),  // Utah AI
            new Player(600, 400, 2, false, '#ff0000')   // Utah AI
        ];
        
        this.players[0].hasBall = true;
        this.ball.holder = this.players[0];
        
        console.log('Players created:', this.players.length);
        console.log('Ball created at:', this.ball.x, this.ball.y);
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            e.preventDefault();
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            e.preventDefault();
        });
    }
    
    update() {
        if (!this.gameRunning) return;
        
        if (this.gameWon) {
            if (this.keys['KeyR']) {
                this.restart();
            }
            return;
        }
        
        this.handleInput();
        this.updatePlayers();
        this.updateBall();
        this.checkCollisions();
        this.updateAI();
    }
    
    handleInput() {
        const player = this.players[0];
        
        let moved = false;
        if (this.keys['ArrowUp']) {
            player.move(0, -1);
            player.lastMoveDirection = { x: 0, y: -1 };
            moved = true;
        }
        if (this.keys['ArrowDown']) {
            player.move(0, 1);
            player.lastMoveDirection = { x: 0, y: 1 };
            moved = true;
        }
        if (this.keys['ArrowLeft']) {
            player.move(-1, 0);
            player.facing = -1;
            player.lastMoveDirection = { x: -1, y: 0 };
            moved = true;
        }
        if (this.keys['ArrowRight']) {
            player.move(1, 0);
            player.facing = 1;
            player.lastMoveDirection = { x: 1, y: 0 };
            moved = true;
        }
        
        if (!moved) {
            player.lastMoveDirection = { x: 0, y: 0 };
        }
        
        if (this.keys['Space']) {
            if (player.hasBall) {
                this.shoot(player);
            } else {
                this.attemptSteal(player);
            }
            this.keys['Space'] = false;
        }
        if (this.keys['ShiftLeft']) {
            if (player.hasBall) {
                this.pass(player);
            } else {
                this.attemptBlock(player);
            }
            this.keys['ShiftLeft'] = false;
        }
    }
    
    updatePlayers() {
        this.players.forEach(player => {
            player.update();
        });
    }
    
    updateBall() {
        this.ball.update();
        
        if (this.ball.isShot && !this.ball.holder && !this.gameWon) {
            if (this.checkShotSuccess()) {
                if (this.ball.shooter.team === 1) {
                    this.score.team1 += 1;
                } else {
                    this.score.team2 += 1;
                }
                this.updateScore();
                this.checkWinCondition();
                if (!this.gameWon) {
                    this.resetAfterScore();
                }
            } else if (this.ball.y > canvas.height - 50) {
                this.ball.isShot = false;
                this.ball.vx = 0;
                this.ball.vy = 0;
            }
        }
    }
    
    shoot(player) {
        if (!player.hasBall) return;
        
        const nearestDefender = this.getNearestDefender(player);
        const distance = nearestDefender ? this.getDistance(player, nearestDefender) : 1000;
        
        const shotInfo = {
            time: Date.now(),
            shooter: player,
            x: player.x,
            y: player.y
        };
        this.recentShots.push(shotInfo);
        
        this.ball.shoot(player, distance);
        player.hasBall = false;
        player.isJumping = true;
        player.jumpStartTime = Date.now();
        this.ball.holder = null;
        
        setTimeout(() => {
            this.recentShots = this.recentShots.filter(shot => shot.time !== shotInfo.time);
        }, 500);
    }
    
    pass(player) {
        if (!player.hasBall) return;
        
        const teammate = this.getNearestTeammate(player);
        if (!teammate) return;
        
        const interceptor = this.checkPassInterception(player, teammate);
        
        if (interceptor) {
            this.ball.holder = interceptor;
            interceptor.hasBall = true;
            this.ball.x = interceptor.x;
            this.ball.y = interceptor.y;
        } else {
            this.ball.holder = teammate;
            teammate.hasBall = true;
            this.ball.x = teammate.x;
            this.ball.y = teammate.y;
        }
        
        player.hasBall = false;
    }
    
    getNearestTeammate(player) {
        let nearest = null;
        let minDistance = Infinity;
        
        this.players.forEach(p => {
            if (p.team === player.team && p !== player) {
                const dx = p.x - player.x;
                const dy = p.y - player.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (player.facing === 1 && p.x > player.x && distance < minDistance) {
                    nearest = p;
                    minDistance = distance;
                } else if (player.facing === -1 && p.x < player.x && distance < minDistance) {
                    nearest = p;
                    minDistance = distance;
                }
            }
        });
        
        return nearest;
    }
    
    checkPassInterception(passer, receiver) {
        const defenders = this.players.filter(p => p.team !== passer.team);
        
        for (let defender of defenders) {
            const distToLine = this.pointToLineDistance(defender, passer, receiver);
            if (distToLine < 30) {
                return defender;
            }
        }
        return null;
    }
    
    pointToLineDistance(point, lineStart, lineEnd) {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) return Math.sqrt(A * A + B * B);
        
        let param = dot / lenSq;
        param = Math.max(0, Math.min(1, param));
        
        const xx = lineStart.x + param * C;
        const yy = lineStart.y + param * D;
        
        const dx = point.x - xx;
        const dy = point.y - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    getNearestDefender(player) {
        let nearest = null;
        let minDistance = Infinity;
        
        this.players.forEach(p => {
            if (p.team !== player.team) {
                const distance = this.getDistance(player, p);
                if (distance < minDistance) {
                    nearest = p;
                    minDistance = distance;
                }
            }
        });
        
        return nearest;
    }
    
    getDistance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    checkShotSuccess() {
        const hoop1 = { x: 400, y: 70, team: 2 };
        const hoop2 = { x: 400, y: 530, team: 1 };
        
        const targetHoop = this.ball.shooter.team === 1 ? hoop1 : hoop2;
        
        if (Math.abs(this.ball.x - targetHoop.x) < 30 && 
            Math.abs(this.ball.y - targetHoop.y) < 20) {
            return true;
        }
        
        return false;
    }
    
    updateAI() {
        this.players.forEach((player, index) => {
            if (index === 0) return; // Skip human player
            
            if (player.hasBall) {
                if (Math.random() < 0.02) {
                    this.shoot(player);
                } else if (Math.random() < 0.01) {
                    this.pass(player);
                } else {
                    const targetHoop = player.team === 1 ? { x: 400, y: 70 } : { x: 400, y: 530 };
                    this.moveToward(player, targetHoop);
                }
            } else {
                if (this.ball.holder && this.ball.holder.team !== player.team) {
                    this.moveToward(player, this.ball.holder);
                } else if (!this.ball.holder) {
                    this.moveToward(player, this.ball);
                }
            }
        });
    }
    
    moveToward(player, target) {
        const dx = target.x - player.x;
        const dy = target.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            const moveX = dx / distance * 0.8;
            const moveY = dy / distance * 0.8;
            player.move(moveX, moveY);
            player.facing = dx > 0 ? 1 : -1;
            player.lastMoveDirection = { x: moveX, y: moveY };
        } else {
            player.lastMoveDirection = { x: 0, y: 0 };
        }
    }
    
    checkCollisions() {
        this.players.forEach(player => {
            if (!this.ball.holder && this.getDistance(player, this.ball) < 25) {
                player.hasBall = true;
                this.ball.holder = player;
                this.ball.isShot = false;
                this.ball.vx = 0;
                this.ball.vy = 0;
            }
        });
    }
    
    updateScore() {
        document.getElementById('score1').textContent = this.score.team1;
        document.getElementById('score2').textContent = this.score.team2;
    }
    
    checkWinCondition() {
        if (this.score.team1 >= 5) {
            this.gameWon = true;
            this.showWinner('BYU WINS!');
        } else if (this.score.team2 >= 5) {
            this.gameWon = true;
            this.showWinner('UTAH WINS!');
        }
    }
    
    showWinner(message) {
        const winnerDiv = document.getElementById('winner');
        winnerDiv.textContent = message;
        winnerDiv.style.display = 'block';
        
        setTimeout(() => {
            winnerDiv.innerHTML = message + '<br><br>Press R to restart';
        }, 1000);
    }
    
    attemptSteal(defender) {
        const ballCarrier = this.ball.holder;
        if (!ballCarrier || ballCarrier.team === defender.team) return;
        
        const distance = this.getDistance(defender, ballCarrier);
        if (distance > 40) return;
        
        const defenderMoving = defender.lastMoveDirection && 
            (Math.abs(defender.lastMoveDirection.x) > 0 || Math.abs(defender.lastMoveDirection.y) > 0);
        const carrierMoving = ballCarrier.lastMoveDirection && 
            (Math.abs(ballCarrier.lastMoveDirection.x) > 0 || Math.abs(ballCarrier.lastMoveDirection.y) > 0);
        
        let canSteal = false;
        if (!defenderMoving && !carrierMoving) {
            canSteal = true;
        } else if (defenderMoving && carrierMoving) {
            const dotProduct = (defender.lastMoveDirection.x * ballCarrier.lastMoveDirection.x) + 
                             (defender.lastMoveDirection.y * ballCarrier.lastMoveDirection.y);
            if (dotProduct > 0.5) canSteal = true;
        }
        
        if (canSteal) {
            ballCarrier.hasBall = false;
            defender.hasBall = true;
            this.ball.holder = defender;
            this.ball.x = defender.x;
            this.ball.y = defender.y;
        }
    }
    
    attemptBlock(defender) {
        const recentShot = this.recentShots.find(shot => {
            const timeDiff = Date.now() - shot.time;
            const distance = this.getDistance(defender, shot);
            return timeDiff <= 500 && distance <= 50;
        });
        
        if (recentShot && this.ball.isShot) {
            this.ball.isShot = false;
            this.ball.vx = 0;
            this.ball.vy = 0;
            this.ball.x = defender.x;
            this.ball.y = defender.y;
            this.ball.holder = defender;
            defender.hasBall = true;
            defender.isJumping = true;
            defender.jumpStartTime = Date.now();
            
            this.recentShots = this.recentShots.filter(shot => shot !== recentShot);
        } else {
            defender.isJumping = true;
            defender.jumpStartTime = Date.now();
        }
    }

    resetAfterScore() {
        setTimeout(() => {
            this.ball = new Ball(400, 300);
            
            this.players.forEach(player => {
                player.hasBall = false;
            });
            
            this.players[0].hasBall = true;
            this.ball.holder = this.players[0];
            this.ball.x = this.players[0].x;
            this.ball.y = this.players[0].y;
        }, 1000);
    }
    
    restart() {
        this.score = { team1: 0, team2: 0 };
        this.gameWon = false;
        this.recentShots = [];
        document.getElementById('winner').style.display = 'none';
        this.updateScore();
        this.init();
    }
    
    render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        this.drawCourt();
        
        this.players.forEach(player => player.render(ctx));
        
        this.ball.render(ctx);
    }
    
    drawCourt() {
        // Background (green around court)
        ctx.fillStyle = '#228B22';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Court surface (brown)
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(50, 50, 700, 500);
        
        // Court boundary
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.rect(50, 50, 700, 500);
        ctx.stroke();
        
        // Hoops (white circles)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(400, 70, 15, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(400, 530, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Center circle
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(400, 300, 80, 0, Math.PI * 2);
        ctx.stroke();
        
        // Half court line
        ctx.beginPath();
        ctx.moveTo(50, 300);
        ctx.lineTo(750, 300);
        ctx.stroke();
        
        // Key areas
        ctx.beginPath();
        ctx.rect(300, 50, 200, 100);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.rect(300, 450, 200, 100);
        ctx.stroke();
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

class Player {
    constructor(x, y, team, isPlayer, color) {
        this.x = x;
        this.y = y;
        this.team = team;
        this.isPlayer = isPlayer;
        this.color = color;
        this.hasBall = false;
        this.facing = 1;
        this.speed = 2;
        this.lastMoveDirection = { x: 0, y: 0 };
        this.isJumping = false;
        this.jumpStartTime = 0;
        this.dribbleOffset = 0;
    }
    
    move(dx, dy) {
        this.x += dx * this.speed;
        this.y += dy * this.speed;
        
        // Keep player on court
        this.x = Math.max(70, Math.min(730, this.x));
        this.y = Math.max(70, Math.min(530, this.y));
    }
    
    update() {
        // Dribbling animation
        if (this.hasBall && game.ball) {
            this.dribbleOffset = Math.sin(Date.now() * 0.01) * 5;
            game.ball.x = this.x;
            game.ball.y = this.y + this.dribbleOffset;
        }
        
        // Jump animation
        if (this.isJumping && Date.now() - this.jumpStartTime > 500) {
            this.isJumping = false;
        }
    }
    
    render(ctx) {
        let yOffset = 0;
        if (this.isJumping) {
            const jumpProgress = (Date.now() - this.jumpStartTime) / 500;
            yOffset = -Math.sin(jumpProgress * Math.PI) * 20;
        }
        
        // Player circle
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y + yOffset, 15, 0, Math.PI * 2);
        ctx.fill();
        
        // Highlight for human player
        if (this.isPlayer) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        // Team number
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.team.toString(), this.x, this.y + yOffset + 5);
        
        // Ball possession indicator
        if (this.hasBall) {
            ctx.strokeStyle = '#ffff00';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.x, this.y + yOffset, 20, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.holder = null;
        this.isShot = false;
        this.shooter = null;
    }
    
    shoot(player, defenderDistance) {
        this.shooter = player;
        this.isShot = true;
        
        const targetHoop = player.team === 1 ? { x: 400, y: 70 } : { x: 400, y: 530 };
        
        let accuracy = 0.7;
        if (defenderDistance < 50) accuracy = 0.3;
        else if (defenderDistance < 100) accuracy = 0.5;
        
        const dx = targetHoop.x - this.x + (Math.random() - 0.5) * 100 * (1 - accuracy);
        const dy = targetHoop.y - this.y + (Math.random() - 0.5) * 50 * (1 - accuracy);
        
        this.vx = dx * 0.05;
        this.vy = dy * 0.05;
    }
    
    update() {
        if (this.isShot) {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.2; // gravity
            
            // Ball goes out of bounds
            if (this.x < 50 || this.x > 750 || this.y > 550) {
                this.isShot = false;
                this.vx = 0;
                this.vy = 0;
            }
        }
    }
    
    render(ctx) {
        ctx.fillStyle = '#ff8800';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    console.log('Page loaded, starting game...');
    game = new Game();
});
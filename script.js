const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gridSize = 10;
const cellSize = 60;
const grid = Array(gridSize).fill().map(() => Array(gridSize).fill(null)); // Empty grid
const citizens = [];
let totalHappiness = 0;

const buildingTypes = {
    house: { color: 'blue', happinessEffect: 1 },
    factory: { color: 'gray', happinessEffect: -2 },
    park: { color: 'green', happinessEffect: 3 }
};

class Citizen {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.happiness = 0;
    }

    move() {
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        const [dx, dy] = directions[Math.floor(Math.random() * directions.length)];
        const newX = this.x + dx;
        const newY = this.y + dy;
        if (newX >= 0 && newX < gridSize && newY >= 0 && newY < gridSize && !grid[newX][newY]) { // Avoid moving onto buildings
            this.x = newX;
            this.y = newY;
        }
    }

    updateHappiness() {
        this.happiness = 0;
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                const nx = this.x + dx;
                const ny = this.y + dy;
                if (nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize && grid[nx][ny]) {
                    this.happiness += grid[nx][ny].happinessEffect;
                }
            }
        }
    }
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            if (grid[x][y]) {
                ctx.fillStyle = grid[x][y].color;
                ctx.fillRect(x * cellSize + 5, y * cellSize + 5, cellSize - 10, cellSize - 10);
                // Add simple icons for visual appeal
                ctx.fillStyle = '#fff';
                ctx.font = '20px Arial';
                if (grid[x][y].type === 'house') ctx.fillText('🏠', x * cellSize + 20, y * cellSize + 35);
                if (grid[x][y].type === 'factory') ctx.fillText('🏭', x * cellSize + 20, y * cellSize + 35);
                if (grid[x][y].type === 'park') ctx.fillText('🌳', x * cellSize + 20, y * cellSize + 35);
            }
        }
    }
    citizens.forEach(c => {
        ctx.fillStyle = c.happiness > 0 ? 'green' : (c.happiness < 0 ? 'red' : 'yellow');
        ctx.beginPath();
        ctx.arc(c.x * cellSize + cellSize / 2, c.y * cellSize + cellSize / 2, 10, 0, Math.PI * 2);
        ctx.fill();
    });
    document.getElementById('happiness').textContent = totalHappiness;
}

function placeBuilding(type) {
    canvas.onclick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / cellSize);
        const y = Math.floor((e.clientY - rect.top) / cellSize);
        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize && !grid[x][y]) {
            grid[x][y] = { type, ...buildingTypes[type] };
            updateCitizenHappiness();
            drawGrid();
            canvas.onclick = null; // Reset click handler
        }
    };
}

function initCitizens() {
    for (let i = 0; i < 5; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * gridSize);
            y = Math.floor(Math.random() * gridSize);
        } while (grid[x][y]); // Ensure starting position is empty
        citizens.push(new Citizen(x, y));
    }
}

function updateCitizenHappiness() {
    totalHappiness = 0;
    citizens.forEach(c => {
        c.updateHappiness();
        totalHappiness += c.happiness;
    });
}

function gameLoop() {
    citizens.forEach(c => c.move());
    updateCitizenHappiness();
    drawGrid();
}

// Initialize and start
initCitizens();
drawGrid();
setInterval(gameLoop, 2000); // Citizens move every 2 seconds
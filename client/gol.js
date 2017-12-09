var canvas;
var context;
var golModel;
var loopInterval;
var communitySelected;

window.onload = function() {
	canvas = document.getElementById("golCanvas");
	canvas.width = 600;
	canvas.height = 600;
	context = canvas.getContext('2d');
	canvas.onclick = toggleCell;
	createGrid();
	communitySelected = document.getElementById("singleCommunityType");
}

var createGrid = function() {
	var gridSizeInput = document.getElementById("gridSizeInput");
	
	var cellSize = gridSizeInput.value;
	if (!cellSize || isNaN(cellSize)) {
		alert("Please enter a valid cell size.");
		return;
	}
	
	golModel = new GolModel(cellSize);
	golModel.isActive = false;
	golModel.createGrid(canvas);
	drawGrid(golModel);
}

var drawGrid = function(golModel) {
	var grid = golModel.grid;
	for (let i = 0; i < grid.length; i++) {
		for (let j = 0; j < grid.length; j++) {
			drawCell(grid[i][j], 'orange');
		}
	}
}

var drawCell = function(cell, color) {
	if (!color) {
		var fill = cell.isAlive ? "red" : "green";
	} else {
		var fill = color;
	}

	context.fillStyle = fill;
	context.fillRect(cell.offsetX, cell.offsetY, cell.height, cell.width);
	context.strokeStyle = "black";
	context.lineWidth = 1;
	context.strokeRect(cell.offsetX + 1, cell.offsetY + 1, cell.height - 2, cell.width - 2);
}

var toggleCell = function(event) {
	if (golModel) {
		var x = event.pageX - canvas.offsetLeft;
		var y = event.pageY - canvas.offsetTop;
		var cellClicked = golModel.getCell(x, y);
		cellsToUpdate = createSelectedCommunity(cellClicked);
		cellsToUpdate.forEach(cell => {
			golModel.updateActiveList(cell);
			drawCell(cell);
		});
	}
}

var setCommunityType = function(event) {
	communitySelected.classList.remove("icon-selected");
	communitySelected = event.currentTarget;
	communitySelected.classList.add("icon-selected");
}

var createSelectedCommunity= function(cell) {
	var communityType = communitySelected.attributes["name"];
	switch(communityType.nodeValue) {
		case "single" :
		cell.isAlive = !cell.isAlive;
			return [cell];
		case "glider" :
			return createGliderCommunity(cell);
		case "flower" :
			return createFlowerCommunity(cell);

	}
}

var createGliderCommunity = function(cell) {
	var northWest = golModel.getNorthWest(cell);
	var north = golModel.getNorth(cell);
	var northEast = golModel.getNorthEast(cell);
	var west = golModel.getWest(cell);
	var south = golModel.getSouth(cell);
	var cells = [northWest, north, northEast, west, south];
	cells.forEach(cell => {
		cell.isAlive = true;
	});
	return cells;
}

var createFlowerCommunity = function(cell) {
	var north = golModel.getNorth(cell);
	var west = golModel.getWest(cell);
	var south = golModel.getSouth(cell);
	var east = golModel.getEast(cell);
	var cells = [north, west, south, east, cell];
	cells.forEach(cell => {
		cell.isAlive = true;
	});
	return cells;
}

var redraw = function(event) {
	if (golModel.isActive) {
		var updatedCells = golModel.update();
		updatedCells.forEach(cell => {
			drawCell(cell);
		});
	} else {
		clearInterval(loopInterval);
		loopInterval = null;
	}
}

var run = function(event) {
	if (golModel !== null && !loopInterval) {
		golModel.isActive = true;
		loopInterval = setInterval(redraw, getInterval());
	}
}

var stop = function(event) {
	golModel.isActive = false;
	clearInterval(loopInterval);
	loopInterval = null;
}

var getInterval = function() {
	var value = document.getElementById("intervalInput").value;
	if (!value || isNaN(value) || value < 1) {
		return 1000;
	}
	return value;
}

class GolModel {

	constructor(cellSize) {
		this.liveCells = [];
		this.cellSize = cellSize;
		this.isActive = false;
		this.yCount;
		this.xCount;
	}

	createGrid(canvas) {
		this.grid = [];

		this.xCount = this.calculateXCount(canvas.offsetWidth);
		this.yCount = this.calculateYCount(canvas.offsetHeight);
		
		for(let i = 0; i < this.xCount; i++) {
			let xGrid = [];
			for (let j = 0; j < this.yCount; j++) {
				let offsets = this.calculateCellOffset(i, j);
				xGrid[j] = new golCell(i, j, offsets.x, offsets.y, this.cellSize, this.cellSize);
			}
			this.grid[i] = xGrid;
		}
	}

	//Calculate the number of vertical cells
	calculateYCount(height) {
		return height / this.cellSize;
	}

	calculateXCount(width) {
		return width / this.cellSize;
	}

	calculateCellOffset(xCoord, yCoord) {
		var offsets = {};
		offsets.x = xCoord * this.cellSize;
		offsets.y = yCoord * this.cellSize;
		return offsets;
	}

	getCell(offsetX, offsetY) {
		var xIndex = Math.floor(offsetX / this.cellSize);
		var yIndex = Math.floor(offsetY / this.cellSize);
		return this.grid[xIndex][yIndex];
	}

	updateActiveList(cell) {
		var key = this.getKey(cell);
		var liveCell = this.liveCells[key];
		if (!liveCell && cell.isAlive) {
			this.liveCells[key] = cell;
		} 

		if (cell && !cell.isAlive) {
			delete this.liveCells[key];
		}
	}

	setAliveState(cell, isAlive) {
		cell.isAlive = isAlive;
		this.updateActiveList(cell);
	}

	update() {
		var liveHitMap = [];
		
		var liveCells = Object.keys(this.liveCells).forEach(key => {
			this.determineLifeHits(this.liveCells[key], liveHitMap);
		});

		var cellsToUpdate = [];
		Object.keys(liveHitMap).forEach(key => {
			var cell = liveHitMap[key];
			if (cell.isAlive) {
				if (cell.hits < 2 || cell.hits > 3) {
					this.setAliveState(cell, false);					
					cellsToUpdate.push(cell);
				}
			} else {
				if (cell.hits == 3) {
					this.setAliveState(cell, true);
					cellsToUpdate.push(cell);
				}
			}
			cell.hits = 0;
		});
		return cellsToUpdate;
	}

	determineLifeHits(cell, liveHitMap) {

		for (let i = cell.x - 1; i <= cell.x + 1; i++) {
			
			if (i < 0 || i > this.xCount - 1) {
				continue;
			}

			for (let j = cell.y - 1; j <= cell.y + 1; j++) {
				
				if (j < 0 || j > this.yCount - 1) {
					continue;
				}

				var adjacent = this.grid[i][j];
				let key = this.getKey(adjacent);
				var inHitMap = liveHitMap[this.getKey(adjacent)];

				if (key == this.getKey(cell)) {
					
					if (!inHitMap) {
						liveHitMap[key] = adjacent;
						adjacent.hits = 0;
					}

					continue;

				} else {

					if (!inHitMap) {

						adjacent.hits = 1;
						liveHitMap[key] = adjacent;

					} else {

						liveHitMap[key].hits += 1;

					}
				}
			}
		}
	}

	getKey(cell) {
		return cell.x + ":" + cell.y;
	}

	printLiveCells() {
		Object.keys(this.liveCells).forEach(key => {
			console.log(this.liveCells[key]);
		});
	}

	getNorth(cell) {
		return this.grid[cell.x][cell.y - 1];
	}

	getNorthWest(cell) {
		return this.grid[cell.x - 1][cell.y - 1];
	}

	getNorthEast(cell) {
		return this.grid[cell.x +1][cell.y - 1];
	}

	getWest(cell) {
		return this.grid[cell.x - 1][cell.y];
	}

	getSouthWest(cell) {
		return this.grid[cell.x - 1][cell.y + 1];
	}

	getSouth(cell) {
		return this.grid[cell.x][cell.y + 1];
	}

	getSouthEast(cell) {
		return this.grid[cell.x + 1][cell.y + 1];
	}

	getEast(cell) {
		return this.grid[cell.x + 1][cell.y];
	}
}

class golCell {

	constructor(x, y, offsetX, offsetY, height, width) {
		this.isAlive = false;
		this.x = x;
		this.y = y;
		this.offsetX = offsetX;
		this.offsetY = offsetY;
		this.height = height;
		this.width = width;
	}
}
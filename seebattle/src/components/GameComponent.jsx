import React, { Component } from 'react';
import Service from '../services/Service';
import { Link, withRouter } from "react-router-dom";
import './styles.css';


class BattlesComponent extends Component {
	constructor(props) {
		super(props);
		this.state = {
			battles: []
		}
	}
	componentDidMount() {
		Service.getAllBattles().then((res) => {
			this.setState({ battles: res.data.content });
		});
		this.mainGame()
	}

	mainGame = () => {
		var CONST = {};
		CONST.AVAILABLE_SHIPS = ['1.1', '1.2', '1.3', '1.4', '2.1', '2.2', '2.3', '3.1', '3.2', '4.1'];
		// You are player 0 and the computer is player 1
		// The virtual player is used for generating temporary ships
		// for calculating the probability heatmap
		CONST.HUMAN_PLAYER = 0;
		CONST.COMPUTER_PLAYER = 1;
		CONST.VIRTUAL_PLAYER = 2;

		CONST.CSS_TYPE_EMPTY = 'empty';
		CONST.CSS_TYPE_SHIP = 'ship';
		CONST.CSS_TYPE_MISS = 'miss';
		CONST.CSS_TYPE_HIT = 'hit';
		CONST.CSS_TYPE_SUNK = 'sunk';

		CONST.TYPE_EMPTY = 0; // 0 = water (empty)
		CONST.TYPE_SHIP = 1; // 1 = undamaged ship
		CONST.TYPE_MISS = 2; // 2 = water with a cannonball in it (missed shot)
		CONST.TYPE_HIT = 3; // 3 = damaged ship (hit shot)
		CONST.TYPE_SUNK = 4; // 4 = sunk ship
		CONST.TYPE_NOT_ALLOWED = 5; // 5 = neighbour of ship

		Game.usedShips = [CONST.UNUSED, CONST.UNUSED, CONST.UNUSED, CONST.UNUSED, CONST.UNUSED];
		CONST.USED = 1;
		CONST.UNUSED = 0;

		function Game(size) {
			Game.size = size;
			this.shotsTaken = 0;
			this.createGrid();
			this.init();
		}
		Game.size = 10; // Default grid size is 10x10
		Game.gameOver = false;
		// Checks if the game is won, and if it is, re-initializes the game
		Game.prototype.checkIfWon = function () {
			if (this.computerFleet.allShipsSunk()) {
				alert('Congratulations, you win!');
				Game.gameOver = true;
				this.showRestartSidebar();
			} else if (this.humanFleet.allShipsSunk()) {
				alert('Yarr! The computer sank all your ships. Try again.');
				Game.gameOver = true;
				this.showRestartSidebar();
			}
		};
		// Shoots at the target player on the grid.
		// Returns {int} Constants.TYPE: What the shot uncovered
		Game.prototype.shoot = function (x, y, targetPlayer) {
			let targetGrid;
			let targetFleet;
			if (targetPlayer === CONST.HUMAN_PLAYER) {
				targetGrid = this.humanGrid;
				targetFleet = this.humanFleet;
			} else if (targetPlayer === CONST.COMPUTER_PLAYER) {
				targetGrid = this.computerGrid;
				targetFleet = this.computerFleet;
			}

			if (targetGrid.isDamagedShip(x, y)) {
				return null;
			} else if (targetGrid.isMiss(x, y)) {
				return null;
			} else if (targetGrid.isUndamagedShip(x, y)) {
				// update the board/grid
				targetGrid.updateCell(x, y, 'hit', targetPlayer);
				// IMPORTANT: This function needs to be called _after_ updating the cell to a 'hit',
				// because it overrides the CSS class to 'sunk' if we find that the ship was sunk
				targetFleet.findShipByCoords(x, y).incrementDamage(); // increase the damage
				this.checkIfWon();
				return CONST.TYPE_HIT;
			} else {
				targetGrid.updateCell(x, y, 'miss', targetPlayer);
				this.checkIfWon();
				return CONST.TYPE_MISS;
			}
		};
		// Creates click event listeners on each one of the 100 grid cells
		Game.prototype.shootListener = function (e) {
			var self = e.target.self;
			// Extract coordinates from event listener
			var x = parseInt(e.target.getAttribute('data-x'), 10);
			var y = parseInt(e.target.getAttribute('data-y'), 10);
			var result = null;
			if (self.readyToPlay) {
				result = self.shoot(x, y, CONST.COMPUTER_PLAYER);

				// Remove the tutorial arrow
				if (gameTutorial.showTutorial) {
					gameTutorial.nextStep();
				}
			}

			if (result !== null && !Game.gameOver) {
				// The AI shoots iff the player clicks on a cell that he/she hasn't
				// already clicked on yet
				self.robot.shoot();
			} else {
				Game.gameOver = false;
			}
		};
		// Creates click event listeners on each of the ship names in the roster
		Game.prototype.rosterListener = function (e) {
			var self = e.target.self;
			// Remove all classes of 'placing' from the fleet roster first
			var roster = document.querySelectorAll('.fleet-roster li');
			for (var i = 0; i < roster.length; i++) {
				var classes = roster[i].getAttribute('class') || '';
				classes = classes.replace('placing', '');
				roster[i].setAttribute('class', classes);
			}

			// Move the highlight to the next step
			if (gameTutorial.currentStep === 1) {
				gameTutorial.nextStep();
			}

			// Set the class of the target ship to 'placing'
			Game.placeShipType = e.target.getAttribute('id');
			document.getElementById(Game.placeShipType).setAttribute('class', 'placing');
			Game.placeShipDirection = parseInt(document.getElementById('rotate-button').getAttribute('data-direction'), 10);
			self.placingOnGrid = true;
		};
		// Creates click event listeners on the human player's grid to handle
		// ship placement after the user has selected a ship name
		Game.prototype.placementListener = function (e) {
			var self = e.target.self;
			if (self.placingOnGrid) {
				// Extract coordinates from event listener
				var x = parseInt(e.target.getAttribute('data-x'), 10);
				var y = parseInt(e.target.getAttribute('data-y'), 10);

				// Don't screw up the direction if the user tries to place again.
				var successful = self.humanFleet.placeShip(x, y, Game.placeShipDirection, Game.placeShipType);
				if (successful) {
					// Done placing this ship
					self.endPlacing(Game.placeShipType);

					// Remove the helper arrow
					if (gameTutorial.currentStep === 2) {
						gameTutorial.nextStep();
					}

					self.placingOnGrid = false;
					if (self.areAllShipsPlaced()) {
						var el = document.getElementById('rotate-button');
						el.addEventListener(transitionEndEventName(), (function () {
							el.setAttribute('class', 'hidden');
							if (gameTutorial.showTutorial) {
								document.getElementById('start-game').setAttribute('class', 'highlight');
							} else {
								document.getElementById('start-game').removeAttribute('class');
							}
						}), false);
						el.setAttribute('class', 'invisible');
					}
				}
			}
		};
		// Creates mouseover event listeners that handles mouseover on the
		// human player's grid to draw a phantom ship implying that the user
		// is allowed to place a ship there
		Game.prototype.placementMouseover = function (e) {
			// conlose.log("placementMouseover");
			var self = e.target.self;
			if (self.placingOnGrid) {
				var x = parseInt(e.target.getAttribute('data-x'), 10);
				var y = parseInt(e.target.getAttribute('data-y'), 10);
				var classes;
				var fleetRoster = self.humanFleet.fleetRoster;

				for (var i = 0; i < fleetRoster.length; i++) {
					var shipType = fleetRoster[i].type;

					if (Game.placeShipType === shipType &&
						fleetRoster[i].isLegal(x, y, Game.placeShipDirection)) {
						for (var j = 0; j < Game.placeShipCoords.length; j++) {
							var el = document.querySelector('.grid-cell-' + Game.placeShipCoords[j].x + '-' + Game.placeShipCoords[j].y);
							classes = el.getAttribute('class');
							// Check if the substring ' grid-ship' already exists to avoid adding it twice
							if (classes.indexOf(' grid-ship') < 0) {
								classes += ' grid-ship';
								el.setAttribute('class', classes);
							}
						}
					}
				}
			}
		};
		// Creates mouseout event listeners that un-draws the phantom ship
		// on the human player's grid as the user hovers over a different cell
		Game.prototype.placementMouseout = function (e) {
			// console.log("on placementMouseout");
			var self = e.target.self;
			if (self.placingOnGrid) {
				for (var j = 0; j < Game.placeShipCoords.length; j++) {
					var el = document.querySelector('.grid-cell-' + Game.placeShipCoords[j].x + '-' + Game.placeShipCoords[j].y);
					var classes = el.getAttribute('class');
					// Check if the substring ' grid-ship' already exists to avoid adding it twice
					if (classes.indexOf(' grid-ship') > -1) {
						classes = classes.replace(' grid-ship', '');
						el.setAttribute('class', classes);
					}
				}
			}
		};
		// Click handler for the Rotate Ship button
		Game.prototype.toggleRotation = function (e) {
			// Toggle rotation direction
			var direction = parseInt(e.target.getAttribute('data-direction'), 10);
			if (direction === Ship.DIRECTION_VERTICAL) {
				e.target.setAttribute('data-direction', '1');
				Game.placeShipDirection = Ship.DIRECTION_HORIZONTAL;
			} else if (direction === Ship.DIRECTION_HORIZONTAL) {
				e.target.setAttribute('data-direction', '0');
				Game.placeShipDirection = Ship.DIRECTION_VERTICAL;
			}
		};
		// Click handler for the Start Game button
		Game.prototype.startGame = function (e) {
			var self = e.target.self;
			var el = document.getElementById('roster-sidebar');
			var fn = function () { el.setAttribute('class', 'hidden'); };
			el.addEventListener(transitionEndEventName(), fn, false);
			el.setAttribute('class', 'invisible');
			self.readyToPlay = true;

			// Advanced the tutorial step
			if (gameTutorial.currentStep === 3) {
				gameTutorial.nextStep();
			}
			el.removeEventListener(transitionEndEventName(), fn, false);
		};
		// Click handler for Restart Game button
		Game.prototype.restartGame = function (e) {
			window.location.reload();
		};
		// // Debugging function used to place all ships and just start
		// Game.prototype.placeRandomly = function (e) {
		// 	e.target.removeEventListener(e.type, arguments.callee);
		// 	e.target.self.humanFleet.placeShipsRandomly();
		// 	e.target.self.readyToPlay = true;
		// 	document.getElementById('roster-sidebar').setAttribute('class', 'hidden');
		// 	this.setAttribute('class', 'hidden');
		// };
		// Ends placing the current ship
		Game.prototype.endPlacing = function (shipType) {
			document.getElementById(shipType).setAttribute('class', 'placed');

			// Mark the ship as 'used'
			Game.usedShips[CONST.AVAILABLE_SHIPS.indexOf(shipType)] = CONST.USED;

			// Wipe out the variable when you're done with it
			Game.placeShipDirection = null;
			Game.placeShipType = '';
			Game.placeShipCoords = [];
		};
		// Checks whether or not all ships are done placing
		// Returns boolean
		Game.prototype.areAllShipsPlaced = function () {
			var playerRoster = document.querySelectorAll('.fleet-roster li');
			for (var i = 0; i < playerRoster.length; i++) {
				if (playerRoster[i].getAttribute('class') === 'placed') {
					continue;
				} else {
					return false;
				}
			}
			// Reset temporary variables
			Game.placeShipDirection = 0;
			Game.placeShipType = '';
			Game.placeShipCoords = [];
			return true;
		};
		// Resets the fog of war
		Game.prototype.resetFogOfWar = function () {
			for (var i = 0; i < Game.size; i++) {
				for (var j = 0; j < Game.size; j++) {
					this.humanGrid.updateCell(i, j, 'empty', CONST.HUMAN_PLAYER);
					this.computerGrid.updateCell(i, j, 'empty', CONST.COMPUTER_PLAYER);
				}
			}
			// Reset all values to indicate the ships are ready to be placed again
			Game.usedShips = Game.usedShips.map(function () { return CONST.UNUSED; });
		};
		// Resets CSS styling of the sidebar
		Game.prototype.resetRosterSidebar = function () {
			var els = document.querySelector('.fleet-roster').querySelectorAll('li');
			for (var i = 0; i < els.length; i++) {
				els[i].removeAttribute('class');
			}

			if (gameTutorial.showTutorial) {
				gameTutorial.nextStep();
			} else {
				document.getElementById('roster-sidebar').removeAttribute('class');
			}
			document.getElementById('rotate-button').removeAttribute('class');
			document.getElementById('start-game').setAttribute('class', 'hidden');
		};
		Game.prototype.showRestartSidebar = function () {
			var sidebar = document.getElementById('restart-sidebar');
			sidebar.setAttribute('class', 'highlight');

			// Deregister listeners
			var computerCells = document.querySelector('.computer-player').childNodes;
			for (var j = 0; j < computerCells.length; j++) {
				computerCells[j].removeEventListener('click', this.shootListener, false);
			}
			var playerRoster = document.querySelector('.fleet-roster').querySelectorAll('li');
			for (var i = 0; i < playerRoster.length; i++) {
				playerRoster[i].removeEventListener('click', this.rosterListener, false);
			}

			var restartButton = document.getElementById('restart-game');
			restartButton.addEventListener('click', this.restartGame, false);
			restartButton.self = this;
		};
		// Generates the HTML divs for the grid for both players
		Game.prototype.createGrid = function () {
			var gridDiv = document.querySelectorAll('.grid');
			for (var grid = 0; grid < gridDiv.length; grid++) {
				gridDiv[grid].removeChild(gridDiv[grid].querySelector('.no-js')); // Removes the no-js warning
				for (var i = 0; i < Game.size; i++) {
					for (var j = 0; j < Game.size; j++) {
						var el = document.createElement('div');
						el.setAttribute('data-x', i);
						el.setAttribute('data-y', j);
						el.setAttribute('class', 'grid-cell grid-cell-' + i + '-' + j);
						gridDiv[grid].appendChild(el);
					}
				}
			}
		};
		// Initializes the Game
		Game.prototype.init = function () {
			this.humanGrid = new Grid(Game.size);
			this.computerGrid = new Grid(Game.size);
			this.humanFleet = new Fleet(this.humanGrid, CONST.HUMAN_PLAYER);
			this.computerFleet = new Fleet(this.computerGrid, CONST.COMPUTER_PLAYER);

			this.robot = new AI(this);

			// Reset game variables
			this.shotsTaken = 0;
			this.readyToPlay = false;
			this.placingOnGrid = false;
			Game.placeShipDirection = 0;
			Game.placeShipType = '';
			Game.placeShipCoords = [];

			this.resetRosterSidebar();

			// Add a click listener for the Grid.shoot() method for all cells
			// Only add this listener to the computer's grid
			var computerCells = document.querySelector('.computer-player').childNodes;
			for (var j = 0; j < computerCells.length; j++) {
				computerCells[j].self = this;
				computerCells[j].addEventListener('click', this.shootListener, false);
			}

			// Add a click listener to the roster	
			var playerRoster = document.querySelector('.fleet-roster').querySelectorAll('li');
			for (var i = 0; i < playerRoster.length; i++) {
				playerRoster[i].self = this;
				playerRoster[i].addEventListener('click', this.rosterListener, false);
			}

			// Add a click listener to the human player's grid while placing
			var humanCells = document.querySelector('.human-player').childNodes;
			for (var k = 0; k < humanCells.length; k++) {
				humanCells[k].self = this;
				humanCells[k].addEventListener('click', this.placementListener, false);
				humanCells[k].addEventListener('mouseover', this.placementMouseover, false);
				humanCells[k].addEventListener('mouseout', this.placementMouseout, false);
			}

			var rotateButton = document.getElementById('rotate-button');
			rotateButton.addEventListener('click', this.toggleRotation, false);
			var startButton = document.getElementById('start-game');
			startButton.self = this;
			startButton.addEventListener('click', this.startGame, false);
			// var resetButton = document.getElementById('reset-stats');
			// resetButton.addEventListener('click', Game.stats.resetStats, false);
			var randomButton = document.getElementById('place-randomly');
			randomButton.self = this;
			randomButton.addEventListener('click', this.placeRandomly, false);
			// this.computerFleet.placeShipsRandomly();
			this.computerFleet.placeShipsRandomlyComp();
		};

		// Grid object
		// Constructor
		function Grid(size) {
			this.size = size;
			this.cells = [];
			this.init();
		}

		// Initialize and populate the grid
		Grid.prototype.init = function () {
			for (var x = 0; x < this.size; x++) {
				var row = [];
				this.cells[x] = row;
				for (var y = 0; y < this.size; y++) {
					row.push(CONST.TYPE_EMPTY);
				}
			}
		};

		// Updates the cell's CSS class based on the type passed in
		Grid.prototype.updateCell = function (x, y, type, targetPlayer) {
			var player;
			if (targetPlayer === CONST.HUMAN_PLAYER) {
				player = 'human-player';
			} else if (targetPlayer === CONST.COMPUTER_PLAYER) {
				player = 'computer-player';
			}

			switch (type) {
				case CONST.CSS_TYPE_EMPTY:
					this.cells[x][y] = CONST.TYPE_EMPTY;
					break;
				case CONST.CSS_TYPE_SHIP:
					this.cells[x][y] = CONST.TYPE_SHIP;
					break;
				case CONST.CSS_TYPE_MISS:
					this.cells[x][y] = CONST.TYPE_MISS;
					break;
				case CONST.CSS_TYPE_HIT:
					this.cells[x][y] = CONST.TYPE_HIT;
					break;
				case CONST.CSS_TYPE_SUNK:
					this.cells[x][y] = CONST.TYPE_SUNK;
					break;
				default:
					this.cells[x][y] = CONST.TYPE_EMPTY;
					break;
			}
			var classes = ['grid-cell', 'grid-cell-' + x + '-' + y, 'grid-' + type];
			document.querySelector('.' + player + ' .grid-cell-' + x + '-' + y).setAttribute('class', classes.join(' '));
		};
		// Checks to see if a cell contains an undamaged ship
		// Returns boolean
		Grid.prototype.isUndamagedShip = function (x, y) {
			return this.cells[x][y] === CONST.TYPE_SHIP;
		};
		// Checks to see if the shot was missed. This is equivalent
		// to checking if a cell contains a cannonball
		// Returns boolean
		Grid.prototype.isMiss = function (x, y) {
			return this.cells[x][y] === CONST.TYPE_MISS;
		};
		// Checks to see if a cell contains a damaged ship,
		// either hit or sunk.
		// Returns boolean
		Grid.prototype.isDamagedShip = function (x, y) {
			return this.cells[x][y] === CONST.TYPE_HIT || this.cells[x][y] === CONST.TYPE_SUNK;
		};

		// Fleet object
		// This object is used to keep track of a player's portfolio of ships
		// Constructor
		function Fleet(playerGrid, player) {
			this.numShips = CONST.AVAILABLE_SHIPS.length;
			this.playerGrid = playerGrid;
			this.player = player;
			this.fleetRoster = [];
			this.populate();
		}
		// Populates a fleet
		Fleet.prototype.populate = function () {
			for (var i = 0; i < this.numShips; i++) {
				// loop over the ship types when numShips > Constants.AVAILABLE_SHIPS.length
				var j = i % CONST.AVAILABLE_SHIPS.length;
				this.fleetRoster.push(new Ship(CONST.AVAILABLE_SHIPS[j], this.playerGrid, this.player));
			}
		};
		// Places the ship and returns whether or not the placement was successful
		// Returns boolean
		Fleet.prototype.placeShip = function (x, y, direction, shipType) {
			var shipCoords;
			for (var i = 0; i < this.fleetRoster.length; i++) {
				var shipTypes = this.fleetRoster[i].type;

				if (shipType === shipTypes &&
					this.fleetRoster[i].isLegal(x, y, direction)) {
					this.fleetRoster[i].create(x, y, direction, false);
					shipCoords = this.fleetRoster[i].getAllShipCells();

					for (var j = 0; j < shipCoords.length; j++) {
						this.playerGrid.updateCell(shipCoords[j].x, shipCoords[j].y, 'ship', this.player);
					}
					return true;
				}
			}
			return false;
		};
		// Places ships randomly on the board
		// TODO: Avoid placing ships too close to each other
		Fleet.prototype.placeShipsRandomly = function () {
			var shipCoords;
			for (var i = 0; i < this.fleetRoster.length; i++) {
				var illegalPlacement = true;

				// Prevents the random placement of already placed ships
				if (this.player === CONST.HUMAN_PLAYER && Game.usedShips[i] === CONST.USED) {
					continue;
				}
				while (illegalPlacement) {
					var randomX = Math.floor(Game.size * Math.random());
					var randomY = Math.floor(Game.size * Math.random());
					var randomDirection = Math.floor(2 * Math.random());

					if (this.fleetRoster[i].isLegal(randomX, randomY, randomDirection)) {
						this.fleetRoster[i].create(randomX, randomY, randomDirection, false);
						shipCoords = this.fleetRoster[i].getAllShipCells();
						illegalPlacement = false;
					} else {
						continue;
					}
				}
				if (this.player === CONST.HUMAN_PLAYER && Game.usedShips[i] !== CONST.USED) {
					for (var j = 0; j < shipCoords.length; j++) {
						this.playerGrid.updateCell(shipCoords[j].x, shipCoords[j].y, 'ship', this.player);
						Game.usedShips[i] = CONST.USED;
					}
				}
			}
		};
		Fleet.prototype.placeShipsRandomlyComp = function () {
			switch (Math.floor(3 * Math.random())) {
				case 0:
					console.log("case 0");
					var unusedShips = ['unused', 'unused', 'unused', 'unused', 'unused', 'unused', 'unused', 'unused', 'unused', 'unused'];
					var availableShipsCount = 10;
					var shipIndex;
					var ySub;

					while (availableShipsCount > 0) {
						// console.log(availableShipsCount + "count ship");
						shipIndex = Math.floor(10 * Math.random());
						// console.log(shipIndex + " shipIndex");
						ySub = 0;
						while (unusedShips[shipIndex] == 'used') {
							shipIndex = Math.floor(10 * Math.random());
							// console.log(shipIndex + " shipIndex in if cond");
						}
						// console.log(shipIndex + " shipIndex after cond");
						var randomDirection = Math.floor(2 * Math.random());
						// console.log(randomDirection + "dir");
						if (randomDirection === 1) {
							ySub = this.fleetRoster[shipIndex].getAllShipCells().length;
						}
						// console.log(ySub + "sub");
						// console.log(this.fleetRoster[shipIndex]);
						var isPlaced = false;
						for (var x = 0; x < 10; x++) {
							if (!isPlaced) {
								for (var y = 0; y < 5; y++) {
									if (!isPlaced) {
										if (y + ySub < 5) {
											ySub = 0;
										}
										if (this.fleetRoster[shipIndex].isLegal(x, y, randomDirection)) {
											// console.log(x + " x" + y + " y");
											// console.log("is legal")
											this.fleetRoster[shipIndex].create(x, (y - ySub), randomDirection, false);
											unusedShips[shipIndex] = 'used';
											availableShipsCount--;
											isPlaced = true;
										}
									}
								}
							}
						}
					}
					console.log("done");
					break;
				case 1:
					console.log("case 1");
					// in the hole grid
					var shipCoords;
					for (var i = 0; i < this.fleetRoster.length; i++) {
						var illegalPlacement = true;
						while (illegalPlacement) {
							var randomX = Math.floor(Game.size * Math.random());
							var randomY = Math.floor(Game.size * Math.random());
							var randomDirection = Math.floor(2 * Math.random());

							if (this.fleetRoster[i].isLegal(randomX, randomY, randomDirection)) {
								this.fleetRoster[i].create(randomX, randomY, randomDirection, false);
								shipCoords = this.fleetRoster[i].getAllShipCells();
								illegalPlacement = false;
							} else {
								continue;
							}
						}
					}
					console.log("done");
					break;
				case 2:
					console.log("case 2");
					var unusedShips = ['unused', 'unused', 'unused', 'unused', 'unused', 'unused', 'unused', 'unused', 'unused', 'unused'];
					var availableShipsCount = 10;
					var shipIndex;
					var ySub;

					while (availableShipsCount > 4) {
						// console.log(availableShipsCount + "count ship");
						shipIndex = Math.floor(6 * Math.random() + 4);
						// console.log(shipIndex + " shipIndex");
						ySub = 0;
						while (unusedShips[shipIndex] == 'used') {
							shipIndex = Math.floor(6 * Math.random() + 4);
							// console.log(shipIndex + " shipIndex in if cond");
						}
						var randomDirection = Math.floor(2 * Math.random());
						// console.log(randomDirection + " dir");
						if (randomDirection === 1) {
							var isPlaced = false;
							for (var x = 0; x < 10; x += 9) {
								if (!isPlaced) {
									for (var y = 0; y < 10; y++) {
										if (!isPlaced) {
											if (this.fleetRoster[shipIndex].isLegal(x, y, randomDirection)) {
												// console.log(x + " x" + y + " y");
												// console.log("is legal")
												this.fleetRoster[shipIndex].create(x, y, randomDirection, false);
												unusedShips[shipIndex] = 'used';
												availableShipsCount--;
												isPlaced = true;
											}
										}
									}
								}
							}
						}
						else {
							var isPlaced = false;
							for (var y = 0; y < 10; y += 9) {

								if (!isPlaced) {
									for (var x = 0; x < 10; x++) {
										if (!isPlaced) {
											if (this.fleetRoster[shipIndex].isLegal(x, y, randomDirection)) {
												// console.log(x + " x" + y + " y");
												// console.log("is legal")
												this.fleetRoster[shipIndex].create(x, (y), randomDirection, false);
												unusedShips[shipIndex] = 'used';
												availableShipsCount--;

												isPlaced = true;
											}
										}
									}
								}
							}
						}
					}
					var m = 0;
					while (availableShipsCount > 0) {
						// console.log("in last while");						
						var x = Math.floor(8 * Math.random() + 1);
						var y = Math.floor(8 * Math.random() + 1);
						randomDirection = Math.floor(2 * Math.random());
						if (this.fleetRoster[m].isLegal(x, y, randomDirection)) {
							// console.log(x + " x" + y + " y");
							// console.log("is legal")
							this.fleetRoster[m].create(x, (y), randomDirection, false);
							unusedShips[m] = 'used';
							// console.log(availableShipsCount + "ship count")
							availableShipsCount--;
							m++;
						}
					}
					// console.log(unusedShips);
					console.log("done");
					break;
				default:
					break;
			}
		};
		// Finds a ship by location
		// Returns the ship object located at (x, y)
		// If no ship exists at (x, y), this returns null instead
		Fleet.prototype.findShipByCoords = function (x, y) {
			for (var i = 0; i < this.fleetRoster.length; i++) {
				var currentShip = this.fleetRoster[i];
				if (currentShip.direction === Ship.DIRECTION_VERTICAL) {
					if (y === currentShip.yPosition &&
						x >= currentShip.xPosition &&
						x < currentShip.xPosition + currentShip.shipLength) {
						return currentShip;
					} else {
						continue;
					}
				} else {
					if (x === currentShip.xPosition &&
						y >= currentShip.yPosition &&
						y < currentShip.yPosition + currentShip.shipLength) {
						return currentShip;
					} else {
						continue;
					}
				}
			}
			return null;
		};
		// Finds a ship by its type
		// Param shipType is a string
		// Returns the ship object that is of type shipType
		// If no ship exists, this returns null.
		Fleet.prototype.findShipByType = function (shipType) {
			for (var i = 0; i < this.fleetRoster.length; i++) {
				if (this.fleetRoster[i].type === shipType) {
					return this.fleetRoster[i];
				}
			}
			return null;
		};
		// Checks to see if all ships have been sunk
		// Returns boolean
		Fleet.prototype.allShipsSunk = function () {
			for (var i = 0; i < this.fleetRoster.length; i++) {
				// If one or more ships are not sunk, then the sentence "all ships are sunk" is false.
				if (this.fleetRoster[i].sunk === false) {
					return false;
				}
			}
			return true;
		};

		// Ship object
		// Constructor
		function Ship(type, playerGrid, player) {
			this.damage = 0;
			this.type = type;
			this.playerGrid = playerGrid;
			this.player = player;

			switch (this.type) {
				case CONST.AVAILABLE_SHIPS[0]:
					this.shipLength = 1;
					break;
				case CONST.AVAILABLE_SHIPS[1]:
					this.shipLength = 1;
					break;
				case CONST.AVAILABLE_SHIPS[2]:
					this.shipLength = 1;
					break;
				case CONST.AVAILABLE_SHIPS[3]:
					this.shipLength = 1;
					break;
				case CONST.AVAILABLE_SHIPS[4]:
					this.shipLength = 2;
					break;
				case CONST.AVAILABLE_SHIPS[5]:
					this.shipLength = 2;
					break;
				case CONST.AVAILABLE_SHIPS[6]:
					this.shipLength = 2;
					break;
				case CONST.AVAILABLE_SHIPS[7]:
					this.shipLength = 3;
					break;
				case CONST.AVAILABLE_SHIPS[8]:
					this.shipLength = 3;
					break;
				case CONST.AVAILABLE_SHIPS[9]:
					this.shipLength = 4;
					break;
			}
			this.maxDamage = this.shipLength;
			this.sunk = false;
		}
		// Checks to see if the placement of a ship is legal
		// Returns boolean
		Ship.prototype.isLegal = function (x, y, direction) {
			// first, check if the ship is within the grid...
			if (this.withinBounds(x, y, direction)) {
				// ...then check to make sure it doesn't collide with another ship
				for (var i = 0; i < this.shipLength; i++) {
					if (direction === Ship.DIRECTION_VERTICAL) {
						if (this.playerGrid.cells[x + i][y] === CONST.TYPE_SHIP ||
							this.playerGrid.cells[x + i][y] === CONST.TYPE_MISS ||
							this.playerGrid.cells[x + i][y] === CONST.TYPE_SUNK ||
							this.playerGrid.cells[x + i][y] === CONST.TYPE_NOT_ALLOWED) {
							return false;
						}
					} else {
						if (this.playerGrid.cells[x][y + i] === CONST.TYPE_SHIP ||
							this.playerGrid.cells[x][y + i] === CONST.TYPE_MISS ||
							this.playerGrid.cells[x][y + i] === CONST.TYPE_SUNK ||
							this.playerGrid.cells[x][y + i] === CONST.TYPE_NOT_ALLOWED) {
							return false;
						}
					}
				}
				return true;
			} else {
				return false;
			}
		};
		// Checks to see if the ship is within bounds of the grid
		// Returns boolean
		Ship.prototype.withinBounds = function (x, y, direction) {
			if (direction === Ship.DIRECTION_VERTICAL) {
				return x + this.shipLength <= Game.size;
			} else {
				return y + this.shipLength <= Game.size;
			}
		};

		// Increments the damage counter of a ship
		// Returns Ship
		Ship.prototype.incrementDamage = function () {
			this.damage++;
			if (this.isSunk()) {
				this.sinkShip(false); // Sinks the ship
			}
		};
		// Checks to see if the ship is sunk
		// Returns boolean
		Ship.prototype.isSunk = function () {
			return this.damage >= this.maxDamage;
		};
		// Sinks the ship
		Ship.prototype.sinkShip = function (virtual) {
			this.damage = this.maxDamage; // Force the damage to exceed max damage
			this.sunk = true;

			// Make the CSS class sunk, but only if the ship is not virtual
			if (!virtual) {
				var allCells = this.getAllShipCells();
				for (var i = 0; i < this.shipLength; i++) {
					this.playerGrid.updateCell(allCells[i].x, allCells[i].y, 'sunk', this.player);
				}
			}
		};
		/**
		 * Gets all the ship cells
		 *
		 * Returns an array with all (x, y) coordinates of the ship:
		 * e.g.
		 * [
		 *	{'x':2, 'y':2},
		 *	{'x':3, 'y':2},
		 *	{'x':4, 'y':2}
		 * ]
		 */
		Ship.prototype.getAllShipCells = function () {
			var resultObject = [];
			for (var i = 0; i < this.shipLength; i++) {
				if (this.direction === Ship.DIRECTION_VERTICAL) {
					resultObject[i] = { 'x': this.xPosition + i, 'y': this.yPosition };
				} else {
					resultObject[i] = { 'x': this.xPosition, 'y': this.yPosition + i };
				}
			}
			return resultObject;
		};
		// Initializes a ship with the given coordinates and direction (bearing).
		// If the ship is declared "virtual", then the ship gets initialized with
		// its coordinates but DOESN'T get placed on the grid.
		Ship.prototype.create = function (x, y, direction, virtual) {
			// This function assumes that you've already checked that the placement is legal
			this.xPosition = x;
			this.yPosition = y;
			this.direction = direction;

			// If the ship is virtual, don't add it to the grid.
			if (!virtual) {
				for (var i = 0; i < this.shipLength; i++) {
					if (this.direction === Ship.DIRECTION_VERTICAL) {
						this.playerGrid.cells[x + i][y] = CONST.TYPE_SHIP;

						if (this.checkPosition(x + i, y + 1)) {
							this.playerGrid.cells[x + i][y + 1] = CONST.TYPE_NOT_ALLOWED;
						}
						if (this.checkPosition(x + i, y - 1)) {
							this.playerGrid.cells[x + i][y - 1] = CONST.TYPE_NOT_ALLOWED;
						}

					} else {
						this.playerGrid.cells[x][y + i] = CONST.TYPE_SHIP;

						if (this.checkPosition(x + 1, y + i)) {
							this.playerGrid.cells[x + 1][y + i] = CONST.TYPE_NOT_ALLOWED;
						}
						if (this.checkPosition(x - 1, y + i)) {
							this.playerGrid.cells[x - 1][y + i] = CONST.TYPE_NOT_ALLOWED;
						}
					}
				}
				if (this.direction === Ship.DIRECTION_VERTICAL) {
					if (this.checkPosition(x - 1, y - 1)) {
						this.playerGrid.cells[x - 1][y - 1] = CONST.TYPE_NOT_ALLOWED;
					}
					if (this.checkPosition(x - 1, y)) {
						this.playerGrid.cells[x - 1][y] = CONST.TYPE_NOT_ALLOWED;
					}
					if (this.checkPosition(x - 1, y + 1)) {
						this.playerGrid.cells[x - 1][y + 1] = CONST.TYPE_NOT_ALLOWED;
					}
					if (this.checkPosition(x + this.shipLength, y - 1)) {
						this.playerGrid.cells[x + this.shipLength][y - 1] = CONST.TYPE_NOT_ALLOWED;
					}
					if (this.checkPosition(x + this.shipLength, y)) {
						this.playerGrid.cells[x + this.shipLength][y] = CONST.TYPE_NOT_ALLOWED;
					}
					if (this.checkPosition(x + this.shipLength, y + 1)) {
						this.playerGrid.cells[x + this.shipLength][y + 1] = CONST.TYPE_NOT_ALLOWED;
					}

				} else {
					if (this.checkPosition(x + 1, y - 1)) {
						this.playerGrid.cells[x + 1][y - 1] = CONST.TYPE_NOT_ALLOWED;
					}
					if (this.checkPosition(x - 1, y - 1)) {
						this.playerGrid.cells[x - 1][y - 1] = CONST.TYPE_NOT_ALLOWED;
					}
					if (this.checkPosition(x, y - 1)) {
						this.playerGrid.cells[x][y - 1] = CONST.TYPE_NOT_ALLOWED;
					}
					if (this.checkPosition(x + 1, y + this.shipLength)) {
						this.playerGrid.cells[x + 1][y + this.shipLength] = CONST.TYPE_NOT_ALLOWED;
					}
					if (this.checkPosition(x - 1, y + this.shipLength)) {
						this.playerGrid.cells[x - 1][y + this.shipLength] = CONST.TYPE_NOT_ALLOWED;
					}
					if (this.checkPosition(x, y + this.shipLength)) {
						this.playerGrid.cells[x][y + this.shipLength] = CONST.TYPE_NOT_ALLOWED;
					}
				}
			}
		};

		Ship.prototype.checkPosition = function (x, y) {
			let triger = false;
			if (x < 10 && y < 10 && x >= 0 && y >= 0) {
				triger = true;
			}
			return triger
		};
		// direction === 0 when the ship is facing north/south
		// direction === 1 when the ship is facing east/west
		Ship.DIRECTION_VERTICAL = 0;
		Ship.DIRECTION_HORIZONTAL = 1;

		// Tutorial Object
		// Constructor
		function Tutorial() {
			this.currentStep = 0;
			// Check if 'showTutorial' is initialized, if it's uninitialized, set it to true.
			this.showTutorial = localStorage.getItem('showTutorial') !== 'false';
		}
		// Advances the tutorial to the next step
		Tutorial.prototype.nextStep = function () {
			var humanGrid = document.querySelector('.human-player');
			var computerGrid = document.querySelector('.computer-player');
			switch (this.currentStep) {
				case 0:
					document.getElementById('roster-sidebar').setAttribute('class', 'highlight');
					//document.getElementById('step1').setAttribute('class', 'current-step');
					this.currentStep++;
					break;
				case 1:
					document.getElementById('roster-sidebar').removeAttribute('class');
					// document.getElementById('step1').removeAttribute('class');
					humanGrid.setAttribute('class', humanGrid.getAttribute('class') + ' highlight');
					// document.getElementById('step2').setAttribute('class', 'current-step');
					this.currentStep++;
					break;
				case 2:
					// document.getElementById('step2').removeAttribute('class');
					var humanClasses = humanGrid.getAttribute('class');
					humanClasses = humanClasses.replace(' highlight', '');
					humanGrid.setAttribute('class', humanClasses);
					this.currentStep++;
					break;
				case 3:
					computerGrid.setAttribute('class', computerGrid.getAttribute('class') + ' highlight');
					// document.getElementById('step3').setAttribute('class', 'current-step');
					this.currentStep++;
					break;
				case 4:
					var computerClasses = computerGrid.getAttribute('class');
					// document.getElementById('step3').removeAttribute('class');
					computerClasses = computerClasses.replace(' highlight', '');
					computerGrid.setAttribute('class', computerClasses);
					// document.getElementById('step4').setAttribute('class', 'current-step');
					this.currentStep++;
					break;
				case 5:
					//document.getElementById('step4').removeAttribute('class');
					this.currentStep = 6;
					this.showTutorial = false;
					localStorage.setItem('showTutorial', false);
					break;
				default:
					break;
			}
		};

		// AI Object
		// Optimal battleship-playing AI
		// Constructor
		function AI(gameObject) {
			this.gameObject = gameObject;
			this.virtualGrid = new Grid(Game.size);
			this.virtualFleet = new Fleet(this.virtualGrid, CONST.VIRTUAL_PLAYER);

			this.probGrid = []; // Probability Grid
			this.initProbs();
			this.updateProbs();
		}

		AI.PROB_WEIGHT = 5000; // arbitrarily big number
		// how much weight to give to the opening book's high probability cells
		AI.OPEN_HIGH_MIN = 20;
		AI.OPEN_HIGH_MAX = 30;
		// how much weight to give to the opening book's medium probability cells
		AI.OPEN_MED_MIN = 15;
		AI.OPEN_MED_MAX = 25;
		// how much weight to give to the opening book's low probability cells
		AI.OPEN_LOW_MIN = 10;
		AI.OPEN_LOW_MAX = 20;
		// Amount of randomness when selecting between cells of equal probability
		AI.RANDOMNESS = 0.1;
		// AI's opening book.
		// This is the pattern of the first cells for the AI to target
		AI.OPENINGS = [
			{ 'x': 7, 'y': 3, 'weight': getRandom(AI.OPEN_LOW_MIN, AI.OPEN_LOW_MAX) },
			{ 'x': 6, 'y': 2, 'weight': getRandom(AI.OPEN_LOW_MIN, AI.OPEN_LOW_MAX) },
			{ 'x': 3, 'y': 7, 'weight': getRandom(AI.OPEN_LOW_MIN, AI.OPEN_LOW_MAX) },
			{ 'x': 2, 'y': 6, 'weight': getRandom(AI.OPEN_LOW_MIN, AI.OPEN_LOW_MAX) },
			{ 'x': 6, 'y': 6, 'weight': getRandom(AI.OPEN_LOW_MIN, AI.OPEN_LOW_MAX) },
			{ 'x': 3, 'y': 3, 'weight': getRandom(AI.OPEN_LOW_MIN, AI.OPEN_LOW_MAX) },
			{ 'x': 5, 'y': 5, 'weight': getRandom(AI.OPEN_LOW_MIN, AI.OPEN_LOW_MAX) },
			{ 'x': 4, 'y': 4, 'weight': getRandom(AI.OPEN_LOW_MIN, AI.OPEN_LOW_MAX) },
			{ 'x': 0, 'y': 8, 'weight': getRandom(AI.OPEN_MED_MIN, AI.OPEN_MED_MAX) },
			{ 'x': 1, 'y': 9, 'weight': getRandom(AI.OPEN_HIGH_MIN, AI.OPEN_HIGH_MAX) },
			{ 'x': 8, 'y': 0, 'weight': getRandom(AI.OPEN_MED_MIN, AI.OPEN_MED_MAX) },
			{ 'x': 9, 'y': 1, 'weight': getRandom(AI.OPEN_HIGH_MIN, AI.OPEN_HIGH_MAX) },
			{ 'x': 9, 'y': 9, 'weight': getRandom(AI.OPEN_HIGH_MIN, AI.OPEN_HIGH_MAX) },
			{ 'x': 0, 'y': 0, 'weight': getRandom(AI.OPEN_HIGH_MIN, AI.OPEN_HIGH_MAX) }
		];
		// Scouts the grid based on max probability, and shoots at the cell
		// that has the highest probability of containing a ship
		AI.prototype.shoot = function () {
			var maxProbability = 0;
			var maxProbCoords;
			var maxProbs = [];

			// Add the AI's opening book to the probability grid
			for (var i = 0; i < AI.OPENINGS.length; i++) {
				var cell = AI.OPENINGS[i];
				if (this.probGrid[cell.x][cell.y] !== 0) {
					this.probGrid[cell.x][cell.y] += cell.weight;
				}
			}

			for (var x = 0; x < Game.size; x++) {
				for (var y = 0; y < Game.size; y++) {
					if (this.probGrid[x][y] > maxProbability) {
						maxProbability = this.probGrid[x][y];
						maxProbs = [{ 'x': x, 'y': y }]; // Replace the array
					} else if (this.probGrid[x][y] === maxProbability) {
						maxProbs.push({ 'x': x, 'y': y });
					}
				}
			}

			maxProbCoords = Math.random() < AI.RANDOMNESS ?
				maxProbs[Math.floor(Math.random() * maxProbs.length)] :
				maxProbs[0];

			var result = this.gameObject.shoot(maxProbCoords.x, maxProbCoords.y, CONST.HUMAN_PLAYER);

			// If the game ends, the next lines need to be skipped.
			if (Game.gameOver) {
				Game.gameOver = false;
				return;
			}

			this.virtualGrid.cells[maxProbCoords.x][maxProbCoords.y] = result;

			// If you hit a ship, check to make sure if you've sunk it.
			if (result === CONST.TYPE_HIT) {
				var humanShip = this.findHumanShip(maxProbCoords.x, maxProbCoords.y);
				if (humanShip.isSunk()) {
					// Remove any ships from the roster that have been sunk
					var shipTypes = [];
					for (var k = 0; k < this.virtualFleet.fleetRoster.length; k++) {
						shipTypes.push(this.virtualFleet.fleetRoster[k].type);
					}
					var index = shipTypes.indexOf(humanShip.type);
					this.virtualFleet.fleetRoster.splice(index, 1);

					// Update the virtual grid with the sunk ship's cells
					var shipCells = humanShip.getAllShipCells();
					for (var _i = 0; _i < shipCells.length; _i++) {
						this.virtualGrid.cells[shipCells[_i].x][shipCells[_i].y] = CONST.TYPE_SUNK;
					}
				}
			}
			// Update probability grid after each shot
			this.updateProbs();
		};
		// Update the probability grid
		AI.prototype.updateProbs = function () {
			var roster = this.virtualFleet.fleetRoster;
			var coords;
			this.resetProbs();

			// Probabilities are not normalized to fit in the interval [0, 1]
			// because we're only interested in the maximum value.

			// This works by trying to fit each ship in each cell in every orientation
			// For every cell, the more legal ways a ship can pass through it, the more
			// likely the cell is to contain a ship.
			// Cells that surround known 'hits' are given an arbitrarily large probability
			// so that the AI tries to completely sink the ship before moving on.

			for (var k = 0; k < roster.length; k++) {
				for (var x = 0; x < Game.size; x++) {
					for (var y = 0; y < Game.size; y++) {
						if (roster[k].isLegal(x, y, Ship.DIRECTION_VERTICAL)) {
							roster[k].create(x, y, Ship.DIRECTION_VERTICAL, true);
							coords = roster[k].getAllShipCells();
							if (this.passesThroughHitCell(coords)) {
								for (var i = 0; i < coords.length; i++) {
									this.probGrid[coords[i].x][coords[i].y] += AI.PROB_WEIGHT * this.numHitCellsCovered(coords);
								}
							} else {
								for (var _i = 0; _i < coords.length; _i++) {
									this.probGrid[coords[_i].x][coords[_i].y]++;
								}
							}
						}
						if (roster[k].isLegal(x, y, Ship.DIRECTION_HORIZONTAL)) {
							roster[k].create(x, y, Ship.DIRECTION_HORIZONTAL, true);
							coords = roster[k].getAllShipCells();
							if (this.passesThroughHitCell(coords)) {
								for (var j = 0; j < coords.length; j++) {
									this.probGrid[coords[j].x][coords[j].y] += AI.PROB_WEIGHT * this.numHitCellsCovered(coords);
								}
							} else {
								for (var _j = 0; _j < coords.length; _j++) {
									this.probGrid[coords[_j].x][coords[_j].y]++;
								}
							}
						}

						// Set hit cells to probability zero so the AI doesn't
						// target cells that are already hit
						if (this.virtualGrid.cells[x][y] === CONST.TYPE_HIT) {
							this.probGrid[x][y] = 0;
						}
					}
				}
			}
		};
		// Initializes the probability grid for targeting
		AI.prototype.initProbs = function () {
			for (var x = 0; x < Game.size; x++) {
				var row = [];
				this.probGrid[x] = row;
				for (var y = 0; y < Game.size; y++) {
					row.push(0);
				}
			}
		};
		// Resets the probability grid to all 0.
		AI.prototype.resetProbs = function () {
			for (var x = 0; x < Game.size; x++) {
				for (var y = 0; y < Game.size; y++) {
					this.probGrid[x][y] = 0;
				}
			}
		};

		// Finds a human ship by coordinates
		// Returns Ship
		AI.prototype.findHumanShip = function (x, y) {
			return this.gameObject.humanFleet.findShipByCoords(x, y);
		};
		// Checks whether or not a given ship's cells passes through
		// any cell that is hit.
		// Returns boolean
		AI.prototype.passesThroughHitCell = function (shipCells) {
			for (var i = 0; i < shipCells.length; i++) {
				if (this.virtualGrid.cells[shipCells[i].x][shipCells[i].y] === CONST.TYPE_HIT) {
					return true;
				}
			}
			return false;
		};
		// Gives the number of hit cells the ships passes through. The more
		// cells this is, the more probable the ship exists in those coordinates
		// Returns int
		AI.prototype.numHitCellsCovered = function (shipCells) {
			var cells = 0;
			for (var i = 0; i < shipCells.length; i++) {
				if (this.virtualGrid.cells[shipCells[i].x][shipCells[i].y] === CONST.TYPE_HIT) {
					cells++;
				}
			}
			return cells;
		};

		// Global constant only initialized once
		var gameTutorial = new Tutorial();

		// Start the game
		new Game(10);

		function transitionEndEventName() {
			var i,
				undefined,
				el = document.createElement('div'),
				transitions = {
					'transition': 'transitionend',
					'OTransition': 'otransitionend',  // oTransitionEnd in very old Opera
					'MozTransition': 'transitionend',
					'WebkitTransition': 'webkitTransitionEnd'
				};

			for (i in transitions) {
				if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
					return transitions[i];
				}
			}
		}

		// Returns a random number between min (inclusive) and max (exclusive)
		function getRandom(min, max) {
			return Math.random() * (max - min) + min;
		}

	}

	render() {
		return (
			<div className="container text-center">
				<h2>Sea Battle with computer</h2>
				<div className="game-container">
					<div className="game-container">
						<div id="restart-sidebar" className="hidden">
							<h2>Try Again</h2>
							<button id="restart-game">Restart Game</button>
						</div><div id="roster-sidebar">
							<h2>Place Your Ships</h2>
							<ul className="fleet-roster" id="fleet-roster">
								<li id="1.1" ></li>
								<li id="1.2" ></li>
								<li id="1.3" ></li>
								<li id="1.4" ></li>
								<li id="2.1" ></li>
								<li id="2.2" ></li>
								<li id="2.3" ></li>
								<li id="3.1" > </li>
								<li id="3.2" > </li>
								<li id="4.1" >  </li>
							</ul>
							<button id="rotate-button" data-direction="0">Rotate Ship</button>
							<button id="start-game" className="hidden">Start Game</button>
							<button id="place-randomly" className="hidden">Place Randomly and Start</button>
						</div>
						<div className="flex-box-contenier">
							<div className="grid-container">
								<h2>Your Fleet</h2>
								<div className="grid human-player"><span className="no-js">Please enable JavaScript to play this game</span></div>
							</div>
							<div className="grid-container">
								<h2>Enemy Fleet</h2>
								<div className="grid computer-player"><span className="no-js">Please enable JavaScript to play this game</span></div>
							</div>
						</div>
					</div>

				</div>
				<span className="prefetch" id="prefetch1"></span>
				<span className="prefetch" id="prefetch2"></span>
				<span className="prefetch" id="prefetch3"></span>


			</div>
		);
	}
}

export default withRouter(BattlesComponent);
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Space Invaders game implemented as a Single Page Application (SPA) using vanilla HTML5, CSS3, and JavaScript. The project serves as both a playable game and a test repository for claude-code functionality verification (claude-codeの動作確認用).

## Project Structure

- `index.html` - Main game HTML structure with canvas element and UI controls
- `game.js` - Core game logic implemented as a single `SpaceInvaders` class
- `style.css` - Game styling with retro monospace theme and responsive design
- `README.md` - Project documentation in Japanese

## Architecture

The game is built using a class-based object-oriented approach:

- **SpaceInvaders Class**: Main game engine handling initialization, game loop, and state management
- **Game Objects**: Player ship, invaders, and bullets represented as plain JavaScript objects
- **Rendering**: HTML5 Canvas API with 2D context for all graphics
- **Input Handling**: Keyboard event listeners for arrow keys and spacebar
- **Game States**: Score, HP, lives, stages with different invader formations

## Key Game Features

- Three distinct stage formations: standard grid, diamond, and wave patterns
- Different invader types with varying bullet power, speed, and shoot intervals
- Progressive difficulty with increasing invader speed and shoot frequency
- Multi-life system (3 lives) with HP per life (5 HP)
- Responsive canvas that adapts to screen size

## Running the Game

Open `index.html` in any modern web browser. No build process or package manager required.

## Development Notes

This is a pure vanilla JS implementation with no external dependencies. All game logic runs in the browser using requestAnimationFrame for smooth 60fps gameplay. The codebase uses ES6 classes and modern JavaScript features.
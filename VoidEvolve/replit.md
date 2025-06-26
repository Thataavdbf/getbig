# VOIDSPAWN - Black Hole Game

## Overview

VOIDSPAWN is a 3D interactive browser-based game where players control a black hole to consume objects in space. The game is built using React Three Fiber for 3D graphics, with a modern tech stack including TypeScript, Vite, and Tailwind CSS. The application features a full-stack architecture with Express.js backend and PostgreSQL database support through Drizzle ORM.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for component-based UI
- **React Three Fiber** (@react-three/fiber) for 3D scene management
- **React Three Drei** (@react-three/drei) for additional 3D utilities
- **Zustand** for state management (game state, audio, black hole properties)
- **Vite** as the build tool and development server
- **Tailwind CSS** with Radix UI components for styling
- **TanStack React Query** for server state management

### Backend Architecture
- **Express.js** server with TypeScript
- **In-memory storage** with interface for future database integration
- **Session-based architecture** ready for user authentication
- **RESTful API** structure with /api prefix

### 3D Graphics Pipeline
- **WebGL** rendering through React Three Fiber
- **GLSL shader** support via vite-plugin-glsl
- **Custom particle systems** for visual effects
- **Real-time physics** calculations for object interactions
- **Dynamic lighting** and post-processing effects

## Key Components

### Game Engine
- **Game Loop**: Handles frame updates, collision detection, and state transitions
- **Physics System**: AABB collision detection and object attraction calculations
- **Particle System**: Star fields and cosmic visual effects
- **Audio Manager**: Sound effects and background music with mute functionality

### 3D Scene Objects
- **BlackHole**: Main player-controlled object with visual effects
- **ConsumableObject**: Interactive objects (cubes, spheres, pyramids) to collect
- **DynamicEnvironment**: Procedural environments with destructible objects
- **EnvironmentalHazards**: Moving threats specific to each environment
- **DestructionEffects**: Particle systems for environmental destruction
- **ParticleSystem**: Background stars and cosmic effects

### UI System
- **GameUI**: HUD displaying score, size, and game instructions
- **Interface**: Game controls, mute button, restart functionality
- **Responsive Design**: Mobile-friendly touch controls

### State Management
- **useGame**: Game phase management (ready/playing/ended)
- **useBlackHole**: Player object properties (position, size, score)
- **useAudio**: Sound system controls and preferences
- **useElements**: Elemental powers system (fire, ice, gravity)
- **useEnvironment**: Dynamic environment management and destruction tracking

### Procedural Environment System
The game features 5 distinct environments with unique characteristics:

#### Deep Space (Default)
- **Visual**: Dark purple ground with cyan grid, floating asteroids
- **Objects**: Balanced mix of cubes, spheres, and pyramids
- **Hazards**: None (safe training environment)
- **Special**: Classic space aesthetic with cosmic particles

#### Alien Planet
- **Visual**: Purple/magenta atmosphere with alien crystal formations
- **Objects**: Primarily spheres and pyramids with alien colors
- **Hazards**: Crystal storms that move in wave patterns and slow black hole movement
- **Special**: Higher object spawn rate, crystal formations regenerate

#### Cyber City
- **Visual**: Dark blue/black cityscape with neon building structures
- **Objects**: Geometric cubes and pyramids with tech colors
- **Hazards**: Data streams following grid patterns that reduce black hole size
- **Special**: Highest object density, bonus points for building destruction

#### Ancient Ruins
- **Visual**: Brown stone environment with weathered monuments
- **Objects**: Earth-toned cubes and spheres resembling stone blocks
- **Hazards**: Stone guardians that patrol in circular patterns
- **Special**: Destructible pillars and ancient architecture

#### Time Vortex
- **Visual**: Purple void with floating temporal fragments and energy rings
- **Objects**: Ethereal spheres and pyramids that spawn at various heights
- **Hazards**: Temporal rifts that randomly teleport and cause score reduction
- **Special**: Fastest spawn rate, objects float at different elevations

## Data Flow

1. **Game Initialization**: 
   - Game starts in "ready" phase
   - 3D scene loads with environment and particles
   - Consumable objects are procedurally generated

2. **Gameplay Loop**:
   - Mouse/touch input controls black hole movement
   - Physics engine checks for collisions each frame
   - Successful collisions trigger growth and score updates
   - Audio feedback plays for interactions

3. **State Transitions**:
   - User input starts the game (ready → playing)
   - Game logic can end the session (playing → ended)
   - Restart functionality resets all game state

## External Dependencies

### 3D Graphics Stack
- **Three.js** (via React Three Fiber) - Core 3D engine
- **@react-three/postprocessing** - Visual effects pipeline
- **WebGL** - Hardware-accelerated rendering

### UI Component Library
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Class Variance Authority** - Component styling utilities

### Database & ORM
- **Drizzle ORM** - Type-safe database operations
- **@neondatabase/serverless** - PostgreSQL adapter
- **Connection pooling** via connect-pg-simple

### Development Tools
- **TypeScript** - Type safety across the stack
- **ESBuild** - Fast production builds
- **PostCSS** - CSS processing pipeline

## Deployment Strategy

### Build Process
- **Client Build**: Vite bundles React app to `dist/public`
- **Server Build**: ESBuild compiles Express server to `dist/index.js`
- **Asset Optimization**: GLTF models, audio files, and textures

### Production Configuration
- **Node.js Runtime**: Production server runs compiled JavaScript
- **Static File Serving**: Express serves client assets
- **Environment Variables**: Database connection and configuration
- **Auto-scaling**: Replit autoscale deployment target

### Development Workflow
- **Hot Reload**: Vite development server with HMR
- **Concurrent Development**: Client and server run simultaneously
- **TypeScript Checking**: Real-time type validation
- **Error Overlay**: Runtime error display in development

## Changelog

```
Changelog:
- June 22, 2025. Initial setup
- June 22, 2025. Added procedural environment system with 5 unique environments
- June 22, 2025. Implemented environmental destruction mechanics and hazards
- June 22, 2025. Added environment-specific object generation and physics
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
Game platform priority: Mobile-first, then PC.
Control preference: Touch controls for mobile devices.
```
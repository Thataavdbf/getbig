/**
 * VOIDSPAWN Game Constants
 */

// Game Physics
export const PHYSICS = {
  // Black Hole
  BLACK_HOLE: {
    INITIAL_SIZE: 1,
    INITIAL_MASS: 10,
    MIN_SIZE: 0.5,
    MAX_SIZE: 10,
    GROWTH_RATE: 0.05,
    SHRINK_RATE: 0.01,
    GRAVITY_STRENGTH: 0.8,
    ROTATION_SPEED: 0.5,
    ENERGY: {
      INITIAL: 100,
      MAX: 100,
      REGEN_RATE: 1,
      BOOST_COST: 20,
      DEFENSE_COST: 15,
    }
  },
};

// Game Logic Settings
export const GAME = {
  COMBO: {
    TIME_WINDOW: 3,
    MAX_MULTIPLIER: 5,
    THRESHOLD: {
      x2: 3,
      x3: 7,
      x4: 12,
      x5: 20
    }
  },
};

// Audio Settings
export const AUDIO = {
  SOUND_EFFECTS: {
    CONSUME: '/sounds/consume.mp3',
    POWER_UP: '/sounds/powerup.mp3',
    DAMAGE: '/sounds/damage.mp3',
    LEVEL_COMPLETE: '/sounds/level_complete.mp3',
    MENU_SELECT: '/sounds/menu_select.mp3',
  },
  VOLUME: {
    MUSIC_DEFAULT: 0.5,
    SFX_DEFAULT: 0.7,
  }
};

// Environment Settings
export const ENVIRONMENTS = {
  SPACE: {
    MUSIC: '/sounds/space_ambient.mp3',
  },
  ALIEN_PLANET: {
    MUSIC: '/sounds/alien_ambient.mp3',
  },
  CYBERCITY: {
    MUSIC: '/sounds/cyber_ambient.mp3',
  },
  ANCIENT_RUINS: {
    MUSIC: '/sounds/ruins_ambient.mp3',
  },
  TIME_VORTEX: {
    MUSIC: '/sounds/vortex_ambient.mp3',
  }
};
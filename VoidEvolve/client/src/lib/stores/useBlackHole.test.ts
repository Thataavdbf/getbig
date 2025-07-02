import { useBlackHole } from './useBlackHole';

describe('BlackHole Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useBlackHole.setState({
      position: { x: 0, y: 0, z: 0 },
      size: 1,
      score: 0,
      initialSize: 1,
      energy: 100,
      maxEnergy: 100
    });
  });

  test('should initialize with default values', () => {
    const state = useBlackHole.getState();
    
    expect(state.position).toEqual({ x: 0, y: 0, z: 0 });
    expect(state.size).toBe(1);
    expect(state.score).toBe(0);
    expect(state.energy).toBe(100);
    expect(state.maxEnergy).toBe(100);
  });

  test('should update position', () => {
    const { setPosition } = useBlackHole.getState();
    const newPosition = { x: 5, y: 10, z: 15 };
    
    setPosition(newPosition);
    
    const state = useBlackHole.getState();
    expect(state.position).toEqual(newPosition);
  });

  test('should grow black hole and update size', () => {
    const { grow } = useBlackHole.getState();
    const growthAmount = 0.5;
    const initialSize = useBlackHole.getState().size;
    
    grow(growthAmount);
    
    const newSize = useBlackHole.getState().size;
    expect(newSize).toBeCloseTo(initialSize + growthAmount);
  });

  test('should add score', () => {
    const { addScore } = useBlackHole.getState();
    const points = 100;
    const initialScore = useBlackHole.getState().score;
    
    addScore(points);
    
    const newScore = useBlackHole.getState().score;
    expect(newScore).toBe(initialScore + points);
  });

  test('should consume energy', () => {
    const { useElementPower } = useBlackHole.getState();
    const initialEnergy = useBlackHole.getState().energy;
    const energyAmount = 30;
    
    const success = useElementPower(energyAmount);
    
    expect(success).toBe(true);
    expect(useBlackHole.getState().energy).toBe(initialEnergy - energyAmount);
  });

  test('should fail to consume energy when not enough available', () => {
    const { useElementPower } = useBlackHole.getState();
    
    // First use most of energy
    useElementPower(90);
    
    // Try to use more than available
    const success = useElementPower(20);
    
    expect(success).toBe(false);
    expect(useBlackHole.getState().energy).toBe(10); // Should remain at 10
  });
});
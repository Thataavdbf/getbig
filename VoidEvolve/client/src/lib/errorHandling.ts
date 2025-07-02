import * as React from 'react';
import { create } from 'zustand';
/** @jsx React.createElement */

// Define error types
export type ErrorSeverity = 'warning' | 'error' | 'critical';

export interface GameError {
  id: string;
  message: string;
  severity: ErrorSeverity;
  timestamp: number;
  details?: any;
  handled: boolean;
}

// Error store to centralize error handling
interface ErrorState {
  errors: GameError[];
  addError: (message: string, severity: ErrorSeverity, details?: any) => string;
  markAsHandled: (id: string) => void;
  clearErrors: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  errors: [],
  
  addError: (message, severity, details) => {
    const error: GameError = {
      id: `error-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      message,
      severity,
      timestamp: Date.now(),
      details,
      handled: false
    };
    
    // Log to console
    console.error(`[${severity.toUpperCase()}] ${message}`, details);
    
    // Add to store
    set(state => ({
      errors: [...state.errors, error]
    }));
    
    // Critical errors could trigger special handling
    if (severity === 'critical') {
      // Could trigger a global error modal, save state, etc.
    }
    
    return error.id;
  },
  
  markAsHandled: (id) => {
    set(state => ({
      errors: state.errors.map(error => 
        error.id === id ? { ...error, handled: true } : error
      )
    }));
  },
  
  clearErrors: () => {
    set({ errors: [] });
  }
}));

// Async utility with error handling
export async function safeAsync<T>(
  asyncFn: () => Promise<T>,
  errorMessage: string,
  severity: ErrorSeverity = 'error'
): Promise<T | null> {
  try {
    return await asyncFn();
  } catch (error) {
    useErrorStore.getState().addError(
      errorMessage,
      severity,
      error instanceof Error ? { name: error.name, message: error.message, stack: error.stack } : error
    );
    return null;
  }
}

// Component error boundary
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode, fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode, fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    useErrorStore.getState().addError(
      `Component Error: ${error.message}`,
      'error',
      { componentStack: errorInfo.componentStack, stack: error.stack }
    );
  }
  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || React.createElement(
        "div", 
        { className: "error-boundary" },
        React.createElement("h2", null, "Something went wrong."),
        React.createElement(
          "button", 
          { onClick: () => this.setState({ hasError: false }) },
          "Try again"
        )
      );
    }

    return this.props.children;
  }
}

// Example usage for async functions:
/*
const loadGameData = async () => {
  return safeAsync(
    async () => {
      const response = await fetch('/api/game-data');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    },
    "Failed to load game data",
    "warning"
  );
};
*/
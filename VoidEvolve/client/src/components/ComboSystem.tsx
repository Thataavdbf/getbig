import React, { useEffect, useState } from 'react';
import { useCombo } from '../lib/stores/useCombo';
import { motion, AnimatePresence } from 'framer-motion';

export default function ComboSystem() {
  const { count, timer, multiplier, updateComboTimer } = useCombo();
  const [showCombo, setShowCombo] = useState(false);

  // Handle visibility of combo display
  useEffect(() => {
    if (count > 0) {
      setShowCombo(true);
    } else {
      // Small delay before hiding to allow animation to complete
      const timer = setTimeout(() => setShowCombo(false), 300);
      return () => clearTimeout(timer);
    }
  }, [count]);

  // Update the combo timer
  useEffect(() => {
    const interval = setInterval(() => {
      updateComboTimer(0.1); // Update every 100ms
    }, 100);

    return () => clearInterval(interval);
  }, [updateComboTimer]);

  // Calculate progress for timer bar
  const timerProgress = Math.max(0, Math.min(1, timer / 3));

  return (
    <AnimatePresence>
      {showCombo && (
        <motion.div
          className="fixed top-20 right-10 bg-black/70 p-4 rounded-lg border border-purple-500 text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{count}x</div>
            <div className="text-purple-300 font-medium">Combo</div>
          </div>

          {/* Multiplier display */}
          <div className="text-sm text-yellow-300 mt-1">
            x{multiplier.toFixed(1)} Multiplier
          </div>

          {/* Timer bar */}
          <div className="w-full bg-gray-700 h-1 mt-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-purple-500"
              style={{ width: `${timerProgress * 100}%` }}
              animate={{ width: `${timerProgress * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
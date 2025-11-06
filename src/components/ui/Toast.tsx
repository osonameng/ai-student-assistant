"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  const Toast = () => (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return { Toast, showToast: (msg: string) => setMessage(msg) };
}
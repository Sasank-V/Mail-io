"use client"

import React from "react";
import { motion } from "framer-motion";
import { RefreshCw, Mail, Send, Inbox, CheckCircle } from "lucide-react";

export const LoadingSpinner = () => {
  const orbitVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 8,
        repeat: Infinity,
        ease: "linear",
      },
    },
  };

  const containerVariants = {
    animate: {
      scale: [0.8, 1.2, 0.8],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const iconVariants = {
    animate: {
      rotate: [0, 360],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <motion.div
      className="bg-background/90 h-full backdrop-blur-md flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex flex-col items-center">
        <motion.div
          className="bg-card p-12 rounded-xl flex flex-col items-center relative overflow-hidden"
          initial={{ scale: 0.8 }}
          variants={containerVariants}
          animate="animate"
        >
          {/* Central spinning element */}
          <div className="relative w-48 h-48">
            {/* Outer orbit */}
            <motion.div
              className="absolute inset-0"
              variants={orbitVariants}
              animate="animate"
            >
              <div className="relative w-full h-full">
                <motion.div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Send className="w-8 h-8 text-primary" />
                </motion.div>
                <motion.div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
                  <Inbox className="w-8 h-8 text-primary" />
                </motion.div>
                <motion.div className="absolute -left-4 top-1/2 transform -translate-y-1/2">
                  <Mail className="w-8 h-8 text-primary" />
                </motion.div>
                <motion.div className="absolute -right-4 top-1/2 transform -translate-y-1/2">
                  <CheckCircle className="w-8 h-8 text-primary" />
                </motion.div>
              </div>
            </motion.div>

            {/* Center spinner */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              variants={iconVariants}
              animate="animate"
            >
              <RefreshCw className="w-16 h-16 text-primary" />
            </motion.div>
          </div>
        </motion.div>

        {/* Stationary text and dots outside the animated container */}
        <div className="mt-8 flex flex-col items-center">
          <p className="text-xl font-semibold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Syncing Your Inbox
          </p>

          <motion.div className="flex space-x-2">
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-3 h-3 rounded-full bg-primary"
                initial={{ scale: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingSpinner;

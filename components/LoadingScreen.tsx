import { motion } from "framer-motion";
import { Mail, CheckCircle } from "lucide-react";

export const LoadingScreen = () => {
  return (
    <motion.div
      className="bg-background h-full backdrop-blur-sm flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-background p-8 rounded-lg shadow-lg flex flex-col items-center"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <motion.div
          className="relative w-48 h-32 mb-6 bg-background"
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 180 }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <motion.div
            className="absolute inset-0 bg-background rounded-lg"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
            }}
          >
            <Mail className="w-full h-full text-primary-foreground p-4" />
          </motion.div>
          <motion.div
            className="absolute inset-0 bg-background rounded-lg flex items-center justify-center"
            style={{
              transformStyle: "preserve-3d",
              backfaceVisibility: "hidden",
              rotateY: 180,
            }}
          >
            <CheckCircle className="w-16 h-16 text-primary" />
          </motion.div>
        </motion.div>
        <motion.p
          className="text-xl font-semibold mb-4"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Processing Emails
        </motion.p>
        <motion.div className="flex space-x-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 rounded-full bg-primary"
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 0] }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

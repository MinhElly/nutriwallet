import { motion } from "motion/react";

const cubicBezier = [0.22, 0.61, 0.36, 1];

const Reveal = ({ children, delay = 0, className = "" }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.6,
        ease: cubicBezier,
        delay: delay,
      }}
    >
      {children}
    </motion.div>
  );
};

export default Reveal;

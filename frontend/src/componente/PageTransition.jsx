import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        x: -20,
        scale: 0.98
    },
    in: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    },
    out: {
        opacity: 0,
        x: 20,
        scale: 1.02,
        transition: {
            duration: 0.3,
            ease: "easeIn"
        }
    }
};

const PageTransition = ({ children }) => {
    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            style={{ width: '100%', height: '100%' }}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;

import { motion } from 'framer-motion';

const Backdrop = ({ children, onClick, small }) => (
    <motion.div
        className={
            'fixed h-screen w-screen z-50 top-0 left-0 bg-opacity-80 grid place-items-center bg-black'
            // + (small ? ' bg-transparent ' : ' bg-black ')
        }
        onClick={onClick}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
    >
        {children}
    </motion.div>
);

export default Backdrop;

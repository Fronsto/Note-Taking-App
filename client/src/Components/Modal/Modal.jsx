import { motion } from 'framer-motion';
import React from 'react';
import Backdrop from '../Backdrop/index.jsx';
import CloseIcon from '@mui/icons-material/Close';
const dropIn = {
    hidden: {
        y: '-100vh',
        opacity: 0,
    },
    visible: {
        y: '0',
        opacity: 1,
        transition: {
            duration: 0.1,
            type: 'spring',
            damping: 25,
            stiffness: 500,
        },
    },
    exit: {
        y: '-100vh',
        opacity: 0,
    },
};

const Modal = ({ handleClose, content, modalOpen }) => {
    return (
        <Backdrop onClick={handleClose}>
            <motion.div
                onClick={(e) => e.stopPropagation()}
                className={
                    'modal modal-col ' +
                    'w-[clamp(65%,700px,90%)] h-[min(70%,500px)]'
                }
                variants={dropIn}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                {React.cloneElement(content, { modalOpen })}
                <button
                    className="absolute rounded hover:bg-gray-400 dark:hover:bg-gray-800 px-[0.2rem] pb-[0.2rem] m-1 right-0 top-0 "
                    onClick={handleClose}
                >
                    <CloseIcon className="text-gray-500" fontSize="small" />
                </button>
            </motion.div>
        </Backdrop>
    );
};

export default Modal;

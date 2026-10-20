import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb } from 'lucide-react';
import { useGetPublicTipsQuery } from '../features/Api/publicApi';

const FloatingTips = ({ forceShow, onDismiss }) => {
    const { data, isLoading } = useGetPublicTipsQuery({ limit: 10 });
    const [currentTipIndex, setCurrentTipIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const [isDismissed, setIsDismissed] = useState(false);

    const tips = data?.tips || [];

    useEffect(() => {
        // If forceShow is true, we override session dismissal
        if (forceShow) {
            setIsDismissed(false);
            setIsVisible(true);
            return;
        }

        const dismissed = sessionStorage.getItem('tipsDismissed');
        if (dismissed) {
            setIsDismissed(true);
            return;
        }
    }, [forceShow]);

    useEffect(() => {
        if (isDismissed || tips.length <= 1) return;

        const interval = setInterval(() => {
            setIsVisible(false);
            setTimeout(() => {
                setCurrentTipIndex((prev) => (prev + 1) % tips.length);
                setIsVisible(true);
            }, 500);
        }, 30000);

        return () => clearInterval(interval);
    }, [tips.length, isDismissed]);

    const handleDismiss = () => {
        setIsDismissed(true);
        sessionStorage.setItem('tipsDismissed', 'true');
        if (onDismiss) onDismiss();
    };

    if (isDismissed || isLoading || tips.length === 0) return null;

    const currentTip = tips[currentTipIndex];

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-2xl px-4">
            <AnimatePresence mode="wait">
                {isVisible && (
                    <motion.div
                        key={currentTip.id}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-full shadow-2xl border border-green-200 dark:border-green-800 px-6 py-3 pr-12 text-center"
                    >
                        <div className="flex items-center justify-center gap-3">
                            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-1.5 rounded-full">
                                <Lightbulb className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                                <span className="text-green-600 dark:text-green-400 font-bold mr-1">Farming Tip:</span>
                                {currentTip.title} - {currentTip.excerpt || currentTip.content.substring(0, 50) + '...'}
                            </p>
                        </div>

                        <button
                            onClick={handleDismiss}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            aria-label="Dismiss tips"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FloatingTips;

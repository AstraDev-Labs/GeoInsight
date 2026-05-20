'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, ExternalLink, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImageSliderProps {
    images: string[];
    title: string;
}

export default function ImageSlider({ images, title }: ImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [hovered, setHovered] = useState(false);

    const length = images.length;

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === length - 1 ? 0 : prev + 1));
    }, [length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? length - 1 : prev - 1));
    }, [length]);

    // Autoplay logic
    useEffect(() => {
        if (!isPlaying || length <= 1) return;
        const interval = setInterval(nextSlide, 5000); // Change image every 5 seconds
        return () => clearInterval(interval);
    }, [isPlaying, nextSlide, length]);

    if (!images || length === 0) {
        return null;
    }

    if (length === 1) {
        const singleImage = images[0];
        return (
            <div className="mb-8 w-full select-none relative group bg-muted border overflow-hidden rounded-none shadow-sm">
                <a href={singleImage} target="_blank" rel="noopener noreferrer" className="block outline-none cursor-pointer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={singleImage}
                        alt={title}
                        className="w-full h-auto object-cover max-h-[700px] transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end">
                        <span className="text-white text-sm flex items-center gap-2 font-bold tracking-widest uppercase">
                            <ExternalLink size={16} /> View Full-Res
                        </span>
                    </div>
                </a>
            </div>
        );
    }

    const currentImage = images[currentIndex];

    return (
        <div 
            className="mb-8 w-full select-none relative group bg-muted overflow-hidden border border-border shadow-md rounded-2xl"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image Container with AnimatePresence for smooth sliding/fade transition */}
            <div className="relative w-full h-[350px] sm:h-[450px] md:h-[600px] lg:h-[650px] overflow-hidden flex items-center justify-center bg-black/5">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentIndex}
                        src={currentImage}
                        alt={`${title} - view ${currentIndex + 1}`}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.4, ease: 'easeInOut' }}
                        className="absolute w-full h-full object-cover"
                    />
                </AnimatePresence>

                {/* Left Shadow overlay for controls */}
                <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                {/* Right Shadow overlay for controls */}
                <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Interactive Controls & Metadata Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    {/* Index Badge and View Full-Res Action */}
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black tracking-widest uppercase bg-primary/95 text-primary-foreground px-3 py-1.5 rounded-md shadow-lg">
                            IMAGE {currentIndex + 1} OF {length}
                        </span>
                        <a 
                            href={currentImage} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-white/80 hover:text-white text-xs flex items-center gap-1.5 font-bold tracking-wider uppercase transition-colors bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-md"
                        >
                            <ExternalLink size={14} /> Full-Res
                        </a>
                    </div>

                    {/* Play/Pause Autoplay button */}
                    <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="self-start sm:self-auto text-white/90 hover:text-white bg-black/40 hover:bg-black/60 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-lg transition-all"
                        title={isPlaying ? 'Pause Autoplay' : 'Resume Autoplay'}
                    >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    </button>
                </div>

                {/* Left/Right Navigation Chevron Arrows */}
                <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-primary text-white border border-white/10 backdrop-blur-md p-3 rounded-xl transition-all duration-300 transform md:opacity-0 md:group-hover:opacity-100 md:-translate-x-4 md:group-hover:translate-x-0 shadow-xl"
                    aria-label="Previous Slide"
                >
                    <ChevronLeft size={20} />
                </button>
                <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-primary text-white border border-white/10 backdrop-blur-md p-3 rounded-xl transition-all duration-300 transform md:opacity-0 md:group-hover:opacity-100 md:translate-x-4 md:group-hover:translate-x-0 shadow-xl"
                    aria-label="Next Slide"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Pagination Bullet Indicators */}
            <div className="bg-card py-4 px-6 border-t border-border flex items-center justify-between gap-4">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest truncate max-w-[60%]">
                    Slide {currentIndex + 1}: {title}
                </span>
                <div className="flex items-center gap-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2.5 rounded-full transition-all duration-300 ${
                                currentIndex === index 
                                ? 'w-8 bg-primary shadow-lg shadow-primary/35' 
                                : 'w-2.5 bg-border hover:bg-muted-foreground/30'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

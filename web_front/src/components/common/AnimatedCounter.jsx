import React, { useEffect, useRef, useState } from 'react';

const AnimatedCounter = ({
    end = 0,
    duration = 1600,
    prefix = '',
    suffix = '',
    separator = ',',
    className = '',
}) => {
    const [count, setCount] = useState(0);
    const [started, setStarted] = useState(
        () => typeof IntersectionObserver === 'undefined'
    );
    const ref = useRef(null);

    useEffect(() => {
        const node = ref.current;
        if (!node || typeof IntersectionObserver === 'undefined') return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setStarted(true);
                    observer.unobserve(node);
                }
            },
            { threshold: 0.2 }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!started) return;

        const target = Number(end) || 0;
        let frameId;
        const startTime = performance.now();

        const tick = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));

            if (progress < 1) {
                frameId = requestAnimationFrame(tick);
            }
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [started, end, duration]);

    const formatted = separator
        ? count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator)
        : count.toString();

    return (
        <span ref={ref} className={className}>
            {prefix}
            {formatted}
            {suffix}
        </span>
    );
};

export default AnimatedCounter;

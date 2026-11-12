import React, { useEffect, useRef, useState } from 'react';

const directionClasses = {
    up: 'translate-y-8 opacity-0',
    down: '-translate-y-8 opacity-0',
    left: 'translate-x-8 opacity-0',
    right: '-translate-x-8 opacity-0',
    scale: 'scale-95 opacity-0',
    fade: 'opacity-0',
};

const Reveal = ({
    children,
    direction = 'up',
    delay = 0,
    duration = 650,
    className = '',
    threshold = 0.12,
}) => {
    const ref = useRef(null);
    const [visible, setVisible] = useState(
        () => typeof IntersectionObserver === 'undefined'
    );

    useEffect(() => {
        const node = ref.current;
        if (!node || typeof IntersectionObserver === 'undefined') return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.unobserve(node);
                }
            },
            { threshold, rootMargin: '0px 0px -40px 0px' }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [threshold]);

    const hiddenClass = directionClasses[direction] || directionClasses.up;

    return (
        <div
            ref={ref}
            style={{
                transitionDuration: `${duration}ms`,
                transitionDelay: `${delay}ms`,
                transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            }}
            className={`transition-all will-change-transform ${
                visible ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : hiddenClass
            } ${className}`}
        >
            {children}
        </div>
    );
};

export default Reveal;

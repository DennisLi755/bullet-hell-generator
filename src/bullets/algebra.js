const Alg = {
    pure: (x, y) => ({
        _tag: 'pure',
        x: x,
        y: y
    }),
    delayed: (delay, bullet) => ({
        _tag: 'delayed',
        delay,
        bullet
    }),
    angled: (angle, bullet) => ({
        _tag: 'angled',
        angle,
        bullet
    }),
    composite: (...bullets) => ({
        _tag: 'composite',
        bullets
    })
};
export { Alg };

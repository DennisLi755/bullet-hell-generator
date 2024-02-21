export type Pure = {
    readonly _tag: "pure";
    x: number,
    y: number,
};

export type Delayed = {
    readonly _tag: "delayed";
    readonly delay: number,
    readonly bullet: Bullet;
};

export type Angled = {
    readonly _tag: "angled";
    angle: number;
    readonly bullet: Bullet;
};

export type Composite = {
    readonly _tag: "composite";
    readonly bullets: Bullet[];
};

export type Bullet = Pure | Delayed | Angled | Composite;

type Algebra = {
    pure: (x: number, y: number) => Bullet;
    delayed: (t: number, b: Bullet) => Bullet;
    angled: (a: number, b: Bullet) => Bullet;
    composite: (...bullets: Bullet[]) => Bullet;
}

const Alg: Algebra = {
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
}

export {
    Alg
}
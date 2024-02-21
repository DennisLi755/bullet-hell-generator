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

// type Algebra = {
//     pure: (x: number, y: number) => Bullet;
//     delayed: ()
// }
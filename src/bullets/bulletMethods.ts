import {Alg, Bullet} from './algebra'

type BulletMethods = {
    Pure: (x: number, y, number, bullet: Bullet) => Bullet
    Delayed: (time: number, bullet: Bullet) => Bullet;
    Angled: (angle: number, bullet: Bullet) => Bullet;
    Composite: (...bullets: Bullet[]) => Bullet;
    Line: (delay: number, n: number, bullet: Bullet) => Bullet
};

const BulletTypes: BulletMethods = {
    Pure: (x, y) => Alg.pure(x, y),
    Delayed: (time, bullet) => Alg.delayed(time, bullet),
    Angled: (angle, bullet) => Alg.angled(angle, bullet),
    Composite: (...bullets) => Alg.composite(...bullets),
    Line: (delay, n, bullet) => {
        return BulletTypes.Composite(
            ...(Array(n).fill(bullet)).map((bullet, index) => 
                BulletTypes.Delayed(delay * index, bullet))
        )
    }
}
import {Alg} from './algebra.js'

const BulletTypes = {
    Pure: (x, y) => Alg.pure(x, y),
    Delayed: (time, bullet) => Alg.delayed(time, bullet),
    Angled: (angle, bullet) => Alg.angled(angle, bullet),
    Composite: (...bullets) => Alg.composite(...bullets),
    Line: (delay, n, bullet) => {
        return BulletTypes.Composite(
            ...(Array(n).fill(bullet)).map((bullet, index) => 
                BulletTypes.Delayed(delay * index, bullet))
        )
    },
    Spiral: (angle, n, time, bullets) => {
        return BulletTypes.Composite(
            ...(Array(n).fill(bullets)).map((bullet, index) => 
                BulletTypes.Angled(angle * index, BulletTypes.Delayed(time * index, bullet)))
        )
    }
}

export {
    BulletTypes as Bullet
}
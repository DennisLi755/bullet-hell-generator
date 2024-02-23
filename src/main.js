import {Bullet} from './bullets/bulletMethods.js';

// bullet drawing/updating
// drawing constraints
const width = 600;
const height = 600;
const fps = 60;
let spf = 1 / fps;
const bulletSpeed = 150;
const bulletRadius = 7;

// set reference to the canvas element and set it's size
const canvas = document.querySelector('#canvas');
canvas.width = width;
canvas.height = height;
const ctx = canvas?.getContext('2d');

let bulletObj = {}; // output from the algebra (in the form of json)
let bullets = []; // an array of 2d objects containing x, y, delay, and angle properties

const update = () => {
    clearCanvas();
    updateBullets();
}

const updateBullets = () => {
    bullets = bullets.map((bullet) => {
        if (bullet.delay <= 0) {
            ctx.fillStyle = 'red';
            drawCircle(bullet.x + width / 2, bullet.y + width / 2, bulletRadius);
            bullet.x += Math.cos(bullet.angle * (Math.PI / 180)) * spf * bulletSpeed;
            bullet.y += Math.sin(bullet.angle * (Math.PI / 180)) * spf * bulletSpeed;
        }
        bullet.delay -= spf;
        return bullet;
    });
};

const drawCircle = (x, y, r) => {
    if (x > 0 && x < width &&
        y > 0 && y < height) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
    }
};

const clearCanvas = () => {
    ctx.clearRect(0, 0, width, height);
}

const initBullets = (bullet, props) => {
    let newProps = {...props};

    switch (bullet._tag) {
        case 'composite':
            for (let i = 0; i < bullet.bullets.length; i++) {
                initBullets(bullet.bullets[i], props);
            }
            break;
        case 'delayed':
            newProps['delay'] ? newProps['delay'] += bullet.delay 
            : newProps['delay'] = bullet.delay;
            initBullets(bullet.bullet, newProps);
            break;
        case 'angled':
            newProps['angle'] ? newProps['angle'] += bullet.angle
            : newProps['angle'] = bullet.angle;
            initBullets(bullet.bullet, newProps);
            break;
        case 'pure':
            bullets.push({
                x: bullet.x,
                y: bullet.y,
                delay: props['delay'] || 0,
                angle: props['angle'] || 0
            })
            break;
    }
}

// data management

const sendPost = async (saveForm) => {
    const saveAction = saveForm.getAttribute('action');
    const saveMethod = saveForm.getAttribute('method');

    const nameField = saveForm.querySelector('#nameSave');
    const dataField = bulletObj;

    console.log(dataField);

    const formData = `name=${nameField.value}&data=${JSON.stringify(dataField)}`;

    let response = await fetch(saveAction, {
        method: saveMethod,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        body: formData,
    });
    console.log(response);
}

const init = () => {
    const saveForm = document.querySelector('#saveForm');

    const addPattern = (e) => {
        e.preventDefault();
        sendPost(saveForm);
        return false;
    }

    saveForm.addEventListener('submit', addPattern)

    const line = (bullet) => (delay, n) => Bullet.Line(delay, n, bullet);

    bulletObj = line(Bullet.Pure(0, 0))(0.2, 20);

    console.log(bulletObj);
    initBullets(bulletObj, {});
    console.log(bullets);
    setInterval(update, spf * 1000);
};

window.onload = init;
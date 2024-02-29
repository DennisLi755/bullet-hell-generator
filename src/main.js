import { Bullet } from './bullets/bulletMethods.js';
import * as Blockly from 'blockly';
import * as libraryBlocks from 'blockly/blocks';
import {javascriptGenerator, Order} from 'blockly/javascript';

// bullet drawing/updating
// drawing constraints
const width = 600;
const height = 600;
const fps = 60;
const spf = 1 / fps;
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
};

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
  if (x > 0 && x < width
        && y > 0 && y < height) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
  }
};

const clearCanvas = () => {
  ctx.clearRect(0, 0, width, height);
};

const initBullets = (bullet, props) => {
  const newProps = { ...props };

  switch (bullet._tag) {
    case 'composite':
      for (let i = 0; i < bullet.bullets.length; i++) {
        initBullets(bullet.bullets[i], props);
      }
      break;
    case 'delayed':
      newProps.delay ? newProps.delay += bullet.delay
        : newProps.delay = bullet.delay;
      initBullets(bullet.bullet, newProps);
      break;
    case 'angled':
      newProps.angle ? newProps.angle += bullet.angle
        : newProps.angle = bullet.angle;
      initBullets(bullet.bullet, newProps);
      break;
    case 'pure':
      bullets.push({
        x: bullet.x,
        y: bullet.y,
        delay: props.delay || 0,
        angle: props.angle || 0,
      });
      break;
  }
};

// data management
const handleResponse = async (response, parseResponse, name) => {
  if (parseResponse) {
    const obj = await response.json();
    console.log(obj);

    if (obj.patterns) {
      bullets = [];
      bulletObj = JSON.parse(obj.patterns[name]);
      console.log(bulletObj);
      initBullets(bulletObj, {});
    }
  }
};

const sendPost = async (saveForm) => {
  const saveAction = saveForm.getAttribute('action');
  const saveMethod = saveForm.getAttribute('method');

  const nameField = saveForm.querySelector('#nameSave');
  const dataField = bulletObj;

  console.log(dataField);

  const formData = `name=${nameField.value}&data=${JSON.stringify(bulletObj)}`;

  const response = await fetch(saveAction, {
    method: saveMethod,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: formData,
  });
  console.log(response);
};

const sendGet = async (getForm) => {
  const url = getForm.getAttribute('action');
  const method = getForm.getAttribute('method');
  const name = document.querySelector('#nameGet').value;
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
  });
  handleResponse(response, method === 'get', name);
};

//blockly stuff
const blocklyDiv = document.querySelector('#blocklyDiv');

Blockly.Blocks['bullet_block'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("Bullet");
    this.appendValueInput("Angle")
        .setCheck("Number")
        .appendField("Angle");
    this.appendValueInput("x")
        .setCheck("Number")
        .appendField("x");
    this.appendValueInput("y")
        .setCheck("Number")
        .appendField("y");
    this.setInputsInline(true);
    this.setOutput(true, "Bullet");
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

javascriptGenerator.forBlock['bullet_block'] = (block, generator) => {
  let angle = generator.valueToCode(block, 'Angle', Order.ATOMIC);
  let x = generator.valueToCode(block, 'x', Order.ATOMIC);
  let y = generator.valueToCode(block, 'y', Order.ATOMIC);
  let code =  `Bullet.Angled(${angle}, Bullet.Pure(${x}, ${y}))`;

  return code;
}

let toolbox = {
  "kind": "flyoutToolbox",
  "contents": [
    {
      'kind': 'block',
      'type': 'math_number',
      'fields': {
        'NUM': 0,
      },
    },
    {
      "kind": "block",
      "type": "bullet_block"
    },
  ]
};

let workspace = Blockly.inject(blocklyDiv, {toolbox: toolbox});

const runCode = () => {
  const code = javascriptGenerator.workspaceToCode(workspace);
  console.log(code);
  eval(code);
}

const init = () => {
  const saveForm = document.querySelector('#saveForm');
  const getForm = document.querySelector('#getForm');

  const addPattern = (e) => {
    e.preventDefault();
    sendPost(saveForm);
    return false;
  };

  const getPattern = (e) => {
    e.preventDefault();
    sendGet(getForm);
    return false;
  };

  saveForm.addEventListener('submit', addPattern);
  getForm.addEventListener('submit', getPattern);
  document.querySelector('#button').addEventListener('click', runCode);

  //const line = (bullet) => (delay, n) => Bullet.Line(delay, n, bullet);
  const spiral = (bullet) => (angle, n, time) => Bullet.Spiral(angle, n, time, bullet);

  //bulletObj = line(Bullet.Pure(0, 0))(0.2, 20);
  bulletObj = spiral(Bullet.Pure(0, 0))(20, 50, 0.1);

  console.log(bulletObj);
  initBullets(bulletObj, {});
  console.log(bullets);
  setInterval(update, spf * 1000);
};

window.onload = init;
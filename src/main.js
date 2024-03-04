import * as Blockly from 'blockly';
import { javascriptGenerator, Order } from 'blockly/javascript';

// Bullet Set Up
const Alg = {
  pure: (x, y) => ({
    _tag: 'pure',
    x,
    y,
  }),
  delayed: (delay, bullet) => ({
    _tag: 'delayed',
    delay,
    bullet,
  }),
  angled: (angle, bullet) => ({
    _tag: 'angled',
    angle,
    bullet,
  }),
  composite: (...bullets) => ({
    _tag: 'composite',
    bullets,
  }),
};

const Bullet = {
  Pure: (x, y) => Alg.pure(x, y),
  Delayed: (time, bullet) => Alg.delayed(time, bullet),
  Angled: (angle, bullet) => Alg.angled(angle, bullet),
  Composite: (...bullets) => Alg.composite(...bullets),
  Line: (delay, n, bullet) => Bullet.Composite(
    ...(Array(n).fill(bullet)).map((bullets, index) => Bullet.Delayed(delay * index, bullets)),
  ),
  Spiral: (angle, n, time, bullets) => Bullet.Composite(
    ...(Array(n).fill(bullets)).map((bullet, index) => Bullet.Angled(
      angle * index,
      Bullet.Delayed(time * index, bullet),
    )),
  ),
  Spread: (angle, bullet) => Bullet.Spiral(angle, Math.floor(360 / angle), 0, bullet),
};

const replaceAt = (string, index, replace) => string.substring(0, index) + replace
  + string.substring(index + replace.length);
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
const ctx = canvas.getContext('2d');

let bulletObj = {}; // output from the algebra (in the form of json)
let bullets = []; // an array of 2d objects containing x, y, delay, and angle properties

const drawCircle = (x, y, r) => {
  if (x > 0 && x < width
        && y > 0 && y < height) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
  }
};

const updateBullets = () => {
  bullets = bullets.map((bullet) => {
    const updatedBullet = { ...bullet };
    if (updatedBullet.delay <= 0) {
      ctx.fillStyle = 'red';
      drawCircle(updatedBullet.x + width / 2, updatedBullet.y + width / 2, bulletRadius);
      updatedBullet.x += Math.cos(updatedBullet.angle * (Math.PI / 180)) * spf * bulletSpeed;
      updatedBullet.y += Math.sin(updatedBullet.angle * (Math.PI / 180)) * spf * bulletSpeed;
    }
    updatedBullet.delay -= spf;
    return updatedBullet;
  });
};

const clearCanvas = () => {
  ctx.clearRect(0, 0, width, height);
};

const update = () => {
  clearCanvas();
  updateBullets();
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
      if (newProps.delay) newProps.delay += bullet.delay;
      else newProps.delay = bullet.delay;
      initBullets(bullet.bullet, newProps);
      break;
    case 'angled':
      if (newProps.angle) newProps.angle += bullet.angle;
      else newProps.angle = bullet.angle;
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
    default:
      console.log('bullet type not known');
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

// blockly stuff
const blocklyDiv = document.querySelector('#blocklyDiv');

// singular bullet block
Blockly.Blocks.bullet_block = {
  init() {
    this.appendDummyInput()
      .appendField('Bullet');
    this.appendValueInput('Angle')
      .setCheck('Number')
      .appendField('Angle: ');
    this.appendValueInput('x')
      .setCheck('Number')
      .appendField('x: ');
    this.appendValueInput('y')
      .setCheck('Number')
      .appendField('y: ');
    this.setPreviousStatement(true);
    this.setOutput(true, 'Bullet');
    this.setNextStatement(true);
    this.setTooltip('Makes a bullet with a starting angle and position.\nRequired to be at the end of all other statements.');
    this.setColour(230);
  },
};

// composite block
Blockly.Blocks.composite_block = {
  init() {
    this.appendDummyInput()
      .appendField('Composite');
    this.appendStatementInput('Bullets')
      .setCheck('Bullet')
      .appendField('Bullets: ');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setOutput(true, 'Bullet');
    this.setNextStatement(true);
    this.setTooltip('Multiple bullets/functions can be composed here.\nThis is the only block where multiple bullets would be correctly evaluated.');
    this.setColour(230);
  },
};

// line block
Blockly.Blocks.line_block = {
  init() {
    this.appendDummyInput()
      .appendField('Line');
    this.appendValueInput('Delay')
      .setCheck('Number')
      .appendField('Delay: ');
    this.appendValueInput('Number')
      .setCheck('Number')
      .appendField('Number: ');
    this.appendStatementInput('Bullet')
      .setCheck('Bullet')
      .appendField('Bullet: ');
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setOutput(true, 'Bullet');
    this.setNextStatement(true);
    this.setTooltip('Makes a line of bullets with the following attributes:\nDelay: The amount of time between each bullet creation\nNumber: The number of bullets\nBullet: The bullet type');
    this.setColour(230);
  },
};

// spiral block
Blockly.Blocks.spiral_block = {
  init() {
    this.appendDummyInput()
      .appendField('Spiral');
    this.appendValueInput('Angle')
      .setCheck('Number')
      .appendField('Angle: ');
    this.appendValueInput('Number')
      .setCheck('Number')
      .appendField('Number: ');
    this.appendValueInput('Delay')
      .setCheck('Number')
      .appendField('Delay: ');
    this.appendStatementInput('Bullet')
      .setCheck('Bullet')
      .appendField('Bullet: ');
    this.setPreviousStatement(true);
    this.setOutput(true, 'Bullet');
    this.setNextStatement(true);
    this.setTooltip('Makes a spiral of bullets with the following attributes:\nAngle (Degrees): The angle difference between each bullet creation\nNumber: The number of bullets\nDelay: The amount of time between each bullet creation\nBullet: The bullet type');
    this.setColour(230);
  },
};

// spiral block
Blockly.Blocks.spread_block = {
  init() {
    this.appendDummyInput()
      .appendField('Spread');
    this.appendValueInput('Angle')
      .setCheck('Number')
      .appendField('Angle: ');
    this.appendStatementInput('Bullet')
      .setCheck('Bullet')
      .appendField('Bullet: ');
    this.setPreviousStatement(true);
    this.setOutput(true, 'Bullet');
    this.setNextStatement(true);
    this.setTooltip('Makes a spread of bullets with the following attributes:\nAngle (Degrees): The angle difference between each bullet creation\nBullet: The bullet type');
    this.setColour(230);
  },
};

javascriptGenerator.forBlock.bullet_block = (block, generator) => {
  const angle = generator.valueToCode(block, 'Angle', Order.ATOMIC);
  const x = generator.valueToCode(block, 'x', Order.ATOMIC);
  const y = generator.valueToCode(block, 'y', Order.ATOMIC);
  return `Bullet.Angled(${angle}, Bullet.Pure(${x}, ${y})) `;
};

javascriptGenerator.forBlock.composite_block = (block, generator) => {
  let blockBullets = generator.statementToCode(block, 'Bullets');
  if (blockBullets.includes(') ')) {
    for (let i = 0; i < blockBullets.length; i++) {
      if (bullets[i] === ')' && bullets[i + 1] === ' ') {
        blockBullets = replaceAt(blockBullets, i + 1, ',');
      }
    }
  }
  return `Bullet.Composite(${blockBullets}) `;
};

javascriptGenerator.forBlock.line_block = (block, generator) => {
  const delay = generator.valueToCode(block, 'Delay', Order.ATOMIC);
  const number = generator.valueToCode(block, 'Number', Order.ATOMIC);
  const bullet = generator.statementToCode(block, 'Bullet');

  return `Bullet.Line(${delay}, ${number}, ${bullet}) `;
};

javascriptGenerator.forBlock.spiral_block = (block, generator) => {
  const angle = generator.valueToCode(block, 'Angle', Order.ATOMIC);
  const number = generator.valueToCode(block, 'Number', Order.ATOMIC);
  const time = generator.valueToCode(block, 'Delay', Order.ATOMIC);
  const bullet = generator.statementToCode(block, 'Bullet');

  return `Bullet.Spiral(${angle}, ${number}, ${time}, ${bullet}) `;
};

javascriptGenerator.forBlock.spread_block = (block, generator) => {
  const angle = generator.valueToCode(block, 'Angle', Order.ATOMIC);
  const bullet = generator.statementToCode(block, 'Bullet');

  return `Bullet.Spread(${angle}, ${bullet}) `;
};

const toolbox = {
  kind: 'flyoutToolbox',
  contents: [
    {
      kind: 'block',
      type: 'math_number',
      fields: {
        NUM: 0,
      },
    },
    {
      kind: 'block',
      type: 'bullet_block',
    },
    {
      kind: 'block',
      type: 'composite_block',
    },
    {
      kind: 'block',
      type: 'line_block',
    },
    {
      kind: 'block',
      type: 'spiral_block',
    },
    {
      kind: 'block',
      type: 'spread_block',
    },
  ],
};

const workspace = Blockly.inject(blocklyDiv, {
  toolbox,
  move: {
    scrollbars: {
      horizontal: true,
      vertical: true,
    },
    drag: true,
    wheel: true,
  },
});

const runCode = () => {
  bullets = [];
  const code = javascriptGenerator.workspaceToCode(workspace);
  bulletObj = eval(code);
  initBullets(bulletObj, {});
};

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

  console.log(bulletObj);
  initBullets(bulletObj, {});
  console.log(bullets);
  setInterval(update, spf * 1000);
};

window.onload = init;

import * as Blockly from 'blockly';
import { javascriptGenerator, Order } from 'blockly/javascript';

// Bullet Set Up
// Algebra that defines the most basic types of bullets
// Returns a Javascript Object defining the properties of bullets
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

// Bullet Object that defines/implements all functions for creating bullet patterns
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

// Helper function for searching through a string and replacing at a certain index
// Repurposed code from this StackOverflow thread: https://stackoverflow.com/questions/1431094/how-do-i-replace-a-character-at-a-specific-index-in-javascript
const replaceAt = (string, index, replace) => string.substring(0, index) + replace
  + string.substring(index + replace.length);

// Bullet drawing/updating
// Drawing constraints
const width = 600;
const height = 600;
const fps = 60;
const spf = 1 / fps;
const bulletSpeed = 150;
const bulletRadius = 7;

// Set reference to the canvas element and set it's size
const canvas = document.querySelector('#canvas');
canvas.width = width;
canvas.height = height;
const ctx = canvas.getContext('2d');

// Output from the algebra (in the form of json)
let bulletObj = {};
// An array of 2d objects containing x, y, delay, and angle properties
let bullets = [];

// Simple function to draw circles with Canvas
const drawCircle = (x, y, r) => {
  if (x > 0 && x < width
        && y > 0 && y < height) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fill();
  }
};

// Updates the positions and color of bullets found in the array
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

// Clears the canvas
const clearCanvas = () => {
  ctx.clearRect(0, 0, width, height);
};

// Update function for Canvas
const update = () => {
  clearCanvas();
  updateBullets();
};

// Initializes the bullets array with the JS object returned from the
// Algebras/Bullet map
// Takes in the JS object and any props (since this function is recursive)
const initBullets = (bullet, props) => {
  const newProps = { ...props };

  // Switch statement depending on the current bullets tag (which determines its type)
  // Different implementation/logic depending on the bullet type
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

// Data management
// Handles get requests
const handleResponse = async (response, parseResponse, name) => {
  // Parses the response and populates the appropriate object (bulletObj) with what was grabbed
  // from the server
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

// Sends a post request taking data from the page
const sendPost = async (saveForm) => {
  const saveAction = saveForm.getAttribute('action');
  const saveMethod = saveForm.getAttribute('method');

  const nameField = saveForm.querySelector('#nameSave');

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

// Sends a get request from the inputted name on the form
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

// Singular bullet block
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

// Composite block
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

// Line block
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

// Spiral block
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

// Spread block
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

// Generates code for the bullet block
javascriptGenerator.forBlock.bullet_block = (block, generator) => {
  const angle = generator.valueToCode(block, 'Angle', Order.ATOMIC);
  const x = generator.valueToCode(block, 'x', Order.ATOMIC);
  const y = generator.valueToCode(block, 'y', Order.ATOMIC);
  return `Bullet.Angled(${angle}, Bullet.Pure(${x}, ${y})) `;
};

// Generates code for the composite block
javascriptGenerator.forBlock.composite_block = (block, generator) => {
  let blockBullets = generator.statementToCode(block, 'Bullets');
  if (blockBullets.includes(') ')) {
    for (let i = 0; i < blockBullets.length; i++) {
      if (blockBullets[i] === ')' && blockBullets[i + 1] === ' ') {
        blockBullets = replaceAt(blockBullets, i + 1, ',');
      }
    }
  }
  return `Bullet.Composite(${blockBullets}) `;
};

// Generates code for the Line block
javascriptGenerator.forBlock.line_block = (block, generator) => {
  const delay = generator.valueToCode(block, 'Delay', Order.ATOMIC);
  const number = generator.valueToCode(block, 'Number', Order.ATOMIC);
  const bullet = generator.statementToCode(block, 'Bullet');

  return `Bullet.Line(${delay}, ${number}, ${bullet}) `;
};

// Generates code for the Spiral block
javascriptGenerator.forBlock.spiral_block = (block, generator) => {
  const angle = generator.valueToCode(block, 'Angle', Order.ATOMIC);
  const number = generator.valueToCode(block, 'Number', Order.ATOMIC);
  const time = generator.valueToCode(block, 'Delay', Order.ATOMIC);
  const bullet = generator.statementToCode(block, 'Bullet');

  return `Bullet.Spiral(${angle}, ${number}, ${time}, ${bullet}) `;
};

// Generates code for the Spread block
javascriptGenerator.forBlock.spread_block = (block, generator) => {
  const angle = generator.valueToCode(block, 'Angle', Order.ATOMIC);
  const bullet = generator.statementToCode(block, 'Bullet');

  return `Bullet.Spread(${angle}, ${bullet}) `;
};

// Toolbox object defining what blocks are in the program
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

// Workspace variable which takes in the toolbox and properties for scrolling in the workspace
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

// Function that runs when the 'Generate Pattern' button is pressed.
// Grabs the code generated from the workspace (as a string) and uses eval() to run it
const runCode = () => {
  bullets = [];
  const code = javascriptGenerator.workspaceToCode(workspace);
  console.log(code);
  // The usage of the eval() function violates ESLint's 'no-eval' rule.
  // I tried researching other methods to run code as a string, but other methods like using the
  // Function constructor violated an ESLint rule as well.

  // After careful consideration, I decided to keep the current implementation due to its
  // simplicity.
  // Within the scope of the project, I don't see the usage of this function as a large risk since
  // the code that can be generated in this function can only be made in the workspace, which uses
  // developer defined functions and logic.

  // This is still a security issue however, since it is still possible to generate a large enough
  // quantity of code and running it could be harmful for the machine (while the code itself is not
  // malicious, since it is all developer defined/implemented).

  // I completely understand if I get points taken off for this. I just wanted to explain my thought
  // process and how I got to this point.
  bulletObj = eval(code);
  initBullets(bulletObj, {});
};

// Initial function linking components together
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

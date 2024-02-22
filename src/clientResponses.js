const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/client/client.html`);
const css = fs.readFileSync(`${__dirname}/client/style.css`);
const js = fs.readFileSync(`${__dirname}/main.js`);
const algebra = fs.readFileSync(`${__dirname}/bullets/algebra.js`);
const bulletMethods = fs.readFileSync(`${__dirname}/bullets/bulletMethods.js`);

const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-type': 'text/html' });
  response.write(index);
  response.end();
};

const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-type': 'text/css' });
  response.write(css);
  response.end();
};

const getJS = (request, response) => {
  response.writeHead(200, {'Content-type': 'text/javascript'});
  response.write(js);
  response.end();
}

const getAlgebra = (request, response) => {
  response.writeHead(200, {'Content-type': 'text/javascript'});
  response.write(algebra);
  response.end();
}

const getBulletMethods = (request, response) => {
  response.writeHead(200, {'Content-type': 'text/javascript'});
  response.write(bulletMethods);
  response.end();
}

module.exports = {
  getIndex,
  getCSS,
  getJS,
  getAlgebra,
  getBulletMethods
};

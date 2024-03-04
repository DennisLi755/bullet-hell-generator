const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/client/client.html`);
const css = fs.readFileSync(`${__dirname}/client/style.css`);
const js = fs.readFileSync(`${__dirname}/../hosted/bundle.js`);

// Gets the index (html) response
const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-type': 'text/html' });
  response.write(index);
  response.end();
};

// Gets the CSS response
const getCSS = (request, response) => {
  response.writeHead(200, { 'Content-type': 'text/css' });
  response.write(css);
  response.end();
};

// Gets the JS response
const getJS = (request, response) => {
  response.writeHead(200, { 'Content-type': 'text/javascript' });
  response.write(js);
  response.end();
};

module.exports = {
  getIndex,
  getCSS,
  getJS,
};

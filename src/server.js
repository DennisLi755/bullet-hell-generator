const http = require('http');
const url = require('url');
const query = require('querystring');
const clientHandler = require('./clientResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const handleGet = (request, response, parsedUrl) => {
    if (parsedUrl.pathname === '/style.css') {
      clientHandler.getCSS(request, response);
    } else if (parsedUrl.pathname === '/main.js') {
      clientHandler.getJS(request, response);
    } else if (parsedUrl.pathname === '/bullets/algebra.js') {
      clientHandler.getAlgebra(request, response);
    } else if (parsedUrl.pathname === '/bullets/bulletMethods.js') {
      clientHandler.getBulletMethods(request, response);
    } else if (parsedUrl.pathname === '/') {
      clientHandler.getIndex(request, response);
    }
  };

const onRequest = (request, response) => {
    console.log(request.url);
    const parsedUrl = url.parse(request.url);
    handleGet(request, response, parsedUrl);
};
  
http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on port: 127.0.0.1:${port}`);
});
const http = require('http');
const url = require('url');
const query = require('querystring');
const clientHandler = require('./clientResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    '/style.css': clientHandler.getCSS,
    '/main.js': clientHandler.getJS,
    '/': clientHandler.getIndex,
    '/bullets/algebra.js': clientHandler.getAlgebra,
    '/bullets/bulletMethods.js': clientHandler.getBulletMethods,
    '/getPatterns': jsonHandler.getPatterns,
    notFound: jsonHandler.notFound
  }
}

const onRequest = (request, response) => {
    console.log(request.url);
    const parsedUrl = url.parse(request.url);
    if (urlStruct[request.method][parsedUrl.pathname]) {
      return urlStruct[request.method][parsedUrl.pathname](request, response);
    } 
      
    return urlStruct[request.method].notFound(request, response);
};
  
http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on port: 127.0.0.1:${port}`);
});
const http = require('http');
const url = require('url');
const query = require('querystring');
const clientHandler = require('./clientResponses.js');
const jsonHandler = require('./jsonResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

// URLstruct that defines the endpoints to their respective functions
const urlStruct = {
  GET: {
    '/style.css': clientHandler.getCSS,
    '/hosted/bundle.js': clientHandler.getJS,
    '/': clientHandler.getIndex,
    '/getPatterns': jsonHandler.getPatterns,
    notFound: jsonHandler.notFound,
  },
  POST: {
    '/addPattern': jsonHandler.addPattern,
  },
};

// Function that takes the body of a request and parses it
const parseBody = (request, response, handler) => {
  const body = [];
  request.on('error', (err) => {
    console.log(err);
    response.statusCode = 400;
    response.end();
  });

  request.on('data', (chunk) => {
    body.push(chunk);
  });

  request.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);

    handler(request, response, bodyParams);
  });
};

// Function that runs everytime a request is made to the server
const onRequest = (request, response) => {
  console.log(request.url);
  const parsedUrl = url.parse(request.url);
  if (request.method === 'POST') {
    return parseBody(request, response, urlStruct[request.method][parsedUrl.pathname]);
  } if (urlStruct[request.method][parsedUrl.pathname]) {
    return urlStruct[request.method][parsedUrl.pathname](request, response);
  }

  return urlStruct[request.method].notFound(request, response);
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on port: 127.0.0.1:${port}`);
});

const http = require('http');
const url = require('url');
const clientHandler = require('./clientResponses.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  GET: {
    '/style.css': clientHandler.getCSS,
    '/hosted/bundle.js': clientHandler.getJS,
    '/': clientHandler.getIndex,
    notFound: clientHandler.getIndex,
  },
};

const onRequest = (request, response) => {
  console.log(request.url);
  const parsedUrl = url.parse(request.url);
  if (urlStruct.GET[parsedUrl.pathname]) {
    return urlStruct.GET[parsedUrl.pathname](request, response);
  }
  return urlStruct.GET.notFound(request, response);
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on port: 127.0.0.1:${port}`);
});

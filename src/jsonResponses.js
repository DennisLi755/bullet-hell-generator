// pattern structure:
// patterns = {
//     'name1': {
//         pattern data
//     },
//     'name2': {
//         pattern data
//     }, etc...
// }
// Patterns object that holds all the users saved patterns
const patterns = {};

// Function that sends a request with JSON data to the server
const respondJSON = (request, response, status, object) => {
  response.writeHead(status, { 'Content-type': 'application/json' });
  response.write(JSON.stringify(object));
  response.end();
};

// Function that sends a head request to the server
const respondJSONMeta = (request, response, status) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end();
};

// Request that is sent when a page that does not exist is accessed
const notFound = (request, response) => {
  const responseJSON = {
    message: 'The page you are looking for was not found.',
    id: 'notFound',
  };
  return respondJSON(request, response, 404, responseJSON);
};

// Gets the patterns currently stored
const getPatterns = (request, response) => {
  const responseJSON = {
    patterns,
  };
  return respondJSON(request, response, 200, responseJSON);
};

// Adds a pattern to the server
const addPattern = (request, response, body) => {
  const responseJSON = {
    message: 'No pattern currently made',
  };

  if (!body.name || !body.data) {
    responseJSON.id = 'missingParams';
    return respondJSON(request, response, 400, responseJSON);
  }

  let responseCode = 204;
  if (!patterns[body.name]) {
    responseCode = 201;
    patterns[body.name] = {};
  }

  patterns[body.name] = body.data;

  if (responseCode === 201) {
    responseJSON.message = 'Created successfully';
    return respondJSON(request, response, responseCode, responseJSON);
  }

  return respondJSONMeta(request, response, responseCode);
};

module.exports = {
  notFound,
  addPattern,
  getPatterns,
};

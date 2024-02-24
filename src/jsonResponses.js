// pattern structure:
// patterns = {
//     'name1': {
//         pattern data
//     },
//     'name2': {
//         pattern data
//     }, etc...
// }
const patterns = {};

const respondJSON = (request, response, status, object) => {
    response.writeHead(status, { 'Content-type': 'application/json' });
    response.write(JSON.stringify(object));
    response.end()
}

const respondJSONMeta = (request, response, status) => {
    response.writeHead(status, { 'Content-Type': 'application/json' });
    response.end();
}

const notFound = (request, response) => {
    const responseJSON = {
        message: 'The page you are looking for was not found.',
        id: 'notFound',
    };
    return respondJSON(request, response, 404, responseJSON);
}

const getPatterns = (request, response) => {
    const responseJSON = {
        patterns,
    };
    return respondJSON(request, response, 200, responseJSON);
}

const addPattern = (request, response, body) => {
    const responseJSON = {
        message: 'No pattern currently made'
    };

    if (!body.name || !body.data) {
        responseJSON.id = 'missingParams';
        return responseJSON(request, response, 400, responsejSON);
    }

    let responseCode = 204;
    if (!patterns[body.name]) {
        responseCode = 201;
        patterns[body.name] = {};
    }

    patterns[body.name] = body.data;

    if (responseCode === 201) {
        responseJSON.message = `Created successfully`;
        return respondJSON(request, response, responseCode, responseJSON);
    }

    return respondJSONMeta(request, response, responseCode)
}

module.exports = {
    notFound,
    addPattern,
    getPatterns
}
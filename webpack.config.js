const path = require('path');

module.exports = {
    entry: './src/main.js',
    mode: 'development',
    watchOptions: {
        aggregateTimeout: 200,
    },
    output: {
        /* The path specifies where the bundle will be placed in our code project.
           In this case, we use the path library to resolve a filepath to the hosted
           folder.
        */
        path: path.resolve(__dirname, 'hosted'),

        // The filename determines the name of the build bundle file.
        filename: 'bundle.js',
    },
}
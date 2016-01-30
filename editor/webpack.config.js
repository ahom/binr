var path = require('path')

module.exports = {
    entry: "./lib/boot",
    output: {
        path: path.join(__dirname, "lib"),
        filename: "bundle.js",
        library: "binr-editor",
        libraryTarget: "umd"
    },
    devtool: "source-map"
}

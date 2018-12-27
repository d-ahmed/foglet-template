module.exports = {
  mode: "development",
  entry: "./lib/index.js",
  output: {
    path: require("path").resolve(process.cwd(), "bin"),
    filename: "consensus.bundle.js",
    library: "consensus",
    libraryTarget: "umd",
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: () => {
          return true;
        },
        use: {
          loader: "babel-loader",
          options: {
            presets: ["env"]
          }
        }
      }
    ]
  },
  devtool: "source-map"
};

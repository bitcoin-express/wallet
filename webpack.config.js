// run production:
//  - npm run build:prod -- --env.dir ./path/to/whatever/
// run dist:
//  - npm run build:dist
// run dev + watch:
//  - npm run build:dev 

module.exports = function (env) {
  let destPath = './dev/js/';
  let type =  "dev";
  if ("prod" in  env) {
    type = "prod";
    destPath = './dist/js/'
  }
  if ("dir" in env) {
    destPath = `${env.dir}js/`;
  }
  console.log("type: ", type, ", destination_path: ", destPath);
  return require(`./webpack.${type}.js`)(env.version, destPath);
};

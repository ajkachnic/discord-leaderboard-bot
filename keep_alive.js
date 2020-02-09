var http = require('http');
let port = process.env.PORT || 3000

http.createServer(function (req, res) {
  res.write("I'm alive");
  res.end();
}).listen(port, () => {
    console.log("Running Webserver")
});

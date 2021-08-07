let app = require("./server.js");
const PORT = 3000;
const HOST = "0.0.0.0";
app.listen(PORT, HOST, () => {
  console.log(`Started at http://localhost:${PORT}`);
});

const app = require("./server");

app.listen(process.env.PORT || 3100, () => {
  console.log("Server started on http://localhost:3100");
});

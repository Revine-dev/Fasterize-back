const app = require("./server");
const cors = require("cors");

const allowedDomains = ["http://localhost:3000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedDomains.indexOf(origin) === -1) {
        return callback(new Error("Access Forbidden"), false);
      }
      return callback(null, true);
    },
  })
);

app.listen(process.env.PORT || 3100, () => {
  console.log("Server started on http://localhost:3100");
});

import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = process.env.PORT;

// for parsing json
app.use(
  bodyParser.json({
    limit: "50mb",
  })
);
// for parsing application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

app.listen(port, () => {
  console.log(
    `Server listening in ${
      process.env.NODE_ENV
    } mode to the port ${port} ${new Date()}`
  );
});

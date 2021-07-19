const express = require("express");
const formidableMiddleware = require("express-formidable");
const axios = require("axios");
const fsCodes = require("./code.json");
const locations = require("./locations.json");
const cors = require("cors");

const allowedDomains = [
  "https://fasterize-c6c670.netlify.app",
  "http://localhost:3000",
];

const app = express();
app.use(formidableMiddleware());

app.use(
  cors({
    origin: (origin, callback) => {
      if (allowedDomains.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Deny by CORS"));
      }
    },
  })
);

app.post("/", async (req, res) => {
  if (req.fields.url) {
    try {
      const response = await axios.get(req.fields.url);

      if (
        !response.headers ||
        !response.headers["x-fstrz"] ||
        !response.headers["x-gen-id"] ||
        !response.headers["server"] ||
        !response.headers["x-cache"] ||
        !response.headers["x-amz-cf-pop"]
      ) {
        return res.status(400).json({
          plugged: false,
        });
      }

      const decodedCodes = response.headers["x-fstrz"]
        .split(",")
        .map((code) => fsCodes[code]);

      let location;
      try {
        const country = await axios.get(
          "https://www.cloudping.cloud/cloudfront-edge-locations.json"
        );
        location =
          country.data.nodes[response.headers["x-amz-cf-pop"].substring(0, 3)]
            .city;
      } catch (error) {
        location = locations.nodes[
          response.headers["x-amz-cf-pop"].substring(0, 3)
        ]
          ? locations.nodes[response.headers["x-amz-cf-pop"].substring(0, 3)]
              .city
          : "Unknow";
      }

      return res.status(200).json({
        plugged: true,
        statusCode: response.status,
        fstrzFlags: decodedCodes,
        cloudfrontStatus: (response.headers["x-cache"].match(/Miss/)
          ? "miss"
          : "hit"
        ).toLocaleUpperCase(),
        cloudfrontPOP: location,
      });
    } catch (error) {
      res.status(400).json({
        error: {
          message: error.message,
          fetched: true,
        },
      });
    }
  } else {
    res.status(400).json({
      error: {
        message: "Missing element",
      },
    });
  }
});

app.all("*", async (req, res) => {
  res.status(404).send("Welcome to Fasterize, you're on the default page.");
});

module.exports = app;

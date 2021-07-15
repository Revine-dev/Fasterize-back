const express = require("express");
const formidableMiddleware = require("express-formidable");
const axios = require("axios");
const fsCodes = require("./code.json");
const locations = require("./locations.json");

const app = express();
app.use(formidableMiddleware());

app.post("/verify", async (req, res) => {
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
        .map((code) => fsCodes[code].toLowerCase());

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

module.exports = app;

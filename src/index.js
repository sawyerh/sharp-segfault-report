const express = require("express");
const UploadProcessor = require("./upload-processor");

const app = express();
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(
    "🚀 Open http://localhost:3000 in your browser to simulate a file processing. Load it a second time to simulate a crash."
  );
});

app.get("/", async (req, res) => {
  const uploadProcessor = new UploadProcessor();

  try {
    const data = await uploadProcessor.processUpload();
    console.log("✅  Successfully processed src/image.tif", data);

    res
      .status(201)
      .send(
        `Successfully processed src/image.tif and generated the following files: <br/><br/> <pre>${JSON.stringify(
          data
        )}</pre>`
      );
  } catch (error) {
    console.info("🛑 Request failed");
    console.error(error);

    res.status(400).send({ error: error.message });
  }
});

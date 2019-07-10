const PDFDocument = require("pdfkit");
const fs = require("fs");
const sharp = require("sharp");
const ghostscript = require("ghostscript4js");
const path = require("path");
const uuidv4 = require("uuid/v4");

class UploadProcessor {
  constructor() {
    this.id = uuidv4();
  }

  /**
   * In the real app, this would also rotate and resize the image.
   * @param {String} imagePath - path to an image file.
   * @returns {Promise<Buffer>} Resolves with the file's Buffer
   */
  async convertImageToJPEG(imagePath) {
    console.log("2️⃣  Converting image to JPEG buffer with sharp()", {
      imagePath
    });

    return sharp(imagePath)
      .toFormat("jpeg")
      .toBuffer();
  }

  /**
   * In the real app, this would merge multiple images into a single PDF
   * @param {String} imagePath
   * @param {String} outputPDFPath
   * @resolves {Promise}
   */
  async convertImageToPDF(imagePath, outputPDFPath) {
    const jpegBuffer = await this.convertImageToJPEG(imagePath);
    return this.createPDF(jpegBuffer, outputPDFPath);
  }

  /**
   * Use GhostScript to convert a PDF to a TIFF. In the real app, this would merge
   * multiple PDFs into a single, multi-page TIFF file.
   * @param {String} pdfPath
   * @param {String} outputTiffPath
   * @resolves {Promise}
   */
  async convertPDFToTiff(pdfPath, outputTiffPath) {
    console.log("4️⃣  Converting PDF to a TIFF with GhostScript", {
      pdfPath,
      outputTiffPath
    });

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Fix: Option 1
    // To simulate a second request that doesn't fail, uncomment the line below,
    // which would skip execution of the GhostScript command that generates a TIFF
    // image from the input PDF file.
    // return Promise.resolve();
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // GhostScript options:
    // -q Quiet
    // -dNOPAUSE Do not pause after each page
    const gsCmd = `gs -q -dNOPAUSE -sDEVICE=tiff12nc -sCompression=lzw -o ${outputTiffPath} -r200 ${pdfPath}`;
    return ghostscript.execute(gsCmd);
  }

  /**
   * In the real app, this would loop through multiple images, and create
   * a PDF with each image on its own page.
   * @param {Buffer} jpegBuffer
   * @param {String} outputPDFPath
   * @returns {Promise}
   */
  async createPDF(jpegBuffer, outputPDFPath) {
    console.log("3️⃣  Creating PDF with PDFKit");
    // PDFDocument instances are readable Node streams.
    // http://pdfkit.org/docs/getting_started.html
    const pdfDoc = new PDFDocument();
    const pdfWriteStream = fs.createWriteStream(outputPDFPath);
    pdfDoc.pipe(pdfWriteStream);

    // Add image to PDF's first page
    pdfDoc.image(jpegBuffer, 0, 0, { fit: [612, 792] });

    return new Promise((resolve, reject) => {
      pdfWriteStream.on("finish", resolve);
      pdfWriteStream.on("error", reject);
      pdfDoc.end();
    });
  }

  /**
   * In the real app, this method would download a Blob from the web, then
   * pipe it to a fs.WriteStream, storing the file in tmp/ for further processing
   * @returns {Promise<String>} Resolves with path to tmp file
   */
  async downloadFiles() {
    const sourceTiffPath = path.resolve(__dirname, "image.tif");

    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Fix: Option 2
    // To simulate a second request that doesn't fail, uncomment the line below,
    // which would skip creating a write stream that places the file in tmp/,
    // and would instead pass the src/image.tif file to sharp()
    // return sourceTiffPath;
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    const localTmpTiffPath = `/tmp/sharp-pdf-ghostscript/image-${this.id}.tif`;
    console.log(
      "1️⃣  Simulating download of a remote file: Copying image.tif to tmp/",
      {
        sourceTiffPath,
        localTmpTiffPath
      }
    );

    const readStream = fs.createReadStream(sourceTiffPath);
    const writeStream = fs.createWriteStream(localTmpTiffPath);

    return new Promise((resolve, reject) => {
      writeStream.on("finish", () => {
        resolve(localTmpTiffPath);
      });
      writeStream.on("error", reject);
      readStream.pipe(writeStream);
    });
  }

  async processUpload() {
    const localTmpTiffPath = await this.downloadFiles();
    const ghostScriptTiffOutputPath = `/tmp/sharp-pdf-ghostscript/ghostscript-${
      this.id
    }.tiff`;
    const pdfOutputPath = `/tmp/sharp-pdf-ghostscript/pdfkit-${this.id}.pdf`;

    await this.convertImageToPDF(localTmpTiffPath, pdfOutputPath);
    await this.convertPDFToTiff(pdfOutputPath, ghostScriptTiffOutputPath);

    return { localTmpTiffPath, ghostScriptTiffOutputPath, pdfOutputPath };
  }
}

module.exports = UploadProcessor;

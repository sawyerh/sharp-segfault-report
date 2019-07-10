# Segmentation fault proof of concept

This codebase demonstrates a segmentation fault caused by _something_ related to the interaction of `sharp`, `ghostscript4js` and possibly Node Streams.

## Prerequisites

- Docker

## What this includes

- The bulk of the logic is in [`src/upload-processor.js`](src/upload-processor.js), which handles the following:
    1. Copies `src/image.tif` to the `tmp/sharp-pdf-ghostscript` directory. In the real world, the app would download a remote file, and this simulates that streaming logic.
    1. Uses `sharp` to convert the TIFF to a JPEG. In the real world, we use `sharp` for other things like rotation and resizing.
    1. Uses `pdfkit` to generate a PDF with the new JPEG image. In the real world, we are combining multiple images into a single PDF.
    1. Uses `ghostscript4js` to convert this new PDF to a TIFF image. In the real world, we are combining PDFs into a single multi-page TIFF file...for reasons.

- Express server with a single route (`GET localhost:3000/`) so you can easily trigger `UploadProcessor#processUpload` which runs the steps outlined above.

## Installation

1. Clone this repo
1. Build the Docker container:
    ```
    npm run docker:build
    ```

Note: running the above will create a new local directory: `/tmp/sharp-pdf-ghostscript` where generate image/pdf files will be saved.

## Running and simulating the issue

1. Start the Docker container:
    ```
    npm run docker:start
    ```
1. This will start an Express server at `localhost:3000`
1. Open `localhost:3000` in your browser to simulate the processing of a file.
    - Once the request completes, your browser should show paths to the generated files. You can browse to those `tmp` paths locally on your machine to view the files.
1. Refresh the page to simulate a second GET request. This should crash the server and show a segmentation fault in your terminal.

## Debugging / Viewing a backtrace

`npm run docker:start` runs node in debug mode, at port `9229`

### Getting a backtrace

You can also get a backtrace by using `gdb`:

1. Run the Docker container with the following:
    ```
    npm run docker:gdb
    ```
1. Once `gdb` is ready, type `run` and press enter. This will start the server.
1. Go through the steps outlined above to simulate the segmentation fault.
1. Once the segmentation fault occurs, you can type `backtrace` and press enter

## "Fixing" the crash

So far, we've identified two things that, when disabled, "fix" the crash. (It's not a true fix though since we need these things enabled for full functionality).

In [`src/upload-processor.js`](src/upload-processor.js), we've commented out two locations. Search for `Fix: Option` to find them.

1. If we don't create a `WriteStream` to copy `src/image.tif` to the `tmp` directory, and instead pass the `src/image.tif` path to `sharp`, the server doesn't crash on the second request.
1. If we don't execute the GhostScript command that converts the PDF to a TIFF, the server doesn't crash on the second request.
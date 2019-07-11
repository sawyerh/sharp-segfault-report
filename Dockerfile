FROM node:10

# - ghostscript libgs-dev   GhostScript dependencies
# - gdb                     Debugging depednency
RUN apt-get update && apt-get install -y \
  ghostscript libgs-dev \
  gdb

# Install libvips from source, inspired by:
# https://github.com/jcupitt/docker-builds/blob/master/libvips-mozjpeg-ubuntu18.10/Dockerfile
ARG VIPS_VERSION=8.7.4
ARG VIPS_URL=https://github.com/libvips/libvips/releases/download

# libvips installs to /usr/local by default .. /usr/local/bin is on the
# default path in ubuntu, but /usr/local/lib is not
ENV LD_LIBRARY_PATH /usr/local/lib

RUN wget ${VIPS_URL}/v${VIPS_VERSION}/vips-${VIPS_VERSION}.tar.gz \
  && tar xzf vips-${VIPS_VERSION}.tar.gz

# libvips is marked up for auto-vectorisation ... -O3 is the optimisation
# level that enables this for gcc
RUN cd vips-${VIPS_VERSION} \
  && ./configure \
  && make \
  && make install

WORKDIR /var/app

# install build dependencies
COPY package*.json /var/app/
# Set the environment variable GS4JS_HOME so that node-gyp
# build operation can find the gslib library when installing
# ghostscript4js.
ENV GS4JS_HOME=/usr/lib/x86_64-linux-gnu
RUN npm install --no-audit

# Copy over rest of source code
COPY src /var/app/src

# Start the app
EXPOSE 3000
CMD ["npm", "start"]

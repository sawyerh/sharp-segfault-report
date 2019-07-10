FROM node:10

# - ghostscript libgs-dev   GhostScript dependencies
# - gdb                     Debugging depednency
RUN apt-get update && apt-get install -y \
  ghostscript libgs-dev \
  gdb

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

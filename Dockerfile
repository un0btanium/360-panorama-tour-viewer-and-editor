FROM node:16

# Create app directory
WORKDIR /usr/src/panorama360

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you are building your code for:
# Development
RUN npm install --silent
# Production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Bundle frontend with webpack
RUN npm run-script webpack-build

# Map port by the docker deamon to 3000
EXPOSE 3000

# Run node server
CMD [ "node", "backend/server.js" ]
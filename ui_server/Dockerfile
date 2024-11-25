FROM node:18.20.3

WORKDIR /work

COPY . /work

RUN npm install -g npm@10.2.3
RUN npm ci

CMD ["npm", "run", "dev"]

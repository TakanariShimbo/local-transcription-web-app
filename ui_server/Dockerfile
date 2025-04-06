FROM node:18.20.3

WORKDIR /work

COPY . /work

RUN npm install -g npm@10.2.3
RUN npm ci
RUN npm run build

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]

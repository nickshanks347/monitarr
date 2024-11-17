FROM node:18

EXPOSE 80 443 3000

WORKDIR /code

CMD yarn run build

CMD yarn run start
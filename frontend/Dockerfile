FROM node:20-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

FROM node:20-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=build /app/build .
EXPOSE 3000
CMD ["sh", "-c", "sed -i 's|<head>|<head><script>window.__API_URL__=\"'$REACT_APP_API_URL'\";</script>|' index.html && serve -s . -l $PORT"]

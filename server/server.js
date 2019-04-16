const express = require('express');
const bodyParser = require('body-parser');
const graphqlHtpp = require('express-graphql');
const mongoose = require('mongoose');
const authenticated = require('./middleware/authenticated');

const graphQlSchema = require('./graphql/schema/index');
const graphQlResolvers = require('./graphql/resolvers/index');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(authenticated);

app.use('/graphql', graphqlHtpp({
  schema: graphQlSchema,
  rootValue: graphQlResolvers,
  graphiql: false
}));

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@graphqlapp-y9axg.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
).then(() => {
  app.listen(8000);
}).catch(err => {
  console.log(err);
});
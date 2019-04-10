const express = require('express');
const bodyParser = require('body-parser');
const graphqlHtpp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');

const app = express();

// const events = [];

app.use(bodyParser.json());

// [String!]! - not null and not a list of null

app.use('/graphql', graphqlHtpp({
  schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: {
    events: () => {
      // return events;
      return Event.find().then(events => {
        return events.map(event => ({ ...event._doc, _id: event.id }));
      }).catch(err => {
        console.log(err);
        throw err;
      });
    },
    createEvent: (args) => {
      // const event = {
      //   _id: Math.random().toString(),
      //   title: args.eventInput.title,
      //   description: args.eventInput.description,
      //   price: +args.eventInput.price,
      //   date: args.eventInput.date
      // };
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date)
      });
      return event.save().then(result => {
        console.log(result);
        return { ...result._doc, _id: result._doc._id.toString() };
      }).catch(err => {
        console.log(err);
        throw err;
      });
      // events.push(event);
      return event;
    }
  },
  graphiql: true
}));

mongoose.connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@graphqlapp-y9axg.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
).then(() => {
  app.listen(3000);
}).catch(err => {
  console.log(err);
});
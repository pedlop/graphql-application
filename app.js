const express = require('express');
const bodyParser = require('body-parser');
const graphqlHtpp = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHtpp({
  schema: buildSchema(`
    type Event {
      _id: ID!
      title: String!
      description: String!
      price: Float!
      date: String!
      creator: User!
    }

    type User {
      _id: ID!
      email: String!
      password: String
      createdEvents: [Event!]
    }

    input EventInput {
      title: String!
      description: String!
      price: Float!
      date: String!
    }

    input UserInput {
      email: String!
      password: String!
    }

    type RootQuery {
      events: [Event!]!
    }

    type RootMutation {
      createEvent(eventInput: EventInput): Event
      createUser(userInput: UserInput): User
    }

    schema {
      query: RootQuery
      mutation: RootMutation
    }
  `),
  rootValue: {
    events: () => {
      return Event.find().then(events => {
        return events.map(event => ({ ...event._doc, _id: event.id }));
      }).catch(err => {
        console.log(err);
        throw err;
      });
    },
    createEvent: (args) => {
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creator: '5cae37eb4577b94cc11cb638'
      });
      let createdEvent;
      return event
        .save()
        .then(result => {
          createdEvent = { ...result._doc, _id: result._doc._id.toString() };
          return User.findById('5cae37eb4577b94cc11cb638');
        })
        .then(user => {
          if (!user) {
            throw new Error('User not found.');
          }
          user.createdEvents.push(event);
          return user.save();
        })
        .then(result => {
          return createdEvent;
        })
        .catch(err => {
          console.log(err);
          throw err;
        });
    },
    createUser: args => {
      return User.findOne({ email: args.userInput.email })
        .then(user => {
          if (user) {
            throw new Error('User exists already');
          }
          return bcrypt.hash(args.userInput.password, 12)
        })
        .then(hashedPassword => {
          const user = new User({
            email: args.userInput.email,
            password: hashedPassword
          });
          return user.save();
        })
        .then(result => {
          return { ...result._doc, password: null, id: result.id };
        })
        .catch(err => {
          throw err;
        });
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
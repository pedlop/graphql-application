# graphql-application

### Class 4

**Types**

```
mutation{
  createEvent(eventInput:{ title: "A Test", description: "Does this work?", price: 9.99, date: "2019-04-10T14:12:21.247Z" }) {
    title
    description
  }
}
```

```
query{
  events{
    _id
    date
  }
}
```
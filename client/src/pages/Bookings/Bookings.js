import React, { Component } from 'react';

class BookingsPage extends Component {
  state = {
    bookings: [],
    loading: false
  };

  componentDidMount() {

  }

  fetchBookings = () => {
    this.setState({ loading: true });
    const requestBody = {
      query: `
        query {
          bookings {
            _id
            createdAt
            event {
              _id
              title
              date
            }
          }
        }
      `
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json'
      }
    }).then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Failed!');
      }
      return res.json();
    }).then(response => {
      console.log(response);
      const events = response.data.events;
      this.setState({ events: events, loading: false });
    }).catch(err => {
      console.log(err);
      this.setState({ loading: false });
    });
  };

  render() {
    return (<h1>The Bookings Page</h1>);
  }
}

export default BookingsPage;
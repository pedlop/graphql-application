import React, { Component } from 'react';

import BookingList from '../../components/Bookings/BookingList/BookingList';
import Loading from '../../components/Loading/Loading';
import AuthContext from '../../context/auth-context';

class BookingsPage extends Component {
  state = {
    bookings: [],
    loading: false
  };

  static contextType = AuthContext;

  componentDidMount() {
    this.fetchBookings();
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.context.token}`
      }
    }).then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Failed!');
      }
      return res.json();
    }).then(response => {
      console.log(response);
      const bookings = response.data.bookings;
      this.setState({ bookings: bookings, loading: false });
    }).catch(err => {
      console.log(err);
      this.setState({ loading: false });
    });
  };

  deleteBookingHandler = (bookingId) => {
    this.setState({ loading: true });
    console.log(bookingId);
    const requestBody = {
      query: `
        mutation {
          cancelBooking(bookingId: "${bookingId}") {
            _id
            title
          }
        }
      `
    };

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.context.token}`
      }
    }).then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Failed!');
      }
      return res.json();
    }).then(response => {
      this.setState(previousState => {
        const updatedBookings = previousState.bookings.filter(booking => booking._id !== bookingId);
        return { bookings: updatedBookings, loading: false };
      });
    }).catch(err => {
      console.log(err);
      this.setState({ loading: false });
    });
  };

  render() {
    return (
      <React.Fragment>
        {this.state.loading ? (
          <Loading />
        ) : (
            <BookingList bookings={this.state.bookings} onDelete={this.deleteBookingHandler} />
          )}
      </React.Fragment>
    );
  }
}

export default BookingsPage;
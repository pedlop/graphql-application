import React, { Component } from 'react';

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

  render() {
    return (
      <React.Fragment>
        {this.state.loading ? (
          <Loading />
        ) : (
            <ul>
              {this.state.bookings.map(booking => (
                <li key={booking._id}>
                  {booking.event.title} - {' '}
                  {new Date(booking.createdAt).toLocaleDateString('pt-BR')}
                </li>
              ))}
            </ul>
          )}
      </React.Fragment>
    );
  }
}

export default BookingsPage;
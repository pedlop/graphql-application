import React, { Component } from 'react';

import BookingList from '../../components/Bookings/BookingList/BookingList';
import BookingsChart from '../../components/Bookings/BookingsChart/BookingsChart';
import BookingsControls from '../../components/Bookings/BookingsControls/BookingsControls';
import Loading from '../../components/Loading/Loading';
import AuthContext from '../../context/auth-context';

class BookingsPage extends Component {
  state = {
    bookings: [],
    loading: false,
    outputType: 'list'
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
              price
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
      const bookings = response.data.bookings;
      this.setState({ bookings: bookings, loading: false });
    }).catch(err => {
      console.log(err);
      this.setState({ loading: false });
    });
  };

  deleteBookingHandler = (bookingId) => {
    this.setState({ loading: true });
    const requestBody = {
      query: `
        mutation CancelBooking($id: ID!) {
          cancelBooking(bookingId: $id) {
            _id
            title
          }
        }
      `,
      variables: {
        id: bookingId
      }
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

  changeOutputTypeHandler = outputType => {
    if (outputType === 'list') {
      this.setState({ outputType })
    } else {
      this.setState({ outputType: 'chart' })
    }
  };

  render() {
    let content = <Loading />;
    if (!this.state.loading) {
      content = (
        <React.Fragment>
          <BookingsControls
            activeOutputType={this.state.outputType}
            onChange={this.changeOutputTypeHandler}
          />
          <div>
            {this.state.outputType === 'list' ? (
              <BookingList
                bookings={this.state.bookings}
                onDelete={this.deleteBookingHandler}
              />
            ) : (
                <BookingsChart bookings={this.state.bookings} />
              )}
          </div>
        </React.Fragment>
      );
    }
    return (
      <React.Fragment>
        {content}
      </React.Fragment>
    );
  }
}

export default BookingsPage;
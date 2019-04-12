import React, { Component } from 'react';

import Modal from '../../components/Modal/Modal';
import Backdrop from '../../components/Backdrop/Backdrop';
import EventList from '../../components/Events/EventList/EventList';
import Loading from '../../components/Loading/Loading';
import AuthContext from '../../context/auth-context';
import './Events.css';

class EventsPage extends Component {
  state = {
    creating: false,
    events: [],
    loading: false,
    selectedEvent: null
  };

  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.titleElementRef = React.createRef();
    this.priceElementRef = React.createRef();
    this.dateElementRef = React.createRef();
    this.descriptionElementRef = React.createRef();
  }

  componentDidMount() {
    this.fecthEvents();
  }

  startCreateEventHandler = () => {
    this.setState({ creating: true });
  };

  modalConfirmHandler = () => {
    // this.setState({ creating: false });
    const title = this.titleElementRef.current.value;
    const price = +this.priceElementRef.current.value;
    const date = this.dateElementRef.current.value;
    const description = this.descriptionElementRef.current.value;

    if (
      title.trim().length === 0 ||
      price <= 0 ||
      date.trim().length === 0 ||
      description.trim().length === 0
    ) {
      return;
    }

    const event = { title, price, date, description };
    console.log(event);


    const requestBody = {
      query: `
        mutation {
          createEvent(eventInput: { title: "${title}", description: "${description}", price: ${price}, date: "${date}" }) {
            _id
            title
            description
            price
            date
          }
        }
      `
    };

    const token = this.context.token;

    fetch('http://localhost:8000/graphql', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).then(res => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Failed!');
      }
      return res.json();
    }).then(response => {
      // this.fecthEvents();
      this.setState(previousState => {
        const updatedEvents = [...previousState.events];
        updatedEvents.push({
          _id: response.data.createEvent._id,
          title: response.data.createEvent.title,
          description: response.data.createEvent.description,
          price: response.data.createEvent.price,
          date: response.data.createEvent.date,
          creator: {
            _id: this.context.userId,
          }
        });
        return { events: updatedEvents };
      });
    }).catch(err => {
      console.log(err);
    });
  };

  modalCancelHandler = () => {
    this.setState({ creating: false, selectedEvent: null });
  };

  fecthEvents() {
    this.setState({ loading: true });
    const requestBody = {
      query: `
        query {
          events {
            _id
            title
            description
            price
            date
            creator {
              _id
              email
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

  showDetailHandler = eventId => {
    this.setState(previousState => {
      const selectedEvent = previousState.events.find(e => e._id === eventId);
      console.log(selectedEvent);
      return { selectedEvent };
    });
  };

  bookEventHandler = () => {

  };

  render() {
    return (
      <React.Fragment>
        {(this.state.creating || this.state.selectedEvent) && <Backdrop />}
        {this.state.creating && (
          <Modal title="Add Event" canCancel canConfirm onCancel={this.modalCancelHandler} onConfirm={this.modalConfirmHandler} confirmText="Confirm">
            <form>
              <div className="form-control">
                <label htmlFor="title">Title</label>
                <input type="text" id="title" ref={this.titleElementRef}></input>
              </div>
              <div className="form-control">
                <label htmlFor="price">Price</label>
                <input type="number" id="price" ref={this.priceElementRef}></input>
              </div>
              <div className="form-control">
                <label htmlFor="date">Date</label>
                <input type="datetime-local" id="date" ref={this.dateElementRef}></input>
              </div>
              <div className="form-control">
                <label htmlFor="description">Description</label>
                <textarea id="description" rows="4" ref={this.descriptionElementRef} />
              </div>
            </form>
          </Modal>
        )}
        {this.state.selectedEvent && (
          <Modal title={this.state.selectedEvent.title} canCancel canConfirm onCancel={this.modalCancelHandler} onConfirm={this.bookEventHandler} confirmText="Book">
            <h1>{this.state.selectedEvent.title}</h1>
            <h2>
              R$ {(this.state.selectedEvent.price).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })} - {new Date(this.state.selectedEvent.date).toLocaleDateString('pt-BR')}
            </h2>
            <p>{this.state.selectedEvent.description}</p>
          </Modal>
        )}
        {this.context.token && (
          <div className="events-control">
            <p>Share your own Events!</p>
            <button className="btn" onClick={this.startCreateEventHandler}>Create Event</button>
          </div>
        )}
        {this.state.loading ? (
          <Loading />
        ) : (
            <EventList events={this.state.events} authUserId={this.context.userId} onViewDetail={this.showDetailHandler} />
          )}

      </React.Fragment>
    );
  }
}

export default EventsPage;
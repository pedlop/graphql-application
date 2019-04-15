import React from 'react';

import './BookingList.css';

const bookingList = props => (
  <ul className="bookings__list">
    {props.bookings.map(booking => {
      return (
        <li key={booking._id} className="bookings__item">
          <div className="bookinkgs__item-data">
            {booking.event.title} - {' '}
            {new Date(booking.createdAt).toLocaleDateString('pt-BR')}
          </div>
          <div className="bookinkgs__item-actions">
            <button className="btn" onClick={props.onDelete.bind(this, booking._id)}>Cancel</button>
          </div>
        </li>
      );
    })}
  </ul>
);

export default bookingList;
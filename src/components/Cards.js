import React from 'react';
import './Cards.css';
import CardItem from './CardItem';

function Cards() {
  return (
    <div className='cards'>
      <h1>Check out these EPIC Destinations!</h1>
      <div className='cards__container'>
        <div className='cards__wrapper'>
          <ul className='cards__items'>
            <CardItem
              src='images/img-9.jpg'
              text='Explore the hidden waterfall deep inside the Amazon Jungle'
              label='Adventure'
              path='/highlights'
            />
            <CardItem
              src='images/img-1.jpg'
              text='Travel through the Islands of Bali in a Private Cruise'
              label='Luxury'
              path='/highlights'
            />
          </ul>
          <ul className='cards__items'>
            <CardItem
              src='images/img-3.jpg'
              text='Set Sail in the Atlantic Ocean visiting Uncharted Waters'
              label='Mystery'
              path='/highlights'
            />
            <CardItem
              src='images/img-5.jpg'
              text='Experience Football on Top of the Himilayan Mountains'
              label='Adventure'
              path='/training'
            />
            <CardItem
              src='images/img-8.jpg'
              text='Ride through the Sahara Desert on a guided camel tour'
              label='Adrenaline'
              path='/achievements'
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Cards;
/* eslint-disable @typescript-eslint/no-explicit-any */
import { collections } from '../constants';
import { EventProps } from '../types';
import { db } from './firebaseConfig';
import { collection, getDocs, query } from 'firebase/firestore';

const eventsCollectionRef = collection(db, collections.EVENTS);

const toEvent = (docData : any): EventProps | undefined => {
    if (typeof docData.name === 'string' &&
    typeof docData.sport === 'string' &&
    typeof docData.date === 'string' &&
    typeof docData.location === 'string' &&
    typeof docData.imageUrl === 'string' &&
    typeof docData.flyerUrl === 'string' &&
    typeof docData.description === 'string') {
  return {
    id: docData.id,
    name: docData.name,
    sport: docData.sport,
    date: docData.date,
    location: docData.location,
    imageUrl: docData.imageUrl,
    flyerUrl: docData.flyerUrl,
    description: docData.description
  };
}
return undefined;
}

export const getEvents = async () => {
  const q = query(eventsCollectionRef); 
  const querySnapshot = await getDocs(q);
  const events: EventProps[] = []
  querySnapshot.forEach(doc => {
    const event = toEvent({id: doc.id, ...doc.data()})
    if(event) events.push(event)
  })
  return events
};
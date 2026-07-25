/* eslint-disable @typescript-eslint/no-explicit-any */
import { EventProps } from '../types';
import { supabase } from './supabaseClient';
import { wrapService } from './error';

const toEvent = (docData: any): EventProps | undefined => {
  if (
    typeof docData.name === 'string' &&
    typeof docData.sport === 'string' &&
    typeof docData.date === 'string' &&
    typeof docData.location === 'string' &&
    typeof docData.imageUrl === 'string' &&
    typeof docData.flyerUrl === 'string' &&
    typeof docData.registrationUrl === 'string' &&
    typeof docData.description === 'string'
  ) {
    return {
      id: docData.id,
      name: docData.name,
      sport: docData.sport,
      date: docData.date,
      location: docData.location,
      imageUrl: docData.imageUrl,
      flyerUrl: docData.flyerUrl,
      registrationUrl: docData.registrationUrl,
      description: docData.description,
    };
  }
  return undefined;
};

export const getEvents = async () =>
  wrapService<EventProps[]>(
    (async () => {
      const { data, error } = await supabase.from('events').select('*');
      if (error) throw error;
      const events: EventProps[] = [];
      (data ?? []).forEach((row) => {
        const event = toEvent(row);
        if (event) events.push(event);
      });
      return events;
    })(),
    'Failed to fetch events'
  );

export const addEvent = async (event: Omit<EventProps, 'id'>) =>
  wrapService<string>(
    (async () => {
      const { data, error } = await supabase.from('events').insert(event).select('id').single();
      if (error) throw error;
      return data.id as string;
    })(),
    'Failed to add event'
  );

export const deleteEvent = async (id: string) =>
  wrapService<void>(
    (async () => {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
    })(),
    'Failed to delete event'
  );

import { EventProps } from '../types';
import { supabase } from './supabaseClient';
import { wrapService } from './error';

// Validates a raw `events` row before it's trusted as an EventProps. Takes
// `unknown` rather than `any` so the typeof checks below are what actually
// proves the shape — with `any` the compiler accepted the returned object on
// faith, which defeats the point of having a validator.
const toEvent = (docData: unknown): EventProps | undefined => {
  if (typeof docData !== 'object' || docData === null) return undefined;
  const row = docData as Record<string, unknown>;
  if (
    typeof row.id === 'string' &&
    typeof row.name === 'string' &&
    typeof row.sport === 'string' &&
    typeof row.date === 'string' &&
    typeof row.location === 'string' &&
    typeof row.imageUrl === 'string' &&
    typeof row.flyerUrl === 'string' &&
    typeof row.registrationUrl === 'string' &&
    typeof row.description === 'string'
  ) {
    return {
      id: row.id,
      name: row.name,
      sport: row.sport,
      date: row.date,
      location: row.location,
      imageUrl: row.imageUrl,
      flyerUrl: row.flyerUrl,
      registrationUrl: row.registrationUrl,
      description: row.description,
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

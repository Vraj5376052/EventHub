import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const BrowseEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get('/api/events', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setEvents(res.data);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
  }, [user]);

  if (!user) return <p className="text-center mt-20">Please log in.</p>;
  if (loading) return <p className="text-center mt-20">Loading events…</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Browse Events</h1>

      {events.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center text-gray-500">
          <p className="mb-2">No events available.</p>
          <p className="text-sm">Check back soon — organisers are still adding events.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => {
            const remaining = ev.capacity - ev.bookedSeats;
            const soldOut = remaining <= 0;
            return (
              <div key={ev._id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-semibold">{ev.title}</h2>
                    <p className="text-gray-600 text-sm">{ev.venue}</p>
                    <p className="text-gray-600 text-sm">
                      {new Date(ev.startsAt).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                    {ev.description && <p className="text-gray-700 text-sm mt-2">{ev.description}</p>}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-semibold">${ev.price}</p>
                    {soldOut ? (
                      <span className="inline-block mt-2 text-sm text-red-600 font
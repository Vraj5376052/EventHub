import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const MyEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosInstance.get('/api/events/mine', {
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
  if (loading) return <p className="text-center mt-20">Loading your events…</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Events</h1>
        <Link to="/create-event" className="bg-green-600 text-white px-4 py-2 rounded">
          Create Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-white p-8 rounded shadow text-center text-gray-500">
          <p className="mb-2">No events yet.</p>
          <p className="text-sm">Create your first event to start taking bookings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <div key={ev._id} className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{ev.title}</h2>
              <p className="text-gray-600 text-sm">{ev.venue}</p>
              <p className="text-gray-600 text-sm">
                {new Date(ev.startsAt).toLocaleString('en-AU', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
              <p className="mt-2 text-sm">
                <span className="font-medium">{ev.capacity - ev.bookedSeats}</span> of {ev.capacity} seats remaining
                {' · $'}{ev.price}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyEvents;
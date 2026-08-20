import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: '' });
  const [error, setError] = useState({ field: '', message: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError({ field: '', message: '' });
    try {
      await axiosInstance.post('/api/auth/register', formData);
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;
      setError({
        field: data?.field || '',
        message: data?.message || 'Registration failed. Please try again.',
      });
    }
  };

  const errorFor = (field) =>
    error.field === field ? <p className="text-red-600 text-sm mb-2">{error.message}</p> : null;

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>

        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mb-1 p-2 border rounded"
        />
        {errorFor('name')}

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-1 p-2 border rounded"
        />
        {errorFor('email')}

        <input
          type="password"
          placeholder="Password (at least 8 characters)"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full mb-1 p-2 border rounded"
        />
        {errorFor('password')}

        <select
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          className="w-full mb-1 p-2 border rounded"
        >
          <option value="">Select your role</option>
          <option value="customer">Customer — I want to book tickets</option>
          <option value="organiser">Organiser — I want to run events</option>
        </select>
        {errorFor('role')}

        {!error.field && error.message && (
          <p className="text-red-600 text-sm mb-2">{error.message}</p>
        )}

        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded mt-3">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
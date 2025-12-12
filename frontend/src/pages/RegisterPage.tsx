import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../services/api';
import { BeamsBackground } from '../components/ui/beams-background';
import { ShimmerButton } from '../components/ui/shimmer-button';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  
  // 1. Role Toggle State
  const [role, setRole] = useState<'PATIENT' | 'PROVIDER'>('PATIENT');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',       // Patient only
    licenseNumber: '',     // Provider only
    specialization: '',    // Provider only
    hospital: ''           // Provider only
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add password matching check here if not already done
    if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
    }

    try {
      let data;
      
      // --- ROBUST DATE FORMATTING FIX (REPLACES OLD LOGIC) ---
      let isoDateString = formData.dateOfBirth;

      if (role === 'PATIENT' && formData.dateOfBirth) {
          // 1. Create a Date object from the input string (e.g., "2004-04-24")
          const dateObj = new Date(formData.dateOfBirth);
          
          // 2. Format to the mandatory YYYY-MM-DD string format for the API
          // This safely handles locale and ensures only the date part is sent.
          if (!isNaN(dateObj.getTime())) { // Check if date is valid
              isoDateString = dateObj.toISOString().split('T')[0];
          } else {
              // Handle invalid date case if needed, though input type="date" usually prevents this
              setError("Invalid Date of Birth.");
              return;
          }
      }
      // ----------------------------------------------------


      if (role === 'PATIENT') {
        data = await apiClient.registerPatient({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          // USE THE NEW, GUARANTEED YYYY-MM-DD STRING
          dateOfBirth: isoDateString 
        });
      } else {
        // ... (Provider logic remains the same)
        data = await apiClient.registerProvider({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          licenseNumber: formData.licenseNumber,
          specialization: formData.specialization,
          hospital: formData.hospital
        });
      }

      // ... (Successful registration logic)
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };
  
  return (
    <BeamsBackground intensity="strong">
      {/* The "Window" - Glassmorphism Card */}
      <div className="w-full max-w-lg p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative z-10">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
            Create Account
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Join HealthPulse AI as a {role === 'PATIENT' ? 'Patient' : 'Healthcare Provider'}
          </p>
        </div>

        {/* Role Toggle Switch */}
        <div className="flex p-1 bg-white/5 rounded-xl mb-6 border border-white/10">
          <button
            type="button"
            onClick={() => setRole('PATIENT')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              role === 'PATIENT' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => setRole('PROVIDER')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
              role === 'PROVIDER' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Doctor / Provider
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300 ml-1">First Name</label>
              <input
                name="firstName"
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="John"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300 ml-1">Last Name</label>
              <input
                name="lastName"
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-300 ml-1">Email</label>
            <input
              name="email"
              type="email"
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              placeholder="name@example.com"
              required
            />
          </div>

          {/* Conditional Fields based on Role */}
          {role === 'PATIENT' ? (
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300 ml-1">Date of Birth</label>
              <input
                name="dateOfBirth"
                type="date"
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                required
              />
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-300 ml-1">Medical License Number</label>
                <input
                  name="licenseNumber"
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  placeholder="MD-123456"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-300 ml-1">Specialization</label>
                  <input
                    name="specialization"
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    placeholder="Cardiology"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-300 ml-1">Hospital (Optional)</label>
                  <input
                    name="hospital"
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    placeholder="City General"
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300 ml-1">Password</label>
              <input
                name="password"
                type="password"
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-300 ml-1">Confirm</label>
              <input
                name="confirmPassword"
                type="password"
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div className="pt-4">
            <ShimmerButton className="w-full shadow-lg" type="submit">
              <span className="text-center font-semibold tracking-wide text-white">
                Create Account
              </span>
            </ShimmerButton>
          </div>
        </form>

        <p className="text-center mt-6 text-sm text-gray-500">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="text-purple-400 hover:text-purple-300 font-medium hover:underline transition-all"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </BeamsBackground>
  );
};

export default RegisterPage;

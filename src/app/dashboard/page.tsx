'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabse';
import { useRouter } from 'next/navigation';
import { UserRound, X, MessageSquare } from 'lucide-react';

type ProfileType = {
  name: string;
  username: string;
  phone: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ProfileType>({ name: '', username: '', phone: '' });

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/auth/login');
      setUser(user);

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        const isComplete = data.name && data.username;
        setProfile(isComplete ? {
          name: data.name,
          username: data.username,
          phone: data.phone || '',
        } : null);
      } else {
        await supabase.from('profiles').insert([{ id: user.id, email: user.email }]);
        setProfile(null);
      }
    };

    fetchUserAndProfile();
  }, [router]);

  const openModalForEdit = () => {
    if (profile) setForm(profile);
    else setForm({ name: '', username: '', phone: '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      ...form,
    });
    setLoading(false);
    if (error) alert(error.message);
    else {
      setProfile(form);
      setModalOpen(false);
      alert('Profile saved successfully!');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold cursor-default">Feedback System</div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600  px-4 py-2 rounded"
        >
          Log Out
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex flex-col md:flex-row gap-6 p-8 flex-grow bg-gray-100">
        {/* Profile Section */}
        <div className="bg-white p-6 rounded shadow-md w-full md:w-1/2">
          <div className="flex items-center gap-4 mb-4">
            <UserRound className="h-10 w-10 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Your Profile</h2>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {profile ? (
            <>
              <div className="space-y-2 mb-4">
                <p><span className="font-semibold">Full Name:</span> {profile.name}</p>
                <p><span className="font-semibold">Username:</span> {profile.username}</p>
                <p><span className="font-semibold">Phone:</span> {profile.phone || '-'}</p>
              </div>
              <button
                onClick={openModalForEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <p className="mb-4 text-red-600">Your profile is incomplete. Please complete your profile.</p>
              <button
                onClick={openModalForEdit}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Complete Profile
              </button>
            </>
          )}
        </div>

        {/* Feedback Section (Promotional style) */}
        <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white p-8 rounded-lg shadow-lg w-full md:w-1/2 flex flex-col items-center justify-center space-y-4">
          <MessageSquare className="w-16 h-16" />
          <h2 className="text-3xl font-bold">Help Improve Faculty Experience</h2>
          <p className="text-lg text-white/90 max-w-md text-center">
            Your feedback matters! Share your thoughts about faculty performance and help us create a better learning environment.
          </p>
          <button
            onClick={() => router.push('/feedback')}
            className="bg-white text-green-600 font-semibold px-6 py-3 rounded shadow-lg hover:bg-gray-100 transition"
          >
            Give Feedback Now
          </button>
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
              onClick={() => setModalOpen(false)}
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
            <h3 className="text-xl font-semibold mb-4">{profile ? 'Edit Profile' : 'Complete Profile'}</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full p-2 border rounded"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Username"
                className="w-full p-2 border rounded"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
              <input
                type="tel"
                placeholder="Phone Number"
                className="w-full p-2 border rounded"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 text-center py-4 mt-auto">
        &copy; {new Date().getFullYear()} Feedback System. All rights reserved.
      </footer>
    </div>
  );
}

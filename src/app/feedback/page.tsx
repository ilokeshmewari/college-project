'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabse';
import { useRouter } from 'next/navigation';
import { UserRound } from 'lucide-react';

type Faculty = {
  id: string;
  name: string;
  department?: string | null;
  image_url?: string | null;
};

type Feedback = {
  class_management: string;
  discipline: string;
  punctuality: string;
  rating: number;
  feedback_message: string;
};

export default function FacultyLandingPage() {
  const router = useRouter();

  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [feedback, setFeedback] = useState<Feedback>({
    class_management: '',
    discipline: '',
    punctuality: '',
    rating: 5,
    feedback_message: '',
  });
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.replace('/auth/login');
        return;
      }

      setUserEmail(user.email ?? '');
      fetchFaculty();
    };

    checkAuth();
  }, [router]);

  const fetchFaculty = async () => {
    const { data, error } = await supabase.from('faculty_profiles').select('*');
    if (error) {
      alert(error.message);
    } else {
      setFacultyList(data ?? []);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedFaculty) {
      alert('Please select a faculty');
      return;
    }

    if (!userEmail) {
      alert('Please login to submit feedback');
      return;
    }

    const { error } = await supabase.from('faculty_feedbacks').insert({
      faculty_id: selectedFaculty.id,
      user_email: userEmail,
      ...feedback,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Feedback submitted!');
      setSelectedFaculty(null);
      setFeedback({
        class_management: '',
        discipline: '',
        punctuality: '',
        rating: 5,
        feedback_message: '',
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/auth/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <div className="text-xl font-bold">Feedback System</div>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
          type="button"
        >
          Log Out
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-grow bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-center mb-6">Faculty List</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {facultyList.map((fac) => (
            <div key={fac.id} className="bg-white p-4 rounded-xl shadow text-center">
              {fac.image_url ? (
                <img
                  src={fac.image_url}
                  alt={fac.name}
                  className="w-28 h-36 object-cover rounded-md mx-auto mb-2"
                />
              ) : (
                <UserRound className="w-16 h-16 mx-auto text-gray-400 mb-2" />
              )}
              <h2 className="text-xl font-semibold">{fac.name}</h2>
              <p className="text-gray-600">{fac.department ?? ''}</p>
              <button
                onClick={() => setSelectedFaculty(fac)}
                className="mt-3 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Give Feedback
              </button>
            </div>
          ))}
        </div>

        {/* Feedback Modal */}
        {selectedFaculty && (
          <div
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            onClick={() => setSelectedFaculty(null)}
          >
            <div
              className="bg-white p-6 rounded w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">
                Feedback for {selectedFaculty.name}
              </h2>

              <textarea
                className="w-full p-2 border rounded mb-3"
                placeholder="Class Management"
                value={feedback.class_management}
                onChange={(e) => setFeedback({ ...feedback, class_management: e.target.value })}
              />
              <textarea
                className="w-full p-2 border rounded mb-3"
                placeholder="Discipline"
                value={feedback.discipline}
                onChange={(e) => setFeedback({ ...feedback, discipline: e.target.value })}
              />
              <textarea
                className="w-full p-2 border rounded mb-3"
                placeholder="Punctuality (Is the faculty on time?)"
                value={feedback.punctuality}
                onChange={(e) => setFeedback({ ...feedback, punctuality: e.target.value })}
              />
              <input
                type="number"
                min={1}
                max={5}
                className="w-full p-2 border rounded mb-3"
                placeholder="Rating out of 5"
                value={feedback.rating}
                onChange={(e) =>
                  setFeedback({
                    ...feedback,
                    rating: Math.min(5, Math.max(1, Number(e.target.value) || 5)),
                  })
                }
              />
              <textarea
                className="w-full p-2 border rounded mb-3"
                placeholder="Any feedback message"
                value={feedback.feedback_message}
                onChange={(e) => setFeedback({ ...feedback, feedback_message: e.target.value })}
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setSelectedFaculty(null)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitFeedback}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 text-center py-4 mt-auto">
        &copy; {new Date().getFullYear()} Feedback System. All rights reserved.
      </footer>
    </div>
  );
}

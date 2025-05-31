'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabse';
import { LogOut, Heart } from 'lucide-react';

interface Feedback {
  id: string;
  user_email: string;
  class_management: string;
  discipline: string;
  punctuality: string;
  rating: number;
  feedback_message: string;
  created_at: string;
}

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const facultyId = params?.id as string;

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!facultyId) return;

      const { data, error } = await supabase
        .from('faculty_feedbacks')
        .select('*')
        .eq('faculty_id', facultyId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching feedbacks:', error.message);
      } else {
        setFeedbacks(data);
      }

      setLoading(false);
    };

    fetchFeedbacks();
  }, [facultyId]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminSession');
    router.push('/admin/auth/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold cursor-pointer" onClick={() => router.push('/admin')}>
          Admin Panel
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 px-3 py-1.5 rounded hover:bg-red-600 transition"
          aria-label="Logout"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-8 max-w-7xl mx-auto w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Student Feedbacks
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Loading feedbacks...</p>
        ) : feedbacks.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">No feedbacks found for this faculty.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedbacks.map((fb) => (
              <div
                key={fb.id}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow flex flex-col space-y-3"
                tabIndex={0}
                aria-label={`Feedback by ${fb.user_email}`}
              >
                <div className="text-sm text-gray-500 font-mono truncate">👤 Anonymous Feedback</div>

                <div className="text-gray-700">
                  <p><strong>Class Management:</strong> <span className="font-medium">{fb.class_management}</span></p>
                  <p><strong>Discipline:</strong> <span className="font-medium">{fb.discipline}</span></p>
                  <p><strong>Punctuality:</strong> <span className="font-medium">{fb.punctuality}</span></p>
                  <p><strong>Rating:</strong> <span className="font-medium text-yellow-500">⭐ {fb.rating}/5</span></p>
                </div>

                {fb.feedback_message && (
                  <p className="italic text-gray-600 border-l-4 border-blue-400 pl-3">{fb.feedback_message}</p>
                )}

                <div className="text-xs text-gray-400 mt-auto">
                  Submitted on: {new Date(fb.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 text-center py-4 text-gray-700 mt-auto">
        Made with <Heart className="inline w-5 h-5 text-red-600 mx-1" /> by MCA Gang
      </footer>
    </div>
  );
}

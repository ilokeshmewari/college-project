'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabse';
import { useRouter } from 'next/navigation';
import { LogOut, Trash2, Heart } from 'lucide-react';

type Faculty = {
  id: string;
  name: string;
  department?: string;
  email?: string;
  phone?: string;
  image_url?: string;
};

export default function SeeAllFaculty() {
  const router = useRouter();
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [newFaculty, setNewFaculty] = useState({
    name: '',
    department: '',
    email: '',
    phone: '',
    image: null as File | null,
  });

  // Redirect if not logged in
  useEffect(() => {
    const adminSession = sessionStorage.getItem('adminSession');
    if (!adminSession) {
      router.replace('/admin/auth/login');
    }
  }, [router]);

  const fetchFaculty = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('faculty_profiles').select('*');
    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      setFacultyList(data || []);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewFaculty({ ...newFaculty, image: e.target.files[0] });
    }
  };

  const uploadImage = async (file: File) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from('faculty-photos')
      .upload(fileName, file);

    if (error) {
      alert('Image upload error: ' + error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('faculty-photos')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  };

  const handleAddFaculty = async () => {
    if (!newFaculty.name.trim()) {
      alert('Name is required');
      return;
    }

    setUploading(true);

    let image_url = null;
    if (newFaculty.image) {
      image_url = await uploadImage(newFaculty.image);
      if (!image_url) {
        setUploading(false);
        return;
      }
    }

    const { error } = await supabase.from('faculty_profiles').insert([
      {
        name: newFaculty.name,
        department: newFaculty.department,
        email: newFaculty.email,
        phone: newFaculty.phone,
        image_url,
      },
    ]);

    setUploading(false);

    if (error) {
      alert(error.message);
    } else {
      alert('Faculty added successfully!');
      setModalOpen(false);
      setNewFaculty({ name: '', department: '', email: '', phone: '', image: null });
      fetchFaculty();
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!confirm('Are you sure you want to delete this faculty?')) return;

    const { error } = await supabase.from('faculty_profiles').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchFaculty();
  };

  const handleLogout = () => {
    sessionStorage.removeItem('adminSession');
    router.push('/admin/auth/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl sm:text-2xl font-bold">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-500 px-3 py-1.5 rounded hover:bg-red-600 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      {/* Main */}
      <main className="flex-grow p-4 sm:p-8">
        <div className="max-w-6xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Faculty Profiles</h2>
            <button
              onClick={() => setModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Add New Faculty
            </button>
          </div>

          {loading ? (
            <p className="text-center">Loading faculty...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {facultyList.map((faculty) => (
                <div
                  key={faculty.id}
                  className="border rounded-lg p-4 bg-gray-50 shadow relative hover:shadow-md transition flex flex-col items-center text-center"
                >
                  {faculty.image_url && (
                    <div className="w-24 h-24 mb-3 rounded-full overflow-hidden border">
                      <img
                        src={faculty.image_url}
                        alt={faculty.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="text-lg font-semibold">{faculty.name}</h3>
                  {faculty.department && (
                    <p className="text-sm text-gray-600">{faculty.department}</p>
                  )}
                  {faculty.email && (
                    <p className="text-sm text-gray-500">{faculty.email}</p>
                  )}
                  {faculty.phone && (
                    <p className="text-sm text-gray-500">{faculty.phone}</p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/student-feedbacks/${faculty.id}`)}
                      className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-sm transition"
                    >
                      View Feedback
                    </button>

                    <button
                      onClick={() => handleDeleteFaculty(faculty.id)}
                      className="text-red-600 hover:text-red-800 transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Add New Faculty</h2>

            <input
              type="text"
              placeholder="Name"
              className="w-full mb-3 p-2 border rounded"
              value={newFaculty.name}
              onChange={(e) => setNewFaculty({ ...newFaculty, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Department"
              className="w-full mb-3 p-2 border rounded"
              value={newFaculty.department}
              onChange={(e) => setNewFaculty({ ...newFaculty, department: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full mb-3 p-2 border rounded"
              value={newFaculty.email}
              onChange={(e) => setNewFaculty({ ...newFaculty, email: e.target.value })}
            />
            <input
              type="tel"
              placeholder="Phone Number"
              className="w-full mb-3 p-2 border rounded"
              value={newFaculty.phone}
              onChange={(e) => setNewFaculty({ ...newFaculty, phone: e.target.value })}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mb-4"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleAddFaculty}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={uploading}
              >
                {uploading ? 'Adding...' : 'Add Faculty'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-gray-200 text-center py-4 text-gray-700">
        Made with <Heart className="inline w-5 h-5 text-red-600" /> by MCA Gang
      </footer>
    </div>
  );
}

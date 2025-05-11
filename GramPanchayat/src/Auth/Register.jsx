import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, storage, db } from '../Config/Firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc } from 'firebase/firestore';

export default function Register() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        role: 'user',
        photo: null
    });
    const [photoPreview, setPhotoPreview] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'photo' && files[0]) {
            setPhotoPreview(URL.createObjectURL(files[0]));
        }
        setFormData(prev => ({
            ...prev,
            [name]: files ? files[0] : value
        }));
        console.log(formData); // Add this line to log the formData object after change
    };

    // Add this at the top of your file
    const CLOUDINARY_CLOUD_NAME = "digao11ku";
    const CLOUDINARY_UPLOAD_PRESET = "E GramPanchayat";

    // Modify the handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Create user account first
            const userCredential = await createUserWithEmailAndPassword(
                auth, 
                formData.email, 
                formData.password
            );

            let photoURL = '';
            if (formData.photo) {
                try {
                    const imageFormData = new FormData();
                    imageFormData.append('file', formData.photo);
                    imageFormData.append('upload_preset', 'e_grampanchayat'); // Make sure this matches exactly with your Cloudinary preset

                    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                        method: 'POST',
                        body: imageFormData
                    });

                    const imageData = await response.json();
                    if (imageData.secure_url) {
                        photoURL = imageData.secure_url;
                        console.log('Photo uploaded successfully:', photoURL);
                    } else {
                        console.error('Failed to get secure URL:', imageData);
                    }
                } catch (uploadError) {
                    console.error('Photo upload error:', uploadError);
                    setError('Failed to upload photo. Please try again.');
                    return;
                }
            }

            // Update user profile
            try {
                await updateProfile(userCredential.user, {
                    displayName: formData.fullName,
                    photoURL: photoURL || null
                });
            } catch (profileError) {
                console.error('Profile update error:', profileError);
            }

            // Store in Firestore with error handling
            try {
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    fullName: formData.fullName,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    photoURL: photoURL || null,
                    role: formData.role,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                console.log('User data stored in Firestore');
                navigate('/dashboard');
            } catch (firestoreError) {
                console.error('Firestore error:', firestoreError);
                setError('Failed to save user data. Please try again.');
            }

        } catch (error) {
            console.error('Registration error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
                {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2">Full Name</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Address</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full p-2 border rounded"
                            rows="3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-2">Profile Photo</label>
                        <input
                            type="file"
                            name="photo"
                            onChange={handleChange}
                            accept="image/*"
                            className="w-full p-2 border rounded"
                        />
                        {photoPreview && (
                            <div className="mt-2">
                                <img 
                                    src={photoPreview} 
                                    alt="Preview" 
                                    className="w-32 h-32 object-cover rounded-full mx-auto"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                        disabled={loading}
                    >
                        {loading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="mt-4 text-center">
                    Already have an account? <Link to="/" className="text-blue-500">Login</Link>
                </p>
            </div>
        </div>
    );
}

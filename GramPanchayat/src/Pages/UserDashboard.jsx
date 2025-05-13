import { useState, useEffect } from 'react';
import { auth, db } from '../Config/Firebase';
import { collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
    const [services, setServices] = useState([]);
    const [applications, setApplications] = useState([]);
    const [activeTab, setActiveTab] = useState('services');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedService, setExpandedService] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const navigate = useNavigate();

    const filteredServices = services.filter(service =>
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchServices();
        fetchApplications();
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
            if (userDoc.exists()) {
                setUserProfile(userDoc.data());
            }
        } catch (error) {
            setError("Failed to fetch profile");
        }
    };

    const fetchServices = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "services"));
            const servicesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setServices(servicesData);
        } catch (error) {
            setError("Failed to fetch services");
        }
    };

    const fetchApplications = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "applications"));
            const applicationsData = querySnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(app => app.userId === auth.currentUser.uid);
            setApplications(applicationsData);
        } catch (error) {
            setError("Failed to fetch applications");
        }
    };

    const handleApplyService = async (serviceId) => {
        try {
            setLoading(true);
            const serviceDoc = await getDoc(doc(db, "services", serviceId));
            const service = serviceDoc.data();

            await addDoc(collection(db, "applications"), {
                serviceId,
                serviceName: service.title,
                userId: auth.currentUser.uid,
                userName: userProfile.fullName,
                status: 'pending',
                createdAt: new Date(),
                documents: [],
                fees: service.fees
            });

            fetchApplications();
            setExpandedService(null);
            alert('Application submitted successfully!');
        } catch (error) {
            setError("Failed to submit application");
        } finally {
            setLoading(false);
        }
    };






    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            setError("Failed to logout");
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">User Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`p-4 rounded ${activeTab === 'services' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                    >
                        Search Services
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`p-4 rounded ${activeTab === 'applications' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                    >
                        My Applications
                    </button>
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`p-4 rounded ${activeTab === 'profile' ? 'bg-blue-500 text-white' : 'bg-white'}`}
                    >
                        My Profile
                    </button>
                </div>

                {/* Services Tab */}
                {activeTab === 'services' && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">Available Services</h2>
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="Search services..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="space-y-4">
                            {filteredServices.map(service => (
                                <div key={service.id} className="border rounded-lg overflow-hidden">
                                    <div
                                        className="p-4 bg-gray-50 cursor-pointer flex justify-between items-center"
                                        onClick={() => setExpandedService(expandedService === service.id ? null : service.id)}
                                    >
                                        <h3 className="font-semibold text-lg">{service.title}</h3>
                                        <span className="text-blue-600">
                                            {expandedService === service.id ? '▼' : '▶'}
                                        </span>
                                    </div>

                                    {expandedService === service.id && (
                                        <div className="p-4 border-t">
                                            {/* Service details here - same as StaffDashboard */}
                                            <button
                                                onClick={() => handleApplyService(service.id)}
                                                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                                disabled={loading}
                                            >
                                                {loading ? 'Applying...' : 'Apply for Service'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}



                {activeTab === 'applications' && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-6">My Applications</h2>

                        <div className="space-y-4">
                            {applications.map(application => (
                                <div key={application.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-lg">{application.serviceName}</h3>
                                            <p className="text-sm text-gray-500">
                                                Applied: {new Date(application.createdAt.toDate()).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-sm ${application.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                        </div>
                                    </div>

                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className="bg-blue-600 h-2.5 rounded-full"
                                                style={{
                                                    width: `${application.status === 'approved' ? '100%' :
                                                            application.status === 'rejected' ? '100%' :
                                                                '50%'
                                                        }`
                                                }}
                                            ></div>
                                        </div>
                                    </div>

                                    <div className="mt-3 text-sm text-gray-600">
                                        <p>Application ID: {application.id}</p>
                                        {application.fees && <p>Fees: ₹{application.fees}</p>}
                                    </div>
                                </div>
                            ))}
                            {applications.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No applications found</p>
                                    <p className="text-sm mt-2">Apply for services to see them here</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}



                {/* Profile Tab */}
                {activeTab === 'profile' && userProfile && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-semibold mb-4">My Profile</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="font-semibold">Full Name</label>
                                <p className="text-gray-600">{userProfile.fullName}</p>
                            </div>
                            <div>
                                <label className="font-semibold">Email</label>
                                <p className="text-gray-600">{userProfile.email}</p>
                            </div>
                            <div>
                                <label className="font-semibold">Phone</label>
                                <p className="text-gray-600">{userProfile.phone}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

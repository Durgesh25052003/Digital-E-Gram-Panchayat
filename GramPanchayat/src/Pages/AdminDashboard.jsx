import { useState, useEffect } from 'react';
import { auth, db } from '../Config/Firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';

export default function AdminDashboard() {
    const [services, setServices] = useState([]);
    const [applications, setApplications] = useState([]);
    const [activeTab, setActiveTab] = useState('services');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // New service form state
    const [newService, setNewService] = useState({
        title: '',
        description: '',
        requirements: '',
        fees: ''
    });

    const [staff, setStaff] = useState([]);
    // Fix the initial state
    const [newStaff, setNewStaff] = useState({
        fullName: '',  // Changed from 'name' to 'fullName'
        email: '',
        password: '',
        phone: '',
        role: 'staff'
    });
    
    // Update handleAddStaff to include error handling
    const handleAddStaff = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(''); // Clear previous errors

        // Store admin's email and password temporarily
        const adminEmail = auth.currentUser?.email;
        const adminPassword = prompt("Please enter your password to confirm staff creation");
        
        try {
            if (!newStaff.fullName || !newStaff.email || !newStaff.password || !newStaff.phone) {
                throw new Error('Please fill in all fields');
            }
            console.log("🌟")
            // First store staff data in Firestore
            const staffDocRef = doc(collection(db, "staffs"));
            await setDoc(staffDocRef, {
                fullName: newStaff.fullName,
                email: newStaff.email,
                phone: newStaff.phone,
                role: newStaff.role,
                createdAt: new Date(),
                status: 'active'
            });
           console.log("🌟🌟")

            // Sign out admin temporarily
            await signOut(auth);
            // Create auth account
            const staffCredential = await createUserWithEmailAndPassword(
                auth,
                newStaff.email,
                newStaff.password
            );

            // Update staff document with auth ID
            await updateDoc(staffDocRef, {
                staffId: staffCredential.user.uid
            });

            // Sign admin back in
            await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

            setNewStaff({
                fullName: '',
                email: '',
                password: '',
                phone: '',
                role: 'staff'
            });
            console.log(auth.currentUser)
            fetchStaff();
        } catch (error) {
            setError(error.message || "Failed to add staff member");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Fetch services and applications
    useEffect(() => {
        fetchServices();
        fetchApplications();
        fetchStaff();
    }, []);

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
            console.error(error);
        }
    };

    const fetchApplications = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "applications"));
            const applicationsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setApplications(applicationsData);
        } catch (error) {
            setError("Failed to fetch applications");
            console.error(error);
        }
    };

    const fetchStaff = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "staffs"));
            const staffData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }
            ));
            setStaff(staffData);
        } catch (error) {
            console.log(error);
        }
    }

    const handleAddService = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, "services"), {
                ...newService,
                createdAt: new Date()
            });
            setNewService({ title: '', description: '', requirements: '', fees: '' });
            fetchServices();
        } catch (error) {
            setError("Failed to add service");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (applicationId, newStatus) => {
        try {
            await updateDoc(doc(db, "applications", applicationId), {
                status: newStatus,
                updatedAt: new Date()
            });
            fetchApplications();
        } catch (error) {
            setError("Failed to update status");
            console.error(error);
        }
    };

    const handleDeleteService = async (serviceId) => {
        if (window.confirm("Are you sure you want to delete this service?")) {
            try {
                await deleteDoc(doc(db, "services", serviceId));
                fetchServices();
            } catch (error) {
                setError("Failed to delete service");
                console.error(error);
            }
        }
    };

    // Add this to your state declarations at the top
    const [editingService, setEditingService] = useState(null);

    // Add this new function after handleDeleteService
    const handleUpdateService = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateDoc(doc(db, "services", editingService.id), {
                title: editingService.title,
                description: editingService.description,
                requirements: editingService.requirements,
                fees: editingService.fees,
                updatedAt: new Date()
            });
            setEditingService(null);
            fetchServices();
        } catch (error) {
            setError("Failed to update service");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <div className="flex gap-4 mb-4">
                        <button
                            onClick={() => setActiveTab('services')}
                            className={`px-4 py-2 rounded ${activeTab === 'services' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        >
                            Services
                        </button>
                        <button
                            onClick={() => setActiveTab('applications')}
                            className={`px-4 py-2 rounded ${activeTab === 'applications' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        >
                            Applications
                        </button>
                        <button
                            onClick={() => setActiveTab('staff')}
                            className={`px-4 py-2 rounded ${activeTab === 'staff' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        >
                            Staff Management
                        </button>
                    </div>






                    {activeTab === 'staff' && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Add New Staff Member</h2>
                            <form onSubmit={handleAddStaff} className="space-y-4 mb-8">
                                <div>
                                    <label className="block mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        value={newStaff.fullName}
                                        onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={newStaff.email}
                                        onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={newStaff.password}
                                        onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={newStaff.phone}
                                        onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    disabled={loading}
                                >
                                    {loading ? 'Adding Staff...' : 'Add Staff Member'}
                                </button>
                            </form>

                            <h2 className="text-xl font-semibold mb-4">Existing Staff Members</h2>
                            <div className="space-y-4">
                                {staff.map(staffMember => (
                                    <div key={staffMember.id} className="border p-4 rounded">
                                        <h3 className="font-semibold">{staffMember.fullName}</h3>
                                        <p className="text-gray-600">Email: {staffMember.email}</p>
                                        <p className="text-gray-600">Phone: {staffMember.phone}</p>
                                        <p className="text-gray-600">Role: {staffMember.role}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'services' && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Add New Service</h2>
                            <form onSubmit={handleAddService} className="space-y-4 mb-8">
                                <div>
                                    <label className="block mb-1">Title</label>
                                    <input
                                        type="text"
                                        value={newService.title}
                                        onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Description</label>
                                    <textarea
                                        value={newService.description}
                                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        rows="3"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Requirements</label>
                                    <textarea
                                        value={newService.requirements}
                                        onChange={(e) => setNewService({ ...newService, requirements: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        rows="3"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Fees</label>
                                    <input
                                        type="number"
                                        value={newService.fees}
                                        onChange={(e) => setNewService({ ...newService, fees: e.target.value })}
                                        className="w-full p-2 border rounded"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                    disabled={loading}
                                >
                                    {loading ? 'Adding...' : 'Add Service'}
                                </button>
                            </form>

                            <h2 className="text-xl font-semibold mb-4">Existing Services</h2>
                            <div className="space-y-4">
                                {services.map(service => (
                                    <div key={service.id} className="border p-4 rounded">
                                        {editingService?.id === service.id ? (
                                            <form onSubmit={handleUpdateService} className="space-y-4">
                                                <div>
                                                    <label className="block mb-1">Title</label>
                                                    <input
                                                        type="text"
                                                        value={editingService.title}
                                                        onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                                                        className="w-full p-2 border rounded"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block mb-1">Description</label>
                                                    <textarea
                                                        value={editingService.description}
                                                        onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                                                        className="w-full p-2 border rounded"
                                                        rows="3"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block mb-1">Requirements</label>
                                                    <textarea
                                                        value={editingService.requirements}
                                                        onChange={(e) => setEditingService({ ...editingService, requirements: e.target.value })}
                                                        className="w-full p-2 border rounded"
                                                        rows="3"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block mb-1">Fees</label>
                                                    <input
                                                        type="number"
                                                        value={editingService.fees}
                                                        onChange={(e) => setEditingService({ ...editingService, fees: e.target.value })}
                                                        className="w-full p-2 border rounded"
                                                        required
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                                        disabled={loading}
                                                    >
                                                        {loading ? 'Updating...' : 'Update'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingService(null)}
                                                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        ) : (
                                            <>
                                                <h3 className="font-semibold">{service.title}</h3>
                                                <p className="text-gray-600">{service.description}</p>
                                                <p className="text-gray-600">Requirements: {service.requirements}</p>
                                                <p className="text-sm text-gray-500">Fees: ₹{service.fees}</p>
                                                <div className="mt-2 space-x-2">
                                                    <button
                                                        onClick={() => setEditingService(service)}
                                                        className="text-blue-500 hover:text-blue-700"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteService(service.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'applications' && (
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="text-xl font-semibold mb-4">Applications</h2>
                            <div className="space-y-4">
                                {applications.map(application => (
                                    <div key={application.id} className="border p-4 rounded">
                                        <h3 className="font-semibold">{application.serviceName}</h3>
                                        <p className="text-gray-600">Applicant: {application.userName}</p>
                                        <p className="text-gray-600">Status: {application.status}</p>
                                        <div className="mt-2 space-x-2">
                                            <button
                                                onClick={() => handleUpdateStatus(application.id, 'approved')}
                                                className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(application.id, 'rejected')}
                                                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(application.id, 'pending')}
                                                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                                            >
                                                Mark Pending
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

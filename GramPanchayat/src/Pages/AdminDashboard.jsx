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
    // Add these to your state declarations
    const [newService, setNewService] = useState({
        title: '',
        description: '',
        requirements: '',
        fees: '',
        validityDays: '',
        processingTime: '',
        department: '',
        documentRequired: '',
        eligibility: '',
        startDate: '',
        endDate: '',
        isActive: true
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
    // Update handleAddStaff function
    const handleAddStaff = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const adminEmail = auth.currentUser?.email;
        const adminPassword = prompt("Please enter your password to confirm staff creation");

        try {
            if (!newStaff.fullName || !newStaff.email || !newStaff.password || !newStaff.phone) {
                throw new Error('Please fill in all fields');
            }

            // Sign out admin temporarily
            await signOut(auth);

            // Create auth account
            const staffCredential = await createUserWithEmailAndPassword(
                auth,
                newStaff.email,
                newStaff.password
            );

            // Store staff data in users collection instead of staffs
            await setDoc(doc(db, "users", staffCredential.user.uid), {
                fullName: newStaff.fullName,
                email: newStaff.email,
                phone: newStaff.phone,
                role: 'staff',
                createdAt: new Date(),
                userId: staffCredential.user.uid,
                status: 'active'
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
            fetchStaff();
        } catch (error) {
            setError(error.message || "Failed to add staff member");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Update fetchStaff to get staff from users collection
    const fetchStaff = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const staffData = querySnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter(user => user.role === 'staff'); // Only get staff members
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

    // Add fetchApplications to useEffect
    useEffect(() => {
        fetchStaff();
        fetchServices();
        fetchApplications();
    }, []);

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
                            <div className="flex items-center mb-6">
                                <img src="/government-logo.png" alt="Logo" className="h-16 mr-4" />
                                <h2 className="text-2xl font-bold text-gray-800">Service Management Portal</h2>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg mb-6">
                                <h2 className="text-xl font-semibold mb-4 text-blue-900">Add New Service</h2>
                                <form onSubmit={handleAddService} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1 font-semibold">Service Title*</label>
                                        <input
                                            type="text"
                                            value={newService.title}
                                            onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                                            className="w-full p-2 border rounded focus:border-blue-500 focus:ring-1"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-semibold">Department*</label>
                                        <select
                                            value={newService.department}
                                            onChange={(e) => setNewService({ ...newService, department: e.target.value })}
                                            className="w-full p-2 border rounded"
                                            required
                                        >
                                            <option value="">Select Department</option>
                                            <option value="revenue">Revenue Department</option>
                                            <option value="education">Education Department</option>
                                            <option value="health">Health Department</option>
                                            <option value="agriculture">Agriculture Department</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block mb-1 font-semibold">Description*</label>
                                        <textarea
                                            value={newService.description}
                                            onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                            className="w-full p-2 border rounded"
                                            rows="3"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-semibold">Processing Time (in days)*</label>
                                        <input
                                            type="number"
                                            value={newService.processingTime}
                                            onChange={(e) => setNewService({ ...newService, processingTime: e.target.value })}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-semibold">Validity (in days)*</label>
                                        <input
                                            type="number"
                                            value={newService.validityDays}
                                            onChange={(e) => setNewService({ ...newService, validityDays: e.target.value })}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-semibold">Start Date*</label>
                                        <input
                                            type="date"
                                            value={newService.startDate}
                                            onChange={(e) => setNewService({ ...newService, startDate: e.target.value })}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-semibold">End Date</label>
                                        <input
                                            type="date"
                                            value={newService.endDate}
                                            onChange={(e) => setNewService({ ...newService, endDate: e.target.value })}
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block mb-1 font-semibold">Required Documents*</label>
                                        <textarea
                                            value={newService.documentRequired}
                                            onChange={(e) => setNewService({ ...newService, documentRequired: e.target.value })}
                                            className="w-full p-2 border rounded"
                                            rows="3"
                                            placeholder="List all required documents, one per line"
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block mb-1 font-semibold">Eligibility Criteria*</label>
                                        <textarea
                                            value={newService.eligibility}
                                            onChange={(e) => setNewService({ ...newService, eligibility: e.target.value })}
                                            className="w-full p-2 border rounded"
                                            rows="3"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-1 font-semibold">Fees (₹)*</label>
                                        <input
                                            type="number"
                                            value={newService.fees}
                                            onChange={(e) => setNewService({ ...newService, fees: e.target.value })}
                                            className="w-full p-2 border rounded"
                                            required
                                        />
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={newService.isActive}
                                            onChange={(e) => setNewService({ ...newService, isActive: e.target.checked })}
                                            className="mr-2"
                                        />
                                        <label>Active Service</label>
                                    </div>

                                    <div className="md:col-span-2">
                                        <button
                                            type="submit"
                                            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 font-semibold"
                                            disabled={loading}
                                        >
                                            {loading ? 'Adding Service...' : 'Add Government Service'}
                                        </button>
                                    </div>
                                </form>
                                <div className="mt-8">
                                    <h2 className="text-xl font-semibold mb-4">Existing Services</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {services.map(service => (
                                            <div key={service.id} className="border rounded-lg p-4 bg-white shadow-sm">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-semibold text-lg">{service.title}</h3>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {service.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 text-sm mt-2">{service.description}</p>
                                                <div className="mt-3 text-sm">
                                                    <p><span className="font-semibold">Department:</span> {service.department}</p>
                                                    <p><span className="font-semibold">Fees:</span> ₹{service.fees}</p>
                                                    <p><span className="font-semibold">Processing Time:</span> {service.processingTime} days</p>
                                                </div>
                                                <div className="mt-4 flex gap-2">
                                                    <button
                                                        onClick={() => setEditingService(service)}
                                                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteService(service.id)}
                                                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

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




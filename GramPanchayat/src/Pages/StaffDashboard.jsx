import { useState, useEffect } from 'react';
import { auth, db } from '../Config/Firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function StaffDashboard() {
    const [services, setServices] = useState([]);
    const [applications, setApplications] = useState([]);
    const [activeTab, setActiveTab] = useState('services');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedService, setExpandedService] = useState(null);
    
    // Add this after your existing state declarations
    const filteredServices = services.filter(service => 
        service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // In your JSX, update the services section
    

    useEffect(() => {
        fetchServices();
        fetchApplications();
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

    const handleUpdateStatus = async (applicationId, newStatus) => {
        try {
            await updateDoc(doc(db, "applications", applicationId), {
                status: newStatus,
                updatedAt: new Date(),
                updatedBy: auth.currentUser.uid
            });
            fetchApplications();
        } catch (error) {
            setError("Failed to update status");
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Staff Dashboard</h1>

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
                            View Services
                        </button>
                        <button
                            onClick={() => setActiveTab('applications')}
                            className={`px-4 py-2 rounded ${activeTab === 'applications' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                        >
                            Update Applications
                        </button>
                    </div>

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
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-700">Description</h4>
                                                        <p className="text-gray-600">{service.description}</p>
                                                    </div>
                                                    
                                                    <div>
                                                        <h4 className="font-semibold text-gray-700">Requirements</h4>
                                                        <p className="text-gray-600">{service.requirements}</p>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold text-gray-700">Processing Time</h4>
                                                        <p className="text-gray-600">{service.processingTime} days</p>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold text-gray-700">Validity</h4>
                                                        <p className="text-gray-600">{service.validityDays} days</p>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold text-gray-700">Department</h4>
                                                        <p className="text-gray-600">{service.department}</p>
                                                    </div>

                                                    <div>
                                                        <h4 className="font-semibold text-gray-700">Fees</h4>
                                                        <p className="text-gray-600">₹{service.fees}</p>
                                                    </div>

                                                    {service.documentRequired && (
                                                        <div className="md:col-span-2">
                                                            <h4 className="font-semibold text-gray-700">Required Documents</h4>
                                                            <ul className="list-disc list-inside text-gray-600">
                                                                {service.documentRequired.split('\n').map((doc, index) => (
                                                                    <li key={index}>{doc}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {service.eligibility && (
                                                        <div className="md:col-span-2">
                                                            <h4 className="font-semibold text-gray-700">Eligibility Criteria</h4>
                                                            <p className="text-gray-600">{service.eligibility}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {filteredServices.length === 0 && (
                                    <p className="text-gray-500 text-center">No services found</p>
                                )}
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
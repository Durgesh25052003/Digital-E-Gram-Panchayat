import { useState, useEffect } from 'react';
import { db } from '../Config/Firebase';
import { collection, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';

export default function StaffList() {
    const [staffMembers, setStaffMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                const staffData = querySnapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }))
                    .filter(user => user.role === 'staff');
                setStaffMembers(staffData);
            } catch (error) {
                console.error("Error fetching staff:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, []);

    const filteredStaff = staffMembers.filter(staff =>
        staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Staff Directory</h1>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Contact our dedicated staff members for assistance with your applications and queries
                    </p>
                </motion.div>

                <div className="mb-8">
                    <div className="max-w-md mx-auto">
                        <input
                            type="text"
                            placeholder="Search staff by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStaff.map((staff) => (
                            <motion.div
                                key={staff.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.02 }}
                                className="bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-200"
                            >
                                <div className="p-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-xl">
                                                {staff.fullName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {staff.fullName}
                                            </h3>
                                            <p className="text-sm text-gray-500">Staff Member</p>
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        <motion.a
                                            href={`mailto:${staff.email}`}
                                            className="flex items-center space-x-3 text-gray-600 hover:text-blue-500"
                                            whileHover={{ x: 5 }}
                                        >
                                            <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span>{staff.email}</span>
                                        </motion.a>

                                        <motion.a
                                            href={`tel:${staff.phone}`}
                                            className="flex items-center space-x-3 text-gray-600 hover:text-blue-500"
                                            whileHover={{ x: 5 }}
                                        >
                                            <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span>{staff.phone}</span>
                                        </motion.a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && filteredStaff.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                        No staff members found matching your search.
                    </div>
                )}
            </div>
        </div>
    );
}
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth, db } from '../Config/Firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function LandingPage() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userId, setUserId]=useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // Get user role from Firestore
                setUserId(currentUser.uid);
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setUserRole(userSnap.data().role);
                }
            } else {
                setUser(null);
                setUserRole(null);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleDashboardClick = () => {
        if (!user) return;
        
        switch(userRole) {
            case 'admin':
                navigate('/admin-dashboard');
                break;
            case 'staff':
                navigate('/staff-dashboard');
                break;
            case 'user':
                navigate(`user/${userId}`);
                break;
            default:
                navigate('/dashboard');
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const handleClick = (title) => {
        switch(title) {
            case "Staff List":
                navigate("/staff-list");
                break;
            case "Apply for Services":
                alert("Please login to apply for services");
                break;
            case "Track Applications":
                alert("Please login to track your applications");
                break;
            case "Secure Login":
                navigate("/login");
                break;
            default:
                break;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with mobile menu */}
            <header className={`fixed w-full z-50 transition-all duration-300 ${
                isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
            }`}>
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <motion.div 
                        className="flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span className="text-2xl font-bold text-blue-600">🏛️ DEGP</span>
                    </motion.div>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        {['home', 'about', 'services'].map((item) => (
                            <motion.a
                                key={item}
                                href={`#${item}`}
                                className="text-gray-700 hover:text-blue-600"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                            </motion.a>
                        ))}
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <motion.div 
                                    className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    <span className="text-sm text-gray-600">👤</span>
                                    <span className="text-sm text-gray-600">{user.email}</span>
                                </motion.div>
                                <motion.button 
                                    onClick={() => navigate('/profile')}
                                    className="text-blue-600 hover:text-blue-700 font-medium"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Profile
                                </motion.button>
                            </div>
                        ) : (
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    Login
                                </Link>
                            </motion.div>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button 
                        className="md:hidden z-50"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
                            />
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                <motion.div 
                    className={`md:hidden fixed inset-0 bg-white z-40 ${isMenuOpen ? 'block' : 'hidden'}`}
                    initial={{ x: "100%" }}
                    animate={{ x: isMenuOpen ? 0 : "100%" }}
                    transition={{ type: "tween" }}
                >
                    <div className="flex flex-col items-center justify-center h-full space-y-8">
                        {['home', 'about', 'services'].map((item) => (
                            <a
                                key={item}
                                href={`#${item}`}
                                className="text-xl text-gray-800 hover:text-blue-600"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.charAt(0).toUpperCase() + item.slice(1)}
                            </a>
                        ))}
                        {user ? (
                            <>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-gray-600">👤 {user.email}</span>
                                    <button 
                                        onClick={() => {
                                            navigate('/profile');
                                            setIsMenuOpen(false);
                                        }}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        View Profile
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link 
                                to="/login" 
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </motion.div>
            </header>

            {/* Hero Section with animations */}
            <motion.section 
                id="home" 
                className="pt-20 relative bg-gradient-to-b from-blue-50 to-white"
                initial="hidden"
                animate="visible"
                variants={{
                    hidden: { opacity: 0 },
                    visible: { opacity: 1, transition: { staggerChildren: 0.3 } }
                }}
            >
                <div className="container mx-auto px-4 py-20">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.h1 
                            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
                            variants={fadeInUp}
                        >
                            🌾 Digital E Gram Panchayat
                        </motion.h1>
                        <motion.p 
                            className="text-xl md:text-2xl text-gray-600 mb-8"
                            variants={fadeInUp}
                        >
                            Bringing governance to your fingertips
                        </motion.p>
                        <motion.div 
                            className="flex flex-col md:flex-row gap-4 justify-center"
                            variants={fadeInUp}
                        >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                {user ? (
                                    <button
                                        onClick={handleDashboardClick}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
                                    >
                                        Go to Dashboard
                                    </button>
                                ) : (
                                    <Link to="/login" 
                                        className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
                                    >
                                        Login
                                    </Link>
                                )}
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <a href="#services" 
                                    className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors inline-block"
                                >
                                    Explore Services
                                </a>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </motion.section>

            {/* Services Section with hover effects */}
            <section id="services" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <motion.h2 
                        className="text-3xl md:text-4xl font-bold text-center mb-12"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        What You Can Do
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: "📝", title: "Apply for Services", desc: "Easy online application for various government services" },
                            { icon: "📄", title: "Track Applications", desc: "Real-time tracking of your application status" },
                            { icon: "👨‍💼", title: "Staff List", desc: "Efficient management of citizen requests" },
                            { icon: "🔒", title: "Secure Login", desc: "Protected access to your personal dashboard" }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                className="bg-white p-6 rounded-lg shadow-md cursor-pointer"
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ 
                                    scale: 1.05,
                                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                                }}
                                transition={{ duration: 0.2 }}
                                onClick={()=>handleClick(feature.title)}
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Rest of the sections remain unchanged */}
        </div>
    );
}
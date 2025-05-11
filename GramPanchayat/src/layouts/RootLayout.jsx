import { Outlet, Link } from 'react-router-dom';

export default function RootLayout() {
    return (
        <div className="min-h-screen flex">
            {/* Sidebar */}
            <nav className="w-64 bg-gray-800 text-white p-4">
                <div className="mb-8">
                    <h2 className="text-xl font-bold">E-Gram Panchayat</h2>
                </div>
                <ul>
                    <li className="mb-2">
                        <Link to="/dashboard" className="hover:text-gray-300">Dashboard</Link>
                    </li>
                    {/* Add more navigation links here */}
                </ul>
            </nav>

            {/* Main Content */}
            <main className="flex-1 bg-gray-100">
                <Outlet />
            </main>
        </div>
    );
}
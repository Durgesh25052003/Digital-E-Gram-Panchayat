import { useState } from 'react';
import { Link ,useNavigate} from 'react-router-dom';
import { auth, db } from '../Config/Firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userCredential=await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
        
            const userRef = doc(db, "users", user.uid);
            // console.log(userRef);
            // console.log(staffRef);

            const docSnap = await getDoc(userRef);
            console.log(docSnap);

        if (docSnap.exists()) {
            console.log("Document data:", docSnap.data());
            // navigate("/home");
            const user=docSnap.data();
            if(user.role==="admin"){
                navigate("/admin");
                console.log("admin");
            }else if(user.role==="user"){
                console.log("user");
            }else if(user.role==="staff"){
                console.log("staff");
                navigate("/staff");
            }else{
                console.log("invalid");
            }
        }

            alert('Login Successfull'); 
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
                {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    >
                        Login
                    </button>
                </form>
                <p className="mt-4 text-center">
                    Don't have an account? <Link to="/register" className="text-blue-500">Register</Link>
                </p>
            </div>
        </div>
    );
}
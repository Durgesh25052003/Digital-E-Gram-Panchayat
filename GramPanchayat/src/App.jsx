import './App.css'
import Login from './Auth/Login'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Register from './Auth/Register'
import AdminDashboard from './Pages/AdminDashboard'
import StaffDashboard from './Pages/StaffDashboard'
import UserDashboard from './Pages/UserDashboard'


const router = createBrowserRouter([

  {
    path: "/",
    element:<Login/>
  },
  {
    path:"/register",
    element:<Register/>
  },
  {
   path:"/admin",
   element:<AdminDashboard/>
  },
  {
    path:"/staff",
    element:<StaffDashboard/>
  },
  {
    path:"/user/:id",
    element:<UserDashboard/>
    }
])


function App() {
 
  return (
    <>
      <RouterProvider router={router}/>
    </>
  )
}

export default App

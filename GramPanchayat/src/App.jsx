import './App.css'
import Login from './Auth/Login'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Register from './Auth/Register'
import AdminDashboard from './Pages/AdminDashboard'
import StaffDashboard from './Pages/StaffDashboard'
import UserDashboard from './Pages/UserDashboard'
import ForgetPassword from './Pages/PasswordUpdate/ForgetPassword'
import ResetPassword from './Pages/PasswordUpdate/ResetPassword'
import LandingPage from './Pages/LandingPage'
import StaffList from './Pages/StaffList'


const router = createBrowserRouter([
  {
    path:"/",
    element:<LandingPage/>
  },
  {
    path: "/login",
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
    path:"/staff-list",
    element:<StaffList/>
   },
  {
    path:"/user/:id",
    element:<UserDashboard/>
    },
    {
      path:"/forget-password",
      element:<ForgetPassword/>
    },
    {
      path:"/reset-password",
      element:<ResetPassword/>
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

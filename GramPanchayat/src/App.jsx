import './App.css'
import Login from './Auth/Login'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Register from './Auth/Register'
import AdminDashboard from './Pages/AdminDashboard'
import StaffDashboard from './Pages/StaffDashboard'


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

import './App.css'
import Login from './Auth/Login'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Register from './Auth/Register'
import AdminDashboard from './Pages/AdminDashboard'


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

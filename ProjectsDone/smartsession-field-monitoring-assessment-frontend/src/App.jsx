import { RouterProvider, createBrowserRouter } from 'react-router'
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManageFields from './pages/admin/ManageFields'
import AgentDashboard from './pages/agent/AgentDashboard'
import MyFields from './pages/agent/MyFields'
import FieldDetails from './pages/agent/FieldDetails'
import GlobalError from './components/GlobalError'
import PublicLayout from './components/PublicLayout'

// Route Protection Components
import AdminRoute from './components/auth/AdminRoute'
import AgentRoute from './components/auth/agentRoute'
import PublicRoute from './components/auth/PublicRoute'

function App() {

    const router = createBrowserRouter([
    // Public routes (Wrapped in PublicLayout)
    {
      path: '/',
      element: <PublicLayout />,
      errorElement: <GlobalError />,
      children: [
        {
          index: true,
          element: <Home />
        },
        {
          path: 'about',
          element: <About />
        },
        {
          path: 'contact',
          element: <Contact />
        },
        {
          path: 'login',
          element: <PublicRoute><Login /></PublicRoute>
        },
        {
          path: 'register',
          element: <PublicRoute><Register /></PublicRoute>
        }
      ]
    },
    // Field Agent routes
    {
      path: '/agent/dashboard',
      element: <AgentRoute><AgentDashboard /> </AgentRoute>,
      errorElement: <GlobalError />
    },
    {
      path: '/agent/my-fields',
      element: <AgentRoute><MyFields /></AgentRoute>,
      errorElement: <GlobalError />
    },
    {
      path: '/agent/field/:id',
      element: <AgentRoute><FieldDetails /></AgentRoute>,
      errorElement: <GlobalError />
    },
    
    // Admin routes (Coordinator)
    {
      path: '/admin/dashboard',
      element: <AdminRoute><AdminDashboard /></AdminRoute>,
      errorElement: <GlobalError />
    },
    {
      path: '/admin/fields',
      element: <AdminRoute><ManageFields /></AdminRoute>,
      errorElement: <GlobalError />
    }
  ])

  return (
    <RouterProvider router={router} />
  )
}

export default App

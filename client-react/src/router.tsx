import { createBrowserRouter } from 'react-router-dom'
import HomePage from './pages/HomePage.tsx'
import TablePage from './pages/TablePage.tsx'
import AboutPage from './pages/AboutPage.tsx'

export const router = createBrowserRouter([
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/table/:table',
        element: <TablePage />,
    },
    {
        path: '/about',
        element: <AboutPage />,
    },
])

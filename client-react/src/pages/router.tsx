import { createBrowserRouter } from 'react-router-dom'
import HomePage from './HomePage.tsx'
import TablePage from './TablePage.tsx'
import AboutPage from './AboutPage.tsx'

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

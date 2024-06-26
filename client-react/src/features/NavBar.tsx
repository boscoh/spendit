import { useNavigate } from 'react-router-dom'

export default function NavBar() {
    const navigate = useNavigate()

    function goHome() {
        navigate('/')
    }

    function goToAbout() {
        navigate('/about')
    }

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <span className="navbar-brand">SpendIt[react]</span>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div
                        className="collapse navbar-collapse"
                        id="navbarSupportedContent"
                    >
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li
                                className="nav-item nav-link"
                                style={{ cursor: 'pointer' }}
                                onClick={goHome}
                            >
                                Tables
                            </li>
                            <li
                                className="nav-item nav-link"
                                style={{ cursor: 'pointer' }}
                                onClick={goToAbout}
                            >
                                About
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    )
}

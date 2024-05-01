import {NavBar} from '../features/NavBar.tsx'

function AboutPage() {
    return (
        <>
            <NavBar></NavBar>
            <div className="container-fluid pt-5 p-3">
                <h3>About</h3>
                <p>Obligatory About page.</p>
                <p> My First React SPA.</p>
            </div>
        </>
    )
}

export default AboutPage

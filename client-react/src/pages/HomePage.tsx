import { NavBar } from '../features/NavBar.tsx'
import { useEffect, useState } from 'react'
import { getTables } from '../fetch.tsx'

function HomePage() {
    const [tables, setTables] = useState([])

    useEffect(() => {
        async function inner() {
            setTables(await getTables())
        }

        inner()
    }, [])

    return (
        <div className="d-flex flex-column">
            <NavBar></NavBar>
            <div className="container-fluid pt-5">
                <h1>Tables</h1>
                <ul className="mt-3 list-group">
                    {tables.map((table) => (
                        <a
                            href={'./table/' + table}
                            className="list-group-item list-group-item-action"
                            key={table}
                        >
                            {table}
                        </a>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default HomePage

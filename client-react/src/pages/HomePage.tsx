import { ChangeEvent, useEffect, useState } from 'react'
import { getTables } from '../fetch.tsx'
import { remoteUpload } from '../../../rpc/rpc.js'
import NavBar from '../features/NavBar.tsx'

function HomePage() {
    const [tables, setTables] = useState([])
    const [file, setFile] = useState<File | null>(null)

    async function reset() {
        setTables(await getTables())
    }

    useEffect(() => { reset() }, [])
    function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
        if (e.target.files) {
            setFile(e.target.files[0])
        }
    }

    async function submit() {
        if (file) {
            await remoteUpload(file, 'upload_csv')
            reset()
        }
    }

    return (
        <div className="d-flex flex-column">
            <NavBar></NavBar>

            <div className="p-3 pt-5">
                <h1>Tables</h1>

                <ul className="mt-3 list-group">
                    {tables.map((table) => (
                        <a
                            href={'./table/' + table}
                            style={{ width: '20em' }}
                            className="list-group-item list-group-item-action"
                            key={table}
                        >
                            {table}
                        </a>
                    ))}
                </ul>

                <div className="pt-5">
                    <label>Upload CSV</label>
                    <div className="d-flex flex-row gap-2">
                        <input
                            className="form-control"
                            style={{ width: '20em' }}
                            type="file"
                            onChange={handleFileChange}
                        />
                        <button
                            className="btn btn-outline-secondary"
                            onClick={submit}
                        >
                            Upload
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomePage

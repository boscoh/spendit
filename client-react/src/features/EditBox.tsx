import { ChangeEvent, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'
import { set } from '../store/transactionsSlice.tsx'

interface IEditBox {
    text: string

    handleText(text: string): void
}

export default function EditBox(props: IEditBox) {
    const dispatch = useDispatch()
    const [isEdit, setIsEdit] = useState(false)
    const [newText, setNewText] = useState('')
    const inputStyle = { fontSize: '1 .3em', fontWeight: 500 }
    const inputRef = useRef<HTMLInputElement>(null)

    function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    async function startEdit() {
        setIsEdit(true)
        setNewText(props.text)
        dispatch(set({ keyLock: true }))
        await sleep(200)
        document.addEventListener('keydown', handleEscape)
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }

    function cleanup() {
        setIsEdit(false)
        dispatch(set({ keyLock: false }))
        document.removeEventListener('keydown', handleEscape)
    }

    function handleEscape(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            cleanup()
        }
    }

    async function submitText() {
        cleanup()
        props.handleText(newText)
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        setNewText(e.target.value)
    }

    if (isEdit) {
        return (
            <div className="d-flex flex-row align-items-center py-2 gap-2">
                <input
                    type="text"
                    ref={inputRef}
                    style={inputStyle}
                    value={newText}
                    onChange={handleInputChange}
                    className="form-control"
                    onBlur={cleanup}
                />
                <button
                    className="btn btn-outline-primary"
                    onClick={submitText}
                >
                    Rename
                </button>
            </div>
        )
    } else {
        return (
            <div className="d-flex flex-row align-items-center py-2 gap-2">
                <div
                    style={inputStyle}
                    className="form-control"
                    onClick={startEdit}
                >
                    {props.text}
                </div>
            </div>
        )
    }
}

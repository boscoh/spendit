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
    const [inputText, setInputTextText] = useState(props.text)
    const inputStyle = { fontSize: '1 .3em', fontWeight: 500 }
    const inputRef = useRef<HTMLInputElement>(null)

    function sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    async function startEdit() {
        setIsEdit(true)
        setInputTextText(props.text)
        dispatch(set({ keyLock: true }))
        document.addEventListener('keydown', onKeyDown)
        await sleep(200)
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }

    function cleanup() {
        setIsEdit(false)
        dispatch(set({ keyLock: false }))
        document.removeEventListener('keydown', onKeyDown)
    }

    function onKeyDown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            cleanup()
        }
        if (e.key === 'Enter') {
            if (inputRef.current) {
                const newReport = inputRef.current.value
                props.handleText(newReport)
            }
            cleanup()
        }
    }

    function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
        setInputTextText(e.target.value)
    }

    if (isEdit) {
        return (
            <div className="d-flex flex-row align-items-center py-2 gap-2">
                <input
                    type="text"
                    ref={inputRef}
                    style={inputStyle}
                    value={inputText}
                    onChange={handleInputChange}
                    className="form-control"
                    onBlur={cleanup}
                />
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

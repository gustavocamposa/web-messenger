import { useState } from "react"

export default function PaginaPrincipal() {
    const [text, setText] = useState("")
    const [send, setSend] = useState("")
    const [message, setMessage] = useState("")

    function sendMessage() {

    }
    return (
        <>
            <div>
                <label>
                    <input type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Your user ID." />
                    <br />
                    <input type="text"
                        value={send}
                        onChange={(e) => setSend(e.target.value)}
                        placeholder="Send To." />
                    <br />
                    <input type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Message." />
                    <br />
                    <button>Send</button>
                </label>
            </div>
        </>
    )
}

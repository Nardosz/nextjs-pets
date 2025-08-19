import Pusher from "pusher-js"
import {useState, useEffect, useRef, use} from "react"

export default function Chat() {
const [isChatOpen, setIsChatOpen] = useState(false)
const [unreadCount, setUnreadCount] = useState(4)
const [socketId, setSocketId] = useState()
const [messegeLog, setMessegeLog] = useState([])
const [userMessege, setUserMessege] = useState("")
const chatField = useRef(null)
const chatLogElement =useRef(null)

    useEffect(() => {
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHERkEY, {
            cluster: "us3"
        })

        pusher.connection.bind("connected", () => {
            setSocketId(pusher.connection.socket_id)
        })
        
        const channel = pusher.subscribe("private-petchat")
        channel.bind("message", (data) => {
            setMessegeLog(prev => [...prev, data])
        })
    }, [])

    useEffect(() => {
        if (messegeLog.length) {
           chatLogElement.current.scrollTop = chatLogElement.current.scrollHeight
            if (!isChatOpen){
                setUnreadCount(prev => prev + 1)
            
            }
        }
    
    },[messegeLog])

    function openChatClick() {
      setIsChatOpen(true)
      setUnreadCount(0)
      setTimeout(() =>{
        chatField.current.focus()
      },350)
    }

     function closeChatClick() {
      setIsChatOpen(false)
    }

    function handleChatSubmit (e) {
        e.preventDefault()
        fetch("/admin/send-chat",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({message: userMessege.trim(),socket_id: socketId})
          })
          setMessegeLog(prev => [...prev, {selfMessage: true, messege: userMessege}])
          setUserMessege
    }

    function handleInputChange(e) {
        setUserMessege(e.target.value)
    }

return (
    <>
        <div className="open-chat" onClick={openChatClick}>
            {unreadCount > 0 && <span className="chat-unread-badge">{unreadCount}</span>}

                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" className="bi bi-chat-text-fill" viewBox="0 0 16 16">
                <path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M4.5 5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1zm0 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1z"/>
                </svg>
            </div>
            <div className={isChatOpen ? "chat-container chat-container--visible" : "chat-container"}>
                <div className="chat-title-bar">
                <h4>staff team chat</h4>
                <svg onClick={closeChatClick} xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-square-fill" viewBox="0 0 16 16">
                    <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708"/>
                </svg>
                </div>
                <div ref={chatLogElement} className="chat-log">
                    {messegeLog.map((item, index) =>{

                        return(
                            <div key={index} className={item.selfMessage ? "chat-messege chat-messege--self" : "chat-messege"}>
                                <div className="chat-messege-inner">{item.message}</div>
                            </div>

                        )
                    } )}
             
            </div>
                <form onSubmit={handleChatSubmit}>
                     <input value={userMessege} ref={chatField} onChange={handleInputChange} type="text" autoComplete="off" placeholder="type your message here"/>
                </form>
        </div>
     </>
       )
}
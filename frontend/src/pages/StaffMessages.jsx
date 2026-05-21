import React, { useEffect, useState } from 'react'
import api from '../api/axios'
import useAuth from '../hooks/useAuth'

export default function StaffMessages() {
    const { user } = useAuth()
    const [conversations, setConversations] = useState([])
    const [selectedConversation, setSelectedConversation] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchConversations()
    }, [])

    const fetchConversations = async () => {
        try {
            const res = await api.get('/api/messages/conversations')

            setConversations(res.data.data || [])
        } catch (err) {
            console.error('Error fetching conversations:', err)
        }
    }

    const handleSelectConversation = async (convId) => {
        setSelectedConversation(convId)
        try {
            const res = await api.get(`/api/messages/conversations/${convId}`)
            setMessages(res.data.data || [])
        } catch (err) {
            console.error('Error fetching messages:', err)
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedConversation) return

        setLoading(true)
        try {
            await api.post('/api/messages/messages', { conversation_id: selectedConversation, content: newMessage })
            setNewMessage('')
            await handleSelectConversation(selectedConversation)
        } catch (err) {
            alert('Error sending message: ' + err.message)
        }
        setLoading(false)
    }

    return (
        <div className="p-6 h-screen flex flex-col max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Messages</h1>

            <div className="flex gap-6 flex-1 overflow-hidden">
                {/* Conversations list */}
                <div className="w-1/3 border rounded-lg overflow-y-auto">
                    <div className="p-4 bg-gray-50 font-semibold">Conversations</div>
                    {conversations.length === 0 ? (
                        <div className="p-4 text-gray-500 text-sm">No conversations yet</div>
                    ) : (
                        <div className="space-y-2 p-2">
                            {conversations.map(conv => (
                                <button
                                    key={conv.id}
                                    onClick={() => handleSelectConversation(conv.id)}
                                    className={`w-full text-left p-3 rounded transition ${selectedConversation === conv.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white hover:bg-gray-100 border'
                                        }`}
                                >
                                    <div className="font-semibold text-sm">{conv.title}</div>
                                    <div className={`text-xs ${selectedConversation === conv.id ? 'text-blue-100' : 'text-gray-600'}`}>
                                        {conv.created_at ? new Date(conv.created_at).toLocaleDateString() : 'N/A'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Messages view */}
                <div className="w-2/3 border rounded-lg flex flex-col bg-white">
                    {selectedConversation ? (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                {messages.length === 0 ? (
                                    <div className="text-gray-500 text-center mt-10">No messages yet. Start the conversation!</div>
                                ) : (
                                    messages.map(msg => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender_id === user?.id
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-gray-200 text-gray-900'
                                                    }`}
                                            >
                                                <div className="text-sm">{msg.content}</div>
                                                <div className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-blue-100' : 'text-gray-600'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 border rounded px-3 py-2"
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                >
                                    Send
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500">
                            Select a conversation to start messaging
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

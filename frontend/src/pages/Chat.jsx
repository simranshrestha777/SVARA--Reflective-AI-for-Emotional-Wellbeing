import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || `${API_URL}`

function Chat() {
  const navigate = useNavigate()
  const messagesEndRef = useRef(null)
  const sendingRef = useRef(false)

  const [conversations, setConversations] = useState([])
  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [crisisResources, setCrisisResources] = useState(null)
  const [message, setMessage] = useState('')

  const [loading, setLoading] = useState(false)
  const [loadingConversations, setLoadingConversations] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadConversations()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages, loading])

  async function loadConversations() {
    const token = sessionStorage.getItem('svara_token')

    if (!token) {
      navigate('/login')
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/conversations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Could not load conversations.'
        )
      }

      setConversations(data)

      // If Dashboard sent a starter message,
      // create a new conversation and send it to Svara.
      const starterMessage =
        sessionStorage.getItem('svara_starter_message')

      if (starterMessage) {
        sessionStorage.removeItem(
          'svara_starter_message'
        )

        await createConversationWithStarter(
          starterMessage
        )

        return
      }

      // Automatically open the newest conversation
      if (data.length > 0) {
        await loadConversation(data[0].id)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingConversations(false)
    }
  }

  async function loadConversation(id) {
    const token = sessionStorage.getItem('svara_token')

    if (!token) {
      navigate('/login')
      return
    }

    setLoadingMessages(true)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/conversations/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Could not load conversation.'
        )
      }

      setConversationId(data.id)
      setMessages(data.messages || [])
      setCrisisResources(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingMessages(false)
    }
  }

  async function createConversation() {
    const token = sessionStorage.getItem('svara_token')

    if (!token) {
      navigate('/login')
      return
    }

    if (sendingRef.current) {
      return
    }

    setError('')

    try {
      const response = await fetch(
        `${API_URL}/conversations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: 'New conversation',
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Could not create conversation.'
        )
      }

      const newConversation = {
        id: data.id,
        title: data.title || 'New conversation',
        created_at: data.created_at,
      }

      setConversations((previous) => [
        newConversation,
        ...previous,
      ])

      setConversationId(data.id)
      setMessages([])
    } catch (err) {
      setError(err.message)
    }
  }

  async function createConversationWithStarter(
    starterMessage
  ) {
    const token = sessionStorage.getItem('svara_token')

    if (!token) {
      navigate('/login')
      return
    }

    if (sendingRef.current) {
      return
    }

    sendingRef.current = true

    setError('')

    try {
      // Create conversation
      const response = await fetch(
        `${API_URL}/conversations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: 'New conversation',
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Could not create conversation.'
        )
      }

      const newConversation = {
        id: data.id,
        title: data.title || 'New conversation',
        created_at: data.created_at,
      }

      setConversations((previous) => [
        newConversation,
        ...previous,
      ])

      setConversationId(data.id)

      // Show starter message immediately
      setMessages([
        {
          role: 'user',
          content: starterMessage,
        },
      ])

      setLoading(true)

      // Send starter message to Svara
      const aiResponse = await fetch(
        `${API_URL}/ai/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversation_id: data.id,
            message: starterMessage,
          }),
        }
      )

      const aiData = await aiResponse.json()

      if (!aiResponse.ok) {
        throw new Error(
          aiData.detail || 'Svara could not respond.'
        )
      }

      // Add Svara's response
      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content: aiData.reply,
        },
      ])

      if (
      aiData.safety?.risk_level === 'high' &&
      aiData.safety?.category === 'self_harm' &&
      aiData.crisis_resources
    ) {
      setCrisisResources(aiData.crisis_resources)
    } else {
      setCrisisResources(null)
    }

      // Update generated title
      if (aiData.title) {
        setConversations((previous) =>
          previous.map((conversation) =>
            conversation.id === data.id
              ? {
                  ...conversation,
                  title: aiData.title,
                }
              : conversation
          )
        )
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      sendingRef.current = false
    }
  }

  async function deleteConversation(id) {
    const token = sessionStorage.getItem('svara_token')

    if (!token) {
      navigate('/login')
      return
    }

    const confirmed = window.confirm(
      'Delete this conversation? This cannot be undone.'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/conversations/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Could not delete conversation.'
        )
      }

      const remainingConversations =
        conversations.filter(
          (conversation) => conversation.id !== id
        )

      setConversations(remainingConversations)

      // If the deleted conversation was open,
      // automatically open another conversation.
      if (conversationId === id) {
        if (remainingConversations.length > 0) {
          await loadConversation(
            remainingConversations[0].id
          )
        } else {
          setConversationId(null)
          setMessages([])
        }
      }
    } catch (err) {
      setError(err.message)
    }
  }

  async function sendMessage(e) {
    e.preventDefault()

    // Prevent duplicate requests
    if (sendingRef.current) {
      return
    }

    const trimmedMessage = message.trim()

    if (
      !trimmedMessage ||
      !conversationId ||
      loading
    ) {
      return
    }

    const token = sessionStorage.getItem('svara_token')

    if (!token) {
      navigate('/login')
      return
    }

    // Lock sending immediately
    sendingRef.current = true

    // Show user message immediately
    setMessages((previous) => [
      ...previous,
      {
        role: 'user',
        content: trimmedMessage,
      },
    ])

    setMessage('')
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/ai/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversation_id: conversationId,
            message: trimmedMessage,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail || 'Svara could not respond.'
        )
      }

      // Add exactly one AI response
      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content: data.reply,
        },
      ])
      
      if (
      data.safety?.risk_level === 'high' &&
      data.safety?.category === 'self_harm' &&
      data.crisis_resources
     ) {
      setCrisisResources(data.crisis_resources)
     } else {
      setCrisisResources(null)
     }
      // Update conversation title
      if (data.title) {
        setConversations((previous) =>
          previous.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  title: data.title,
                }
              : conversation
          )
        )
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)

      // Unlock sending
      sendingRef.current = false
    }
  }

  if (loadingConversations) {
    return (
      <main className="chat-page">
        <div className="chat-loading">
          Opening your space...
        </div>
      </main>
    )
  }

  return (
    <main className="chat-page">

      <header className="chat-header">

        <button
          className="chat-back"
          onClick={() => navigate('/dashboard')}
        >
          ←
        </button>

        <div>
          <div className="chat-logo">
            Svara
          </div>

          <span>
            Your space to talk
          </span>
        </div>

      </header>

      <div className="chat-layout">

        {/* SIDEBAR */}

        <aside className="conversation-sidebar">

          <button
            className="new-conversation-button"
            onClick={createConversation}
          >
            + New conversation
          </button>

          <div className="conversation-list">

            <p className="conversation-label">
              Conversations
            </p>

            {conversations.length === 0 ? (
              <p className="no-conversations">
                Your conversations will appear here.
              </p>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${
                    conversationId === conversation.id
                      ? 'active'
                      : ''
                  }`}
                >

                  <button
                    className="conversation-select"
                    onClick={() =>
                      loadConversation(conversation.id)
                    }
                  >
                    <span>
                      {conversation.title ||
                        'New conversation'}
                    </span>
                  </button>

                  <button
                    className="conversation-delete"
                    onClick={() =>
                      deleteConversation(
                        conversation.id
                      )
                    }
                    title="Delete conversation"
                  >
                    ×
                  </button>

                </div>
              ))
            )}

          </div>

        </aside>

        {/* CHAT */}

        <section className="chat-main">

          {loadingMessages ? (
            <div className="chat-loading">
              Opening conversation...
            </div>
          ) : (
            <>
              {messages.length === 0 ? (
                <div className="chat-introduction">

                  <div className="svara-orb">
                    S
                  </div>

                  <h1>
                    I'm here.
                  </h1>

                  <p>
                    You can tell me whatever is on
                    your mind. There is no right way
                    to start.
                  </p>

                </div>
              ) : (
                <div className="messages">

                  {messages.map((item, index) => (
                    <div
                      key={index}
                      className={`message-row ${item.role}`}
                    >
                      <div className="message-bubble">
                        {item.content}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="message-row assistant">
                      <div className="message-bubble typing">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  )}

                  {crisisResources && (
  <div className="crisis-support-card">

    <div className="crisis-support-header">
      <div className="crisis-icon">
        !
      </div>

      <div>
        <p className="crisis-eyebrow">
          Immediate support
        </p>

        <h3>
          You're not alone.
        </h3>
      </div>
    </div>

    <p className="crisis-message">
      Your safety matters. Because you may be
      going through something very difficult right
      now, here are support resources for{' '}
      <strong>
        {crisisResources.country}
      </strong>.
    </p>

    {crisisResources.emergency_message && (
      <p className="crisis-emergency-message">
        {crisisResources.emergency_message}
      </p>
    )}

    {crisisResources.helplines?.length > 0 && (
      <div className="crisis-helplines">

        {crisisResources.helplines.map(
          (helpline, index) => (
            <div
              className="crisis-helpline"
              key={index}
            >

              <div>
                <strong>
                  {helpline.name}
                </strong>

                <p>
                  {helpline.description}
                </p>
              </div>

              <a
                href={
                  helpline.type === 'call_or_text'
                    ? `tel:${helpline.number}`
                    : `tel:${helpline.number}`
                }
              >
                {helpline.number}
              </a>

            </div>
          )
        )}

      </div>
    )}

    {crisisResources.helplines?.length === 0 && (
      <p className="crisis-no-helpline">
        We don't currently have a verified
        dedicated helpline listed for your country.
        Please contact your local emergency services
        or go to the nearest emergency department.
      </p>
    )}

    <p className="crisis-footer">
      Svara is not an emergency service. If you are
      in immediate danger, seek emergency help now.
    </p>

  </div>
)}

                  <div ref={messagesEndRef} />

                </div>
              )}

              {error && (
                <p className="chat-error">
                  {error}
                </p>
              )}

              <form
                className="chat-input-area"
                onSubmit={sendMessage}
              >

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
                  }
                  placeholder="What's on your mind?"
                  rows="1"
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (
                      e.key === 'Enter' &&
                      !e.shiftKey
                    ) {
                      e.preventDefault()
                      sendMessage(e)
                    }
                  }}
                />

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !message.trim() ||
                    !conversationId
                  }
                >
                  ↑
                </button>

              </form>

              <p className="chat-disclaimer">
                Svara is an emotional wellness and
                self-reflection companion, not a
                replacement for professional care.
              </p>

            </>
          )}

        </section>

      </div>

    </main>
  )
}

export default Chat
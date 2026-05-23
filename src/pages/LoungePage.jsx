import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Send, Sparkles, Megaphone, Calendar, Trophy, Users, ShieldAlert, Heart, Terminal, Image, X } from 'lucide-react';
import './LoungePage.css';

const ANNOUNCEMENTS = [
  {
    id: 1,
    tag: 'LATEST',
    tagColor: '#38bdf8',
    title: 'Prompt by Niti v2.0 is Live!',
    date: 'May 23, 2026',
    icon: <Sparkles size={16} />,
    desc: 'We have updated our prompt generation engine with advanced contextual memory and support for Claude 3.5 Sonnet. Tokens are now credited instantly!'
  },
  {
    id: 2,
    tag: 'CHALLENGE',
    tagColor: '#fb923c',
    title: 'Weekly Prompt Challenge #14',
    date: 'May 22, 2026',
    icon: <Trophy size={16} />,
    desc: 'Build the best "3D Isometric Illustration Generator" prompt for Midjourney v6.1. The top 3 creators win 500 bonus tokens and front-page features!'
  },
  {
    id: 3,
    tag: 'SECURITY',
    tagColor: '#ef4444',
    title: 'Enhanced Prompt Verification',
    date: 'May 20, 2026',
    icon: <ShieldAlert size={16} />,
    desc: 'All submitted marketplace prompts are now automatically screened by our AI validation sandbox to ensure 100% execution compatibility.'
  },
  {
    id: 4,
    tag: 'EVENT',
    tagColor: '#a855f7',
    title: 'Live Q&A with Nitin Dagar',
    date: 'May 18, 2026',
    icon: <Calendar size={16} />,
    desc: 'Join us next Saturday inside the Lounge for a live group discussion on prompt engineering tips, marketplace insights, and upcoming features.'
  }
];

export default function LoungePage() {
  const { state } = useApp();
  // Persistent messages list stored in localStorage or starting empty
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [activeAnnouncement, setActiveAnnouncement] = useState(1);
  const [chatMode, setChatMode] = useState('group'); // 'group' or 'direct'
  const [adminInfo, setAdminInfo] = useState(null);
  const [directContacts, setDirectContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [privateContacts, setPrivateContacts] = useState([]);
  const [selectedPrivateContactId, setSelectedPrivateContactId] = useState(null);
  const [privateChatHasUnread, setPrivateChatHasUnread] = useState(false);
  
  const chatEndRef = useRef(null);
  const containerRef = useRef(null);
  const [showScrollDownBtn, setShowScrollDownBtn] = useState(false);
  const isAtBottomRef = useRef(true);
  const isInitialLoadRef = useRef(true);

  const isAdmin = state?.user?.email === 'nitindagar0800@gmail.com';

  // Switch chat modes cleanly
  const handleSwitchMode = (mode) => {
    setChatMode(mode);
    setMessages([]); // clear transiently so it looks clean while loading
    isInitialLoadRef.current = true;
    if (mode === 'private') {
      const token = localStorage.getItem('promptbyniti_token');
      if (token) {
        fetchPrivateContacts();
      }
    }
  };

  const handleSwitchContact = (contactId) => {
    setSelectedContactId(contactId);
    setMessages([]); // clear transiently so it looks clean while loading
    isInitialLoadRef.current = true;
  };

  const handleSwitchPrivateContact = (contactId) => {
    setSelectedPrivateContactId(contactId);
    setMessages([]); // clear transiently so it looks clean while loading
    isInitialLoadRef.current = true;
  };

  // Fetch direct chat contacts if admin
  const fetchDirectContacts = async () => {
    try {
      const token = localStorage.getItem('promptbyniti_token');
      if (!token) return;
      const res = await fetch('/api/lounge/contacts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDirectContacts(data.contacts);
      }
    } catch (err) {
      console.error('Error fetching direct contacts:', err);
    }
  };

  // Fetch 1-on-1 private contacts (buyers/sellers/recent chats)
  const fetchPrivateContacts = async () => {
    try {
      const token = localStorage.getItem('promptbyniti_token');
      if (!token) return;
      const res = await fetch('/api/lounge/private-contacts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPrivateContacts(data.contacts);
        const hasUnread = data.contacts.some(c => c.hasUnread);
        setPrivateChatHasUnread(hasUnread);
      }
    } catch (err) {
      console.error('Error fetching private contacts:', err);
    }
  };

  // Fetch admin info dynamically
  const fetchAdminInfo = async () => {
    try {
      const res = await fetch('/api/lounge/admin-info');
      const data = await res.json();
      if (data.success) {
        setAdminInfo(data.admin);
      }
    } catch (err) {
      console.error('Error fetching admin info:', err);
    }
  };

  // Fetch Lounge messages from backend API based on current mode
  const fetchLoungeMessages = async () => {
    try {
      const token = localStorage.getItem('promptbyniti_token');
      if (token) {
        // Run private contacts check periodically to update unread badge counts
        fetchPrivateContacts();
      }

      if (chatMode === 'group') {
        const res = await fetch('/api/lounge');
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
        }
      } else if (chatMode === 'direct') {
        // Direct DM chat mode
        if (!token) return;
        let url = '/api/lounge/direct';
        if (isAdmin && selectedContactId) {
          url += `?targetUserId=${selectedContactId}`;
        }
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
        }
        if (isAdmin) {
          fetchDirectContacts();
        }
      } else if (chatMode === 'private') {
        // 1-on-1 private chat mode with other users
        if (!token) return;
        if (!selectedPrivateContactId) {
          setMessages([]);
          return;
        }
        const url = `/api/lounge/direct?targetUserId=${selectedPrivateContactId}`;
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setMessages(data.messages);
        }
      }
    } catch (err) {
      console.error('Error fetching lounge messages:', err);
    }
  };

  useEffect(() => {
    fetchAdminInfo();
    if (isAdmin) {
      fetchDirectContacts();
    }
    const token = localStorage.getItem('promptbyniti_token');
    if (token) {
      fetchPrivateContacts();
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchLoungeMessages();
    const interval = setInterval(fetchLoungeMessages, 3500);
    return () => clearInterval(interval);
  }, [chatMode, selectedContactId, selectedPrivateContactId]);

  // Sync messages with localStorage to persist real user conversations!
  useEffect(() => {
    localStorage.setItem('promptniti_lounge_messages', JSON.stringify(messages));
  }, [messages]);

  // Handle scroll events
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    // Consider at the bottom if within 100px threshold
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    isAtBottomRef.current = isAtBottom;
    if (isAtBottom) {
      setShowScrollDownBtn(false);
    }
  };

  // Scroll to bottom on initial load / refresh
  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
      isAtBottomRef.current = true;
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle auto scroll or down arrow display on new message
  useEffect(() => {
    if (messages.length === 0) return;

    if (isInitialLoadRef.current) {
      if (containerRef.current) {
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }
      isInitialLoadRef.current = false;
      setShowScrollDownBtn(false);
      isAtBottomRef.current = true;
    } else {
      if (isAtBottomRef.current) {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: 'smooth'
          });
        }
      } else {
        // Only show scroll down alert if the last message is from someone else
        const lastMsg = messages[messages.length - 1];
        const msgUserId = lastMsg.userId?.toString();
        const currentUserId = state?.user?._id?.toString() || state?.user?.id?.toString();
        const currentUsername = state?.user?.name || state?.user?.email?.split('@')[0];
        const isMsgSelf = (msgUserId && currentUserId && msgUserId === currentUserId) || 
                          (lastMsg.username && currentUsername && lastMsg.username === currentUsername) || 
                          lastMsg.isSelf;
        if (!isMsgSelf) {
          setShowScrollDownBtn(true);
        }
      }
    }
  }, [messages]);

  const handleScrollToLast = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
    setShowScrollDownBtn(false);
    isAtBottomRef.current = true;
  };

  const [selectedImage, setSelectedImage] = useState(null);
  const [activeLightboxImg, setActiveLightboxImg] = useState(null);

  // Handle escape key to close lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveLightboxImg(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file only.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image is too large. Please select an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() && !selectedImage) return;

    const userText = inputValue.trim();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const token = localStorage.getItem('promptbyniti_token');
      if (!token) {
        alert('Please login to send messages.');
        return;
      }

      // When posting in DM / private mode, pass the correct recipientId
      let recipientId = null;
      if (chatMode === 'direct') {
        if (isAdmin) {
          if (!selectedContactId) {
            alert('Please select a user to message.');
            return;
          }
          recipientId = selectedContactId;
        } else {
          if (!adminInfo) {
            alert('Admin details not loaded. Please try again.');
            return;
          }
          recipientId = adminInfo._id;
        }
      } else if (chatMode === 'private') {
        if (!selectedPrivateContactId) {
          alert('Please select a private contact user to message.');
          return;
        }
        recipientId = selectedPrivateContactId;
      }

      // Optimistically append local message for zero-latency UI response
      const optimisticMsg = {
        id: Date.now(),
        username: state?.user?.name || state?.user?.email?.split('@')[0] || 'Guest_User',
        color: state?.user?.email === 'nitindagar0800@gmail.com' ? '#f97316' : '#10b981',
        badge: state?.user?.email === 'nitindagar0800@gmail.com' ? '🛡️ Admin' : '👾 Human',
        text: userText,
        image: selectedImage,
        time: timeStr,
        isSelf: true,
        recipientId: recipientId
      };
      setMessages(prev => [...prev, optimisticMsg]);
      setInputValue('');
      setSelectedImage(null);

      const response = await fetch('/api/lounge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: userText,
          image: selectedImage,
          time: timeStr,
          recipientId: recipientId
        })
      });

      const data = await response.json();
      if (data.success) {
        // Sync real backend-persisted message
        fetchLoungeMessages();
        if (isAdmin) {
          fetchDirectContacts();
        }
      } else {
        alert(data.message || 'Failed to send message.');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="lounge-page container">
      {/* Lounge Header */}
      <header className="lounge-header-clean">
        <h1>Cosmic Lounge</h1>
        <p>Group Discussions & Updates Board for the Prompt by Niti Community</p>
      </header>
      <br></br>

      {/* Main Grid */}
      <div className="lounge-grid">
        {/* Left Side: Live Chat Feed */}
        <section className="lounge-chat-card glass-card" style={{ position: 'relative' }}>
          <div className="card-header">
            <h2>Group Discussion</h2>
            
            {/* Chat Mode Switcher Tabs */}
            <div className="chat-lounge-tabs">
              <button
                type="button"
                className={`chat-lounge-tab-btn group-tab ${chatMode === 'group' ? 'active' : ''}`}
                onClick={() => handleSwitchMode('group')}
              >
                👥 Group Talk
              </button>
              <button
                type="button"
                className={`chat-lounge-tab-btn direct-tab ${chatMode === 'direct' ? 'active' : ''}`}
                onClick={() => handleSwitchMode('direct')}
              >
                💬 Talk Direct Admin (Nitin)
              </button>
              {state?.user && (
                <button
                  type="button"
                  className={`chat-lounge-tab-btn private-tab ${chatMode === 'private' ? 'active' : ''}`}
                  onClick={() => handleSwitchMode('private')}
                  style={{ position: 'relative' }}
                >
                  🔒 Private Chat
                  {privateChatHasUnread && (
                    <span 
                      className="pulse-dot" 
                      style={{ 
                        position: 'absolute', 
                        top: '-2px', 
                        right: '-2px', 
                        display: 'inline-block', 
                        width: '8px', 
                        height: '8px', 
                        backgroundColor: '#ef4444', 
                        borderRadius: '50%', 
                        boxShadow: '0 0 8px #ef4444', 
                        animation: 'glowPulse 2s infinite' 
                      }}
                    ></span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* If current user IS the admin, let them select a contact user to chat with - Fixed at top of card */}
          {chatMode === 'direct' && isAdmin && directContacts.length > 0 && (
            <div className="admin-chat-selector-banner" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              background: 'rgba(251, 146, 60, 0.07)', 
              borderBottom: '1px solid rgba(251, 146, 60, 0.15)', 
              padding: '12px 24px', 
              flexShrink: 0 
            }}>
              <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                💬 Active DM Thread:
                {directContacts.some(c => c.hasUnread) && (
                  <span className="pulse-dot" style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', boxShadow: '0 0 8px #ef4444', animation: 'glowPulse 2s infinite' }}></span>
                )}
              </span>
              <select
                value={selectedContactId || ''}
                onChange={(e) => handleSwitchContact(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'white',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  fontFamily: 'var(--font-body)',
                  fontSize: '1.25rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">-- Choose a member to read/reply --</option>
                {directContacts.map(c => (
                  <option key={c._id} value={c._id}>
                    {c.hasUnread ? '🔴 ' : ''}{c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 1-on-1 Private Chat Contact Selector Banner */}
          {chatMode === 'private' && (
            <div className="private-chat-selector-banner" style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              background: 'rgba(99, 102, 241, 0.07)', 
              borderBottom: '1px solid rgba(99, 102, 241, 0.15)', 
              padding: '12px 24px', 
              flexShrink: 0 
            }}>
              <span style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🔒 Select Private Chat:
                {privateContacts.some(c => c.hasUnread) && (
                  <span className="pulse-dot" style={{ display: 'inline-block', width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%', boxShadow: '0 0 8px #ef4444', animation: 'glowPulse 2s infinite' }}></span>
                )}
              </span>
              {privateContacts.length > 0 ? (
                <select
                  value={selectedPrivateContactId || ''}
                  onChange={(e) => handleSwitchPrivateContact(e.target.value)}
                  style={{
                    flex: 1,
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '10px',
                    fontFamily: 'var(--font-body)',
                    fontSize: '1.25rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">-- Choose a contact user to message --</option>
                  {privateContacts.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.hasUnread ? '🔴 ' : ''}{c.name} ({c.email})
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ flex: 1, fontSize: '1.2rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', paddingLeft: '8px' }}>
                  No active clients or sellers. Purchased prompt chats appear here automatically.
                </div>
              )}
            </div>
          )}
          
          <div 
            className="chat-messages-container"
            ref={containerRef}
            onScroll={handleScroll}
          >
             {messages.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: '1.8rem', margin: '0 0 10px 0', color: 'var(--text-primary)' }}>
                  {chatMode === 'group' ? '👽 Welcome to the Cosmic Lounge!' : chatMode === 'private' ? '🔒 1-on-1 Private Chat' : '🔒 Private Direct Chat'}
                </p>
                <p style={{ fontSize: '1.3rem', maxWidth: '400px', lineHeight: '1.4' }}>
                  {chatMode === 'group' 
                    ? 'The chat is currently empty. Be the first to share a thought, tip, or announcement with the community!'
                    : chatMode === 'private'
                      ? (selectedPrivateContactId
                          ? 'No messages yet in this private discussion thread. Start your conversation!'
                          : 'Select an eligible client or seller from the dropdown above to start a secure, private 1-on-1 chat!')
                      : isAdmin 
                        ? 'Select a member contact from the dropdown to start your 1-on-1 direct discussion!'
                        : 'This is a private direct message board with Nitin (Admin). Share your questions, feedback, or custom requests directly and privately here!'}
                </p>
              </div>
            ) : (
              messages.map(msg => {
                const msgUserId = msg.userId?.toString();
                const currentUserId = state?.user?._id?.toString() || state?.user?.id?.toString();
                const currentUsername = state?.user?.name || state?.user?.email?.split('@')[0];
                const isMsgSelf = (msgUserId && currentUserId && msgUserId === currentUserId) || 
                                  (msg.username && currentUsername && msg.username === currentUsername) || 
                                  msg.isSelf;
                
                // Check if this is a regular user-to-user private DM
                const isAdminMessage = adminInfo && (msg.recipientId === adminInfo._id || msg.userId === adminInfo._id);
                const isUserToUserPrivate = msg.recipientId && !isAdminMessage;

                return (
                  <div key={msg._id || msg.id} className={`chat-bubble-row ${isMsgSelf ? 'self' : ''}`}>
                    <div className="chat-bubble-header">
                      <span className="chat-username" style={{ color: msg.color }}>{msg.username}</span>
                      <span className="chat-user-badge">{msg.badge}</span>
                      {msg.recipientId && (
                        isUserToUserPrivate ? (
                          <span className="chat-user-badge" style={{ color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.2)' }}>🔒 Private Chat</span>
                        ) : (
                          <span className="chat-user-badge" style={{ color: '#fb923c', background: 'rgba(251, 146, 60, 0.1)', border: '1px solid rgba(251, 146, 60, 0.2)' }}>🔒 Direct DM</span>
                        )
                      )}
                      <span className="chat-msg-time">{msg.time}</span>
                    </div>
                    <div className="chat-bubble-text">
                      {msg.image && (
                        <img 
                          src={msg.image} 
                          alt="Sent upload" 
                          className="chat-bubble-image" 
                          onClick={() => setActiveLightboxImg(msg.image)}
                          style={{ cursor: 'zoom-in' }}
                        />
                      )}
                      {msg.text && (
                        <p style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {isUserToUserPrivate && <span title="Secure 1-on-1 private chat" style={{ cursor: 'help', userSelect: 'none' }}>🔒</span>}
                          {msg.text}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Floating show scroll down arrow notification */}
          {showScrollDownBtn && (
            <button 
              className="chat-scroll-down-btn" 
              onClick={handleScrollToLast}
              title="Scroll to last message"
              type="button"
            >
              <span>New Messages</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="scroll-arrow-icon" style={{ display: 'inline', marginLeft: '6px', verticalAlign: 'middle' }}>
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </button>
          )}

          <form className="chat-input-bar-wrapper" onSubmit={handleSendMessage}>
            {selectedImage && (
              <div className="chat-image-preview-overlay">
                <div className="preview-container">
                  <img src={selectedImage} alt="Selected preview" />
                  <button type="button" className="remove-preview-btn" onClick={handleRemoveImage} title="Remove image">
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}
            <div className="chat-input-bar">
              {state?.user ? (
                <>
                  <input 
                    type="text" 
                    placeholder={
                      chatMode === 'private' && privateContacts.length === 0
                        ? "no active private contacts available..."
                        : chatMode === 'private' && !selectedPrivateContactId
                          ? "select a private contact above to chat..."
                          : "chat with the community..."
                    }
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    maxLength={200}
                    disabled={chatMode === 'private' && (!selectedPrivateContactId || privateContacts.length === 0)}
                  />
                  <label 
                    className="chat-image-attach-btn" 
                    title="Attach Image"
                    style={{
                      opacity: chatMode === 'private' && (!selectedPrivateContactId || privateContacts.length === 0) ? 0.4 : 1,
                      cursor: chatMode === 'private' && (!selectedPrivateContactId || privateContacts.length === 0) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Image size={18} />
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      style={{ display: 'none' }} 
                      disabled={chatMode === 'private' && (!selectedPrivateContactId || privateContacts.length === 0)}
                    />
                  </label>
                  <button 
                    type="submit" 
                    className="btn btn-blue send-btn"
                    disabled={chatMode === 'private' && (!selectedPrivateContactId || privateContacts.length === 0)}
                  >
                    <Send size={16} style={{ marginRight: '6px' }} />
                    Send
                  </button>
                </>
              ) : (
                <div className="chat-input-placeholder">
                  <p>👽 Please <a href="/login">login</a> or <a href="/signup">signup</a> to participate in the live group discussion!</p>
                </div>
              )}
            </div>
          </form>
        </section>

        {/* Right Side: Announcements Board */}
        <section className="lounge-announcements-card glass-card">
          <div className="card-header">
            <h2>Announcements</h2>
            <Megaphone size={18} className="text-orange" />
          </div>

          <div className="announcements-list-vertical">
            {ANNOUNCEMENTS.map(item => (
              <div 
                key={item.id} 
                className={`announcement-card-item ${activeAnnouncement === item.id ? 'active' : ''}`}
                onClick={() => setActiveAnnouncement(item.id)}
              >
                <div className="item-header">
                  <div className="item-title-box">
                    <span className="item-icon-wrapper" style={{ color: item.tagColor }}>
                      {item.icon}
                    </span>
                    <h3 style={{ color: item.tagColor }}>{item.title}</h3>
                  </div>
                  <span className="item-tag" style={{ backgroundColor: `${item.tagColor}15`, color: item.tagColor, border: `1px solid ${item.tagColor}30` }}>
                    {item.tag}
                  </span>
                </div>
                <span className="item-date">{item.date}</span>
                
                {activeAnnouncement === item.id && (
                  <div className="item-description-full animate-fadeIn">
                    <p>{item.desc}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activeLightboxImg && (
        <div className="chat-lightbox-overlay" onClick={() => setActiveLightboxImg(null)}>
          <div className="lightbox-container" onClick={(e) => e.stopPropagation()}>
            <img src={activeLightboxImg} alt="Fullscreen preview" />
            <button 
              type="button" 
              className="lightbox-close-btn" 
              onClick={() => setActiveLightboxImg(null)} 
              title="Close preview"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

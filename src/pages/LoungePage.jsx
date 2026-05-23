import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, Megaphone, Calendar, Trophy, Users, ShieldAlert, Heart, Terminal, Image, X, Plus, Pencil, Trash2 } from 'lucide-react';
import './LoungePage.css';



export default function LoungePage() {
  const { state, authLoading } = useApp();
  const navigate = useNavigate();

  // Redirect to login if user session is unauthenticated
  useEffect(() => {
    if (!authLoading && !state?.user) {
      navigate('/login');
    }
  }, [authLoading, state?.user, navigate]);

  // Persistent messages list stored in localStorage or starting empty
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  
  // Dynamic Announcements States
  const [announcements, setAnnouncements] = useState([]);
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    desc: '',
    tag: 'LATEST',
    tagColor: '#38bdf8',
    type: 'latest'
  });

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

  // Fetch Announcements from backend API
  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/lounge/announcements');
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements);
        if (data.announcements.length > 0 && !activeAnnouncement) {
          setActiveAnnouncement(data.announcements[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    }
  };

  // Add or Edit Announcement
  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('promptbyniti_token');
    if (!token) return;

    try {
      const url = editingAnnouncement 
        ? `/api/lounge/announcements/${editingAnnouncement._id}`
        : '/api/lounge/announcements';
      const method = editingAnnouncement ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(announcementForm)
      });
      const data = await res.json();
      if (data.success) {
        fetchAnnouncements();
        setShowAnnouncementModal(false);
        setEditingAnnouncement(null);
        setAnnouncementForm({
          title: '',
          desc: '',
          tag: 'LATEST',
          tagColor: '#38bdf8',
          type: 'latest'
        });
      } else {
        alert(data.message || 'Failed to save announcement.');
      }
    } catch (err) {
      console.error('Error saving announcement:', err);
    }
  };

  // Delete Announcement
  const handleDeleteAnnouncement = async (id, e) => {
    e.stopPropagation(); // prevent card click activating the announcement
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    const token = localStorage.getItem('promptbyniti_token');
    if (!token) return;

    try {
      const res = await fetch(`/api/lounge/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (activeAnnouncement === id) {
          setActiveAnnouncement(null);
        }
        fetchAnnouncements();
      } else {
        alert(data.message || 'Failed to delete announcement.');
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
    }
  };

  // Open modal in Add mode
  const openAddAnnouncement = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({
      title: '',
      desc: '',
      tag: 'LATEST',
      tagColor: '#38bdf8',
      type: 'latest'
    });
    setShowAnnouncementModal(true);
  };

  // Open modal in Edit mode
  const openEditAnnouncement = (ann, e) => {
    e.stopPropagation(); // prevent card click
    setEditingAnnouncement(ann);
    setAnnouncementForm({
      title: ann.title,
      desc: ann.desc,
      tag: ann.tag,
      tagColor: ann.tagColor,
      type: ann.type || 'latest'
    });
    setShowAnnouncementModal(true);
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
    fetchAnnouncements();
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

  if (authLoading || !state?.user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'white', background: '#090d16', fontSize: '1.8rem', fontFamily: 'var(--font-display)' }}>
        Loading Cosmic Lounge...
      </div>
    );
  }

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
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2>Announcements</h2>
              <Megaphone size={18} className="text-orange" />
            </div>
            {isAdmin && (
              <button 
                type="button" 
                onClick={openAddAnnouncement} 
                title="Add New Announcement"
                style={{ background: 'none', border: 'none', color: '#fb923c', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'transform 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.18)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Plus size={20} />
              </button>
            )}
          </div>

          <div className="announcements-list-vertical">
            {announcements.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', padding: '20px', textAlign: 'center', fontStyle: 'italic', fontSize: '1.2rem' }}>
                No announcements posted yet.
              </div>
            ) : (
              announcements.map(item => {
                const getIcon = (type, color) => {
                  switch(type) {
                    case 'challenge': return <Trophy size={16} style={{ color }} />;
                    case 'security': return <ShieldAlert size={16} style={{ color }} />;
                    case 'event': return <Calendar size={16} style={{ color }} />;
                    default: return <Sparkles size={16} style={{ color }} />;
                  }
                };

                return (
                  <div 
                    key={item._id} 
                    className={`announcement-card-item ${activeAnnouncement === item._id ? 'active' : ''}`}
                    onClick={() => setActiveAnnouncement(item._id)}
                  >
                    <div className="item-header">
                      <div className="item-title-box">
                        <span className="item-icon-wrapper">
                          {getIcon(item.type, item.tagColor)}
                        </span>
                        <h3 style={{ color: item.tagColor }}>{item.title}</h3>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="item-tag" style={{ backgroundColor: `${item.tagColor}15`, color: item.tagColor, border: `1px solid ${item.tagColor}30` }}>
                          {item.tag}
                        </span>
                        {isAdmin && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button 
                              type="button" 
                              onClick={(e) => openEditAnnouncement(item, e)} 
                              title="Edit Announcement"
                              style={{ background: 'none', border: 'none', color: '#fb923c', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', opacity: 0.7, transition: 'all 0.2s ease' }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                            >
                              <Pencil size={12} />
                            </button>
                            <button 
                              type="button" 
                              onClick={(e) => handleDeleteAnnouncement(item._id, e)} 
                              title="Delete Announcement"
                              style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', opacity: 0.7, transition: 'all 0.2s ease' }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="item-date">{item.date}</span>
                    
                    {activeAnnouncement === item._id && (
                      <div className="item-description-full animate-fadeIn">
                        <p>{item.desc}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {/* Add / Edit Announcement Modal Dialog overlay */}
      {showAnnouncementModal && (
        <div className="chat-lightbox-overlay" style={{ background: 'rgba(15, 23, 42, 0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAnnouncementModal(false)}>
          <div className="glass-card" style={{ 
            width: '450px', 
            maxWidth: '90vw', 
            background: 'rgba(30, 41, 59, 0.95)', 
            border: '1px solid rgba(56, 189, 248, 0.2)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            padding: '24px 30px',
            borderRadius: '24px'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.45rem', margin: 0, color: 'white', fontFamily: 'var(--font-display)' }}>
                {editingAnnouncement ? '📝 Edit Announcement' : '📢 New Announcement'}
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAnnouncementModal(false)}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)' }}>Title</label>
                <input 
                  type="text" 
                  value={announcementForm.title}
                  onChange={(e) => setAnnouncementForm({...announcementForm, title: e.target.value})}
                  placeholder="e.g. Prompt by Niti v2.0 is Live!"
                  required
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    height: '42px',
                    padding: '0 12px',
                    color: 'white',
                    fontSize: '1.25rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)' }}>Description</label>
                <textarea 
                  value={announcementForm.desc}
                  onChange={(e) => setAnnouncementForm({...announcementForm, desc: e.target.value})}
                  placeholder="Provide the announcement text here..."
                  required
                  rows={4}
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    color: 'white',
                    fontSize: '1.25rem',
                    outline: 'none',
                    resize: 'none',
                    fontFamily: 'var(--font-body)'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)' }}>Tag Label</label>
                  <input 
                    type="text" 
                    value={announcementForm.tag}
                    onChange={(e) => setAnnouncementForm({...announcementForm, tag: e.target.value.toUpperCase()})}
                    placeholder="e.g. LATEST"
                    style={{
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      height: '42px',
                      padding: '0 12px',
                      color: 'white',
                      fontSize: '1.25rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)' }}>Tag Color</label>
                  <select 
                    value={announcementForm.tagColor}
                    onChange={(e) => setAnnouncementForm({...announcementForm, tagColor: e.target.value})}
                    style={{
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      height: '42px',
                      padding: '0 12px',
                      color: 'white',
                      fontSize: '1.25rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="#38bdf8">Cyan (#38bdf8)</option>
                    <option value="#fb923c">Orange (#fb923c)</option>
                    <option value="#ef4444">Red (#ef4444)</option>
                    <option value="#a855f7">Purple (#a855f7)</option>
                    <option value="#ec4899">Pink (#ec4899)</option>
                    <option value="#10b981">Green (#10b981)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.7)', fontFamily: 'var(--font-body)' }}>Icon Style</label>
                <select 
                  value={announcementForm.type}
                  onChange={(e) => setAnnouncementForm({...announcementForm, type: e.target.value})}
                  style={{
                    background: 'rgba(15, 23, 42, 0.85)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    height: '42px',
                    padding: '0 12px',
                    color: 'white',
                    fontSize: '1.25rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="latest">✨ Sparkles (Latest Updates)</option>
                  <option value="challenge">🏆 Trophy (Events/Challenges)</option>
                  <option value="security">🛡️ Shield Alert (Alerts/Security)</option>
                  <option value="event">📅 Calendar (Q&A/Schedules)</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="btn btn-blue"
                style={{
                  height: '46px',
                  borderRadius: '12px',
                  fontSize: '1.25rem',
                  marginTop: '10px',
                  fontFamily: 'var(--font-display)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                {editingAnnouncement ? 'Save Changes' : 'Publish Announcement'}
              </button>
            </form>
          </div>
        </div>
      )}

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

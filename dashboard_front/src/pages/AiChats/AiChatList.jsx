import React, { useState, useEffect } from 'react';
import {
  Eye,
  RefreshCw,
  Bot,
  User,
  MessageSquare,
} from 'lucide-react';
import { adminApi } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { Badge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Dialog } from '../../components/common/Dialog';
import { SearchInput } from '../../components/common/SearchInput';
import { useNotification } from '../../context/NotificationContext';

const formatDateTime = (isoString) => {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const renderFormattedText = (text) => {
  if (!text) return null;
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`|\*[^*\n]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} style={{ fontWeight: 800, color: '#0f172a' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          style={{
            padding: '2px 6px',
            borderRadius: '6px',
            background: '#ecfdf5',
            color: '#0f6848',
            fontWeight: 700,
            fontSize: '0.82em',
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <span key={i}>{part.slice(1, -1)}</span>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};

export const AiChatList = () => {
  const { showNotification } = useNotification();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  // Read-only View Dialog State
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);

  const fetchChats = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 10,
        search: debouncedSearch || undefined,
      };
      const res = await adminApi.getAiChats(params);
      if (res.data?.success) {
        setChats(res.data.data || []);
        setCurrentPage(res.data.current_page || 1);
        setLastPage(res.data.last_page || 1);
        setTotal(res.data.total || 0);
      }
    } catch {
      showNotification('فشل تحميل سجل شاتس الـ AI', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats(1);
  }, [debouncedSearch]);

  const handleViewChat = async (chatRow) => {
    setIsViewOpen(true);
    setViewLoading(true);
    setSelectedChat(null);
    try {
      const res = await adminApi.getAiChat(chatRow.id);
      if (res.data?.success) {
        setSelectedChat(res.data.data);
      }
    } catch {
      showNotification('تعذر تحميل تفاصيل المحادثة', 'error');
      setIsViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setSelectedChat(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--slate-900)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot size={26} style={{ color: 'var(--primary-600, #0f6848)' }} />
            <span>شاتس الـ AI</span>
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
            استعراض محادثات المستخدمين المسجلين مع الصيدلي الذكي ({total} محادثة) — للعرض فقط
          </p>
        </div>

        <button
          onClick={() => fetchChats(currentPage)}
          className="btn btn-outline"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} />
          <span>تحديث</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '18px 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <div style={{ flex: '1 1 280px' }}>
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="ابحث باسم المستخدم، البريد الإلكتروني، أو موضوع المحادثة..."
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px 20px' }}>
            <LoadingSpinner />
          </div>
        ) : chats.length === 0 ? (
          <div style={{ padding: '48px 20px' }}>
            <EmptyState
              icon={MessageSquare}
              title="لا توجد محادثات AI مسجلة"
              description="لم يقم أي مستخدم مسجل بإجراء محادثات مع الصيدلي الذكي حتى الآن."
            />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>المستخدم صاحب الشات</th>
                  <th>موضوع المحادثة</th>
                  <th>عدد الرسائل</th>
                  <th>آخر نشاط</th>
                  <th style={{ textAlign: 'center' }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {chats.map((chat) => (
                  <tr key={chat.id}>
                    <td style={{ fontWeight: 700, color: 'var(--slate-500)' }}>#{chat.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          background: 'var(--primary-50, #ecfdf5)',
                          color: 'var(--primary-600, #0f6848)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <User size={18} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: '0.92rem' }}>
                            {chat.user?.name || 'مستخدم محذوف'}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                            {chat.user?.email || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: '340px', fontWeight: 600, color: 'var(--slate-700)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {chat.title}
                      </div>
                    </td>
                    <td>
                      <Badge variant="info">{chat.messages_count ?? 0} رسالة</Badge>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                      {formatDateTime(chat.last_message_at || chat.created_at)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleViewChat(chat)}
                        className="btn btn-outline"
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                        title="عرض المحادثة"
                      >
                        <Eye size={15} />
                        <span>عرض</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && lastPage > 1 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--slate-100)' }}>
            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              onPageChange={(page) => fetchChats(page)}
            />
          </div>
        )}
      </div>

      {/* Read-Only View Chat Dialog */}
      <Dialog
        isOpen={isViewOpen}
        onClose={handleCloseView}
        title={selectedChat ? `محادثة #${selectedChat.id} — ${selectedChat.user?.name || 'مستخدم'}` : 'عرض المحادثة'}
        maxWidth="760px"
        footer={
          <button type="button" onClick={handleCloseView} className="btn btn-outline">
            إغلاق
          </button>
        }
      >
        {viewLoading ? (
          <div style={{ padding: '48px 0' }}>
            <LoadingSpinner />
          </div>
        ) : selectedChat ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* User Info Summary (Read-Only) */}
            <div style={{
              background: 'var(--slate-50)',
              border: '1px solid var(--slate-200)',
              borderRadius: '12px',
              padding: '12px 16px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.85rem',
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--slate-500)' }}>المستخدم:</span>
                <strong style={{ color: 'var(--slate-800)' }}>{selectedChat.user?.name || '—'}</strong>
                {selectedChat.user?.email && (
                  <span
                    dir="ltr"
                    style={{
                      color: 'var(--slate-600)',
                      background: '#ffffff',
                      border: '1px solid var(--slate-200)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                    }}
                  >
                    {selectedChat.user.email}
                  </span>
                )}
              </div>
              <div>
                <span style={{ color: 'var(--slate-500)' }}>تاريخ البدء: </span>
                <strong style={{ color: 'var(--slate-700)' }}>{formatDateTime(selectedChat.created_at)}</strong>
              </div>
            </div>

            {/* Messages Thread (Read-Only) */}
            <div style={{
              maxHeight: '460px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '14px',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid var(--slate-200)',
            }}>
              {(selectedChat.messages || []).length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '24px' }}>
                  لا توجد رسائل في هذه المحادثة.
                </div>
              ) : (
                selectedChat.messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        flexDirection: isUser ? 'row' : 'row-reverse',
                        alignItems: 'flex-start',
                        gap: '10px',
                      }}
                    >
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: isUser ? 'var(--primary-600, #0f6848)' : '#d1fae5',
                        color: isUser ? '#ffffff' : '#0f6848',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {isUser ? <User size={16} /> : <Bot size={16} />}
                      </div>

                      <div style={{ maxWidth: '80%' }}>
                        <div style={{
                          padding: '11px 15px',
                          borderRadius: '14px',
                          fontSize: '0.88rem',
                          lineHeight: 1.75,
                          whiteSpace: 'pre-line',
                          background: isUser ? 'var(--primary-600, #0f6848)' : '#ffffff',
                          color: isUser ? '#ffffff' : 'var(--slate-800)',
                          border: isUser ? 'none' : '1px solid var(--slate-200)',
                          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
                        }}>
                          {isUser ? msg.message : renderFormattedText(msg.message)}
                        </div>
                        <div style={{
                          fontSize: '0.72rem',
                          color: 'var(--slate-400)',
                          marginTop: '4px',
                          textAlign: isUser ? 'right' : 'left',
                        }}>
                          {formatDateTime(msg.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
};

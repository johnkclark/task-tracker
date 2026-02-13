import { useState, useRef } from "react";

const K = {
  pink: "#FFA8CD", pinkHover: "#FFB8D7", pinkMuted: "rgba(255,168,205,0.12)",
  black: "#0B051D", offWhite: "#F9F8F5", steel: "#1D192A",
  gray: "#C4C3CA", grayMuted: "#9694A0",
  border: "rgba(29,25,42,0.08)", borderDark: "rgba(29,25,42,0.15)",
  danger: "#E8405C", dangerBg: "rgba(232,64,92,0.08)",
  font: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const defaultLists = [
  {
    id: 1, name: "Your first list",
    tasks: [
      { id: 1, text: "Drag tasks to reorder by priority", done: false },
      { id: 2, text: "Click the ✉ icon to share via Gmail", done: false },
      { id: 3, text: "Create a new list with + New List", done: false },
    ],
  },
];

const TaskTracker = () => {
  const [lists, setLists] = useState(defaultLists);
  const [activeId, setActiveId] = useState(1);
  const [input, setInput] = useState("");
  const [editingName, setEditingName] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [showShare, setShowShare] = useState(null);
  const [email, setEmail] = useState("");
  const dragItem = useRef(null);
  const [dragging, setDragging] = useState(null);

  const active = lists.find((l) => l.id === activeId);
  const tasks = active?.tasks || [];

  const updateTasks = (nt) =>
    setLists(lists.map((l) => (l.id === activeId ? { ...l, tasks: nt } : l)));

  const addTask = () => {
    if (!input.trim()) return;
    updateTasks([...tasks, { id: Date.now(), text: input.trim(), done: false }]);
    setInput("");
  };

  const toggle = (id) => updateTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id) => updateTasks(tasks.filter((t) => t.id !== id));

  const addList = () => {
    const id = Date.now();
    setLists([...lists, { id, name: "New List", tasks: [] }]);
    setActiveId(id);
    setEditingName(id);
    setNameInput("New List");
  };

  const deleteList = (id) => {
    if (lists.length <= 1) return;
    const u = lists.filter((l) => l.id !== id);
    setLists(u);
    if (activeId === id) setActiveId(u[0].id);
  };

  const saveName = () => {
    if (nameInput.trim()) setLists(lists.map((l) => (l.id === editingName ? { ...l, name: nameInput.trim() } : l)));
    setEditingName(null);
  };

  const onDragStart = (idx) => { dragItem.current = idx; setDragging(idx); };
  const onDragEnter = (idx) => {
    if (dragItem.current === null || dragItem.current === idx) return;
    const u = [...tasks]; const item = u.splice(dragItem.current, 1)[0];
    u.splice(idx, 0, item); dragItem.current = idx; updateTasks(u);
  };
  const onDragEnd = () => { dragItem.current = null; setDragging(null); };

  const buildMailto = () => {
    const to = email.trim();
    if (!to) return null;
    let subject, body;
    if (showShare === "all") {
      subject = active.name;
      body = tasks.map((t, i) => `${i + 1}. [${t.done ? "✓" : " "}] ${t.text}`).join("\n");
    } else {
      const t = tasks.find((x) => x.id === showShare);
      if (!t) return null;
      subject = `Task: ${t.text}`;
      body = `${t.done ? "✓ Done" : "◻ Pending"}: ${t.text}`;
    }
    return `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSend = () => {
    const url = buildMailto();
    if (url) { window.open(url, "_blank"); setShowShare(null); setEmail(""); }
  };

  const pending = tasks.filter((t) => !t.done).length;

  return (
    <div style={{ minHeight: "100vh", background: K.offWhite, color: K.black, fontFamily: K.font, display: "flex", justifyContent: "center", padding: "48px 16px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ width: "100%", maxWidth: 580 }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "inline-block", background: K.pink, borderRadius: 12, padding: "6px 14px", marginBottom: 16 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: K.black, letterSpacing: 0.5 }}>TASK TRACKER</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap", alignItems: "center" }}>
          {lists.map((l) => (
            <div key={l.id}>
              {editingName === l.id ? (
                <input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onBlur={saveName}
                  onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(null); }}
                  autoFocus
                  style={{ padding: "10px 16px", borderRadius: 24, border: `2px solid ${K.pink}`, background: "#fff", color: K.black, fontSize: 14, fontFamily: K.font, fontWeight: 500, outline: "none", width: 130 }}
                />
              ) : (
                <button
                  onClick={() => setActiveId(l.id)}
                  onDoubleClick={() => { setEditingName(l.id); setNameInput(l.name); }}
                  style={{
                    padding: "10px 18px", borderRadius: 24, border: "none", cursor: "pointer",
                    background: l.id === activeId ? K.black : "#fff",
                    color: l.id === activeId ? K.offWhite : K.black,
                    fontSize: 14, fontWeight: 600, fontFamily: K.font,
                    boxShadow: l.id === activeId ? "none" : `0 0 0 1px ${K.borderDark}`,
                    display: "flex", alignItems: "center", gap: 8, transition: "all 0.2s",
                  }}
                >
                  {l.name}
                  <span style={{ fontSize: 11, fontWeight: 500, color: l.id === activeId ? K.gray : K.grayMuted }}>
                    {l.tasks.filter((t) => !t.done).length}/{l.tasks.length}
                  </span>
                  {lists.length > 1 && (
                    <span
                      onClick={(e) => { e.stopPropagation(); deleteList(l.id); }}
                      style={{ fontSize: 15, color: l.id === activeId ? K.gray : K.grayMuted, marginLeft: 2, lineHeight: 1 }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = K.danger)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = l.id === activeId ? K.gray : K.grayMuted)}
                    >×</span>
                  )}
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addList}
            style={{ padding: "10px 18px", borderRadius: 24, border: `2px dashed ${K.borderDark}`, background: "transparent", color: K.grayMuted, fontSize: 14, fontWeight: 500, fontFamily: K.font, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = K.pink; e.currentTarget.style.color = K.black; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = K.borderDark; e.currentTarget.style.color = K.grayMuted; }}
          >+ New List</button>
        </div>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>{active?.name}</h1>
          {tasks.length > 0 && (
            <button
              onClick={() => setShowShare("all")}
              style={{ background: "#fff", border: `1px solid ${K.borderDark}`, borderRadius: 20, color: K.black, fontSize: 13, fontWeight: 500, padding: "7px 14px", cursor: "pointer", fontFamily: K.font, transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = K.pinkMuted; e.currentTarget.style.borderColor = K.pink; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = K.borderDark; }}
            >✉ Share list</button>
          )}
        </div>
        <p style={{ color: K.grayMuted, marginBottom: 24, fontSize: 14 }}>
          {tasks.length === 0 ? "No tasks yet — add one below." : `${pending} of ${tasks.length} remaining · drag to prioritize · double-click tab to rename`}
        </p>

        {/* Input */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder={`Add to ${active?.name}...`}
            style={{ flex: 1, padding: "14px 18px", borderRadius: 14, border: `1px solid ${K.borderDark}`, background: "#fff", color: K.black, fontSize: 15, fontFamily: K.font, outline: "none", transition: "border-color 0.2s" }}
            onFocus={(e) => (e.target.style.borderColor = K.pink)}
            onBlur={(e) => (e.target.style.borderColor = K.borderDark)}
          />
          <button
            onClick={addTask}
            style={{ padding: "14px 24px", borderRadius: 14, border: "none", background: K.black, color: K.offWhite, fontWeight: 600, fontSize: 15, fontFamily: K.font, cursor: "pointer", transition: "all 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = K.steel)}
            onMouseLeave={(e) => (e.currentTarget.style.background = K.black)}
          >Add</button>
        </div>

        {/* Tasks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {tasks.map((t, idx) => (
            <div
              key={t.id}
              draggable
              onDragStart={() => onDragStart(idx)}
              onDragEnter={() => onDragEnter(idx)}
              onDragEnd={onDragEnd}
              onDragOver={(e) => e.preventDefault()}
              style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "16px 18px", borderRadius: 14,
                background: dragging === idx ? K.pinkMuted : "#fff",
                border: `1px solid ${dragging === idx ? K.pink : K.border}`,
                transition: "all 0.15s", opacity: t.done ? 0.55 : 1,
              }}
            >
              <div style={{ cursor: "grab", color: K.gray, fontSize: 16, userSelect: "none", padding: "0 2px" }}>≡</div>
              <div
                onClick={() => toggle(t.id)}
                style={{
                  width: 22, height: 22, borderRadius: 22, flexShrink: 0, cursor: "pointer",
                  border: t.done ? "none" : `2px solid ${K.gray}`,
                  background: t.done ? K.pink : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
                }}
              >
                {t.done && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={K.black} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 11, color: K.gray, fontWeight: 600, minWidth: 18, textAlign: "center", fontFamily: "monospace" }}>{idx + 1}</span>
              <span style={{ flex: 1, fontSize: 15, fontWeight: 400, textDecoration: t.done ? "line-through" : "none", color: t.done ? K.grayMuted : K.black, transition: "all 0.2s" }}>{t.text}</span>
              <div
                onClick={() => setShowShare(t.id)}
                style={{ width: 30, height: 30, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: K.gray, fontSize: 14, transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = K.pinkMuted; e.currentTarget.style.color = K.black; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = K.gray; }}
              >✉</div>
              <div
                onClick={() => remove(t.id)}
                style={{ width: 30, height: 30, borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: K.gray, fontSize: 18, transition: "all 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = K.dangerBg; e.currentTarget.style.color = K.danger; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = K.gray; }}
              >×</div>
            </div>
          ))}
        </div>

        {tasks.length > 1 && (
          <p style={{ color: K.gray, fontSize: 12, marginTop: 16, textAlign: "center" }}>Drag tasks by the ≡ handle to set your priority order</p>
        )}
      </div>

      {/* Email modal */}
      {showShare !== null && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(11,5,29,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, backdropFilter: "blur(4px)" }}
          onClick={() => { setShowShare(null); setEmail(""); }}
        >
          <div
            style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", width: "90%", maxWidth: 420, boxShadow: "0 24px 48px rgba(11,5,29,0.15)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4, color: K.black }}>
              {showShare === "all" ? `Share: ${active?.name}` : "Share task"}
            </h2>
            <p style={{ color: K.grayMuted, fontSize: 13, marginBottom: 20 }}>Opens Gmail with the {showShare === "all" ? "full list" : "task"} pre-filled.</p>
            <div style={{ background: K.offWhite, borderRadius: 12, padding: "14px 16px", marginBottom: 18, fontSize: 13, color: K.grayMuted, lineHeight: 1.7, maxHeight: 120, overflow: "auto" }}>
              {showShare === "all"
                ? tasks.map((t, i) => <div key={t.id}>{i + 1}. [{t.done ? "✓" : " "}] {t.text}</div>)
                : (() => { const t = tasks.find((x) => x.id === showShare); return t ? <div>{t.done ? "✓ Done" : "◻ Pending"}: {t.text}</div> : null; })()
              }
            </div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Recipient email address..."
              type="email"
              autoFocus
              style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: `1px solid ${K.borderDark}`, background: K.offWhite, color: K.black, fontSize: 14, fontFamily: K.font, outline: "none", marginBottom: 20, boxSizing: "border-box" }}
              onFocus={(e) => (e.target.style.borderColor = K.pink)}
              onBlur={(e) => (e.target.style.borderColor = K.borderDark)}
            />
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => { setShowShare(null); setEmail(""); }}
                style={{ padding: "12px 20px", borderRadius: 12, border: `1px solid ${K.borderDark}`, background: "transparent", color: K.black, fontSize: 14, fontWeight: 500, fontFamily: K.font, cursor: "pointer" }}
              >Cancel</button>
              <button
                onClick={handleSend}
                disabled={!email.trim()}
                style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: email.trim() ? K.pink : K.border, color: email.trim() ? K.black : K.grayMuted, fontSize: 14, fontWeight: 600, fontFamily: K.font, cursor: email.trim() ? "pointer" : "default", transition: "all 0.15s" }}
              >Open in Gmail ✉</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTracker;
import os

css_path = 'web_app/static/style.css'

pro_max_css = """
/* ========================================================
   PRO MAX UI OVERRIDES (Elegant, Smooth, Native feel)
   ======================================================== */

/* Smooth global scrolling */
html {
  scroll-behavior: smooth;
}

/* Elegant Cards */
.card {
  background: var(--card-bg) !important;
  backdrop-filter: blur(24px) saturate(1.5) !important;
  -webkit-backdrop-filter: blur(24px) saturate(1.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0.05), 
              0 1px 2px rgba(0, 0, 0, 0.02) !important;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), 
              box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
  transform: translateZ(0); /* Hardware acceleration */
}

body.dark .card {
  border: 1px solid rgba(255, 255, 255, 0.04) !important;
  box-shadow: 0 8px 32px -8px rgba(0, 0, 0, 0.3), 
              0 1px 2px rgba(0, 0, 0, 0.2) !important;
}

.card:hover {
  transform: translateY(-3px) scale(1.005) !important;
  box-shadow: 0 12px 36px -12px rgba(0, 0, 0, 0.12), 
              0 4px 8px -4px rgba(0, 0, 0, 0.04) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

body.dark .card:hover {
  box-shadow: 0 12px 40px -10px rgba(0, 0, 0, 0.5), 
              inset 0 1px 0 0 rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* Ultra-smooth Buttons */
.btn-primary, .btn-secondary, button {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
  transform: translateZ(0);
}
.btn-primary:active, .btn-secondary:active, button:active {
  transform: scale(0.96) !important;
}

/* Elegant Table Rows */
.cm-table tbody tr, table.history-table tbody tr {
  transition: background-color 0.3s ease, transform 0.3s ease !important;
}
.cm-table tbody tr:hover, table.history-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.02) !important;
  transform: translateX(4px) !important; /* Slight nudge */
}
body.dark .cm-table tbody tr:hover, body.dark table.history-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.03) !important;
}

/* Minimalist Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  transition: background 0.3s ease;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.25);
}
body.dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
}
body.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}

/* Inputs & Textareas */
textarea, input[type="text"], input[type="number"] {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
textarea:focus, input[type="text"]:focus, input[type="number"]:focus {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05), 0 0 0 2px var(--gray-200) !important;
}
body.dark textarea:focus, body.dark input[type="text"]:focus, body.dark input[type="number"]:focus {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 0 0 2px var(--gray-600) !important;
}

/* Tab animations */
.tab-btn {
  position: relative;
  overflow: hidden;
}
.tab-btn::after {
  content: '';
  position: absolute;
  bottom: 0; left: 50%;
  width: 0; height: 2px;
  background: var(--primary);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  transform: translateX(-50%);
}
.tab-btn.active::after {
  width: 100%;
}
"""

with open(css_path, 'a', encoding='utf-8') as f:
    f.write(pro_max_css)

print("Pro Max CSS added successfully.")

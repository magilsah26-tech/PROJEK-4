// ============================================================
//   TASKFLOW — To Do List App
//   script.js
// ============================================================

// ===== DATA & STATE =====
let tasks = JSON.parse(localStorage.getItem('taskflow_tasks') || '[]');
let selectedPriority = 'low';

// ===== PROFILE =====
const PROFILE = {
  name: 'Hanya Rindu',
  role: 'Staff Operasional'
};

document.getElementById('profileName').textContent = PROFILE.name;
document.getElementById('profileRole').textContent = PROFILE.role;

const initials = PROFILE.name
  .split(' ')
  .map(word => word[0])
  .join('')
  .slice(0, 2)
  .toUpperCase();

document.getElementById('avatarInitial').textContent = initials;

// ===== TIME =====
function updateTime() {
  const now    = new Date();
  const days   = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  document.getElementById('currentDay').textContent  = days[now.getDay()];
  document.getElementById('currentDate').textContent =
    `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

updateTime();
setInterval(updateTime, 60000);

// ===== PRIORITY BUTTONS =====
document.querySelectorAll('.priority-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedPriority = btn.dataset.priority;
  });
});

// ===== SIMPAN KE LOCAL STORAGE =====
function save() {
  localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}

// ===== TOAST NOTIFIKASI =====
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}

// ===== TAMBAH TUGAS =====
function addTask() {
  const input = document.getElementById('taskInput');
  const text  = input.value.trim();

  if (!text) {
    showToast('⚠️ Tulis tugasnya dulu ya!');
    return;
  }

  const now  = new Date();
  const task = {
    id:        Date.now(),
    text:      text,
    priority:  selectedPriority,
    done:      false,
    createdAt: now.toISOString(),
    dateLabel: formatDate(now)
  };

  tasks.unshift(task);
  save();

  input.value = '';
  render();
  showToast('✅ Tugas berhasil ditambahkan!');
}

// Ctrl + Enter untuk submit
document.getElementById('taskInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && e.ctrlKey) {
    addTask();
  }
});

// ===== CENTANG / BATAL CENTANG =====
function toggleDone(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.done = !task.done;
  save();
  render();
}

// ===== HAPUS SATU TUGAS =====
function deleteOne(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
  showToast('🗑️ Tugas dihapus.');
}

// ===== HAPUS SEMUA TUGAS =====
function deleteAll() {
  if (!tasks.length) {
    showToast('Tidak ada tugas untuk dihapus.');
    return;
  }

  const konfirmasi = confirm('Hapus semua tugas? Tindakan ini tidak bisa dibatalkan.');
  if (!konfirmasi) return;

  tasks = [];
  save();
  render();
  showToast('🗑️ Semua tugas dihapus.');
}

// ===== FORMAT TANGGAL =====
function formatDate(d) {
  const days   = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const jam    = String(d.getHours()).padStart(2, '0');
  const menit  = String(d.getMinutes()).padStart(2, '0');

  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} — ${jam}.${menit}`;
}

// ===== CEK OVERDUE =====
function isOverdue(task) {
  if (task.done) return false;

  const created  = new Date(task.createdAt);
  const deadline = new Date(created);
  deadline.setDate(deadline.getDate() + 1); // overdue jika lebih dari 1 hari

  return new Date() > deadline;
}

// ===== ESCAPE HTML (keamanan) =====
function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ===== TEMPLATE HTML TASK ITEM =====
function taskItemHTML(task, inOverdue = false) {
  const priorityTag = `<span class="priority-tag ${task.priority}">${task.priority}</span>`;
  const overdueTag  = inOverdue
    ? '<span class="priority-tag" style="background:#EDE9FE;color:#7C3AED;">⏰ Terlambat</span>'
    : '';

  return `
    <div class="task-item ${task.done ? 'done-item' : ''}" id="task-${task.id}">

      <div class="task-checkbox ${task.done ? 'checked' : ''}"
           onclick="toggleDone(${task.id})"
           title="Centang jika selesai">
        <svg viewBox="0 0 24 24" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <div class="task-body">
        <div class="task-text ${task.done ? 'strikethrough' : ''}">
          ${escHtml(task.text)}
        </div>
        <div class="task-meta">
          ${priorityTag}
          <span class="task-date">${task.dateLabel}</span>
          ${overdueTag}
        </div>
      </div>

      <button class="btn-delete-task" onclick="deleteOne(${task.id})" title="Hapus tugas ini">
        <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

    </div>
  `;
}

// ===== TEMPLATE HTML DONE ITEM =====
function doneItemHTML(task) {
  return `
    <div class="done-task">
      <div class="done-check-icon">
        <svg viewBox="0 0 24 24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <span class="done-task-text">${escHtml(task.text)}</span>
      <span class="priority-tag ${task.priority}">${task.priority}</span>
      <button class="btn-delete-task" onclick="deleteOne(${task.id})" title="Hapus tugas ini">
        <svg viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  `;
}

// ===== RENDER / TAMPILKAN SEMUA =====
function render() {
  const todoList    = document.getElementById('todoList');
  const doneList    = document.getElementById('doneList');
  const overdueList = document.getElementById('overdueList');

  // Pisahkan task berdasarkan statusnya
  const active  = tasks.filter(t => !t.done && !isOverdue(t));
  const done    = tasks.filter(t => t.done);
  const overdue = tasks.filter(t => isOverdue(t));

  // --- TAMPILKAN TO DO ---
  if (active.length === 0) {
    todoList.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3"/>
          <path d="M8 12h8M8 8h8M8 16h5"/>
        </svg>
        <p>Semua tugas selesai! 🎉</p>
      </div>`;
  } else {
    todoList.innerHTML = active.map(t => taskItemHTML(t)).join('');
  }

  // --- TAMPILKAN OVERDUE ---
  const overdueSection = document.getElementById('overdueSection');
  if (overdue.length > 0) {
    overdueSection.style.display = '';
    overdueList.innerHTML = overdue.map(t => taskItemHTML(t, true)).join('');
    document.getElementById('overdueCount').textContent = overdue.length;
  } else {
    overdueSection.style.display = 'none';
  }

  // --- TAMPILKAN DONE ---
  const doneSection = document.getElementById('doneSection');
  if (done.length > 0) {
    doneSection.style.display = '';
    doneList.innerHTML = done.map(t => doneItemHTML(t)).join('');
    document.getElementById('doneCount').textContent = done.length;
  } else {
    doneSection.style.display = 'none';
  }

  // --- UPDATE BADGE ---
  document.getElementById('todoCount').textContent  = active.length;
  document.getElementById('totalBadge').textContent = `${tasks.length} tugas`;
}

// ===== INISIALISASI =====
render();

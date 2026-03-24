
'use strict';

let state = {
  user: null, // name , area
  currentPage: 'home',
  posts: [],
  editingPostId: null,
  userActions: { reports: 0, votes: 0, events: 0, supported: 0 },
  streak: 0,
  badges: [],
  filter: 'all',
  profileChart: null,
  activityChart: null,
  homeCharts: {},
};

const SEED_POSTS = [
  {
    id: 1, type: 'issue', user: 'James Mwangi', area: 'Kibera',
    title: 'Flooded Road — Mathare North Rd', date: 'Today, 8:15am',
    desc: 'The road leading to Mathare Primary School has been flooded for 3 days after heavy rains. Children cannot access school safely. Urgent repair needed from county roads department.',
    supports: 47, joins: 0, supported: false, joined: false,
  },
  {
    id: 2, type: 'voting', user: 'Nairobi IEBC Office', area: 'Westlands',
    title: 'Ward Representative By-Election — 29 March', date: 'Sat 29 Mar, 7am–5pm',
    desc: 'All registered voters in Westlands sub-county are reminded to bring your national ID. Polling stations open 7am–5pm. Know your polling station at iebc.or.ke.',
    supports: 120, joins: 89, supported: false, joined: false,
  },
  {
    id: 3, type: 'food', user: 'Feeding Nairobi Foundation', area: 'Mathare',
    title: 'Free Maize Flour Distribution — Mathare 4A', date: 'Tomorrow, 9am–2pm',
    desc: 'Join us at Mathare 4A Community Hall for free food distribution. 500 families will receive 10kg maize flour + cooking oil. Bring ID. Sponsored by Safaricom Foundation.',
    supports: 203, joins: 156, supported: false, joined: false,
  },
  {
    id: 4, type: 'event', user: 'Nairobi Green Initiative', area: 'Uhuru Park',
    title: 'City Clean-Up & Tree Planting Day', date: 'Sun 30 Mar, 7am',
    desc: '500 trees to be planted around Uhuru Park and Central Business District. Bring gloves and water. Free breakfast for all participants. #GreenNairobi2025',
    supports: 88, joins: 64, supported: false, joined: false,
  },
  {
    id: 5, type: 'health', user: 'Aga Khan Health Services', area: 'Eastleigh',
    title: 'Free Cervical Cancer Screening — Eastleigh', date: 'Fri 28 Mar, 8am–4pm',
    desc: 'Free cervical cancer screening at Eastleigh Health Centre. Women aged 25–65 welcome. No appointment needed. Bring NHIF card if available. Subsidized by Ministry of Health.',
    supports: 76, joins: 42, supported: false, joined: false,
  },
  {
    id: 6, type: 'issue', user: 'Residents of South B', area: 'South B',
    title: 'Water Shortage — 6 Days Without Supply', date: '2 days ago',
    desc: 'South B Estate has not had pipe water for 6 days. Nairobi Water Company has not responded to calls. Residents are buying expensive jerricans daily. County intervention needed.',
    supports: 312, joins: 0, supported: false, joined: false,
  },
  {
    id: 7, type: 'event', user: 'Kenyatta University Alumni', area: 'Kasarani',
    title: 'Youth Skills Boot Camp — IT & Entrepreneurship', date: 'Apr 5–7, 8am',
    desc: 'Free 3-day skills training for youth aged 18–30. Topics: Digital Marketing, Mobile Money Business, Basic Coding & CV Writing. Registration via WhatsApp 0700-RADAA.',
    supports: 134, joins: 97, supported: false, joined: false,
  },
  {
    id: 8, type: 'voting', user: 'IEBC Civic Ed Team', area: 'Kayole',
    title: 'Voter Registration Drive — Kayole Ward', date: 'Sat 5 Apr, 9am–5pm',
    desc: 'Not yet registered? IEBC teams will be at Kayole Market from 9am. Register and update your details. All Kenyan citizens 18+ with valid ID are eligible.',
    supports: 58, joins: 0, supported: false, joined: false,
  },
];

const NGO_DATA = [
  { icon: '🍱', name: 'Feeding Nairobi Foundation', desc: 'Monthly food distribution to 5,000+ families across informal settlements.', area: 'Mathare, Kibera', beneficiaries: '5,200', programs: 3, status: 'Active' },
  { icon: '📚', name: 'Ujuzi Digital Africa', desc: 'Digital literacy and tech skills training for out-of-school youth.', area: 'Eastleigh, Makadara', beneficiaries: '1,800', programs: 5, status: 'Active' },
  { icon: '🏥', name: 'Afya Bora Community Health', desc: 'Free mobile clinics, maternal health and HIV testing services.', area: 'Korogocho, Huruma', beneficiaries: '3,400', programs: 8, status: 'Active' },
  { icon: '🌱', name: 'Nairobi Green Initiative', desc: 'Urban tree planting, waste management and climate action programs.', area: 'City-Wide', beneficiaries: '12,000', programs: 4, status: 'Active' },
  { icon: '👩‍💼', name: 'Mama Na Biashara', desc: 'Microloan and business mentorship for women entrepreneurs.', area: 'Gikomba, Ngara', beneficiaries: '920', programs: 2, status: 'Recruiting' },
  { icon: '🏘️', name: 'Safe Shelter Initiative', desc: 'Emergency housing and legal aid for displaced families.', area: 'Mukuru, Kayole', beneficiaries: '640', programs: 6, status: 'Active' },
];

const BADGES_DEF = [
  { emoji: '🌱', name: 'Civic Seed', req: 1, desc: 'First action taken' },
  { emoji: '🗳️', name: 'Voter', req: 1, desc: 'Engaged with voting' },
  { emoji: '🚨', name: 'Watchdog', req: 2, desc: 'Reported 2 issues' },
  { emoji: '🤝', name: 'Helper', req: 3, desc: 'Supported 3 posts' },
  { emoji: '🔥', name: 'Streaker', req: 7, desc: '7-day streak' },
  { emoji: '🏆', name: 'Champion', req: 15, desc: '15 total actions' },
  { emoji: '🦁', name: 'Simba', req: 30, desc: '30 total actions' },
  { emoji: '🇰🇪', name: 'Mwananchi', req: 50, desc: '50 actions — Legend!' },
  { emoji: '⭐', name: 'Rising Star', req: 5, desc: 'Great start' },
];

const ALERTS = [
  { color: 'red', text: 'Water disruption reported in South C — 3hrs ago' },
  { color: 'gold', text: 'By-election reminder: Westlands, 29 March' },
  { color: 'green', text: 'Food aid confirmed at Mathare 4A — Tomorrow' },
  { color: 'red', text: 'Road closure: Jogoo Road (Mon–Fri)' },
  { color: 'green', text: 'Clean-up event: Uhuru Park — 30 March 7am' },
];

const TOP_AREAS = [
  { name: 'Kibera', pct: 85 },
  { name: 'Mathare', pct: 72 },
  { name: 'Westlands', pct: 65 },
  { name: 'Eastleigh', pct: 58 },
  { name: 'Kasarani', pct: 44 },
];

// =============================================
// LOGIN / LOGOUT
// =============================================
function selectRole(role) {
  state.selectedRole = role;
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('role' + role).classList.add('selected');
}

function doLogin() {
  const name = document.getElementById('loginName').value.trim();
  const area = document.getElementById('loginArea').value.trim();
  if (!name) { showToast('Please enter your name', 'error'); return; }
  if (!state.selectedRole) { showToast('Please select a role', 'error'); return; }

  state.user = {
    name,
    area: area || 'Nairobi',
    role: state.selectedRole,
    bio: '',
    joined: new Date().toLocaleDateString('en-KE', { month: 'long', year: 'numeric' }),
  };

  // Simulate some existing activity
  state.posts = JSON.parse(JSON.stringify(SEED_POSTS));
  state.userActions = { reports: 2, votes: 1, events: 3, supported: 4 };
  state.streak = 5;

  document.getElementById('loginScreen').classList.remove('active');
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  document.getElementById('app').classList.add('active');

  document.getElementById('navName').textContent = name.split(' ')[0];
  document.getElementById('navAvatar').textContent = name[0].toUpperCase();
  document.getElementById('navAreaBadge').textContent = state.user.area;

  if (state.user.role === 'ngo') {
    document.querySelectorAll('.ngo-only').forEach(el => el.classList.remove('hidden'));
  }

  initApp();
  showPage('home');
  showToast(`Karibu, ${name.split(' ')[0]}! 🇰🇪`, 'success');
}

function doLogout() {
  destroyCharts();
  state = {
    user: null, currentPage: 'home', posts: [], editingPostId: null,
    userActions: { reports: 0, votes: 0, events: 0, supported: 0 },
    streak: 0, badges: [], filter: 'all',
    profileChart: null, activityChart: null, homeCharts: {},
    selectedRole: null,
  };
  document.getElementById('app').classList.add('hidden');
  document.getElementById('app').classList.remove('active');
  document.getElementById('loginScreen').classList.add('active');
  document.getElementById('loginScreen').classList.remove('hidden');
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('loginName').value = '';
  document.getElementById('loginArea').value = '';
}

// =============================================
// APP INIT
// =============================================
function initApp() {
  renderHeroLive();
  renderTrending();
  animateStats();
  renderHomeCharts();
  renderFeed();
  renderSidebar();
  renderDashboard();
  renderProfile();
  renderNGO();
}

// =============================================
// PAGE NAVIGATION
// =============================================
function showPage(page) {
  state.currentPage = page;
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.classList.add('hidden');
  });
  const el = document.getElementById(page + 'Page');
  if (el) { el.classList.remove('hidden'); el.classList.add('active'); }

  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(l => {
    if (l.getAttribute('onclick') && l.getAttribute('onclick').includes(`'${page}'`)) {
      l.classList.add('active');
    }
  });

  // Lazy-render charts per page
  if (page === 'dashboard') { setTimeout(renderDashboardCharts, 100); }
  if (page === 'profile') { setTimeout(renderProfileCharts, 100); }
}

// =============================================
// HERO LIVE ITEMS
// =============================================
const LIVE_ITEMS = [
  { icon: '🚨', color: 'red', title: 'Pothole reported', loc: 'Jogoo Rd · 2min ago' },
  { icon: '🗳️', color: 'gold', title: 'Voter reg reminder', loc: 'Westlands · 5min ago' },
  { icon: '🍱', color: 'green', title: 'Food aid confirmed', loc: 'Mathare 4A · 12min ago' },
  { icon: '🌱', color: 'blue', title: 'Clean-up crew forming', loc: 'Uhuru Park · 18min ago' },
  { icon: '🏥', color: 'green', title: 'Free screening today', loc: 'Eastleigh · 30min ago' },
];
function renderHeroLive() {
  const c = document.getElementById('heroLiveItems');
  if (!c) return;
  c.innerHTML = LIVE_ITEMS.map(i => `
    <div class="hmc-item">
      <div class="hmc-icon ${i.color}">${i.icon}</div>
      <div class="hmc-text">
        <strong>${i.title}</strong>
        <span>📍 ${i.loc}</span>
      </div>
    </div>
  `).join('');
}

// =============================================
// TRENDING GRID
// =============================================
function renderTrending() {
  const c = document.getElementById('trendingGrid');
  if (!c) return;
  const items = state.posts.slice(0, 6);
  c.innerHTML = items.map(p => buildCard(p, 'trending')).join('');
}

function buildCard(p, mode = 'feed') {
  const typeLabels = { issue:'Issue', voting:'Voting', food:'Food Aid', event:'Event', health:'Health' };
  const id = p.id;

  if (mode === 'trending') {
    return `
      <div class="trending-card type-${p.type}" id="tc-${id}">
        <div class="tc-header">
          <span class="tc-type-badge">${typeLabels[p.type] || p.type}</span>
          <span class="tc-area">📍 ${p.area}</span>
        </div>
        <div class="tc-title">${p.title}</div>
        <div class="tc-desc">${p.desc.substring(0, 100)}...</div>
        <div class="tc-footer">
          <div class="tc-actions">
            <button class="tc-btn ${p.supported ? 'active':''}" onclick="toggleSupport(${id})">
              ❤️ ${p.supports}
            </button>
            ${p.type !== 'issue' ? `<button class="tc-btn ${p.joined?'active':''}" onclick="toggleJoin(${id})">✔ Join</button>` : ''}
          </div>
          <span class="tc-meta">${p.date}</span>
        </div>
      </div>`;
  }

  return `
    <div class="feed-card type-${p.type}" id="fc-${id}" data-type="${p.type}">
      <div class="fc-header">
        <div class="fc-user">
          <div class="fc-avatar">${p.user[0]}</div>
          <div class="fc-user-info">
            <strong>${p.user}</strong>
            <span>📍 ${p.area} · ${p.date}</span>
          </div>
        </div>
        <div class="fc-controls">
          ${isOwner(p) ? `
            <button class="tc-btn btn-sm" onclick="openEditModal(${id})">✏️</button>
            <button class="tc-btn btn-sm delete" onclick="deletePost(${id})">🗑️</button>
          ` : ''}
        </div>
      </div>
      <div class="fc-title">${p.title}</div>
      <div class="fc-desc">${p.desc}</div>
      <div class="fc-footer">
        <div class="fc-tags">
          <span class="fc-tag">${typeLabels[p.type]}</span>
          <span class="fc-tag">📍 ${p.area}</span>
        </div>
        <div class="fc-actions">
          <button class="fc-action-btn ${p.supported ? 'supported':''}" onclick="toggleSupport(${id})">
            ❤️ <span id="sup-${id}">${p.supports}</span>
          </button>
          ${p.type !== 'issue' ? `
            <button class="fc-action-btn ${p.joined?'active':''}" onclick="toggleJoin(${id})" id="join-btn-${id}">
              ${p.joined ? '✅ Joined' : '+ Join'}
            </button>
          ` : ''}
        </div>
      </div>
    </div>`;
}

function isOwner(p) {
  if (!state.user) return false;
  return p.user === state.user.name || state.user.role === 'ngo';
}

// =============================================
// FEED
// =============================================
function renderFeed() {
  const c = document.getElementById('feedContainer');
  if (!c) return;
  const filtered = state.filter === 'all'
    ? state.posts
    : state.posts.filter(p => p.type === state.filter);
  if (filtered.length === 0) {
    c.innerHTML = `<div style="text-align:center;padding:60px;color:var(--text-muted)">No posts in this category yet. Be the first to post!</div>`;
    return;
  }
  c.innerHTML = filtered.map(p => buildCard(p, 'feed')).join('');
}

function filterFeed(type, btn) {
  state.filter = type;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFeed();
}

// =============================================
// SIDEBAR
// =============================================
function renderSidebar() {
  const al = document.getElementById('alertsList');
  if (al) {
    al.innerHTML = ALERTS.map(a => `
      <div class="alert-item">
        <span class="alert-dot ${a.color}"></span>
        <span>${a.text}</span>
      </div>`).join('');
  }
  const ta = document.getElementById('topAreas');
  if (ta) {
    ta.innerHTML = TOP_AREAS.map(a => `
      <div class="area-item">
        <div>
          <div style="font-weight:600;font-size:0.85rem">${a.name}</div>
          <div class="area-bar" style="width:${a.pct}%;max-width:120px;margin-top:4px"></div>
        </div>
        <span style="color:var(--accent-green);font-weight:700;font-size:0.82rem">${a.pct}%</span>
      </div>`).join('');
  }
}

// =============================================
// SUPPORT / JOIN ACTIONS
// =============================================
function toggleSupport(id) {
  const post = state.posts.find(p => p.id === id);
  if (!post) return;
  post.supported = !post.supported;
  post.supports += post.supported ? 1 : -1;
  if (post.supported) {
    state.userActions.supported++;
    trackAction('supported', `Supported: ${post.title}`);
    showToast('❤️ Support registered!', 'success');
  }
  refreshPostUI(post);
  updateDashboardNumbers();
}

function toggleJoin(id) {
  const post = state.posts.find(p => p.id === id);
  if (!post) return;
  post.joined = !post.joined;
  post.joins += post.joined ? 1 : -1;
  if (post.joined) {
    state.userActions.events++;
    if (post.type === 'voting') state.userActions.votes++;
    trackAction('joined', `Joined: ${post.title}`);
    showToast(`✅ You joined: ${post.title}`, 'success');
  }
  refreshPostUI(post);
  updateDashboardNumbers();
}

function refreshPostUI(post) {
  // Feed card
  const supEl = document.getElementById(`sup-${post.id}`);
  if (supEl) supEl.textContent = post.supports;
  const fcBtn = document.querySelector(`#fc-${post.id} .fc-action-btn`);
  if (fcBtn) { fcBtn.className = `fc-action-btn ${post.supported ? 'supported' : ''}`; }
  const joinBtn = document.getElementById(`join-btn-${post.id}`);
  if (joinBtn) { joinBtn.textContent = post.joined ? '✅ Joined' : '+ Join'; joinBtn.className = `fc-action-btn ${post.joined ? 'active' : ''}`; }

  // Trending card
  const tcSupBtn = document.querySelector(`#tc-${post.id} .tc-btn`);
  if (tcSupBtn) { tcSupBtn.innerHTML = `❤️ ${post.supports}`; tcSupBtn.className = `tc-btn ${post.supported ? 'active' : ''}`; }
}

// =============================================
// ADD / EDIT / DELETE POST
// =============================================
function openAddModal() {
  state.editingPostId = null;
  document.getElementById('modalTitle').textContent = 'Post Activity';
  document.getElementById('modalSubmit').textContent = 'Post →';
  document.getElementById('modalTitle2').value = '';
  document.getElementById('modalDesc').value = '';
  document.getElementById('modalArea').value = state.user?.area || '';
  document.getElementById('modalDate').value = '';
  document.getElementById('modalType').value = 'issue';
  document.getElementById('modal').classList.remove('hidden');
}

function openEditModal(id) {
  const post = state.posts.find(p => p.id === id);
  if (!post) return;
  state.editingPostId = id;
  document.getElementById('modalTitle').textContent = 'Edit Post';
  document.getElementById('modalSubmit').textContent = 'Save →';
  document.getElementById('modalType').value = post.type;
  document.getElementById('modalTitle2').value = post.title;
  document.getElementById('modalDesc').value = post.desc;
  document.getElementById('modalArea').value = post.area;
  document.getElementById('modalDate').value = post.date;
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  state.editingPostId = null;
}

function submitPost() {
  const type = document.getElementById('modalType').value;
  const title = document.getElementById('modalTitle2').value.trim();
  const desc = document.getElementById('modalDesc').value.trim();
  const area = document.getElementById('modalArea').value.trim();
  const date = document.getElementById('modalDate').value.trim();

  if (!title || !desc) { showToast('Please fill in title and description', 'error'); return; }

  if (state.editingPostId) {
    const post = state.posts.find(p => p.id === state.editingPostId);
    if (post) {
      post.type = type; post.title = title; post.desc = desc;
      post.area = area || state.user.area; post.date = date || 'Just now';
    }
    showToast('✏️ Post updated!', 'success');
  } else {
    const newPost = {
      id: Date.now(), type, user: state.user.name,
      area: area || state.user.area, title, desc,
      date: date || 'Just now', supports: 0, joins: 0,
      supported: false, joined: false,
    };
    state.posts.unshift(newPost);
    if (type === 'issue') {
      state.userActions.reports++;
      trackAction('reported', `Reported: ${title}`);
    } else {
      trackAction('posted', `Posted: ${title}`);
    }
    showToast('🎉 Activity posted!', 'success');
  }

  closeModal();
  renderFeed();
  renderTrending();
  updateDashboardNumbers();
  checkBadges();
}

function deletePost(id) {
  if (!confirm('Delete this post?')) return;
  state.posts = state.posts.filter(p => p.id !== id);
  document.getElementById(`fc-${id}`)?.remove();
  document.getElementById(`tc-${id}`)?.remove();
  showToast('Post deleted.', 'info');
  renderTrending();
}

// =============================================
// ANIMATE STATS (Home)
// =============================================
function animateStats() {
  const targets = {
    statReports: 4280, statVotes: 12840, statEvents: 880, statNGOs: 340,
  };
  Object.entries(targets).forEach(([id, target]) => {
    const el = document.getElementById(id);
    if (!el) return;
    let current = 0;
    const step = Math.ceil(target / 60);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString();
      if (current >= target) clearInterval(timer);
    }, 20);
  });
}

// =============================================
// HOME CHARTS
// =============================================
function renderHomeCharts() {
  const kenyaColors = ['#E8001A', '#00A550', '#C8A84B', '#4096FF', '#F5A623', '#9B59B6'];
  Chart.defaults.color = '#9ea89c';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.07)';

  // Pie — Issue Categories
  const pieCtx = document.getElementById('pieChart');
  if (pieCtx) {
    if (state.homeCharts.pie) state.homeCharts.pie.destroy();
    state.homeCharts.pie = new Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels: ['Infrastructure', 'Water & Sanitation', 'Security', 'Health', 'Environment', 'Education'],
        datasets: [{ data: [32, 21, 15, 14, 10, 8], backgroundColor: kenyaColors, borderWidth: 0, hoverOffset: 6 }],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } } },
        animation: { animateRotate: true, duration: 1200 },
      },
    });
  }

  // Bar — Weekly Engagement
  const barCtx = document.getElementById('barChart');
  if (barCtx) {
    if (state.homeCharts.bar) state.homeCharts.bar.destroy();
    state.homeCharts.bar = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          { label: 'Reports', data: [45, 62, 38, 71, 55, 88, 42], backgroundColor: 'rgba(232,0,26,0.7)', borderRadius: 6 },
          { label: 'Events Joined', data: [28, 35, 52, 40, 60, 95, 30], backgroundColor: 'rgba(0,165,80,0.7)', borderRadius: 6 },
          { label: 'Votes/Awareness', data: [20, 40, 28, 55, 35, 65, 25], backgroundColor: 'rgba(200,168,75,0.7)', borderRadius: 6 },
        ],
      },
      options: {
        responsive: true,
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(255,255,255,0.05)' } },
        },
        plugins: { legend: { position: 'bottom', labels: { padding: 14, font: { size: 11 } } } },
        animation: { duration: 1000 },
      },
    });
  }

  // Doughnut — Area participation
  const dCtx = document.getElementById('doughnutChart');
  if (dCtx) {
    if (state.homeCharts.doughnut) state.homeCharts.doughnut.destroy();
    state.homeCharts.doughnut = new Chart(dCtx, {
      type: 'pie',
      data: {
        labels: ['Kibera', 'Mathare', 'Westlands', 'Eastleigh', 'Kasarani', 'Others'],
        datasets: [{ data: [22, 18, 16, 14, 12, 18], backgroundColor: kenyaColors, borderWidth: 0, hoverOffset: 6 }],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } } },
        animation: { duration: 1200 },
      },
    });
  }
}

// =============================================
// DASHBOARD
// =============================================
function renderDashboard() {
  updateDashboardNumbers();
  renderRecentActions();
  renderStreakCalendar();
  renderBadges();
}

function updateDashboardNumbers() {
  const a = state.userActions;
  const total = a.reports + a.votes + a.events + a.supported;

  const statsHtml = `
    <div class="dash-stat-card" data-icon="🚨">
      <div class="dsc-label">Issues Reported</div>
      <div class="dsc-value red">${a.reports}</div>
      <div class="dsc-change">+${a.reports > 0 ? 1 : 0} this week</div>
    </div>
    <div class="dash-stat-card" data-icon="🗳️">
      <div class="dsc-label">Votes / Awareness</div>
      <div class="dsc-value gold">${a.votes}</div>
      <div class="dsc-change">Active voter</div>
    </div>
    <div class="dash-stat-card" data-icon="🌱">
      <div class="dsc-label">Events Joined</div>
      <div class="dsc-value green">${a.events}</div>
      <div class="dsc-change">Community active</div>
    </div>
    <div class="dash-stat-card" data-icon="❤️">
      <div class="dsc-label">Posts Supported</div>
      <div class="dsc-value blue">${a.supported}</div>
      <div class="dsc-change">Solidarity actions</div>
    </div>`;

  const el = document.getElementById('dashStats');
  if (el) el.innerHTML = statsHtml;

  const streakEl = document.getElementById('dashStreak');
  if (streakEl) streakEl.textContent = `🔥 ${state.streak} Day Streak`;
}

function renderDashboardCharts() {
  const a = state.userActions;
  const ctx = document.getElementById('myActivityChart');
  if (!ctx) return;
  if (state.activityChart) state.activityChart.destroy();

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
  const data = [1, 2, 0, 3, 1, 2, 4].map(v => Math.max(v, Math.floor(Math.random() * 3)));

  state.activityChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: days,
      datasets: [{
        label: 'Actions',
        data,
        borderColor: '#00A550',
        backgroundColor: 'rgba(0,165,80,0.12)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00A550',
        pointRadius: 5,
        pointHoverRadius: 7,
      }],
    },
    options: {
      responsive: true,
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, min: 0, ticks: { stepSize: 1 } },
      },
      plugins: { legend: { display: false } },
      animation: { duration: 1000 },
    },
  });
}

// =============================================
// ACTIONS LOG
// =============================================
const recentActionsLog = [];
function trackAction(type, label) {
  const iconMap = { reported:'🚨', joined:'✅', posted:'📝', supported:'❤️', voted:'🗳️' };
  recentActionsLog.unshift({ icon: iconMap[type] || '⚡', label, time: 'Just now' });
  state.streak = Math.min(state.streak + 1, 99);
  renderRecentActions();
  renderStreakCalendar();
  checkBadges();
  updateProfileStreak();
}

function renderRecentActions() {
  const c = document.getElementById('recentActions');
  if (!c) return;
  const all = [
    ...recentActionsLog,
    { icon: '🚨', label: 'Reported: Flooded Road — Kibera', time: '2 days ago' },
    { icon: '❤️', label: 'Supported: Feeding Nairobi Drive', time: '3 days ago' },
    { icon: '✅', label: 'Joined: Youth Skills Boot Camp', time: '4 days ago' },
    { icon: '🗳️', label: 'Viewed: Voter Registration Drive', time: '5 days ago' },
  ].slice(0, 6);
  c.innerHTML = all.map(a => `
    <div class="action-item">
      <div class="action-icon">${a.icon}</div>
      <div class="action-text">${a.label}</div>
      <div class="action-time">${a.time}</div>
    </div>`).join('');
}

// =============================================
// STREAK CALENDAR
// =============================================
function renderStreakCalendar() {
  const c = document.getElementById('streakCalendar');
  if (!c) return;
  const days = [];
  const today = new Date();
  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const label = d.getDate();
    const isActive = i < state.streak;
    const isToday = i === 0;
    days.push(`<div class="streak-day ${isActive ? 'active' : 'inactive'} ${isToday ? 'today' : ''}" title="${d.toDateString()}">${label}</div>`);
  }
  c.innerHTML = days.join('');
}

// =============================================
// BADGES
// =============================================
function computeBadges() {
  const total = state.userActions.reports + state.userActions.votes + state.userActions.events + state.userActions.supported;
  return BADGES_DEF.map(b => {
    let earned = false;
    if (b.name === 'Voter') earned = state.userActions.votes >= 1;
    else if (b.name === 'Watchdog') earned = state.userActions.reports >= 2;
    else if (b.name === 'Helper') earned = state.userActions.supported >= 3;
    else if (b.name === 'Streaker') earned = state.streak >= 7;
    else earned = total >= b.req;
    return { ...b, earned };
  });
}

function checkBadges() {
  const badges = computeBadges();
  const prev = state.badges.filter(b => b.earned).length;
  state.badges = badges;
  const now = badges.filter(b => b.earned).length;
  if (now > prev) {
    const newBadge = badges.filter(b => b.earned)[now - 1];
    if (newBadge) showToast(`🏅 Badge unlocked: ${newBadge.name}!`, 'success');
  }
  renderBadges();
}

function renderBadges() {
  const badges = computeBadges();
  state.badges = badges;
  const c = document.getElementById('badgesGrid');
  if (!c) return;
  c.innerHTML = badges.map(b => `
    <div class="badge-item ${b.earned ? 'earned' : 'locked'}" title="${b.desc}">
      <span class="badge-emoji">${b.emoji}</span>
      <span class="badge-name">${b.name}</span>
    </div>`).join('');
}

// =============================================
// PROFILE
// =============================================
function renderProfile() {
  if (!state.user) return;
  const u = state.user;
  const init = u.name[0].toUpperCase();

  document.getElementById('profileAvatarBig').textContent = init;
  document.getElementById('profileName').textContent = u.name;
  document.getElementById('profileRole').innerHTML = `${u.role === 'ngo' ? 'NGO / Organisation' : 'Citizen'} · <span id="profileArea">${u.area}</span>`;

  renderProfileBadges();
  renderImpactStats();
  updateProfileStreak();
  updateCongrats();
}

function renderProfileBadges() {
  const earned = computeBadges().filter(b => b.earned).slice(0, 4);
  const c = document.getElementById('profileBadgesRow');
  if (!c) return;
  c.innerHTML = earned.map(b => `<span class="profile-badge-chip">${b.emoji} ${b.name}</span>`).join('');
}

function renderImpactStats() {
  const a = state.userActions;
  const total = a.reports + a.votes + a.events + a.supported;
  const c = document.getElementById('impactStats');
  if (!c) return;
  const items = [
    { label: 'Issues Reported', val: a.reports, pct: Math.min(a.reports * 10, 100), color: '#E8001A' },
    { label: 'Events Joined', val: a.events, pct: Math.min(a.events * 10, 100), color: '#00A550' },
    { label: 'Posts Supported', val: a.supported, pct: Math.min(a.supported * 10, 100), color: '#C8A84B' },
    { label: 'Total Actions', val: total, pct: Math.min(total * 2, 100), color: '#4096FF' },
  ];
  c.innerHTML = items.map(i => `
    <div>
      <div class="is-row">
        <span class="is-label">${i.label}</span>
        <span class="is-val" style="color:${i.color}">${i.val}</span>
      </div>
      <div class="is-bar-wrap"><div class="is-bar" style="width:${i.pct}%;background:${i.color}"></div></div>
    </div>`).join('');
}

function updateProfileStreak() {
  const el = document.getElementById('streakNumber');
  if (el) el.textContent = state.streak;
  const msg = document.getElementById('streakMessage');
  if (msg) {
    const messages = [
      `Keep going, ${state.user?.name?.split(' ')[0] || 'citizen'}! You're making a difference.`,
      `Nairobi is better because of you! 🇰🇪`,
      `${state.streak} days of civic action — inspiring!`,
      `Harambee! Your community sees your effort.`,
    ];
    msg.textContent = messages[Math.floor(state.streak / 2) % messages.length];
  }
  const prog = document.getElementById('streakProgressBar');
  if (prog) prog.style.setProperty('--progress', `${Math.min((state.streak / 30) * 100, 100)}%`);
}

function updateCongrats() {
  const total = Object.values(state.userActions).reduce((a, b) => a + b, 0);
  const levels = [
    { min: 0, icon: '🌱', title: 'Getting Started', desc: 'Complete 5 actions to unlock your first badge!' },
    { min: 5, icon: '⭐', title: 'Rising Star', desc: 'You\'re gaining momentum — Nairobi notices!' },
    { min: 15, icon: '🔥', title: 'Civic Activist', desc: 'Excellent! Your voice is shaping the community.' },
    { min: 30, icon: '🦁', title: 'Simba wa Mtaa', desc: 'Community champion! You inspire others to act.' },
    { min: 50, icon: '🇰🇪', title: 'Mwananchi wa Mwaka!', desc: 'Legend status! You embody Harambee spirit.' },
  ];
  const lvl = [...levels].reverse().find(l => total >= l.min) || levels[0];
  const lb = document.getElementById('levelBadge');
  const lt = document.getElementById('levelTitle');
  const ld = document.getElementById('levelDesc');
  if (lb) lb.textContent = lvl.icon;
  if (lt) lt.textContent = lvl.title;
  if (ld) ld.textContent = lvl.desc;
}

function renderProfileCharts() {
  const a = state.userActions;
  const ctx = document.getElementById('profilePie');
  if (!ctx) return;
  if (state.profileChart) state.profileChart.destroy();
  state.profileChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Reported', 'Joined', 'Supported', 'Voted'],
      datasets: [{
        data: [a.reports || 1, a.events || 1, a.supported || 1, a.votes || 1],
        backgroundColor: ['#E8001A', '#00A550', '#C8A84B', '#4096FF'],
        borderWidth: 0,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } } },
      animation: { duration: 1000 },
    },
  });
}

// =============================================
// EDIT PROFILE
// =============================================
function openEditProfile() {
  document.getElementById('editName').value = state.user.name;
  document.getElementById('editArea').value = state.user.area;
  document.getElementById('editBio').value = state.user.bio || '';
  document.getElementById('editProfileModal').classList.remove('hidden');
}

function closeEditProfile() {
  document.getElementById('editProfileModal').classList.add('hidden');
}

function saveProfile() {
  const name = document.getElementById('editName').value.trim();
  const area = document.getElementById('editArea').value.trim();
  const bio = document.getElementById('editBio').value.trim();
  if (!name) { showToast('Name cannot be empty', 'error'); return; }
  state.user.name = name;
  state.user.area = area || state.user.area;
  state.user.bio = bio;
  document.getElementById('navName').textContent = name.split(' ')[0];
  document.getElementById('navAvatar').textContent = name[0].toUpperCase();
  document.getElementById('navAreaBadge').textContent = area || state.user.area;
  renderProfile();
  closeEditProfile();
  showToast('Profile updated! ✅', 'success');
}

// =============================================
// NGO HUB
// =============================================
function renderNGO() {
  const c = document.getElementById('ngoGrid');
  if (!c) return;
  c.innerHTML = NGO_DATA.map((n, i) => `
    <div class="ngo-card">
      <div class="ngo-card-header">
        <div class="ngo-icon">${n.icon}</div>
        <span class="ngo-status">${n.status}</span>
      </div>
      <div class="ngo-name">${n.name}</div>
      <div class="ngo-desc">${n.desc}</div>
      <div class="ngo-meta">
        <span>📍 ${n.area}</span>
        <span>👥 ${n.beneficiaries} beneficiaries</span>
        <span>📋 ${n.programs} programs</span>
      </div>
      <div class="ngo-footer">
        <button class="btn-primary btn-sm" onclick="joinNGO(${i})">Support</button>
        <button class="btn-outline btn-sm">Learn More</button>
      </div>
    </div>`).join('');
}

function joinNGO(i) {
  state.userActions.events++;
  trackAction('joined', `Supported NGO: ${NGO_DATA[i].name}`);
  showToast(`🤝 You're now supporting ${NGO_DATA[i].name}!`, 'success');
  updateDashboardNumbers();
}

// =============================================
// TOAST
// =============================================
function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = `toast ${type}`;
  setTimeout(() => { t.classList.add('hidden'); }, 3500);
}

// =============================================
// CHART CLEANUP
// =============================================
function destroyCharts() {
  if (state.profileChart) { state.profileChart.destroy(); state.profileChart = null; }
  if (state.activityChart) { state.activityChart.destroy(); state.activityChart = null; }
  Object.values(state.homeCharts).forEach(c => { if (c) c.destroy(); });
  state.homeCharts = {};
}

// =============================================
// AUTO-REFRESH LIVE FEED (simulated)
// =============================================
const LIVE_FEED_UPDATES = [
  { type: 'issue', user: 'Nairobi Resident', area: 'Dandora', title: 'Street lights out — Outer Ring Rd', desc: 'Multiple street lights have been off for 2 weeks along Outer Ring Road near Dandora Phase 4. Safety concern for residents at night.', date: 'Just now', supports: 0, joins: 0, supported: false, joined: false },
  { type: 'food', user: 'Al-Nour Foundation', area: 'Eastleigh', title: 'Ramadan Food Packages Available', desc: 'Free Ramadan food packages for 200 families. Dry foods, cooking oil and dates. First come first served from 10am at Al-Nour mosque.', date: 'Just now', supports: 0, joins: 0, supported: false, joined: false },
];
let liveIndex = 0;
function startLiveFeed() {
  setInterval(() => {
    if (!state.user || !state.posts) return;
    const item = LIVE_FEED_UPDATES[liveIndex % LIVE_FEED_UPDATES.length];
    const newPost = { ...item, id: Date.now() + liveIndex };
    state.posts.unshift(newPost);
    if (state.currentPage === 'feed') {
      const fc = document.getElementById('feedContainer');
      if (fc && (state.filter === 'all' || state.filter === newPost.type)) {
        const div = document.createElement('div');
        div.innerHTML = buildCard(newPost, 'feed');
        fc.insertBefore(div.firstChild, fc.firstChild);
      }
    }
    liveIndex++;
    updateHeroLive(newPost);
  }, 30000); // every 30s
}

function updateHeroLive(post) {
  const iconMap = { issue:'🚨', voting:'🗳️', food:'🍱', event:'🌱', health:'🏥' };
  LIVE_ITEMS.unshift({ icon: iconMap[post.type]||'📌', color: 'green', title: post.title.substring(0,30), loc: `${post.area} · Just now` });
  LIVE_ITEMS.pop();
  renderHeroLive();
}

// =============================================
// KEYBOARD SHORTCUT
// =============================================
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal();
    closeEditProfile();
  }
});

// =============================================
// CLOSE MODAL ON OVERLAY CLICK
// =============================================
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.getElementById('editProfileModal').addEventListener('click', function(e) {
  if (e.target === this) closeEditProfile();
});

// =============================================
// START
// =============================================
startLiveFeed();
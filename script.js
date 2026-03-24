let state = {
  user: null,              // Who is logged in
  selectedRole: null,      // citizen or NGO
  currentPage: 'home',     // Page is showing
  posts: [],               //  activity posts
  editingPostId: null,     // shows if post is edited
  filter: 'all',           //  feed filter thingy

  // actions by user 
  userActions: {
    reports: 0,    // How many issues the user reported
    votes: 0,      // Voting events engaged
    events: 0,     // Events joined
    supported: 0,  // Posts liked or and supported
  },

  streak: 0,          // How many days in a row the user active
  totalActions: 0,    //  total of actions done
  actionLog: [],      //  what yo did shown in dashboard
  activeDays: new Set(), // Set of Y/M/D did something

  charts: {
    homePie: null,
    homeBar: null,
    homeDoughnut: null,
    dashActivity: null,
    profilePie: null,
  } ,

  _lastBadgeCount: 0, //  Shows a new badge is earned
};

const STORAGE_KEY = 'RADAA_save' ;
function saveToStorage() {
   try{
      var snapshot = {
      user:            state.user, 
      posts:           state.posts,
      userActions:     state.userActions,
      totalActions:    state.totalActions,
      streak:          state.streak,
      activeDays:      Array.from(state.activeDays),
       actionLog:       state.actionLog,
      _lastBadgeCount: state._lastBadgeCount,
    };
  }
}; 

function loadFromStorage() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false; // Nothing saved yet —


    if (saved.user)         state.user         = saved.user;
    if (saved.posts)        state.posts        = saved.posts;
    if (saved.userActions)  state.userActions  = saved.userActions;
    if (typeof saved.totalActions === 'number') state.totalActions = saved.totalActions;
    if (typeof saved.streak === 'number')       state.streak       = saved.streak;
    if (saved._lastBadgeCount !== undefined)    state._lastBadgeCount = saved._lastBadgeCount;
    if (saved.actionLog)    state.actionLog    = saved.actionLog;

    // Convert the saved Array back into a Set 
    if (Array.isArray(saved.activeDays)) {
      state.activeDays = new Set(saved.activeDays);
    }

    return true; // Successfully loaded
  } catch (err) {
    // If the saved data is corrupted start fresh
    console.warn('RADAA: Could not load from localStorage — starting fresh:', err.message);
    localStorage.removeItem(STORAGE_KEY); // Clear the corrupted data
    return false;
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('RADAA: Could not clear localStorage:', err.message);
  }
}

function autoSave() {
  saveToStorage();
}

const SEED_POSTS = [
  {
    id: 101, type: 'issue',
    user: 'James Mwangi', area: 'Kibera',
    title: 'Flooded Road Blocks School Access — Mathare North Rd',
    desc: 'The road leading to Mathare Primary School has been flooded for 3 days after heavy rains. Children cannot access school safely. County roads department urgently needed.',
    date: 'Today, 8:15am', supports: 47, joins: 0,
    supported: false, joined: false, isOwn: false,
  },
  {
    id: 102, type: 'voting',
    user: 'Nairobi IEBC Office', area: 'Westlands',
    title: 'Ward Representative By-Election — 29 March 2025',
    desc: 'All registered voters in Westlands sub-county: bring your national ID. Polling stations open 7am to 5pm. Know your polling station at iebc.or.ke before election day.',
    date: 'Sat 29 Mar, 7am–5pm', supports: 120, joins: 89,
    supported: false, joined: false, isOwn: false,
  },
  {
    id: 103, type: 'food',
    user: 'Feeding Nairobi Foundation', area: 'Mathare',
    title: 'Free Maize Flour Distribution — Mathare 4A',
    desc: '500 families will receive 10kg maize flour and cooking oil at Mathare 4A Community Hall. Bring ID. Sponsored by Safaricom Foundation. First come, first served.',
    date: 'Tomorrow, 9am–2pm', supports: 203, joins: 156,
    supported: false, joined: false, isOwn: false,
  },
  {
    id: 104, type: 'event',
    user: 'Nairobi Green Initiative', area: 'Uhuru Park',
    title: 'City Clean-Up & Tree Planting Day — #GreenNairobi2025',
    desc: '500 trees to be planted around Uhuru Park and CBD. Bring gloves and water. Free breakfast for all participants. Join us and make Nairobi greener for everyone!',
    date: 'Sun 30 Mar, 7am', supports: 88, joins: 64,
    supported: false, joined: false, isOwn: false,
  },
  {
    id: 105, type: 'health',
    user: 'Aga Khan Health Services', area: 'Eastleigh',
    title: 'Free Cervical Cancer Screening — Eastleigh Health Centre',
    desc: 'Women aged 25 to 65 welcome. No appointment needed. Bring NHIF card if available. Subsidized by Ministry of Health. Free transport from Eastleigh stage.',
    date: 'Fri 28 Mar, 8am–4pm', supports: 76, joins: 42,
    supported: false, joined: false, isOwn: false,
  },
  {
    id: 106, type: 'issue',
    user: 'Residents of South B', area: 'South B',
    title: 'Water Shortage — 6 Days Without Supply',
    desc: 'South B Estate has not had pipe water for 6 days. Nairobi Water Company has not responded. Residents buying expensive jerricans daily. County intervention urgently needed.',
    date: '2 days ago', supports: 312, joins: 0,
    supported: false, joined: false, isOwn: false,
  },
  {
    id: 107, type: 'event',
    user: 'Kenyatta University Alumni', area: 'Kasarani',
    title: 'Youth Skills Boot Camp — IT & Entrepreneurship (Free)',
    desc: 'Free 3-day skills training for youth aged 18 to 30. Topics: Digital Marketing, Mobile Money Business, Basic Coding and CV Writing. Register via WhatsApp 0700-RADAA.',
    date: 'Apr 5–7, 8am', supports: 134, joins: 97,
    supported: false, joined: false, isOwn: false,
  },
  {
    id: 108, type: 'voting',
    user: 'IEBC Civic Ed Team', area: 'Kayole',
    title: 'Voter Registration Drive — Kayole Ward',
    desc: 'Not yet registered? IEBC teams will be at Kayole Market from 9am. Register and update your details. All Kenyan citizens 18+ with valid ID are eligible to vote.',
    date: 'Sat 5 Apr, 9am–5pm', supports: 58, joins: 0,
    supported: false, joined: false, isOwn: false,
  },
  {
    id: 109, type: 'health',
    user: 'Mama Afya Initiative', area: 'Korogocho',
    title: 'Free Maternal Health Clinic — Korogocho Health Centre',
    desc: 'Free prenatal checkups, iron supplements and nutrition education for expectant mothers. Bring your maternal health booklet. Available in Swahili and English.',
    date: 'Every Wednesday, 8am', supports: 91, joins: 38,
    supported: false, joined: false, isOwn: false,
  },
  {
    id: 110, type: 'issue',
    user: 'Ngara Residents Group', area: 'Ngara',
    title: 'Open Sewer Flooding — Ngara Estate Block C',
    desc: 'Broken sewer pipe has caused flooding in Block C playground for over a week. Children cannot play safely. Nairobi City Water has been called but not responded.',
    date: '3 days ago', supports: 145, joins: 0,
    supported: false, joined: false, isOwn: false,
  },
];

const NGO_DATA = [
  { icon: '🍱', name: 'Feeding Nairobi Foundation',  desc: 'Monthly food distribution to 5,000+ families across informal settlements.',       area: 'Mathare, Kibera',    beneficiaries: '5,200',  programs: 3, status: 'Active' },
  { icon: '📚', name: 'Ujuzi Digital Africa',         desc: 'Digital literacy and tech skills training for out-of-school youth aged 16–28.',   area: 'Eastleigh, Makadara',beneficiaries: '1,800',  programs: 5, status: 'Active' },
  { icon: '🏥', name: 'Afya Bora Community Health',   desc: 'Free mobile clinics, maternal health and HIV testing services across Nairobi.',   area: 'Korogocho, Huruma', beneficiaries: '3,400',  programs: 8, status: 'Active' },
  { icon: '🌱', name: 'Nairobi Green Initiative',     desc: 'Urban tree planting, waste management and climate action programs city-wide.',     area: 'City-Wide',          beneficiaries: '12,000', programs: 4, status: 'Active' },
  { icon: '👩‍💼', name: 'Mama Na Biashara',           desc: 'Microloan and business mentorship for women entrepreneurs in Nairobi.',           area: 'Gikomba, Ngara',    beneficiaries: '920',    programs: 2, status: 'Recruiting' },
  { icon: '🏘️', name: 'Safe Shelter Initiative',     desc: 'Emergency housing assistance and legal aid for displaced families.',               area: 'Mukuru, Kayole',    beneficiaries: '640',    programs: 6, status: 'Active' },
];

// Badge definitions 
const BADGE_DEFS = [
  { id: 'first_action', emoji: '🌱', name: 'Civic Seed',     desc: 'Take your first action',         check: (s) => s.totalActions >= 1 },
  { id: 'voter',        emoji: '🗳️', name: 'Voter',          desc: 'Engage with a voting event',      check: (s) => s.userActions.votes >= 1 },
  { id: 'watchdog',     emoji: '🚨', name: 'Watchdog',       desc: 'Report 2 issues',                 check: (s) => s.userActions.reports >= 2 },
  { id: 'helper',       emoji: '🤝', name: 'Helper',         desc: 'Support 3 posts',                 check: (s) => s.userActions.supported >= 3 },
  { id: 'joiner',       emoji: '✅', name: 'Joiner',         desc: 'Join 2 community events',         check: (s) => s.userActions.events >= 2 },
  { id: 'rising_star',  emoji: '⭐', name: 'Rising Star',    desc: 'Complete 5 total actions',        check: (s) => s.totalActions >= 5 },
  { id: 'streaker',     emoji: '🔥', name: 'Streaker',       desc: 'Reach a 3-day streak',            check: (s) => s.streak >= 3 },
  { id: 'champion',     emoji: '🏆', name: 'Champion',       desc: '10 total actions',                check: (s) => s.totalActions >= 10 },
  { id: 'simba',        emoji: '🦁', name: 'Simba',          desc: '20 total actions',                check: (s) => s.totalActions >= 20 },
  { id: 'mwananchi',    emoji: '🇰🇪', name: 'Mwananchi',     desc: 'Legend — 30 total actions',       check: (s) => s.totalActions >= 30 },
];

const ALERTS = [
  { color: 'red',   text: 'Water disruption reported in South C — 3hrs ago' },
  { color: 'gold',  text: 'By-election reminder: Westlands, 29 March' },
  { color: 'green', text: 'Food aid confirmed at Mathare 4A — Tomorrow 9am' },
  { color: 'red',   text: 'Road closure: Jogoo Road (Mon–Fri this week)' },
  { color: 'green', text: 'Uhuru Park clean-up — 30 March, 7am' },
];

const TOP_AREAS = [
  { name: 'Kibera', pct: 85 }, { name: 'Mathare', pct: 72 },
  { name: 'Westlands', pct: 65 }, { name: 'Eastleigh', pct: 58 }, { name: 'Kasarani', pct: 44 },
];

const HERO_ITEMS = [
  { icon: '🚨', color: 'red',   title: 'Pothole reported',      loc: 'Jogoo Rd · 2min ago' },
  { icon: '🗳️', color: 'gold',  title: 'Voter reg drive open',  loc: 'Westlands · 5min ago' },
  { icon: '🍱', color: 'green', title: 'Food aid confirmed',     loc: 'Mathare 4A · 12min ago' },
  { icon: '🌱', color: 'blue',  title: 'Clean-up crew forming', loc: 'Uhuru Park · 18min ago' },
  { icon: '🏥', color: 'green', title: 'Free screening today',  loc: 'Eastleigh · 30min ago' },
];

function selectRole(role) {
  state.selectedRole = role;
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('role' + role).classList.add('selected');
}

function doLogin() {
  const name = document.getElementById('loginName').value.trim();
  const area = document.getElementById('loginArea').value.trim();
  if (!name)              { showToast('Please enter your name', 'error'); return; }
  if (!state.selectedRole){ showToast('Please choose a role first', 'error'); return; }

  // Build your  object from the login form
  state.user = { name, area: area || 'Nairobi', role: state.selectedRole, bio: '' };
  var savedOk = loadFromStorage();
  var isReturning = savedOk && state.user && state.user.name === name;

  if (isReturning) {
    showToast('Welcome back, ' + firstName(name) + '! Your progress was saved. 🇰🇪', 'success');
  } else {
    // Brand new user — start with zero stats
    state.user = { name, area: area || 'Nairobi', role: state.selectedRole, bio: '' };
    state.posts        = JSON.parse(JSON.stringify(SEED_POSTS)); // Deep copy — never mutate the original
    state.userActions  = { reports: 0, votes: 0, events: 0, supported: 0 };
    state.totalActions = 0;
    state.streak       = 0;
    state.activeDays   = new Set();
    state.actionLog    = [];
    state._lastBadgeCount = 0;
    showToast('Karibu, ' + firstName(name) + '! Harambee! 🇰🇪', 'success');
  markTodayActive();
  saveToStorage();
  // Swap screens
  document.getElementById('loginScreen').classList.replace('active', 'hidden');
  document.getElementById('app').classList.replace('hidden', 'active');

  // Update nav with user info
  document.getElementById('navName').textContent       = firstName(state.user.name);
  document.getElementById('navAvatar').textContent     = state.user.name[0].toUpperCase();
  document.getElementById('navAreaBadge').textContent  = state.user.area;

  if (state.user.role === 'ngo') {
    document.querySelectorAll('.ngo-only').forEach(el => el.classList.remove('hidden'));
  }

  initApp();
  showPage('home');
}
}

function doLogout() {
  destroyAllCharts();

  clearStorage();

  state = {
    user: null, selectedRole: null, currentPage: 'home', posts: [],
    editingPostId: null, filter: 'all',
    userActions: { reports: 0, votes: 0, events: 0, supported: 0 },
    streak: 0, totalActions: 0, actionLog: [], activeDays: new Set(),
    charts: { homePie:null, homeBar:null, homeDoughnut:null, dashActivity:null, profilePie:null },
    _lastBadgeCount: 0,
  };
  document.getElementById('loginName').value = '';
  document.getElementById('loginArea').value = '';
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.ngo-only').forEach(el => el.classList.add('hidden'));
  document.getElementById('app').classList.replace('active', 'hidden');
  document.getElementById('loginScreen').classList.replace('hidden', 'active');
}

function initApp() {
  renderHeroLive();
  renderTrending();
  animateStatCounters();
  renderHomeCharts();
  renderFeed();
  renderSidebar();
  renderDashboard();
  renderProfile();
  renderNGO();
  startAutoRefresh();
  saveToStorag();
(function tryRestoreSession()  {
  var saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;// Nothing saved 
} );

    // Restore full state
    if (data.posts)       state.posts       = data.posts;
    if (data.userActions) state.userActions = data.userActions;
    if (typeof data.totalActions === 'number') state.totalActions = data.totalActions;
    if (typeof data.streak === 'number')       state.streak       = data.streak;
    if (data._lastBadgeCount !== undefined)    state._lastBadgeCount = data._lastBadgeCount;
    if (data.actionLog)   state.actionLog   = data.actionLog;
    if (Array.isArray(data.activeDays))        state.activeDays   = new Set(data.activeDays);

    // Restore the user object
    state.user = data.user;
    state.selectedRole = data.user.role;

    // Mark today active 
    markTodayActive();

    // Recalculate streak in case a day has passed since last visit
    incrementStreak();

    // go straight to app
    document.getElementById('loginScreen').classList.replace('active', 'hidden');
    document.getElementById('app').classList.replace('hidden', 'active');

    // Populate nav bar
    document.getElementById('navName').textContent      = firstName(state.user.name);
    document.getElementById('navAvatar').textContent    = state.user.name[0].toUpperCase();
    document.getElementById('navAreaBadge').textContent = state.user.area;

    // Show NGO nav link if needed
    if (state.user.role === 'ngo') {
      document.querySelectorAll('.ngo-only').forEach(function(el){ el.classList.remove('hidden'); });
    }

    // Re-render everything with restored data
    initApp();
    showPage('home');
    showToast('Welcome back, ' + firstName(state.user.name) + '! 🔥 Your streak continues.', 'success');

function showPage(page) {
  state.currentPage = page;
  document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); });
  const target = document.getElementById(page + 'Page');
  if (target) { target.classList.remove('hidden'); target.classList.add('active'); }
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', (l.getAttribute('onclick') || '').includes("'" + page + "'"));
  });
  // Charts need the canvas visible before rendering
  if (page === 'dashboard') setTimeout(renderDashboardCharts, 80);
  if (page === 'profile')   setTimeout(renderProfileCharts, 80);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderHeroLive() {
  const c = document.getElementById('heroLiveItems');
  if (!c) return;
  c.innerHTML = HERO_ITEMS.map((item, i) =>
    '<div class="hmc-item" style="animation-delay:' + (i * 0.1) + 's">' +
      '<div class="hmc-icon ' + item.color + '">' + item.icon + '</div>' +
      '<div class="hmc-text"><strong>' + item.title + '</strong><span>📍 ' + item.loc + '</span></div>' +
    '</div>'
  ).join('');
}

function renderTrending() {
  const c = document.getElementById('trendingGrid');
  if (!c) return;
  c.innerHTML = state.posts.slice(0, 6).map(buildTrendingCard).join('');
}

function buildTrendingCard(p) {
  var LABELS = { issue:'Issue', voting:'Voting', food:'Food Aid', event:'Event', health:'Health' };
  return '<div class="trending-card type-' + p.type + '" id="tc-' + p.id + '">' +
    '<div class="tc-header"><span class="tc-type-badge">' + (LABELS[p.type]||p.type) + '</span>' +
    '<span class="tc-area">📍 ' + p.area + '</span></div>' +
    '<div class="tc-title">' + p.title + '</div>' +
    '<div class="tc-desc">' + p.desc.slice(0,100) + '…</div>' +
    '<div class="tc-footer"><div class="tc-actions">' +
      '<button class="tc-btn ' + (p.supported?'active':'') + '" onclick="toggleSupport(' + p.id + ')" id="tc-sup-' + p.id + '">❤️ ' + p.supports + '</button>' +
      (p.type !== 'issue' ? '<button class="tc-btn ' + (p.joined?'active':'') + '" onclick="toggleJoin(' + p.id + ')" id="tc-join-' + p.id + '">' + (p.joined?'✅ Joined':'✔ Join') + '</button>' : '') +
    '</div><span class="tc-meta">' + p.date + '</span></div></div>';
}

function animateStatCounters() {
  var targets = { statReports: 4280, statVotes: 12840, statEvents: 880, statNGOs: 340 };
  Object.entries(targets).forEach(function(pair) {
    var id = pair[0], target = pair[1];
    var el = document.getElementById(id);
    if (!el) return;
    var current = 0;
    var step = Math.ceil(target / 60);
    var timer = setInterval(function() {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString(); // adds commas: 12,840
      if (current >= target) clearInterval(timer);
    }, 20);
  });
}

function renderHomeCharts() {
  Chart.defaults.color = '#9ea89c';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.07)';
  Chart.defaults.font.family = "'DM Sans', sans-serif";
  var HEX = ['#E8001A','#00A550','#C8A84B','#4096FF','#F5A623','#9B59B6'];

  function make(key, ctx, cfg) {
    if (state.charts[key]) state.charts[key].destroy();
    state.charts[key] = new Chart(ctx, cfg);
  }

  var pieEl = document.getElementById('pieChart');
  if (pieEl) make('homePie', pieEl, {
    type: 'doughnut',
    data: { labels:['Infrastructure','Water & Sanitation','Security','Health','Environment','Education'],
            datasets:[{data:[32,21,15,14,10,8], backgroundColor:HEX, borderWidth:0, hoverOffset:8}] },
    options: { responsive:true, animation:{animateRotate:true,duration:1400},
               plugins:{legend:{position:'bottom',labels:{padding:12,font:{size:11}}}} },
  });

  var barEl = document.getElementById('barChart');
  if (barEl) make('homeBar', barEl, {
    type: 'bar',
    data: { labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
            datasets:[
              {label:'Reports',          data:[45,62,38,71,55,88,42], backgroundColor:'rgba(232,0,26,0.75)',  borderRadius:6},
              {label:'Events Joined',    data:[28,35,52,40,60,95,30], backgroundColor:'rgba(0,165,80,0.75)',  borderRadius:6},
              {label:'Voting/Awareness', data:[20,40,28,55,35,65,25], backgroundColor:'rgba(200,168,75,0.75)',borderRadius:6},
            ] },
    options: { responsive:true, animation:{duration:1000},
               scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(255,255,255,0.05)'}}},
               plugins:{legend:{position:'bottom',labels:{padding:14,font:{size:11}}}} },
  });

  var dEl = document.getElementById('doughnutChart');
  if (dEl) make('homeDoughnut', dEl, {
    type: 'pie',
    data: { labels:['Kibera','Mathare','Westlands','Eastleigh','Kasarani','Others'],
            datasets:[{data:[22,18,16,14,12,18], backgroundColor:HEX, borderWidth:0, hoverOffset:8}] },
    options: { responsive:true, animation:{duration:1200},
               plugins:{legend:{position:'bottom',labels:{padding:12,font:{size:11}}}} },
  });
}

function renderFeed() {
  var c = document.getElementById('feedContainer');
  if (!c) return;
  var visible = state.filter === 'all' ? state.posts : state.posts.filter(function(p){ return p.type === state.filter; });
  if (!visible.length) {
    c.innerHTML = '<div style="text-align:center;padding:64px;color:var(--text-muted)"><div style="font-size:3rem;margin-bottom:16px">🔍</div><p>No posts in this category yet. Be the first to post!</p></div>';
    return;
  }
  c.innerHTML = visible.map(function(p,i){ return buildFeedCard(p,i); }).join('');
}

function buildFeedCard(p, index) {
  index = index || 0;
  var LABELS = { issue:'Issue', voting:'Voting', food:'Food Aid', event:'Event', health:'Health' };
  var canEdit = p.isOwn || (state.user && state.user.role === 'ngo');

  // icons
  var typeIconMap = { issue:'fa-circle-exclamation', voting:'fa-person-booth', food:'fa-bowl-food', event:'fa-leaf', health:'fa-heart-pulse' };
  var typeIcon = typeIconMap[p.type] || 'fa-tag';

  var controls = canEdit
    ? '<div class="fc-controls">' +
        '<button class="tc-btn btn-sm" onclick="openEditModal(' + p.id + ')" title="Edit post">' +
          '<i class="fa-solid fa-pen-to-square"></i>' +
        '</button>' +
        '<button class="tc-btn btn-sm delete" onclick="deletePost(' + p.id + ')" title="Delete post">' +
          '<i class="fa-solid fa-trash-can"></i>' +
        '</button>' +
      '</div>'
    : '';

  var joinBtn = p.type !== 'issue'
    ? '<button class="fc-action-btn ' + (p.joined ? 'active' : '') + '" onclick="toggleJoin(' + p.id + ')" id="feed-join-' + p.id + '">' +
        (p.joined
          ? '<i class="fa-solid fa-circle-check"></i> Joined'
          : '<i class="fa-regular fa-circle-plus"></i> Join') +
      '</button>'
    : '';

  return '<div class="feed-card type-' + p.type + '" id="fc-' + p.id + '" data-type="' + p.type + '" style="animation-delay:' + (index * 0.05) + 's">' +
    '<div class="fc-header">' +
      '<div class="fc-user">' +
        '<div class="fc-avatar">' + p.user[0].toUpperCase() + '</div>' +
        '<div class="fc-user-info">' +
          '<strong>' + p.user + '</strong>' +
          '<span><i class="fa-solid fa-location-dot" style="font-size:0.7rem;margin-right:3px"></i>' + p.area + ' &middot; ' + p.date + '</span>' +
        '</div>' +
      '</div>' +
      controls +
    '</div>' +
    '<div class="fc-title">' + p.title + '</div>' +
    '<div class="fc-desc">' + p.desc + '</div>' +
    '<div class="fc-footer">' +
      '<div class="fc-tags">' +
        '<span class="fc-tag"><i class="fa-solid ' + typeIcon + '" style="margin-right:4px"></i>' + (LABELS[p.type] || p.type) + '</span>' +
        '<span class="fc-tag"><i class="fa-solid fa-location-dot" style="margin-right:3px"></i>' + p.area + '</span>' +
      '</div>' +
      '<div class="fc-actions">' +
        '<button class="fc-action-btn ' + (p.supported ? 'supported' : '') + '" onclick="toggleSupport(' + p.id + ')" id="feed-sup-' + p.id + '">' +
          '<i class="' + (p.supported ? 'fa-solid' : 'fa-regular') + ' fa-heart"></i> ' +
          '<span id="sup-count-' + p.id + '">' + p.supports + '</span>' +
        '</button>' +
        joinBtn +
      '</div>' +
    '</div>' +
  '</div>';
}

function filterFeed(type, btn) {
  state.filter = type;
  document.querySelectorAll('.filter-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  renderFeed();
}
}
function renderSidebar() {
  var al = document.getElementById('alertsList');
  if (al) al.innerHTML = ALERTS.map(function(a){
    return '<div class="alert-item"><span class="alert-dot ' + a.color + '"></span><span>' + a.text + '</span></div>';
  }).join('');

  var ta = document.getElementById('topAreas');
  if (ta) ta.innerHTML = TOP_AREAS.map(function(a){
    return '<div class="area-item"><div><div style="font-weight:600;font-size:0.85rem">' + a.name + '</div>' +
      '<div class="area-bar" style="width:' + a.pct + '%;max-width:130px;margin-top:4px"></div></div>' +
      '<span style="color:var(--accent-green);font-weight:700;font-size:0.82rem">' + a.pct + '%</span></div>';
  }).join('');
}

function toggleSupport(postId) {
  var post = state.posts.find(function(p){ return p.id === postId; });
  if (!post) return;

  if (post.supported) {
    post.supported = false;
    post.supports--;
    state.userActions.supported = Math.max(0, state.userActions.supported - 1);
    state.totalActions = Math.max(0, state.totalActions - 1);
    removeFromLog(postId, 'supported');
    showToast('Support removed', 'info');
  } else {
    post.supported = true;
    post.supports++;
    state.userActions.supported++;
    state.totalActions++;
    markTodayActive();
    addToLog({ icon:'❤️', type:'supported', label:'Supported: ' + post.title, postId:postId });
    showToast('❤️ Support registered! Thank you.', 'success');
    incrementStreak();
  }

  refreshPostUI(post);
  updateAllCounters();
  checkAndAwardBadges();
  autoSave(); // 💾 Persist to localStorage 
}

function toggleJoin(postId) {
  var post = state.posts.find(function(p){ return p.id === postId; });
  if (!post) return;

  if (post.joined) {
    post.joined = false;
    post.joins--;
    state.userActions.events = Math.max(0, state.userActions.events - 1);
    if (post.type === 'voting') state.userActions.votes = Math.max(0, state.userActions.votes - 1);
    state.totalActions = Math.max(0, state.totalActions - 1);
    removeFromLog(postId, 'joined');
    showToast('Left the event.', 'info');
  } else {
    post.joined = true;
    post.joins++;
    state.userActions.events++;
    if (post.type === 'voting') state.userActions.votes++;
    state.totalActions++;
    markTodayActive();
    addToLog({ icon:'✅', type:'joined', label:'Joined: ' + shortenTitle(post.title), postId:postId });
    showToast('✅ You joined: ' + shortenTitle(post.title), 'success');
    incrementStreak();
  }

  refreshPostUI(post);
  updateAllCounters();
  checkAndAwardBadges();
  autoSave(); // 💾 Persist to localStorage
}

// Update only the changed buttons 
function refreshPostUI(post) {
  // Feed card support button
  var supCount = document.getElementById('sup-count-' + post.id);
  if (supCount) supCount.textContent = post.supports;
  var feedSup = document.getElementById('feed-sup-' + post.id);
  if (feedSup) {
    feedSup.className = 'fc-action-btn ' + (post.supported ? 'supported' : '');
    var heartIcon = feedSup.querySelector('i');
    if (heartIcon) heartIcon.className = (post.supported ? 'fa-solid fa-heart' : 'fa-regular fa-heart');
  }
  var feedJoin = document.getElementById('feed-join-' + post.id);
  if (feedJoin) {
    feedJoin.className = 'fc-action-btn ' + (post.joined ? 'active' : '');
    feedJoin.innerHTML = post.joined
      ? '<i class="fa-solid fa-circle-check"></i> Joined'
      : '<i class="fa-regular fa-circle-plus"></i> Join';
  }
  // Trending card
  var tcSup = document.getElementById('tc-sup-' + post.id);
  if (tcSup) { tcSup.innerHTML = '❤️ ' + post.supports; tcSup.className = 'tc-btn ' + (post.supported ? 'active' : ''); }
  var tcJoin = document.getElementById('tc-join-' + post.id);
  if (tcJoin) { tcJoin.className = 'tc-btn ' + (post.joined ? 'active' : ''); tcJoin.textContent = post.joined ? '✅ Joined' : '✔ Join'; }
  // News card counts (home page)
  var ncSup = document.getElementById('nc-sup-' + post.id);
  if (ncSup) ncSup.textContent = post.supports;
  var ncJoin = document.getElementById('nc-join-' + post.id);
  if (ncJoin) ncJoin.textContent = post.joined ? '✓ Joined' : 'Join';
}

function openAddModal() {
  state.editingPostId = null;
  document.getElementById('modalTitle').textContent  = 'Post Activity';
  document.getElementById('modalSubmit').textContent = 'Post →';
  clearModalFields();
  if (state.user) document.getElementById('modalArea').value = state.user.area;
  document.getElementById('modal').classList.remove('hidden');
}

function openEditModal(id) {
  var post = state.posts.find(function(p){ return p.id === id; });
  if (!post) return;
  state.editingPostId = id;
  document.getElementById('modalTitle').textContent  = 'Edit Post';
  document.getElementById('modalSubmit').textContent = 'Save Changes →';
  document.getElementById('modalType').value   = post.type;
  document.getElementById('modalTitle2').value = post.title;
  document.getElementById('modalDesc').value   = post.desc;
  document.getElementById('modalArea').value   = post.area;
  document.getElementById('modalDate').value   = post.date;
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  state.editingPostId = null;
}

function submitPost() {
  var type  = document.getElementById('modalType').value;
  var title = document.getElementById('modalTitle2').value.trim();
  var desc  = document.getElementById('modalDesc').value.trim();
  var area  = document.getElementById('modalArea').value.trim() || (state.user && state.user.area) || 'Nairobi';
  var date  = document.getElementById('modalDate').value.trim() || 'Just now';

  if (!title) { showToast('Please add a title', 'error'); return; }
  if (!desc)  { showToast('Please add a description', 'error'); return; }

  if (state.editingPostId) {
    var post = state.posts.find(function(p){ return p.id === state.editingPostId; });
    if (post) Object.assign(post, { type:type, title:title, desc:desc, area:area, date:date });
    showToast('✏️ Post updated!', 'success');
  } else {
    var newPost = {
      id: Date.now(), type:type, title:title, desc:desc, area:area, date:date,
      user: state.user.name,
      supports: 0, joins: 0, supported: false, joined: false, isOwn: true,
    };
    state.posts.unshift(newPost); // Add to the top of the list

    if (type === 'issue') {
      state.userActions.reports++;
      addToLog({ icon:'🚨', type:'reported', label:'Reported: ' + title, postId: newPost.id });
    } else {
      addToLog({ icon:'📝', type:'posted', label:'Posted: ' + title, postId: newPost.id });
    }
    state.totalActions++;
    markTodayActive();
    incrementStreak();
    showToast('🎉 Activity posted to the community!', 'success');
  }

  closeModal();
  renderFeed();
  renderTrending();
  updateAllCounters();
  checkAndAwardBadges();
  autoSave(); // 💾 Persist post to localStorage
}

function deletePost(id) {
  if (!confirm('Delete this post')) return;
  state.posts = state.posts.filter(function(p){ return p.id !== id; });
  var fcEl = document.getElementById('fc-' + id);
  var tcEl = document.getElementById('tc-' + id);
  if (fcEl) fcEl.remove(); // Remove just that card
  if (tcEl) tcEl.remove();
  showToast('Post deleted.', 'info');
  renderTrending();
  autoSave(); // 💾 Persist deletion to localStorage
}

function clearModalFields() {
  ['modalTitle2','modalDesc','modalArea','modalDate'].forEach(function(id){
    var el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('modalType').value = 'issue';
}

function markTodayActive() {
  state.activeDays.add(todayString());
}

function incrementStreak() {
  // Count backwards from today until there's a gap in activeDays
  var today = new Date();
  var streak = 0;
  for (var i = 0; i < 365; i++) {
    var d = new Date(today);
    d.setDate(today.getDate() - i);
    if (state.activeDays.has(dateString(d))) {
      streak++;
    } else {
      break; // Stop at first missing day
    }
  }
  state.streak = streak;
  var el = document.getElementById('dashStreak');
  if (el) el.textContent = '🔥 ' + state.streak + ' Day Streak';
  updateProfileStreak();
  renderStreakCalendar();
  autoSave(); // 💾 Persist streak and activeDays to localStorage
}

function todayString() { return dateString(new Date()); }
function dateString(d)  { return d.toISOString().split('T')[0]; } 
function addToLog(entry) {
  entry.time = 'Just now';
  entry.timestamp = Date.now();
  state.actionLog.unshift(entry); // Newest at top
  if (state.actionLog.length > 20) state.actionLog.pop(); // Cap at 20 entries
  renderRecentActions();
}

function removeFromLog(postId, type) {
  state.actionLog = state.actionLog.filter(function(e){ return !(e.postId === postId && e.type === type); });
  renderRecentActions();
}

function renderRecentActions() {
  var c = document.getElementById('recentActions');
  if (!c) return;
  var faIconMap = { '🚨':'<i class="fa-solid fa-triangle-exclamation" style="color:var(--accent-red)"></i>', '❤️':'<i class="fa-solid fa-heart" style="color:var(--accent-red)"></i>', '✅':'<i class="fa-solid fa-circle-check" style="color:var(--accent-green)"></i>', '🗳️':'<i class="fa-solid fa-person-booth" style="color:var(--accent-gold)"></i>', '📝':'<i class="fa-solid fa-pen-to-square" style="color:#4096FF"></i>', '🤝':'<i class="fa-solid fa-handshake-angle" style="color:var(--accent-green)"></i>' };
  var seedHistory = [
    { icon:'🚨', label:'Reported: Flooded road in Kibera', time:'2 days ago' },
    { icon:'❤️', label:'Supported: Feeding Nairobi Drive', time:'3 days ago' },
    { icon:'✅', label:'Joined: Youth Skills Boot Camp', time:'4 days ago' },
    { icon:'🗳️', label:'Engaged: Voter Registration Drive', time:'5 days ago' },
    { icon:'📝', label:'Posted: Community issue report', time:'6 days ago' },
  ];
  var combined = state.actionLog.concat(seedHistory).slice(0, 7);
  c.innerHTML = combined.length === 0
    ? '<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:20px">No actions yet — start participating!</p>'
    : combined.map(function(a){
        var iconHtml = faIconMap[a.icon] || '<i class="fa-solid fa-bolt" style="color:var(--accent-gold)"></i>';
        return '<div class="action-item"><div class="action-icon">' + iconHtml + '</div><div class="action-text">' + a.label + '</div><div class="action-time">' + a.time + '</div></div>';
      }).join('');
}

function renderDashboard() {
  updateDashStatsCards();
  renderRecentActions();
  renderStreakCalendar();
  renderBadgeGrid();
  updateStorageMeta(); // 💾 refresh storage inspector info
}

function updateDashStatsCards() {
  var a = state.userActions;
  var el = document.getElementById('dashStats');
  if (!el) return;
  el.innerHTML =
    '<div class="dash-stat-card" data-icon="🚨"><div class="dsc-label">Issues Reported</div><div class="dsc-value red">' + a.reports + '</div><div class="dsc-change">' + (a.reports > 0 ? '↑ Community watchdog' : 'Report your first issue') + '</div></div>' +
    '<div class="dash-stat-card" data-icon="🗳️"><div class="dsc-label">Voting Actions</div><div class="dsc-value gold">' + a.votes + '</div><div class="dsc-change">' + (a.votes > 0 ? '✓ Active voter' : 'Join a voting event') + '</div></div>' +
    '<div class="dash-stat-card" data-icon="🌱"><div class="dsc-label">Events Joined</div><div class="dsc-value green">' + a.events + '</div><div class="dsc-change">' + (a.events > 0 ? '↑ Community active' : 'Join your first event') + '</div></div>' +
    '<div class="dash-stat-card" data-icon="❤️"><div class="dsc-label">Posts Supported</div><div class="dsc-value blue">' + a.supported + '</div><div class="dsc-change">' + (a.supported > 0 ? '↑ Solidarity actions' : 'Support a post') + '</div></div>';
}

function updateAllCounters() {
  updateDashStatsCards();
  renderImpactStats();
  renderBadgeGrid();
  updateCongrats();
  renderProfileBadges();
  updateProfileStreak();
}

function renderDashboardCharts() {
  var ctx = document.getElementById('myActivityChart');
  if (!ctx) return;
  if (state.charts.dashActivity) state.charts.dashActivity.destroy();

  var labels = [], data = [];
  for (var i = 6; i >= 0; i--) {
    var d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(i === 0 ? 'Today' : d.toLocaleDateString('en', {weekday:'short'}));
    if (state.activeDays.has(dateString(d))) {
      data.push(i === 0 ? Math.max(state.totalActions, 1) : 1);
    } else {
      data.push(i > 4 ? Math.floor(Math.random() * 2) : 0);
    }
  }

  state.charts.dashActivity = new Chart(ctx, {
    type: 'line',
    data: { labels: labels, datasets: [{
      label: 'Actions', data: data,
      borderColor: '#00A550', backgroundColor: 'rgba(0,165,80,0.12)',
      fill: true, tension: 0.4,
      pointBackgroundColor: '#00A550', pointBorderColor: '#0d0f0e',
      pointBorderWidth: 2, pointRadius: 6, pointHoverRadius: 9,
    }] },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { grid:{display:false} }, y: { grid:{color:'rgba(255,255,255,0.05)'}, min:0, ticks:{stepSize:1} } },
      animation: { duration: 900 },
    },
  });
}

function renderStreakCalendar() {
  var c = document.getElementById('streakCalendar');
  if (!c) return;

  var today = new Date();
  var year = today.getFullYear();
  var startOfYear = new Date(year, 0, 1);
  var daysInYear = isLeapYear(year) ? 366 : 365;
  var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  var html = '<div class="year-cal-wrap"><div class="year-cal-months">';
  monthNames.forEach(function(m){ html += '<span class="ycal-month">' + m + '</span>'; });
  html += '</div><div class="year-cal-grid">';

  for (var dayNum = 0; dayNum < daysInYear; dayNum++) {
    var d = new Date(startOfYear);
    d.setDate(dayNum + 1);
    var ds = dateString(d);
    var isToday   = ds === todayString();
    var isActive  = state.activeDays.has(ds);
    var isFuture  = d > today;
    var dayLabel  = d.toLocaleDateString('en-KE', {weekday:'short', day:'numeric', month:'short'});

    var cls = 'ycal-day';
    if (isFuture)      cls += ' future';
    else if (isActive) cls += ' active';
    else               cls += ' inactive';
    if (isToday)       cls += ' today';

    html += '<div class="' + cls + '" title="' + dayLabel + '"></div>';
  }

  html += '</div>' +
    '<div class="ycal-legend">' +
      '<span class="ycal-dot inactive"></span> No activity &nbsp;' +
      '<span class="ycal-dot active"></span> Active day &nbsp;' +
      '<span class="ycal-dot today-dot"></span> Today' +
    '</div></div>';

  c.innerHTML = html;
}

function isLeapYear(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }

function computeBadges() {
  return BADGE_DEFS.map(function(b){ return Object.assign({}, b, { earned: b.check(state) }); });
}

function checkAndAwardBadges() {
  var prev = state._lastBadgeCount || 0;
  var badges = computeBadges();
  var earned = badges.filter(function(b){ return b.earned; });
  if (earned.length > prev) {
    var newest = earned[earned.length - 1];
    setTimeout(function(){
      showToast('🏅 Badge Unlocked: ' + newest.emoji + ' ' + newest.name + '!', 'success');
    }, 400);
  }
  state._lastBadgeCount = earned.length;
  renderBadgeGrid();
  renderProfileBadges();
}

function renderBadgeGrid() {
  var c = document.getElementById('badgesGrid');
  if (!c) return;
  c.innerHTML = computeBadges().map(function(b){
    return '<div class="badge-item ' + (b.earned ? 'earned' : 'locked') + '" title="' + b.desc + '">' +
      '<span class="badge-emoji">' + b.emoji + '</span>' +
      '<span class="badge-name">' + b.name + '</span></div>';
  }).join('');
}

function renderProfile() {
  if (!state.user) return;
  document.getElementById('profileAvatarBig').textContent = state.user.name[0].toUpperCase();
  document.getElementById('profileName').textContent = state.user.name;
  document.getElementById('profileRole').innerHTML =
    (state.user.role === 'ngo' ? 'NGO / Organisation' : 'Citizen') +
    ' · <span id="profileArea">' + state.user.area + '</span>';
  renderProfileBadges();
  renderImpactStats();
  updateProfileStreak();
  updateCongrats();
}

function renderProfileBadges() {
  var earned = computeBadges().filter(function(b){ return b.earned; }).slice(0, 5);
  var c = document.getElementById('profileBadgesRow');
  if (!c) return;
  c.innerHTML = earned.length
    ? earned.map(function(b){ return '<span class="profile-badge-chip">' + b.emoji + ' ' + b.name + '</span>'; }).join('')
    : '<span class="profile-badge-chip" style="opacity:0.5">No badges yet — start participating!</span>';
}

function renderImpactStats() {
  var a = state.userActions;
  var total = state.totalActions;
  var c = document.getElementById('impactStats');
  if (!c) return;
  var items = [
    { label:'Issues Reported', val:a.reports,  pct:pct(a.reports,10),  color:'var(--accent-red)' },
    { label:'Events Joined',   val:a.events,   pct:pct(a.events,10),   color:'var(--accent-green)' },
    { label:'Posts Supported', val:a.supported,pct:pct(a.supported,10),color:'var(--accent-gold)' },
    { label:'Total Actions',   val:total,      pct:pct(total,30),      color:'#4096FF' },
  ];
  c.innerHTML = items.map(function(i){
    return '<div><div class="is-row"><span class="is-label">' + i.label + '</span>' +
      '<span class="is-val" style="color:' + i.color + '">' + i.val + '</span></div>' +
      '<div class="is-bar-wrap"><div class="is-bar" style="width:' + i.pct + '%;background:' + i.color + '"></div></div></div>';
  }).join('');
}

function updateProfileStreak() {
  var el = document.getElementById('streakNumber');
  if (el) el.textContent = state.streak;

  var msg = document.getElementById('streakMessage');
  if (msg) {
    var name = firstName(state.user ? state.user.name : 'Citizen');
    var s = state.streak;
    if (s === 0)    msg.textContent = 'Welcome, ' + name + '! Start your streak today. 🌱';
    else if (s < 3) msg.textContent = 'Great start, ' + name + '! Keep going — Nairobi needs you!';
    else if (s < 7) msg.textContent = s + ' days strong, ' + name + '! Your community thanks you. 🔥';
    else if (s < 14)msg.textContent = 'Incredible streak! You are a civic champion, ' + name + '! 🏆';
    else            msg.textContent = 'LEGENDARY, ' + name + '! ' + s + ' days of action. Harambee! 🇰🇪';
  }

  var prog = document.getElementById('streakProgressBar');
  if (prog) prog.style.setProperty('--progress', pct(state.streak, 30) + '%');

  var dashStreak = document.getElementById('dashStreak');
  if (dashStreak) dashStreak.textContent = '🔥 ' + state.streak + ' Day Streak';
}

function updateCongrats() {
  var total = state.totalActions;
  var levels = [
    { min:0,  icon:'🌱', title:'Getting Started',    desc:'Complete your first action to earn a badge!' },
    { min:1,  icon:'⭐', title:'Rising Star',         desc:'Your first step! Nairobi is watching. Keep going!' },
    { min:5,  icon:'🔥', title:'Civic Activist',      desc:'Excellent! Your voice is shaping the community.' },
    { min:10, icon:'🏆', title:'Community Champion',  desc:'Amazing dedication. You inspire others to participate!' },
    { min:20, icon:'🦁', title:'Simba wa Mtaa',       desc:'Neighbourhood lion! Real changes happening because of you.' },
    { min:30, icon:'🇰🇪', title:'Mwananchi wa Mwaka!','desc':'LEGEND! You embody the Harambee spirit. Asante sana!' },
  ];
  var lvl = levels[0];
  for (var i = levels.length - 1; i >= 0; i--) { if (total >= levels[i].min) { lvl = levels[i]; break; } }
  var lb = document.getElementById('levelBadge');
  var lt = document.getElementById('levelTitle');
  var ld = document.getElementById('levelDesc');
  if (lb) lb.textContent = lvl.icon;
  if (lt) lt.textContent = lvl.title;
  if (ld) ld.textContent = lvl.desc;
}

function renderProfileCharts() {
  var ctx = document.getElementById('profilePie');
  if (!ctx) return;
  if (state.charts.profilePie) state.charts.profilePie.destroy();
  var a = state.userActions;
  state.charts.profilePie = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Reported','Joined','Supported','Voting'],
      datasets: [{ data: [Math.max(a.reports,0.1),Math.max(a.events,0.1),Math.max(a.supported,0.1),Math.max(a.votes,0.1)],
                   backgroundColor:['#E8001A','#00A550','#C8A84B','#4096FF'], borderWidth:0, hoverOffset:10 }],
    },
    options: { responsive:true, animation:{duration:1000},
               plugins:{legend:{position:'bottom',labels:{padding:12,font:{size:11}}}} },
  });
}

function openEditProfile() {
  document.getElementById('editName').value = state.user.name;
  document.getElementById('editArea').value = state.user.area;
  document.getElementById('editBio').value  = state.user.bio || '';
  document.getElementById('editProfileModal').classList.remove('hidden');
}

function closeEditProfile() {
  document.getElementById('editProfileModal').classList.add('hidden');
}

function saveProfile() {
  var name = document.getElementById('editName').value.trim();
  var area = document.getElementById('editArea').value.trim();
  var bio  = document.getElementById('editBio').value.trim();
  if (!name) { showToast('Name cannot be empty', 'error'); return; }
  Object.assign(state.user, { name:name, area:area || state.user.area, bio:bio });
  document.getElementById('navName').textContent      = firstName(name);
  document.getElementById('navAvatar').textContent    = name[0].toUpperCase();
  document.getElementById('navAreaBadge').textContent = state.user.area;
  renderProfile();
  closeEditProfile();
  showToast('✅ Profile saved!', 'success');
  autoSave(); // 💾 Persist updated profile 
}
function renderNGO() {
  var c = document.getElementById('ngoGrid');
  if (!c) return;
  c.innerHTML = NGO_DATA.map(function(n, i){
    return '<div class="ngo-card">' +
      '<div class="ngo-card-header"><div class="ngo-icon">' + n.icon + '</div><span class="ngo-status">' + n.status + '</span></div>' +
      '<div class="ngo-name">' + n.name + '</div>' +
      '<div class="ngo-desc">' + n.desc + '</div>' +
      '<div class="ngo-meta"><span>📍 ' + n.area + '</span><span>👥 ' + n.beneficiaries + ' beneficiaries</span><span>📋 ' + n.programs + ' programs</span></div>' +
      '<div class="ngo-footer"><button class="btn-primary btn-sm" id="ngo-btn-' + i + '" onclick="supportNGO(' + i + ', this)">Support</button>' +
      '<button class="btn-outline btn-sm">Learn More</button></div></div>';
  }).join('');
}

function supportNGO(index, btn) {
  if (btn.dataset.supported) { showToast('Already supporting this NGO!', 'info'); return; }
  btn.dataset.supported = 'true';
  btn.textContent = '✅ Supporting';
  state.userActions.supported++;
  state.totalActions++;
  markTodayActive();
  incrementStreak();
  addToLog({ icon:'🤝', type:'supported', label:'Supporting NGO: ' + NGO_DATA[index].name, postId: -index });
  showToast('🤝 Now supporting ' + NGO_DATA[index].name + '!', 'success');
  updateAllCounters();
  checkAndAwardBadges();
  autoSave(); // 💾 Persist NGO support action to localStorage
}

var toastTimer = null;
function showToast(message, type) {
  type = type || 'info';
  var t = document.getElementById('toast');
  if (!t) return;
  clearTimeout(toastTimer);
  t.textContent = message;
  t.className   = 'toast ' + type;
  toastTimer = setTimeout(function(){ t.classList.add('hidden'); }, 3800);
}

var AUTO_POSTS = [
  { type:'issue', user:'Dandora Resident', area:'Dandora', title:'Street Lights Out — Outer Ring Rd', desc:'Multiple street lights off for 2 weeks near Dandora Phase 4. Safety risk at night.' },
  { type:'food',  user:'Al-Nour Foundation', area:'Eastleigh', title:'Ramadan Food Packages Available', desc:'Free food packages for 200 families — dry foods, oil, dates. From 10am at Al-Nour Mosque.' },
  { type:'event', user:'Nairobi Youth Hub', area:'Makadara', title:'Free Mental Health Awareness Walk', desc:'300+ youth walking for mental health awareness from Makadara Grounds. Everyone welcome.' },
];
var autoPostIndex = 0;

function startAutoRefresh() {
  setInterval(function() {
    if (!state.user) return;
    var template = AUTO_POSTS[autoPostIndex % AUTO_POSTS.length];
    var newPost = Object.assign({}, template, {
      id: Date.now() + autoPostIndex,
      supports: Math.floor(Math.random() * 30),
      joins: 0, supported: false, joined: false, isOwn: false, date: 'Just now',
    });
    state.posts.unshift(newPost);
    autoPostIndex++;
    if (state.currentPage === 'feed') {
      var fc = document.getElementById('feedContainer');
      if (fc && (state.filter === 'all' || state.filter === newPost.type)) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = buildFeedCard(newPost, 0);
        fc.insertBefore(wrapper.firstChild, fc.firstChild);
      }
    }
    var icons = { issue:'🚨', food:'🍱', event:'🌱', health:'🏥', voting:'🗳️' };
    HERO_ITEMS.unshift({ icon:icons[newPost.type]||'📌', color:'green', title:newPost.title.slice(0,28), loc:newPost.area + ' · Just now' });
    HERO_ITEMS.pop();
    if (state.currentPage === 'home') renderHeroLive();
  }, 45000);
}

function destroyAllCharts() {
  Object.keys(state.charts).forEach(function(key){
    if (state.charts[key]) { state.charts[key].destroy(); state.charts[key] = null; }
  });
}

function firstName(name) { return (name || 'Citizen').split(' ')[0]; }
function shortenTitle(t) { return t && t.length > 42 ? t.slice(0,42) + '…' : (t || ''); }
function pct(val, max)   { return Math.min(Math.round((val / max) * 100), 100); }

function updateStorageMeta() {
  var el = document.getElementById('storageMeta');
  if (!el) return;

  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      el.innerHTML = '<span style="color:var(--text-muted)">No save file found. Your data will be saved automatically as you participate.</span>';
      return;
    }

    var sizeKB = (raw.length / 1024).toFixed(2);
    var data = JSON.parse(raw);

    var postCount = (data.posts || []).length;
    var ownPosts  = (data.posts || []).filter(function(p){ return p.isOwn; }).length;
    var supported = (data.posts || []).filter(function(p){ return p.supported; }).length;
    var joined    = (data.posts || []).filter(function(p){ return p.joined; }).length;
    var days      = (data.activeDays || []).length;
    var lastSaved = new Date().toLocaleString('en-KE');

    el.innerHTML =
      '<div class="storage-grid">' +
        '<div class="sg-item"><span class="sg-val green">' + sizeKB + ' KB</span><span class="sg-lbl">Save Size</span></div>' +
        '<div class="sg-item"><span class="sg-val">'        + postCount + '</span><span class="sg-lbl">Posts Stored</span></div>' +
        '<div class="sg-item"><span class="sg-val red">'   + ownPosts  + '</span><span class="sg-lbl">Your Posts</span></div>' +
        '<div class="sg-item"><span class="sg-val red">'   + supported + '</span><span class="sg-lbl">Supported</span></div>' +
        '<div class="sg-item"><span class="sg-val green">' + joined    + '</span><span class="sg-lbl">Joined</span></div>' +
        '<div class="sg-item"><span class="sg-val gold">'  + days      + '</span><span class="sg-lbl">Active Days</span></div>' +
      '</div>' +
      '<p style="font-size:0.75rem;color:var(--text-muted);margin-top:10px">&#128197; Last auto-saved: ' + lastSaved + '</p>';

  } catch (err) {
    el.innerHTML = '<span style="color:var(--accent-red)">Save file could not be read. It may be corrupted.</span>';
  }
}

function inspectStorage() {
  var pre = document.getElementById('storagePreview');
  if (!pre) return;

  if (!pre.classList.contains('hidden')) {
    pre.classList.add('hidden'); // Toggle 
    return;
  }

  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { showToast('No save file found yet.','info'); return; }
function exportSave() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) { showToast('Nothing saved yet to export.', 'info'); return; }

  // Reset just the stats 
  state.posts        = JSON.parse(JSON.stringify(SEED_POSTS));
  state.userActions  = { reports:0, votes:0, events:0, supported:0 };
  state.totalActions = 0;
  state.streak       = 0;
  state.activeDays   = new Set();
  state.actionLog    = [];
  state._lastBadgeCount = 0;

  markTodayActive();
  saveToStorage();
  renderDashboard(); //rerender
  renderProfile();
  renderFeed();
  renderTrending();
  updateStorageMeta();
  document.getElementById('storagePreview').classList.add('hidden');

  showToast('Save data cleared. Starting fresh!', 'info');
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') { closeModal(); closeEditProfile(); }
});
document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});
document.getElementById('editProfileModal').addEventListener('click', function(e) {
  if (e.target === this) closeEditProfile();
}
  }
}
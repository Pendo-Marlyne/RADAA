let state = {
  user:          null,   // who is logged in? 
  selectedRole:  null,   // citizen or ngo
  currentPage:   'home', // which page is showing
  posts:         [],     // all civic activity cards
  editingPostId: null,   // id of post being edited 
  filter:        'all',  // current feed filter

  // counters  grow every time on click
  userActions: {
    reports:   0,
    votes:     0,
    events:    0,
    supported: 0,
  },

  streak:       0,          // consecutive active days
  totalActions: 0,          // grand total of all actions taken
  actionLog:    [],         // list of recent actions for the dashboard
  activeDays:   new Set(),  // Set of date strings

  // Chart.js  stored so it can be destroy before rebuilding
  charts: {
    homePie:     null, 
    homeBar:     null,
    homeDoughnut:null,
    dashActivity:null,
    profilePie:  null,
  },

  lastBadgeCount: 0, //detect when a new badge is earned
};
// LocalStorage to save data to the browser storing key used to save data in a string key that identifies as RADAA
const STORAGE_KEY = 'RADAA_save';

// Save the important parts of state to localStorage try checks for errors
function saveToStorage() {
  try {
    const snapshot = {
      user:           state.user,
      posts:          state.posts,
      userActions:    state.userActions,
      totalActions:   state.totalActions,
      streak:         state.streak,
      activeDays:     Array.from(state.activeDays), // Set Array for JSON
      actionLog:      state.actionLog,
      lastBadgeCount: state.lastBadgeCount,
    };
    //save data as a string to be restored
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.warn('RADAA save failed:', err.message);
  }
}

// Load saved data back into state and returns true if data existed.
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false; //no data

    const saved = JSON.parse(raw); // saved data string to object for access

    if (saved.user)        state.user        = saved.user; // assigns saved user info
    if (saved.posts)       state.posts       = saved.posts; // updates
    if (saved.userActions) state.userActions = saved.userActions;// user is recognised without logging in again
    if (saved.actionLog)   state.actionLog   = saved.actionLog;
    
//if the saved data type is in numerical value assigned a value in the platform
    if (typeof saved.totalActions === 'number') state.totalActions = saved.totalActions;
    if (typeof saved.streak       === 'number') state.streak       = saved.streak;
    if (typeof saved.lastBadgeCount === 'number') state.lastBadgeCount = saved.lastBadgeCount;

    if (Array.isArray(saved.activeDays)) {
      state.activeDays = new Set(saved.activeDays); // Array → Saved active days in array
    }

    return true;
  } catch (err) {
    console.warn('RADAA load failed:', err.message);
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
}

// Remove saved data completely on logout
function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

// Seed Data dummy data that is default before actual users post
const SEED_POSTS = [
  { id:101, type:'issue',  user:'James Mwangi',            area:'Kibera',     title:'Flooded Road Blocks School Access — Mathare North Rd',      desc:'The road to Mathare Primary School has been flooded for 3 days. Children cannot reach school safely. County roads urgently needed.',             date:'Today, 8:15am',        supports:47,  joins:0,   supported:false, joined:false, isOwn:false },
  { id:102, type:'voting', user:'Nairobi IEBC Office',      area:'Westlands',  title:'Ward Representative By-Election — 29 March 2025',           desc:'All registered voters in Westlands: bring your national ID. Polling stations open 7am–5pm. Check iebc.or.ke for your polling station.',       date:'Sat 29 Mar, 7am–5pm',  supports:120, joins:89,  supported:false, joined:false, isOwn:false },
  { id:103, type:'food',   user:'Feeding Nairobi Foundation',area:'Mathare',   title:'Free Maize Flour Distribution — Mathare 4A',                desc:'500 families receive 10kg maize flour and cooking oil at Mathare 4A Hall. Bring ID. Safaricom Foundation sponsored. First come first served.',  date:'Tomorrow, 9am–2pm',    supports:203, joins:156, supported:false, joined:false, isOwn:false },
  { id:104, type:'event',  user:'Nairobi Green Initiative', area:'Uhuru Park', title:'City Clean-Up & Tree Planting Day — #GreenNairobi2025',     desc:'500 trees to be planted around Uhuru Park and CBD. Bring gloves and water. Free breakfast for all participants. Join us!',                       date:'Sun 30 Mar, 7am',      supports:88,  joins:64,  supported:false, joined:false, isOwn:false },
  { id:105, type:'health', user:'Aga Khan Health Services', area:'Eastleigh',  title:'Free Cervical Cancer Screening — Eastleigh Health Centre',  desc:'Women 25–65 welcome. No appointment needed. Bring NHIF card if available. Subsidized by Ministry of Health.',                                  date:'Fri 28 Mar, 8am–4pm',  supports:76,  joins:42,  supported:false, joined:false, isOwn:false },
  { id:106, type:'issue',  user:'Residents of South B',     area:'South B',    title:'Water Shortage — 6 Days Without Supply',                    desc:'South B Estate has had no pipe water for 6 days. Nairobi Water has not responded. Residents buying expensive jerricans daily.',               date:'2 days ago',           supports:312, joins:0,   supported:false, joined:false, isOwn:false },
  { id:107, type:'event',  user:'Kenyatta University Alumni',area:'Kasarani',  title:'Youth Skills Boot Camp — IT & Entrepreneurship (Free)',      desc:'Free 3-day training for youth 18–30. Digital Marketing, Mobile Money, Coding & CV Writing. Register via WhatsApp 0700-RADAA.',               date:'Apr 5–7, 8am',         supports:134, joins:97,  supported:false, joined:false, isOwn:false },
  { id:108, type:'voting', user:'IEBC Civic Ed Team',        area:'Kayole',    title:'Voter Registration Drive — Kayole Ward',                    desc:'IEBC teams will be at Kayole Market from 9am. Register and update your details. All Kenyan citizens 18+ with valid ID welcome.',               date:'Sat 5 Apr, 9am–5pm',   supports:58,  joins:0,   supported:false, joined:false, isOwn:false },
  { id:109, type:'health', user:'Mama Afya Initiative',      area:'Korogocho', title:'Free Maternal Health Clinic — Korogocho Health Centre',     desc:'Free prenatal checkups, iron supplements and nutrition education for expectant mothers. Bring your maternal booklet.',                         date:'Every Wednesday, 8am', supports:91,  joins:38,  supported:false, joined:false, isOwn:false },
  { id:110, type:'issue',  user:'Ngara Residents Group',     area:'Ngara',     title:'Open Sewer Flooding — Ngara Estate Block C',                desc:'Broken sewer pipe flooded Block C playground for over a week. Children cannot play safely. Nairobi City Water has not responded.',            date:'3 days ago',           supports:145, joins:0,   supported:false, joined:false, isOwn:false },
];

const NGO_DATA = [
  {
    icon:'🍱',
    name:'Feeding Nairobi Foundation',
    desc:'Monthly food distribution to 5,000+ families across informal settlements.',
    area:'Mathare, Kibera',
    beneficiaries:'5,200',
    programs:3,
    status:'Active',
    team:'10 field coordinators, 45 volunteers',
    partners:'Safaricom Foundation, Local Chiefs, Churches',
    supporters:'Over 800 recurring small donors',
    imageUrl:'images/food.avif',
  },
  {
    icon:'📚',
    name:'Ujuzi Digital Africa',
    desc:'Digital literacy and tech skills for out-of-school youth aged 16–28.',
    area:'Eastleigh, Makadara',
    beneficiaries:'1,800',
    programs:5,
    status:'Active',
    team:'12 trainers, 3 program managers',
    partners:'County Youth Office, Tech Hubs, Universities',
    supporters:'Corporate CSR programs and alumni',
    imageUrl:'images/ujuzi.jpg',
  },
  {
    icon:'🏥',
    name:'Afya Bora Community Health',
    desc:'Free mobile clinics, maternal health and HIV testing services across Nairobi.',
    area:'Korogocho, Huruma',
    beneficiaries:'3,400',
    programs:8,
    status:'Active',
    team:'5 doctors, 18 nurses, 20 CHVs',
    partners:'County Health Dept, MOH, Global Fund',
    supporters:'Diaspora donors and community groups',
    imageUrl:'images/afyabora.jpg',
  },
  {
    icon:'🌱',
    name:'Nairobi Green Initiative',
    desc:'Urban tree planting, waste management and climate action city-wide.',
    area:'City-Wide',
    beneficiaries:'12,000',
    programs:4,
    status:'Active',
    team:'Core team of 8, 200+ volunteers',
    partners:'NEMA, City Parks, Youth Groups',
    supporters:'Climate activists and green businesses',
    imageUrl:'images/plant.jpg',
  },
  {
    icon:'👩‍💼',
    name:'Mama Na Biashara',
    desc:'Microloan and business mentorship for women entrepreneurs in Nairobi.',
    area:'Gikomba, Ngara',
    beneficiaries:'920',
    programs:2,
    status:'Recruiting',
    team:'Loan officers, mentors, paralegal',
    partners:'Local banks, Women SACCOs',
    supporters:'Impact investors and donors',
    imageUrl:'images/mamabiz.webp',
  },
  {
    icon:'🏘️',
    name:'Safe Shelter Initiative',
    desc:'Emergency housing and legal aid for displaced families.',
    area:'Mukuru, Kayole',
    beneficiaries:'640',
    programs:6,
    status:'Active',
    team:'Shelter managers, social workers, lawyers',
    partners:'Legal Aid NGOs, Faith groups',
    supporters:'Community fundraisers & well-wishers',
    imageUrl:'images/shelter.jpg',
  },
];

// Each badge has a function — it receives state and returns true/false
const BADGE_DEFS = [
  { id:'first',    emoji:'🌱', name:'Civic Seed',  desc:'First action taken',        check: s => s.totalActions >= 1 },
  { id:'voter',    emoji:'🗳️', name:'Voter',       desc:'Engage with voting',        check: s => s.userActions.votes >= 1 },
  { id:'watchdog', emoji:'🚨', name:'Watchdog',    desc:'Report 2 issues',           check: s => s.userActions.reports >= 2 },
  { id:'helper',   emoji:'🤝', name:'Helper',      desc:'Support 3 posts',           check: s => s.userActions.supported >= 3 },
  { id:'joiner',   emoji:'✅', name:'Joiner',      desc:'Join 2 events',             check: s => s.userActions.events >= 2 },
  { id:'star',     emoji:'⭐', name:'Rising Star', desc:'5 total actions',           check: s => s.totalActions >= 5 },
  { id:'fire',     emoji:'🔥', name:'Streaker',    desc:'3-day streak',              check: s => s.streak >= 3 },
  { id:'champ',    emoji:'🏆', name:'Champion',    desc:'10 total actions',          check: s => s.totalActions >= 10 },
  { id:'simba',    emoji:'🦁', name:'Simba',       desc:'20 total actions',          check: s => s.totalActions >= 20 },
  { id:'nation',   emoji:'🇰🇪', name:'Mwananchi',  desc:'30 total actions — Legend', check: s => s.totalActions >= 30 },
];

const TOP_AREAS = [
  { name:'Kibera', pct:85 }, { name:'Mathare', pct:72 },
  { name:'Westlands', pct:65 }, { name:'Eastleigh', pct:58 }, { name:'Kasarani', pct:44 },
];

// Login and Logout
function selectRole(role) {
  state.selectedRole = role;
  // Remove 'selected' from all cards, add to the clicked one
  document.querySelectorAll('.role-card').forEach(card => card.classList.remove('selected'));
  document.getElementById('role' + role).classList.add('selected');

  // Show extra NGO contact fields only when NGO role is selected
  const ngoFields = document.getElementById('ngoExtraFields');
  if (ngoFields) {
    ngoFields.classList.toggle('hidden', role !== 'ngo');
  }
}
//get username connected to id='LoginName' in index,htl
function doLogin() { 
  const name = document.getElementById('loginName').value.trim();// get what user typed and trim extra space
  const area = document.getElementById('loginArea').value.trim();

  const ngoName  = document.getElementById('loginNgoName')?.value.trim()  || '';
  const ngoEmail = document.getElementById('loginNgoEmail')?.value.trim() || '';
  const ngoPhone = document.getElementById('loginNgoPhone')?.value.trim() || '';
  const ngoSocial= document.getElementById('loginNgoSocial')?.value.trim()|| '';

  if (!name)             { showToast('Please enter your name', 'error'); return; }// no name error
  if (!state.selectedRole) { showToast('Please choose a role', 'error'); return; } //no role error

  if (state.selectedRole === 'ngo') {
    if (!ngoName)  { showToast('Please enter your organisation name', 'error'); return; }
    if (!ngoEmail) { showToast('Please enter your NGO email', 'error'); return; }
  }
 
  // Set the user object
  state.user = {
    name,
    area: area || 'Nairobi',
    role: state.selectedRole,
    bio: '',
    ngoName:  state.selectedRole === 'ngo' ? ngoName  : null,
    ngoEmail: state.selectedRole === 'ngo' ? ngoEmail : null,
    ngoPhone: state.selectedRole === 'ngo' ? ngoPhone : null,
    ngoSocial:state.selectedRole === 'ngo' ? ngoSocial: null,
  };

  // Check if  user already has saved data
  const hadSavedData = loadFromStorage(); //check data in localstorage
  const isReturning  = hadSavedData && state.user && state.user.name === name; //returning user
//A returning user whose data is in the platform
  if (isReturning) {
    showToast(`Welcome back, ${firstName(name)}! Progress restored. 🇰🇪`, 'success');
  } else {
    // New user — start with a fresh copy of seed posts
    state.posts        = JSON.parse(JSON.stringify(SEED_POSTS)); // object-string-object to get data from local storage
    state.userActions  = { reports:0, votes:0, events:0, supported:0 };
    state.totalActions = 0;
    state.streak       = 0;
    state.activeDays   = new Set();
    state.actionLog    = [];
    state.lastBadgeCount = 0;
    showToast(`Karibu, ${firstName(name)}! Harambee! 🇰🇪`, 'success');
  }

  markTodayActive(); // opened marked active
  saveToStorage(); //currents state saved
  showApp(); //displays homepage
  initApp(); //loads and updates data
  showPage('home'); //page displayed
}

// logging out
function doLogout() {
  destroyAllCharts(); //resets charts
  clearStorage(); //clear saved data

  // Reset state to blank
  state.user = null;
  state.posts = [];
  state.userActions = { reports:0, votes:0, events:0, supported:0 };
  state.totalActions = 0;
  state.streak = 0;
  state.activeDays = new Set();
  state.actionLog = [];
  state.selectedRole = null;
  state.lastBadgeCount = 0;

  // Reset the login form connected to html
  document.getElementById('loginName').value = '';
  document.getElementById('loginArea').value = '';
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
  document.querySelectorAll('.ngo-only').forEach(el => el.classList.add('hidden'));

  // Swap screens connected to html and css class
  document.getElementById('app').classList.replace('active', 'hidden');
  document.getElementById('loginScreen').classList.replace('hidden', 'active');
}

// Show the app screen and populate the navbar
function showApp() {
  document.getElementById('loginScreen').classList.replace('active', 'hidden');
  document.getElementById('app').classList.replace('hidden', 'active');
  document.getElementById('navName').textContent      = firstName(state.user.name); //username added to navbar
  document.getElementById('navAvatar').textContent    = state.user.name[0].toUpperCase(); //avatar added to navbar
  document.getElementById('navAreaBadge').textContent = state.user.area; //are added to navbar

  //show elements only for NGO users for ngo user
  if (state.user.role === 'ngo') {
    document.querySelectorAll('.ngo-only').forEach(el => el.classList.remove('hidden'));
  } else {
    // hide NGO-only controls for citizens (citizens can only like/join/share)
    document.querySelectorAll('.ngo-only').forEach(el => el.classList.add('hidden'));
  }
}

// Restoring page on session
(function restoreSessionOnLoad() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return; // nothing saved login shown normally

  try {
    const saved = JSON.parse(raw); // string to object
    if (!saved || !saved.user || !saved.user.name) return;

    // Put saved data back into state for returning user
    state.user          = saved.user;
    state.selectedRole  = saved.user.role;
    state.posts         = saved.posts       || JSON.parse(JSON.stringify(SEED_POSTS));//object-string-object
    state.userActions   = saved.userActions || { reports:0, votes:0, events:0, supported:0 };
    state.totalActions  = saved.totalActions || 0;
    state.streak        = saved.streak      || 0;
    state.actionLog     = saved.actionLog   || [];
    state.lastBadgeCount = saved.lastBadgeCount || 0;
    state.activeDays    = new Set(Array.isArray(saved.activeDays) ? saved.activeDays : []);//

    markTodayActive();
    incrementStreak();
    showApp();
    initApp();
    showPage('home');
    showToast(`Welcome back, ${firstName(state.user.name)}! 🔥`, 'success');

  } catch (err) {
    console.warn('Session restore failed — starting fresh.', err.message);
    localStorage.removeItem(STORAGE_KEY);
  }
})();
//get saved data 
// App initialization load saved data update app state
function initApp() {
  renderTrending();
  animateStatCounters();
  renderHomeCharts();
  renderFeed();
  renderSidebar();
  renderDashboard();
  renderProfile();
  renderNGO();
  startAutoRefresh();
  saveToStorage();
}

// Navigating Page
function showPage(page) {
  state.currentPage = page;

  // Hide every page, then show only the one we want
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.classList.add('hidden');
  });
// activates chosen page
  const target = document.getElementById(page + 'Page');
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }

  // Highlight the correct nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    const isActive = (link.getAttribute('onclick') || '').includes(`'${page}'`);
    link.classList.toggle('active', isActive);
  });

  // Charts must render after their canvas is visible
  if (page === 'dashboard')
    { setTimeout(renderDashboardChart, 80);
    }
  if (page === 'profile')  {
     setTimeout(renderProfileChart, 80);
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Home page grid cards
function renderTrending() {
  const container = document.getElementById('trendingGrid');
  if (!container) return;
  container.innerHTML = state.posts.slice(0, 6).map(buildTrendingCard).join('');
}

function buildTrendingCard(post) {
  const labels = { issue:'Issue', voting:'Voting', food:'Food Aid', event:'Event', health:'Health' };
  const joinBtn = post.type !== 'issue'
    ? `<button class="tc-btn ${post.joined ? 'active' : ''}" onclick="toggleJoin(${post.id})" id="tc-join-${post.id}">
         ${post.joined ? '✅ Joined' : '✔ Join'}
       </button>`
    : '';

  return `
    <div class="trending-card type-${post.type}" id="tc-${post.id}">
      <div class="tc-header">
        <span class="tc-type-badge">${labels[post.type] || post.type}</span>
        <span class="tc-area">📍 ${post.area}</span>
      </div>
      <div class="tc-title">${post.title}</div>
      <div class="tc-desc">${post.desc.slice(0, 100)}…</div>
      <div class="tc-footer">
        <div class="tc-actions">
          <button class="tc-btn ${post.supported ? 'active' : ''}" onclick="toggleSupport(${post.id})" id="tc-sup-${post.id}">
            ❤️ ${post.supports}
          </button>
          ${joinBtn}
        </div>
        <span class="tc-meta">${post.date}</span>
      </div>
    </div>`;
}
// Statistics
function animateStatCounters() {
  const targets = {
    statReports: 4280,
    statVotes:   12840,
    statEvents:  880,
    statNGOs:    340,
  };

  for (const [id, target] of Object.entries(targets)) {
    const el = document.getElementById(id); // loops through key-value pair like supports
    if (!el) continue; //skip if non exsistent

    let current = 0;
    const step = Math.ceil(target / 60);

    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current.toLocaleString(); // adds comma
      if (current >= target) clearInterval(timer);
    }, 20);
  }
}

// Charts
//Destroy old chart before making a new one
function makeChart(key, canvas, config) {
  if (state.charts[key]) state.charts[key].destroy();
  state.charts[key] = new Chart(canvas, config);
}

function renderHomeCharts() {
  Chart.defaults.color       = '#9ea89c';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.07)';

  const colors = ['#E8001A','#00A550','#C8A84B','#4096FF','#F5A623','#9B59B6'];

  const pieEl = document.getElementById('pieChart');
  if (pieEl) makeChart('homePie', pieEl, {
    type: 'doughnut',
    data: {
      labels:   ['Infrastructure','Water','Security','Health','Environment','Education'],
      datasets: [{ data:[32,21,15,14,10,8], backgroundColor:colors, borderWidth:0, hoverOffset:8 }],
    },
    options: { responsive:true, plugins:{ legend:{ position:'bottom' } } },
  });

  const barEl = document.getElementById('barChart');
  if (barEl) makeChart('homeBar', barEl, {
    type: 'bar',
    data: {
      labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      datasets: [
        { label:'Reports',   data:[45,62,38,71,55,88,42], backgroundColor:'rgba(232,0,26,0.75)',  borderRadius:6 },
        { label:'Events',    data:[28,35,52,40,60,95,30], backgroundColor:'rgba(0,165,80,0.75)',  borderRadius:6 },
        { label:'Voting',    data:[20,40,28,55,35,65,25], backgroundColor:'rgba(200,168,75,0.75)',borderRadius:6 },
      ],
    },
    options: {
      responsive: true,
      scales: { x:{ grid:{ display:false } }, y:{ grid:{ color:'rgba(255,255,255,0.05)' } } },
      plugins: { legend:{ position:'bottom' } },
    },
  });

  const dEl = document.getElementById('doughnutChart');
  if (dEl) makeChart('homeDoughnut', dEl, {
    type: 'pie',
    data: {
      labels:   ['Kibera','Mathare','Westlands','Eastleigh','Kasarani','Others'],
      datasets: [{ data:[22,18,16,14,12,18], backgroundColor:colors, borderWidth:0, hoverOffset:8 }],
    },
    options: { responsive:true, plugins:{ legend:{ position:'bottom' } } },
  });
}

// Live Feed
function renderFeed() {
  const container = document.getElementById('feedContainer');
  if (!container) return;

  // Filter posts 
  const visible = state.filter === 'all'
    ? state.posts
    : state.posts.filter(post => post.type === state.filter);

  if (visible.length === 0) {
    container.innerHTML = `
      <div style="text-align:center;padding:64px;color:var(--text-muted)">
        <div style="font-size:3rem;margin-bottom:16px">🔍</div>
        <p>No posts in this category yet. Be the first to post!</p>
      </div>`;
    return;
  }

  container.innerHTML = visible.map((post, index) => buildFeedCard(post, index)).join('');
}

function buildFeedCard(post, index = 0) {
  const labels     = { issue:'Issue', voting:'Voting', food:'Food Aid', event:'Event', health:'Health' };
  const typeIcons  = { issue:'fa-circle-exclamation', voting:'fa-person-booth', food:'fa-bowl-food', event:'fa-leaf', health:'fa-heart-pulse' };
  const canEdit    = post.isOwn || (state.user && state.user.role === 'ngo');
  const heartClass = post.supported ? 'fa-solid fa-heart' : 'fa-regular fa-heart';

  const editButtons = canEdit ? `
    <div class="fc-controls">
      <button class="tc-btn btn-sm" onclick="openEditModal(${post.id})" title="Edit">
        <i class="fa-solid fa-pen-to-square"></i>
      </button>
      <button class="tc-btn btn-sm delete" onclick="deletePost(${post.id})" title="Delete">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>` : '';

  const joinButton = post.type !== 'issue' ? `
    <button class="fc-action-btn ${post.joined ? 'active' : ''}"
            onclick="toggleJoin(${post.id})" id="feed-join-${post.id}">
      ${post.joined
        ? '<i class="fa-solid fa-circle-check"></i> Joined'
        : '<i class="fa-regular fa-circle-plus"></i> Join'}
    </button>` : '';

  return `
    <div class="feed-card type-${post.type}" id="fc-${post.id}"
         style="animation-delay:${index * 0.05}s">
      <div class="fc-header">
        <div class="fc-user">
          <div class="fc-avatar">${post.user[0].toUpperCase()}</div>
          <div class="fc-user-info">
            <strong>${post.user}</strong>
            <span><i class="fa-solid fa-location-dot" style="font-size:.7rem;margin-right:3px"></i>
              ${post.area} · ${post.date}
            </span>
          </div>
        </div>
        ${editButtons}
      </div>
      ${post.imageUrl ? `
      <div class="fc-image-wrap">
        <img src="${post.imageUrl}" alt="Post image" class="fc-image"/>
      </div>` : ''}
      <div class="fc-title">${post.title}</div>
      <div class="fc-desc">${post.desc}</div>
      <div class="fc-footer">
        <div class="fc-tags">
          <span class="fc-tag">
            <i class="fa-solid ${typeIcons[post.type] || 'fa-tag'}" style="margin-right:4px"></i>
            ${labels[post.type] || post.type}
          </span>
          <span class="fc-tag">📍 ${post.area}</span>
        </div>
        <div class="fc-actions">
          <button class="fc-action-btn ${post.supported ? 'supported' : ''}"
                  onclick="toggleSupport(${post.id})" id="feed-sup-${post.id}">
            <i class="${heartClass}"></i>
            <span id="sup-count-${post.id}">${post.supports}</span>
          </button>
          ${joinButton}
        </div>
      </div>
    </div>`;
}

function filterFeed(type, btn) {
  state.filter = type;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderFeed();
}

// Sidebar
function renderSidebar() {
  const topAreas = document.getElementById('topAreas');
  if (topAreas) {
    topAreas.innerHTML = TOP_AREAS.map(area => `
      <div class="area-item">
        <div>
          <div style="font-weight:600;font-size:.85rem">${area.name}</div>
          <div class="area-bar" style="width:${area.pct}%;max-width:130px;margin-top:4px"></div>
        </div>
        <span style="color:var(--accent-green);font-weight:700;font-size:.82rem">${area.pct}%</span>
      </div>`).join('');
  }
}

// Support and Join
function toggleSupport(postId) {
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;

  if (post.supported) {
    // Undo support
    post.supported = false;
    post.supports--;
    state.userActions.supported = Math.max(0, state.userActions.supported - 1);
    state.totalActions = Math.max(0, state.totalActions - 1);
    removeFromLog(postId, 'supported');
    showToast('Support removed', 'info');
  } else {
    // Add support
    post.supported = true;
    post.supports++;
    state.userActions.supported++;
    state.totalActions++;
    markTodayActive();
    addToLog({ icon:'❤️', type:'supported', label:`Supported: ${post.title}`, postId });
    showToast('❤️ Support registered!', 'success');
    incrementStreak();
  }

  refreshPostButtons(post);
  updateAllDisplays();
  checkBadges();
  autoSave();
}

function toggleJoin(postId) {
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;

  if (post.joined) {
    // Undo join
    post.joined = false;
    post.joins--;
    state.userActions.events = Math.max(0, state.userActions.events - 1);
    if (post.type === 'voting') state.userActions.votes = Math.max(0, state.userActions.votes - 1);
    state.totalActions = Math.max(0, state.totalActions - 1);
    removeFromLog(postId, 'joined');
    showToast('Left the event', 'info');
  } else {
    // Join
    post.joined = true;
    post.joins++;
    state.userActions.events++;
    if (post.type === 'voting') state.userActions.votes++;
    state.totalActions++;
    markTodayActive();
    addToLog({ icon:'✅', type:'joined', label:`Joined: ${shortenTitle(post.title)}`, postId });
    showToast(`✅ Joined: ${shortenTitle(post.title)}`, 'success');
    incrementStreak();
  }

  refreshPostButtons(post);
  updateAllDisplays();
  checkBadges();
  autoSave();
}

// Update only the buttons on a specific post card 
function refreshPostButtons(post) {
  // Feed card — support button
  const supCount = document.getElementById(`sup-count-${post.id}`);
  if (supCount) supCount.textContent = post.supports;

  const feedSup = document.getElementById(`feed-sup-${post.id}`);
  if (feedSup) {
    feedSup.className = `fc-action-btn ${post.supported ? 'supported' : ''}`;
    const icon = feedSup.querySelector('i');
    if (icon) icon.className = post.supported ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  }

  const feedJoin = document.getElementById(`feed-join-${post.id}`);
  if (feedJoin) {
    feedJoin.className = `fc-action-btn ${post.joined ? 'active' : ''}`;
    feedJoin.innerHTML = post.joined
      ? '<i class="fa-solid fa-circle-check"></i> Joined'
      : '<i class="fa-regular fa-circle-plus"></i> Join';
  }

  // Trending card buttons
  const tcSup = document.getElementById(`tc-sup-${post.id}`);
  if (tcSup) { tcSup.innerHTML = `❤️ ${post.supports}`; tcSup.className = `tc-btn ${post.supported ? 'active' : ''}`; }

  const tcJoin = document.getElementById(`tc-join-${post.id}`);
  if (tcJoin) { tcJoin.className = `tc-btn ${post.joined ? 'active' : ''}`; tcJoin.textContent = post.joined ? '✅ Joined' : '✔ Join'; }

  // Home page news card counters
  const ncSup = document.getElementById(`nc-sup-${post.id}`);
  if (ncSup) ncSup.textContent = post.supports;
}

// poast- add edit
function openAddModal() {
  if (!state.user || state.user.role !== 'ngo') {
    showToast('Only verified NGOs can post. Citizens participate by supporting, joining and sharing.', 'error');
    return;
  }
  state.editingPostId = null;
  document.getElementById('modalTitle').textContent  = 'Post Activity';
  document.getElementById('modalSubmit').textContent = 'Post →';
  clearModalFields();
  if (state.user) document.getElementById('modalArea').value = state.user.area;
  document.getElementById('modal').classList.remove('hidden');
}

function openEditModal(id) {
  const post = state.posts.find(p => p.id === id);
  if (!post) return; //no paragraph=no post =function stopped
  state.editingPostId = id;
  document.getElementById('modalTitle').textContent  = 'Edit Post';
  document.getElementById('modalSubmit').textContent = 'Save →';
  document.getElementById('modalType').value   = post.type;
  document.getElementById('modalTitle2').value = post.title;
  document.getElementById('modalDesc').value   = post.desc;
  document.getElementById('modalArea').value   = post.area;
  document.getElementById('modalDate').value   = post.date;
   const imgField = document.getElementById('modalImage');
   if (imgField) imgField.value = post.imageUrl || '';
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  state.editingPostId = null;
}

function submitPost() {
  const type  = document.getElementById('modalType').value;
  const title = document.getElementById('modalTitle2').value.trim();
  const desc  = document.getElementById('modalDesc').value.trim();
  const area  = document.getElementById('modalArea').value.trim() || state.user?.area || 'Nairobi';
  const date  = document.getElementById('modalDate').value.trim() || 'Just now';
  const imageUrl = document.getElementById('modalImage')?.value.trim() || '';

  if (!title) { showToast('Please add a title', 'error'); return; }
  if (!desc)  { showToast('Please add a description', 'error'); return; }

  if (state.editingPostId) {
    // Update existing post
    const post = state.posts.find(p => p.id === state.editingPostId);
    if (post) Object.assign(post, { type, title, desc, area, date, imageUrl });
    showToast('✏️ Post updated!', 'success');
  } else {
    // Create a new post
    const newPost = {
      id: Date.now(), type, title, desc, area, date,
      user: state.user.name,
      imageUrl,
      supports: 0, joins: 0,
      supported: false, joined: false, isOwn: true,
    };
    state.posts.unshift(newPost); // Add to the front of the array

    if (type === 'issue') {
      state.userActions.reports++;
      addToLog({ icon:'🚨', type:'reported', label:`Reported: ${title}`, postId: newPost.id });
    } else {
      addToLog({ icon:'📝', type:'posted', label:`Posted: ${title}`, postId: newPost.id });
    }

    state.totalActions++;
    markTodayActive();
    incrementStreak();
    showToast('🎉 Activity posted!', 'success');
  }

  closeModal();
  renderFeed();
  renderTrending();
  updateAllDisplays();
  checkBadges();
  autoSave();
}

function deletePost(id) {
  if (!confirm('Delete this post? This cannot be undone.')) return; //not confirmed

  state.posts = state.posts.filter(p => p.id !== id);
  document.getElementById(`fc-${id}`)?.remove();
  document.getElementById(`tc-${id}`)?.remove();

  showToast('Post deleted', 'info');
  renderTrending();
  autoSave();
}

function clearModalFields() {
  ['modalTitle2','modalDesc','modalArea','modalDate','modalImage'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('modalType').value = 'issue';
}

// Streak System
// Mark today as an active day 
function markTodayActive() {
  state.activeDays.add(todayStr());
}

// Count consecutive active days backwards from today
function incrementStreak() {
  let count = 0; // start counter
  const today = new Date(); //gets day counter started

  for (let i = 0; i < 365; i++) {
    const d = new Date(today); //365 days loop plus copy of date today
    d.setDate(today.getDate() - i); //subtracts day from today
    if (state.activeDays.has(dateStr(d))) {
      count++;//continous active days adding
    } else {
      break; // stop at first gap
    }
  }

  state.streak = count;

  const dashStreak = document.getElementById('dashStreak'); //select sreak in html
  if (dashStreak) dashStreak.innerHTML = `<i class="fa-solid fa-fire"></i> ${count} Day Streak`; //count streak

  updateProfileStreak(); //updates
  renderStreakCalendar();
}

function todayStr()  { return dateStr(new Date()); }
function dateStr(d)  { return d.toISOString().split('T')[0]; } // date

// Logaction
function addToLog(entry) {
  entry.time = 'Just now';
  state.actionLog.unshift(entry);           // add to front
  if (state.actionLog.length > 20) state.actionLog.pop(); 
  renderRecentActions();
}

function removeFromLog(postId, type) {
  state.actionLog = state.actionLog.filter(e => !(e.postId === postId && e.type === type));
  renderRecentActions();
}

function renderRecentActions() {
  const container = document.getElementById('recentActions');
  if (!container) return;

  const faIcons = {
    '🚨': '<i class="fa-solid fa-triangle-exclamation" style="color:var(--accent-red)"></i>',
    '❤️': '<i class="fa-solid fa-heart" style="color:var(--accent-red)"></i>',
    '✅': '<i class="fa-solid fa-circle-check" style="color:var(--accent-green)"></i>',
    '🗳️': '<i class="fa-solid fa-person-booth" style="color:var(--accent-gold)"></i>',
    '📝': '<i class="fa-solid fa-pen-to-square" style="color:#4096FF"></i>',
    '🤝': '<i class="fa-solid fa-handshake-angle" style="color:var(--accent-green)"></i>',
  };

  // User plus seed history
  const seedHistory = [
    { icon:'🚨', label:'Reported: Flooded road in Kibera',  time:'2 days ago' },
    { icon:'❤️', label:'Supported: Feeding Nairobi Drive',   time:'3 days ago' },
    { icon:'✅', label:'Joined: Youth Skills Boot Camp',     time:'4 days ago' },
    { icon:'🗳️', label:'Engaged: Voter Registration Drive',  time:'5 days ago' },
  ];

  const combined = [...state.actionLog, ...seedHistory].slice(0, 7);

  container.innerHTML = combined.map(a => {
    const iconHtml = faIcons[a.icon] || '<i class="fa-solid fa-bolt" style="color:var(--accent-gold)"></i>';
    return `
      <div class="action-item">
        <div class="action-icon">${iconHtml}</div>
        <div class="action-text">${a.label}</div>
        <div class="action-time">${a.time}</div>
      </div>`;
  }).join('');
}

// Dashboard
function renderDashboard() {
  renderDashStatCards();
  renderRecentActions();
  renderStreakCalendar();
  renderBadgeGrid();
  renderLeaderboard();
}

function renderDashStatCards() {
  const a   = state.userActions;
  const el  = document.getElementById('dashStats');
  if (!el) return;

  el.innerHTML = `
    <div class="dash-stat-card" data-icon="🚨">
      <div class="dsc-label">Issues Reported</div>
      <div class="dsc-value red">${a.reports}</div>
      <div class="dsc-change">${a.reports > 0 ? '↑ Community watchdog' : 'Report your first issue'}</div>
    </div>
    <div class="dash-stat-card" data-icon="🗳️">
      <div class="dsc-label">Voting Actions</div>
      <div class="dsc-value gold">${a.votes}</div>
      <div class="dsc-change">${a.votes > 0 ? '✓ Active voter' : 'Join a voting event'}</div>
    </div>
    <div class="dash-stat-card" data-icon="🌱">
      <div class="dsc-label">Events Joined</div>
      <div class="dsc-value green">${a.events}</div>
      <div class="dsc-change">${a.events > 0 ? '↑ Community active' : 'Join your first event'}</div>
    </div>
    <div class="dash-stat-card" data-icon="❤️">
      <div class="dsc-label">Posts Supported</div>
      <div class="dsc-value blue">${a.supported}</div>
      <div class="dsc-change">${a.supported > 0 ? '↑ Solidarity!' : 'Support a post'}</div>
    </div>`;
}

function updateAllDisplays() {
  renderDashStatCards();
  renderImpactStats();
  renderBadgeGrid();
  updateCongrats();
  renderProfileBadges();
  updateProfileStreak();
  renderLeaderboard();
}

function autoSave() {
  saveToStorage();
}

// Dashboard chart
function renderDashboardChart() {
  const canvas = document.getElementById('myActivityChart');
  if (!canvas) return;
  if (state.charts.dashActivity) state.charts.dashActivity.destroy();

  const labels = [];
  const data   = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    labels.push(i === 0 ? 'Today' : d.toLocaleDateString('en', { weekday: 'short' }));
    data.push(state.activeDays.has(dateStr(d)) ? (i === 0 ? Math.max(state.totalActions, 1) : 1) : 0);
  }

  state.charts.dashActivity = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Actions',
        data,
        borderColor: '#00A550',
        backgroundColor: 'rgba(0,165,80,0.12)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#00A550',
        pointRadius: 6,
        pointHoverRadius: 9,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, min: 0, ticks: { stepSize: 1 } },
      },
    },
  });
}

// Streak calendar
function renderStreakCalendar() {
  const container = document.getElementById('streakCalendar');
  if (!container) return;

  const today    = new Date();
  const year     = today.getFullYear();
  const start    = new Date(year, 0, 1);
  const daysInYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
  const months   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  let html = `
    <div class="year-cal-wrap">
      <div class="year-cal-months">${months.map(m => `<span class="ycal-month">${m}</span>`).join('')}</div>
      <div class="year-cal-grid">`;

  for (let i = 0; i < daysInYear; i++) {
    const d      = new Date(start);
    d.setDate(i + 1);
    const ds     = dateStr(d);
    const isToday   = ds === todayStr();
    const isActive  = state.activeDays.has(ds);
    const isFuture  = d > today;
    const label     = d.toLocaleDateString('en-KE', { weekday:'short', day:'numeric', month:'short' });

    let cls = 'ycal-day';
    if (isFuture)      cls += ' future';
    else if (isActive) cls += ' active';
    else               cls += ' inactive';
    if (isToday)       cls += ' today';

    html += `<div class="${cls}" title="${label}"></div>`;
  }

  html += `</div>
    <div class="ycal-legend">
      <span class="ycal-dot inactive"></span> No activity &nbsp;
      <span class="ycal-dot active"></span> Active day &nbsp;
      <span class="ycal-dot today-dot"></span> Today
    </div>
    </div>`;

  container.innerHTML = html;
}

// Earn a badge or not 
// Run badge check and mark it earned or not
function computeBadges() {
  return BADGE_DEFS.map(b => ({ ...b, earned: b.check(state) }));
}

function checkBadges() {
  const badges     = computeBadges();
  const earnedNow  = badges.filter(b => b.earned).length;

  if (earnedNow > state.lastBadgeCount) {
    const newest = badges.filter(b => b.earned)[earnedNow - 1];
    if (newest) setTimeout(() => showToast(`🏅 Badge: ${newest.emoji} ${newest.name}!`, 'success'), 400);
  }
  state.lastBadgeCount = earnedNow;
  renderBadgeGrid();
  renderProfileBadges();
}

function renderBadgeGrid() {
  const container = document.getElementById('badgesGrid');
  if (!container) return;
  container.innerHTML = computeBadges().map(b => `
    <div class="badge-item ${b.earned ? 'earned' : 'locked'}" title="${b.desc}">
      <span class="badge-emoji">${b.emoji}</span>
      <span class="badge-name">${b.name}</span>
    </div>`).join('');
}

// Profile
function renderProfile() {
  if (!state.user) return;
  const { name, area, role } = state.user;

  document.getElementById('profileAvatarBig').textContent = name[0].toUpperCase();
  document.getElementById('profileName').textContent      = name;
  document.getElementById('profileRole').innerHTML        =
    `${role === 'ngo' ? 'NGO / Organisation' : 'Citizen'} · <span id="profileArea">${area}</span>`;

  renderProfileBadges();
  renderImpactStats();
  updateProfileStreak();
  updateCongrats();

  // NGO contact card
  const ngoCard = document.getElementById('ngoContactCard');
  const ngoDetails = document.getElementById('ngoContactDetails');
  if (ngoCard && ngoDetails) {
    if (role === 'ngo') {
      ngoCard.classList.remove('hidden');
      const u = state.user;
      ngoDetails.innerHTML = `
        <p><strong>Organisation:</strong> ${u.ngoName || 'Not set'}</p>
        <p><strong>Email:</strong> ${u.ngoEmail || 'Not set'}</p>
        <p><strong>Phone:</strong> ${u.ngoPhone || 'Not set'}</p>
        <p><strong>Social:</strong> ${u.ngoSocial || 'Not set'}</p>
      `;
    } else {
      ngoCard.classList.add('hidden');
      ngoDetails.innerHTML = '';
    }
  }

  renderLeaderboard();
}

function renderProfileBadges() {
  const earned    = computeBadges().filter(b => b.earned).slice(0, 5);
  const container = document.getElementById('profileBadgesRow');
  if (!container) return;
  container.innerHTML = earned.length
    ? earned.map(b => `<span class="profile-badge-chip">${b.emoji} ${b.name}</span>`).join('')
    : `<span class="profile-badge-chip" style="opacity:.5">No badges yet</span>`;
}

function renderImpactStats() {
  const a   = state.userActions;
  const tot = state.totalActions;
  const container = document.getElementById('impactStats');
  if (!container) return;

  const rows = [
    { label:'Issues Reported', val:a.reports,  max:10, color:'var(--accent-red)' },
    { label:'Events Joined',   val:a.events,   max:10, color:'var(--accent-green)' },
    { label:'Posts Supported', val:a.supported,max:10, color:'var(--accent-gold)' },
    { label:'Total Actions',   val:tot,        max:30, color:'#4096FF' },
  ];

  container.innerHTML = rows.map(r => {
    const width = Math.min(Math.round((r.val / r.max) * 100), 100);
    return `
      <div>
        <div class="is-row">
          <span class="is-label">${r.label}</span>
          <span class="is-val" style="color:${r.color}">${r.val}</span>
        </div>
        <div class="is-bar-wrap">
          <div class="is-bar" style="width:${width}%;background:${r.color}"></div>
        </div>
      </div>`;
  }).join('');
}

function updateProfileStreak() {
  const numEl = document.getElementById('streakNumber');
  if (numEl) numEl.textContent = state.streak;

  const msgEl = document.getElementById('streakMessage');
  if (msgEl) {
    const name = firstName(state.user?.name || 'Citizen');
    const s    = state.streak;
    if (s === 0)     msgEl.textContent = `Welcome, ${name}! Start your streak today. 🌱`;
    else if (s < 3)  msgEl.textContent = `Great start, ${name}! Keep going!`;
    else if (s < 7)  msgEl.textContent = `${s} days strong, ${name}! Nairobi thanks you. 🔥`;
    else             msgEl.textContent = `LEGENDARY, ${name}! ${s} days of action. Harambee! 🇰🇪`;
  }

  const progEl = document.getElementById('streakProgressBar');
  if (progEl) {
    const pct = Math.min(Math.round((state.streak / 30) * 100), 100);
    progEl.style.setProperty('--progress', `${pct}%`);
  }

  const dashStreak = document.getElementById('dashStreak');
  if (dashStreak) dashStreak.innerHTML = `<i class="fa-solid fa-fire"></i> ${state.streak} Day Streak`;
}

function updateCongrats() {
  const tot    = state.totalActions;
  const levels = [
    { min:0,  icon:'🌱', title:'Getting Started',    desc:'Complete your first action to earn a badge!' },
    { min:1,  icon:'⭐', title:'Rising Star',         desc:'Your first step! Nairobi is watching.' },
    { min:5,  icon:'🔥', title:'Civic Activist',      desc:'Your voice is shaping the community.' },
    { min:10, icon:'🏆', title:'Community Champion',  desc:'Amazing! You inspire others to act.' },
    { min:20, icon:'🦁', title:'Simba wa Mtaa',       desc:'Real change is happening because of you.' },
    { min:30, icon:'🇰🇪', title:'Mwananchi wa Mwaka', desc:'LEGEND! You embody the Harambee spirit.' },
  ];

  const level = [...levels].reverse().find(l => tot >= l.min) || levels[0];
  const lb = document.getElementById('levelBadge');
  const lt = document.getElementById('levelTitle');
  const ld = document.getElementById('levelDesc');
  if (lb) lb.textContent = level.icon;
  if (lt) lt.textContent = level.title;
  if (ld) ld.textContent = level.desc;
}

function renderProfileChart() {
  const canvas = document.getElementById('profilePie');
  if (!canvas) return;
  if (state.charts.profilePie) state.charts.profilePie.destroy();
  const a = state.userActions;

  state.charts.profilePie = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels:   ['Reported','Joined','Supported','Voting'],
      datasets: [{
        data: [
          Math.max(a.reports, 0.1),
          Math.max(a.events, 0.1),
          Math.max(a.supported, 0.1),
          Math.max(a.votes, 0.1),
        ],
        backgroundColor: ['#E8001A','#00A550','#C8A84B','#4096FF'],
        borderWidth: 0,
        hoverOffset: 10,
      }],
    },
    options: { responsive:true, plugins:{ legend:{ position:'bottom' } } },
  });
};

// Profile Edit
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
  const name = document.getElementById('editName').value.trim();
  const area = document.getElementById('editArea').value.trim();
  const bio  = document.getElementById('editBio').value.trim();
  if (!name) { showToast('Name cannot be empty', 'error'); return; }

  state.user.name = name;
  state.user.area = area || state.user.area;
  state.user.bio  = bio;

  document.getElementById('navName').textContent       = firstName(name);
  document.getElementById('navAvatar').textContent     = name[0].toUpperCase();
  document.getElementById('navAreaBadge').textContent  = state.user.area;

  renderProfile();
  closeEditProfile();
  showToast('✅ Profile saved!', 'success');
  autoSave();
}

//DE'NGO
function renderNGO() {
  const container = document.getElementById('ngoGrid');
  if (!container) return;

  container.innerHTML = NGO_DATA.map((ngo, i) => `
    <div class="ngo-card">
      <div class="ngo-card-header">
        <div class="ngo-icon">${ngo.icon}</div>
        <span class="ngo-status">${ngo.status}</span>
      </div>
      <div class="ngo-name">${ngo.name}</div>
      ${ngo.imageUrl ? `<div class="ngo-img-wrap"><img src="${ngo.imageUrl}" alt="${ngo.name}" class="ngo-img"/></div>` : ''}
      <div class="ngo-desc">${ngo.desc}</div>
      <div class="ngo-meta">
        <span>📍 ${ngo.area}</span>
        <span>👥 ${ngo.beneficiaries} beneficiaries</span>
        <span>📋 ${ngo.programs} programs</span>
      </div>
      <div class="ngo-meta" style="flex-direction:column;align-items:flex-start;gap:4px">
        <span><strong>Team:</strong> ${ngo.team}</span>
        <span><strong>Partners:</strong> ${ngo.partners}</span>
        <span><strong>Supporters:</strong> ${ngo.supporters}</span>
      </div>
      <div class="ngo-footer">
        <button class="btn-primary btn-sm" id="ngo-btn-${i}" onclick="supportNGO(${i}, this)">
          <i class="fa-solid fa-hand-holding-heart"></i> Support
        </button>
        <button class="btn-outline btn-sm">Learn More</button>
      </div>
    </div>`).join('');
}

function supportNGO(index, btn) {
  if (btn.dataset.supported) { showToast('Already supporting this NGO', 'info'); return; }
  btn.dataset.supported = 'true';
  btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Supporting';

  state.userActions.supported++;
  state.totalActions++;
  markTodayActive();
  incrementStreak();
  addToLog({ icon:'🤝', type:'supported', label:`Supporting NGO: ${NGO_DATA[index].name}`, postId: -index });
  showToast(`🤝 Now supporting ${NGO_DATA[index].name}!`, 'success');
  updateAllDisplays();
  checkBadges();
  autoSave();
}

function updateStorageMeta() {
  const el = document.getElementById('storageMeta');
  if (!el) return;
 
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      el.innerHTML = '<span style="color:var(--text-muted)">No save file yet. Data is saved automatically.</span>';
      return;
    }
    const sizeKB = (raw.length / 1024).toFixed(2);
    const data   = JSON.parse(raw);
    const posts  = data.posts || [];
 
    el.innerHTML = `
      <div class="storage-grid">
        <div class="sg-item"><span class="sg-val green">${sizeKB} KB</span><span class="sg-lbl">Save Size</span></div>
        <div class="sg-item"><span class="sg-val">${posts.length}</span><span class="sg-lbl">Posts Stored</span></div>
        <div class="sg-item"><span class="sg-val red">${posts.filter(p => p.isOwn).length}</span><span class="sg-lbl">Your Posts</span></div>
        <div class="sg-item"><span class="sg-val red">${posts.filter(p => p.supported).length}</span><span class="sg-lbl">Supported</span></div>
        <div class="sg-item"><span class="sg-val green">${posts.filter(p => p.joined).length}</span><span class="sg-lbl">Joined</span></div>
        <div class="sg-item"><span class="sg-val gold">${(data.activeDays || []).length}</span><span class="sg-lbl">Active Days</span></div>
      </div>
      <p style="font-size:.75rem;color:var(--text-muted);margin-top:10px">
        Last auto-saved: ${new Date().toLocaleString('en-KE')}
      </p>`;
  } catch {
    el.innerHTML = '<span style="color:var(--accent-red)">Save file could not be read.</span>';
  }
}
 
function inspectStorage() {
  const pre = document.getElementById('storagePreview');
  if (!pre) return;
 
  if (!pre.classList.contains('hidden')) { pre.classList.add('hidden'); return; }
 
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) { showToast('No save file found yet.', 'info'); return; }
 
  pre.textContent = JSON.stringify(JSON.parse(raw), null, 2);
  pre.classList.remove('hidden');
}
 
function exportSave() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) { showToast('Nothing to export yet.', 'info'); return; }
 
  const blob = new Blob([raw], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `RADAA_save_${state.user?.name?.replace(/\s+/g,'_') || 'export'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Save file downloaded!', 'success');
}
 
function confirmClearStorage() {
  if (!confirm('Clear ALL saved data? This cannot be undone.')) return;
  if (!confirm('Last chance — really delete everything?')) return;
 
  clearStorage();
  state.posts        = JSON.parse(JSON.stringify(SEED_POSTS));
  state.userActions  = { reports:0, votes:0, events:0, supported:0 };
  state.totalActions = 0;
  state.streak       = 0;
  state.activeDays   = new Set();
  state.actionLog    = [];
  state.lastBadgeCount = 0;
 
  markTodayActive();
  saveToStorage();
  renderDashboard();
  renderProfile();
  renderFeed();
  renderTrending();
  updateStorageMeta();
  document.getElementById('storagePreview').classList.add('hidden');
  showToast('Saved data cleared. Starting fresh!', 'info');
}
 
 

// Toast Notifications
let toastTimer = null;

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className   = `toast ${type}`;
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 3800);
}

const AUTO_POSTS = [
  { type:'issue', user:'Dandora Resident',  area:'Dandora',  title:'Street Lights Out — Outer Ring Rd',    desc:'Multiple street lights off for 2 weeks near Dandora Phase 4. Safety risk at night.' },
  { type:'food',  user:'Al-Nour Foundation',area:'Eastleigh',title:'Ramadan Food Packages Available',      desc:'Free food packages for 200 families. Dry foods, oil, dates. From 10am at Al-Nour Mosque.' },
  { type:'event', user:'Nairobi Youth Hub', area:'Makadara', title:'Free Mental Health Awareness Walk',    desc:'300+ youth walking from Makadara Grounds. Mental health counselling at the end. All welcome.' },
];

let autoPostIndex = 0;

function startAutoRefresh() {
  setInterval(() => {
    if (!state.user) return;

    const template = AUTO_POSTS[autoPostIndex % AUTO_POSTS.length];
    const newPost  = { ...template, id: Date.now() + autoPostIndex, supports:Math.floor(Math.random()*30), joins:0, supported:false, joined:false, isOwn:false, date:'Just now' };

    state.posts.unshift(newPost);
    autoPostIndex++;

    // update the feed when user is looking at it
    if (state.currentPage === 'feed') {
      const fc = document.getElementById('feedContainer');
      if (fc && (state.filter === 'all' || state.filter === newPost.type)) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = buildFeedCard(newPost, 0);
        fc.insertBefore(wrapper.firstChild, fc.firstChild);
      }
    }
  }, 45000);
}

function destroyAllCharts() {
  for (const key of Object.keys(state.charts)) {
    if (state.charts[key]) {
      state.charts[key].destroy();
      state.charts[key] = null;
    }
  }
}

const firstName    = name  => (name || 'Citizen').split(' ')[0];
const shortenTitle = title => title && title.length > 42 ? title.slice(0, 42) + '…' : (title || '');

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); closeEditProfile(); }
});

document.getElementById('modal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeModal();
});

document.getElementById('editProfileModal').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeEditProfile();
});

// Simple local participation leaderboard 
function renderLeaderboard() {
  const container = document.getElementById('leaderboardList');
  if (!container) return;

  const youScore = state.totalActions || 0;
  const base = [
    { name: 'Amina – Kibera', score: 18 },
    { name: 'Brian – Mathare', score: 12 },
    { name: 'Fatma – Eastleigh', score: 9 },
    { name: 'Otieno – Kayole', score: 6 },
  ];

  const youEntry = { name: `${firstName(state.user?.name || 'You')} (You)`, score: youScore, isYou: true };
  const all = [...base, youEntry].sort((a, b) => b.score - a.score);

  container.innerHTML = all.map((p, idx) => `
    <div class="leader-row ${p.isYou ? 'leader-you' : ''}">
      <span class="leader-rank">#${idx + 1}</span>
      <span class="leader-name">${p.name}</span>
      <span class="leader-score">${p.score} actions</span>
    </div>
  `).join('');
}
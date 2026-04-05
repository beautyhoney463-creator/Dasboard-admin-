// GLOBAL STATE
let nasabahData = [];
let currentPage = 'dashboard';
let editingId = null;

// INIT APP
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initApp();
});

function initApp() {
    updateStats();
    renderDashboard();
    setupEventListeners();
    console.log('✅ Admin Dashboard Ready!');
}

function loadData() {
    nasabahData = JSON.parse(localStorage.getItem('nasabahData')) || generateDummyData();
}

function generateDummyData() {
    const dummy = [
        {id: 1, nama: 'Budi Santoso', email: 'budi@email.com', telepon: '081234567890', alamat: 'Jl. Merdeka No.123, Jakarta Pusat', tglLahir: '1985-03-15', ktp: '3171234567890001', pekerjaan: 'Manager IT', status: 'active', tanggal: '2024-01-15'},
        {id: 2, nama: 'Siti Aminah', email: 'siti@email.com', telepon: '081234567891', alamat: 'Jl. Sudirman No.45, Bandung', tglLahir: '1990-07-22', ktp: '3272345678900002', pekerjaan: 'Wiraswasta', status: 'pending', tanggal: '2024-01-14'},
        {id: 3, nama: 'Ahmad Fauzi', email: 'ahmad@email.com', telepon: '081234567892', alamat: 'Jl. Gatot Subroto No.78, Surabaya', tglLahir: '1988-11-10', ktp: '3573456789010003', pekerjaan: 'Dokter', status: 'active', tanggal: '2024-01-13'},
        {id: 4, nama: 'Dewi Sartika', email: 'dewi@email.com', telepon: '081234567893', alamat: 'Jl. Thamrin No.12, Medan', tglLahir: '1992-05-30', ktp: '1174567890120004', pekerjaan: 'Guru', status: 'rejected', tanggal: '2024-01-12'},
        {id: 5, nama: 'Rudi Hartono', email: 'rudi@email.com', telepon: '081234567894', alamat: 'Jl. Ahmad Yani No.56, Makassar', tglLahir: '1987-09-18', ktp: '7375678901230005', pekerjaan: 'Pengusaha', status: 'pending', tanggal: '2024-01-11'}
    ];
    localStorage.setItem('nasabahData', JSON.stringify(dummy));
    return dummy;
}

// EVENT LISTENERS
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link[data-page]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentPage = this.dataset.page;
            document.getElementById('pageTitle').textContent = this.textContent.trim().replace(/\s+\d+$/, '');
            showPage(currentPage);
        });
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', debounce(searchNasabah, 300));

    // Form
    document.getElementById('nasabahForm').addEventListener('submit', handleFormSubmit);

    // Mobile sidebar
    document.querySelector('.mobile-toggle').addEventListener('click', toggleSidebar);
}

// PAGES
function showPage(page) {
    const content = document.getElementById('mainContent');
    
    switch(page) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'nasabah':
            renderAllNasabah();
            break;
        case 'pending':
            renderPendingNasabah();
            break;
        default:
            renderDashboard();
    }
}

function renderDashboard() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="card">
            <div class="card-header">
                <div class="card-title">Total Nasabah</div>
                <div class="card-icon stats-primary"><i class="fas fa-users"></i></div>
            </div>
            <div class="stats-number" id="totalNasabah">${nasabahData.length.toLocaleString()}</div>
            <div class="stats-change positive"><i class="fas fa-arrow-up"></i> +12.5%</div>
        </div>
        <div class="card">
            <div class="card-header">
                <div class="card-title">Nasabah Baru</div>
                <div class="card-icon stats-success"><i class="fas fa-user-plus"></i></div>
            </div>
            <div class="stats-number" id="nasabahBaru">12</div>
            <div class="stats-change positive"><i class="fas fa-arrow-up"></i> Minggu ini</div>
        </div>
        <div class="card">
            <div class="card-header">
                <div class="card-title">Pending</div>
                <div class="card-icon stats-warning"><i class="fas fa-clock"></i></div>
            </div>
            <div class="stats-number" id="pendingCount">${nasabahData.filter(n => n.status === 'pending').length}</div>
            <div class="stats-change negative"><i class="fas fa-arrow-down"></i> -2 hari</div>
        </div>
        <div class="card">
            <div class="card-header">
                <div class="card-title">Aktif</div>
                <div class="card-icon stats-success"><i class="fas fa-check-circle"></i></div>
            </div>
            <div class="stats-number" id="nasabahAktif">${nasabahData.filter(n => n.status === 'active').length}</div>
            <div class="stats-change positive"><i class="fas fa-arrow-up"></i> 92%</div>
        </div>
        <div class="card" style="grid-column: 1 / -1;">
            <div class="card-header">
                <div class="card-title">📋 Registrasi Terbaru</div>
                <div class="card-icon stats-primary"><i class="fas fa-list"></i></div>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Tanggal</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="recentTable"></tbody>
                </table>
            </div>
        </div>
    `;
    renderRecentTable();
}

function renderRecentTable(filteredData = nasabahData.slice(0,5)) {
    const tbody = document.getElementById('recentTable');
    if (!tbody) return;
    
    tbody.innerHTML = filteredData.map(n => `
        <tr>
            <td><strong>${n.nama}</strong></td>
            <td>${n.email}</td>
            <td><span class="status ${n.status}">${n.status.toUpperCase()}</span></td>
            <td>${new Date(n.tanggal).toLocaleDateString('id-ID')}</td>
            <td>
                <button onclick="editNasabah(${n.id})" class="btn-mini btn-primary"><i class="fas fa-edit"></i></button>
                <button onclick="deleteNasabah(${n.id})" class="btn-mini btn-danger"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderAllNasabah() {
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="card" style="grid-column: 1 / -1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <h3 style="font-size: 24px; font-weight: 700; color: var(--dark);">📋 Semua Nasabah (${nasabahData.length})</h3>
                <button onclick="openModal('add')" class="btn btn-primary" style="padding: 12px 24px;">
                    <i class="fas fa-plus"></i> Tambah Nasabah
                </button>
            </div>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>Telepon</th>
                            <th>Status</th>
                            <th>Daftar</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="allNasabahTable"></tbody>
                </table>
            </div>
        </div>
    `;
    renderAllTable();
}

function renderAllTable() {
    const tbody = document.getElementById('allNasabahTable');
    tbody.innerHTML = nasabahData.map(n => `
        <tr>
            <td>#${n.id}</td>
            <td><strong>${n.nama}</strong></td>
            <td>${n.email}</td>
            <td>${n.telepon}</td>
            <td><span class="status ${n.status}">${n.status.toUpperCase()}</span></td>
            <td>${new Date(n.tanggal).toLocaleDateString('id-ID')}</td>
            <td>
                <button onclick="editNasabah(${n.id})" class="btn-mini btn-primary">Edit</button>
                <button onclick="deleteNasabah(${n.id})" class="btn-mini btn-danger">Hapus</button>
            </td>
        </tr>
    `).join('');
}

function renderPendingNasabah() {
    const pending = nasabahData.filter(n => n.status === 'pending');
    document.getElementById('pageTitle').textContent = `Pending Verifikasi (${pending.length})`;
    
    const content = document.getElementById('mainContent');
    content.innerHTML = `
        <div class="card" style="grid-column: 1 / -1;">
            <h3 style="font-size: 24px; font-weight: 700; color: var(--dark); margin-bottom: 25px;">⏳ Nasabah Menunggu (${pending.length})</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Email</th>
                            <th>KTP</th>
                            <th>Daftar</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody id="pendingTable"></tbody>
                </table>
            </div>
        </div>
    `;
    
    const tbody = document.getElementById('pendingTable');
    tbody.innerHTML = pending.map(n => `
        <tr>
            <td><strong>${n.nama}</strong></td>
            <td>${n.email}</td>
            <td>${n.ktp}</td>
            <td>${new Date(n.tanggal).toLocaleDateString('id-ID')}</td>
            <td>
                <button onclick="editNasabah(${n.id})" class="btn btn-success" style="padding: 8px 16px;">✅ Verifikasi</button>
            </td>
        </tr>
    `).join('');
}

// CRUD OPERATIONS
  

    function openModal(action = 'add', id = null) {
    editingId = id;
    const modal = document.getElementById('nasabahModal');
    const title = document.getElementById('modalTitle');
    const form = document.getElementById('nasabahForm');
    
    form.reset();
    
    if (action === 'edit' && id) {
        const nasabah = nasabahData.find(n => n.id === id);
        if (nasabah) {
            title.innerHTML = `<i class="fas fa-edit"></i> Edit ${nasabah.nama}`;
            document.getElementById('nama').value = nasabah.nama;
            document.getElementById('email').value = nasabah.email;
            document.getElementById('telepon').value = nasabah.telepon;
            document.getElementById('alamat').value = nasabah.alamat;
            document.getElementById('tglLahir').value = nasabah.tglLahir;
            document.getElementById('ktp').value = nasabah.ktp;
            document.getElementById('pekerjaan').value = nasabah.pekerjaan || '';
            document.getElementById('status').value = nasabah.status;
        }
    } else {
        title.innerHTML = '<i class="fas fa-user-plus"></i> Tambah Nasabah Baru';
        document.getElementById('tglLahir').valueAsDate = new Date();
        document.getElementById('status').value = 'pending';
    }
    
    modal.style.display = 'block';
    document.getElementById('nama').focus();
}

function closeModal() {
    document.getElementById('nasabahModal').style.display = 'none';
    editingId = null;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        nama: document.getElementById('nama').value.trim(),
        email: document.getElementById('email').value.trim(),
        telepon: document.getElementById('telepon').value.trim(),
        alamat: document.getElementById('alamat').value.trim(),
        tglLahir: document.getElementById('tglLahir').value,
        ktp: document.getElementById('ktp').value.trim(),
        pekerjaan: document.getElementById('pekerjaan').value.trim() || '',
        status: document.getElementById('status').value,
        tanggal: new Date().toISOString().split('T')[0]
    };

    // Validation
    if (!isValidEmail(formData.email)) {
        alert('❌ Email tidak valid!');
        return;
    }
    if (!/^\d{16}$/.test(formData.ktp.replace(/[-\s]/g, ''))) {
        alert('❌ No. KTP harus 16 digit!');
        return;
    }

    if (editingId) {
        // UPDATE
        const index = nasabahData.findIndex(n => n.id === editingId);
        nasabahData[index] = { ...nasabahData[index], ...formData };
        showNotification('✅ Nasabah berhasil diupdate!', 'success');
    } else {
        // CREATE
        formData.id = Date.now();
        nasabahData.unshift(formData);
        showNotification('✅ Nasabah baru berhasil ditambahkan!', 'success');
    }

    saveData();
    closeModal();
    renderCurrentPage();
}

function editNasabah(id) {
    openModal('edit', id);
}

function deleteNasabah(id) {
    if (confirm(`Hapus "${nasabahData.find(n => n.id === id)?.nama}"?`)) {
        nasabahData = nasabahData.filter(n => n.id !== id);
        saveData();
        showNotification('🗑️ Nasabah berhasil dihapus!', 'danger');
        renderCurrentPage();
    }
}

// UTILS
function updateStats() {
    document.getElementById('nasabahCount').textContent = nasabahData.length;
    document.getElementById('pendingCount').textContent = nasabahData.filter(n => n.status === 'pending').length;
}

function saveData() {
    localStorage.setItem('nasabahData', JSON.stringify(nasabahData));
}

function renderCurrentPage() {
    showPage(currentPage);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function searchNasabah(e) {
    const query = e.target.value.toLowerCase();
    const filtered = nasabahData.filter(n => 
        n.nama.toLowerCase().includes(query) || 
        n.email.toLowerCase().includes(query) ||
        n.telepon.includes(query)
    );
    renderRecentTable(filtered.slice(0, 5));
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
}

// NOTIFICATION SYSTEM
function showNotification(message, type = 'info') {
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'}"></i>
        ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// DEBOUNCE untuk search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// MODAL OUTSIDE CLICK
window.onclick = function(event) {
    const modal = document.getElementById('nasabahModal');
    if (event.target === modal) {
        closeModal();
    }
};

// AUTO SAVE
setInterval(saveData, 30000);

// ESC KEY CLOSE MODAL
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// PERFECT! 🎉
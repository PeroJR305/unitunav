const API_URL = 'http://localhost:3000/api';

// ดึงชื่อผู้ใช้ที่ล็อกอินจาก localStorage
const loggedUserData = JSON.parse(localStorage.getItem('jeratou_current_user'));
let currentUser = loggedUserData ? loggedUserData.username : 'Jerry';
let currentCredit = 0;

// โหลดข้อมูลเมื่อเปิดหน้าเว็บ
document.addEventListener('DOMContentLoaded', () => {
    // แสดงชื่อผู้ใช้บน UI
    const nameElem = document.getElementById('user-name');
    if (nameElem) nameElem.innerText = currentUser;

    loadProducts();
    loadUserData();
    loadHistory();

    const topupForm = document.getElementById('topup-form');
    if (topupForm) {
        topupForm.addEventListener('submit', processTopup);
    }
});

function showPage(pageId, event) {
    if (event) event.preventDefault();
    
    const pages = document.querySelectorAll('.page-section');
    pages.forEach(page => page.classList.remove('active'));

    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) targetPage.classList.add('active');

    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => link.classList.remove('active', 'text-warning'));
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active', 'text-warning');
    }

    if (pageId === 'history-topup' || pageId === 'history-buy') {
        loadHistory();
    }
}

async function loadProducts() {
    try {
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();
        
        const container = document.querySelector('#cat-clean .row');
        if (!container) return;

        if (!Array.isArray(products) || products.length === 0) {
            container.innerHTML = `<div class="col-12 text-center text-muted py-5">ยังไม่มีสินค้าในระบบ</div>`;
            return;
        }

        container.innerHTML = products.map((item) => `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card p-3 h-100 d-flex flex-column bg-dark text-white border-secondary">
                    <div class="character-img-box mb-3 text-center">
                        <img src="Screenshot 2026-09-11 203829_2.png" class="character-img img-fluid rounded" alt="${item.title}" onerror="this.src='https://via.placeholder.com/200x200/121217/ffb700?text=Roblox'">
                    </div>
                    <div class="mb-2">
                        <span class="badge bg-success"><i class="fa-solid fa-check-circle me-1"></i> ${item.badge || 'สะอาด 100%'}</span>
                    </div>
                    <h5 class="fw-bold mb-2">${item.title}</h5>
                    <p class="text-muted small mb-3">${item.details || 'ไม่มีรายละเอียด'}</p>
                    <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top border-secondary">
                        <span class="fs-4 fw-bold text-info">${item.price} ฿</span>
                        <button class="btn btn-warning fw-bold" onclick="processBuy('${item._id}', '${item.title}', ${item.price})">
                            <i class="fa-solid fa-cart-shopping me-1"></i> ซื้อสินค้า
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('ไม่สามารถโหลดรายการสินค้าได้:', err);
    }
}

async function loadUserData() {
    try {
        const res = await fetch(`${API_URL}/history/${currentUser}`);
        const history = await res.json();
        
        let total = 0;
        if (Array.isArray(history)) {
            history.forEach(item => {
                if (item.type === 'TOPUP') total += item.amount;
                if (item.type === 'BUY') total -= item.amount;
            });
        }
        currentCredit = total < 0 ? 0 : total;

        const creditDisplay = document.getElementById('user-credit');
        if (creditDisplay) creditDisplay.innerText = currentCredit;
    } catch (err) {
        console.error('ไม่สามารถโหลดข้อมูลเครดิตได้:', err);
    }
}

async function processTopup(event) {
    if (event) event.preventDefault();
    const amountInput = document.getElementById('topup-amount');
    const amount = amountInput ? Number(amountInput.value) : 0;

    if (!amount || amount <= 0) {
        alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');
        return;
    }

    try {
        const res = await fetch(`${API_URL}/topup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser, amount })
        });

        if (res.ok) {
            alert(`เติมเงินสำเร็จ ${amount} บาท!`);
            if (amountInput) amountInput.value = '';
            await loadUserData();
            showPage('history-topup');
        } else {
            alert('เติมเงินไม่สำเร็จ');
        }
    } catch (err) {
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
}

async function processBuy(productId, title, price) {
    if (currentCredit < price) {
        alert(`เครดิตของคุณไม่พอ! (ขาดอีก ${price - currentCredit} บาท)\nกรุณากดรับเครดิตทดลองฟรี หรือเติมเงินเข้าระบบ`);
        return;
    }

    if (!confirm(`คุณต้องการยืนยันการซื้อ "${title}" ในราคา ${price} บาท หรือไม่?`)) return;

    try {
        const res = await fetch(`${API_URL}/buy`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: currentUser, productId })
        });
        const data = await res.json();

        if (res.ok) {
            alert(`สั่งซื้อสำเร็จ!\nคุณได้รับบัญชี: ${data.accountData}`);
            await loadUserData();
            await loadProducts();
            showPage('history-buy');
        } else {
            alert(data.error || 'การสั่งซื้อล้มเหลว');
        }
    } catch (err) {
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    }
}

async function loadHistory() {
    try {
        const res = await fetch(`${API_URL}/history/${currentUser}`);
        const history = await res.json();

        const topupList = document.getElementById('history-topup-list');
        const buyList = document.getElementById('history-buy-list');

        if (!Array.isArray(history)) return;

        const topups = history.filter(item => item.type === 'TOPUP');
        if (topupList) {
            topupList.innerHTML = topups.length === 0 
                ? `<tr><td colspan="5" class="text-center text-muted py-4">ยังไม่มีประวัติการเติมเงิน</td></tr>`
                : topups.map((item, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${new Date(item.createdAt).toLocaleString('th-TH')}</td>
                        <td>ระบบซองของขวัญ / เครดิตทดลอง</td>
                        <td class="text-warning fw-bold">+${item.amount} ฿</td>
                        <td><span class="text-success fw-bold"><i class="fa-solid fa-circle-check"></i> สำเร็จ</span></td>
                    </tr>
                `).join('');
        }

        const buys = history.filter(item => item.type === 'BUY');
        if (buyList) {
            buyList.innerHTML = buys.length === 0
                ? `<tr><td colspan="5" class="text-center text-muted py-4">ยังไม่มีประวัติการสั่งซื้อ</td></tr>`
                : buys.map((item, i) => `
                    <tr>
                        <td>${i + 1}</td>
                        <td>${new Date(item.createdAt).toLocaleString('th-TH')}</td>
                        <td>${item.details ? item.details.split(' (บัญชี:')[0] : 'ซื้อสินค้า'}</td>
                        <td class="text-info fw-bold">${item.amount} ฿</td>
                        <td><code class="bg-dark p-1 rounded text-warning border border-secondary">${(item.details && item.details.includes('บัญชี:')) ? item.details.split('บัญชี: ')[1].replace(')', '') : '-'}</code></td>
                    </tr>
                `).join('');
        }
    } catch (err) {
        console.error('ไม่สามารถโหลดประวัติได้:', err);
    }
}
// ==================================================
// ฟังก์ชันสั่งซื้อสินค้า (ส่งข้อมูลไป MongoDB)
// ==================================================
async function buyProduct(productName, price) {
    // 1. เช็กว่าล็อกอินหรือยัง
    const currentUser = JSON.parse(localStorage.getItem("jeratou_current_user"));

    if (!currentUser || !currentUser.username) {
        alert("กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อสินค้า!");
        window.location.href = "Login.html";
        return;
    }

    // 2. ถามยืนยันการซื้อ
    const confirmBuy = confirm(`คุณต้องการซื้อ "${productName}" ในราคา ${price} บาท ใช่หรือไม่?`);
    if (!confirmBuy) return;

    try {
        // 3. ส่งข้อมูลคำสั่งซื้อไปยัง Node.js Backend
        const response = await fetch('http://localhost:3000/api/buy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: currentUser.username,
                productName: productName,
                price: price
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
        } else {
            alert(data.error || 'เกิดข้อผิดพลาดในการซื้อสินค้า');
        }
    } catch (error) {
        console.error('Fetch Error:', error);
        alert('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้ (โปรดตรวจสอบว่าเปิด node index.js ใน jerrpun หรือยัง)');
    }
}
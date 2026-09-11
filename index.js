// ตัวแปรเก็บข้อมูล
let credit = 0;
let topupHistory = [];
let buyHistory = [];

// ฟังก์ชันสลับหน้าเพจ
function showPage(pageId, event) {
    if (event) event.preventDefault();
    
    // ซ่อนทุกหน้า
    const pages = document.querySelectorAll('.page-section');
    pages.forEach(page => page.classList.remove('active'));

    // แสดงหน้าเป้าหมาย
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    // อัปเดตสถานะของ Nav Links
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => link.classList.remove('active', 'text-warning'));
    
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active', 'text-warning');
    }
}

// ฟังก์ชันรับเครดิตฟรี
function addFreeMoney(amount) {
    credit += amount;
    updateCreditDisplay();
    alert(`ได้รับเครดิตทดลองฟรีจำนวน ${amount} บาทเรียบร้อยแล้ว!`);
}

// อัปเดตแสดงผลยอดเครดิต
function updateCreditDisplay() {
    const creditElement = document.getElementById('user-credit');
    if (creditElement) {
        creditElement.innerText = credit;
    }
}

// ฟังก์ชันจำลองเติมเงิน
function processTopup(event) {
    event.preventDefault();
    const amountInput = document.getElementById('topup-amount');
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        alert('กรุณากรอกจำนวนเงินให้ถูกต้อง');
        return;
    }

    credit += amount;
    updateCreditDisplay();

    // บันทึกประวัติ
    const now = new Date().toLocaleString('th-TH');
    topupHistory.unshift({
        id: topupHistory.length + 1,
        time: now,
        method: 'TrueMoney Wallet (จำลอง)',
        amount: amount,
        status: '<span class="text-success fw-bold"><i class="fa-solid fa-circle-check"></i> สำเร็จ</span>'
    });

    renderTopupHistory();
    alert(`เติมเงินสำเร็จจำนวน ${amount} บาท!`);
    showPage('history-topup');
}

// ฟังก์ชันสั่งซื้อสินค้า
function processBuy(productName, price) {
    if (credit < price) {
        alert(`เครดิตของคุณไม่พอ! (ขาดอีก ${price - credit} บาท)\nกรุณากดรับเครดิตทดลองฟรี หรือเติมเงินเข้าระบบ`);
        return;
    }

    if (confirm(`คุณต้องการยืนยันการซื้อ "${productName}" ในราคา ${price} บาท หรือไม่?`)) {
        credit -= price;
        updateCreditDisplay();

        // สุ่มสร้าง ID / PASS จำลอง
        const randomUser = 'RBX_' + Math.floor(100000 + Math.random() * 900000);
        const randomPass = Math.random().toString(36).slice(-8);
        const now = new Date().toLocaleString('th-TH');

        // บันทึกประวัติ
        buyHistory.unshift({
            id: buyHistory.length + 1,
            time: now,
            name: productName,
            price: price,
            account: `${randomUser} : ${randomPass}`
        });

        renderBuyHistory();
        alert(`สั่งซื้อสำเร็จ!\nคุณได้รับบัญชี: ${randomUser}\nรหัสผ่าน: ${randomPass}`);
        showPage('history-buy');
    }
}

// ฟังก์ชันแสดงรายการประวัติเติมเงิน
function renderTopupHistory() {
    const list = document.getElementById('history-topup-list');
    if (!list) return;

    if (topupHistory.length === 0) {
        list.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">ยังไม่มีประวัติการเติมเงิน</td></tr>`;
        return;
    }

    list.innerHTML = topupHistory.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.time}</td>
            <td>${item.method}</td>
            <td class="text-warning fw-bold">+${item.amount} ฿</td>
            <td>${item.status}</td>
        </tr>
    `).join('');
}

// ฟังก์ชันแสดงรายการประวัติการสั่งซื้อ
function renderBuyHistory() {
    const list = document.getElementById('history-buy-list');
    if (!list) return;

    if (buyHistory.length === 0) {
        list.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">ยังไม่มีประวัติการสั่งซื้อ</td></tr>`;
        return;
    }

    list.innerHTML = buyHistory.map(item => `
        <tr>
            <td>${item.id}</td>
            <td>${item.time}</td>
            <td>${item.name}</td>
            <td class="text-info fw-bold">${item.price} ฿</td>
            <td><code class="bg-dark p-1 rounded text-warning border border-secondary">${item.account}</code></td>
        </tr>
    `).join('');
}
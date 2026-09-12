// ตัวแปรเก็บข้อมูล
let credit = 0;
let topupHistory = [];
let buyHistory = [];

// ฟังก์ชันแสดง Modal แจ้งเตือนสไตล์ Dark Theme (แทน alert เดิม)
function showAlert(title, bodyHtml, onConfirm = null, showCancel = false) {
    document.getElementById('customModalTitle').innerHTML = title;
    document.getElementById('customModalBody').innerHTML = bodyHtml;

    const confirmBtn = document.getElementById('customModalConfirmBtn');
    const cancelBtn = document.getElementById('customModalCancelBtn');

    cancelBtn.style.display = showCancel ? 'inline-block' : 'none';

    // ล้าง Event listener เก่า
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);

    newConfirmBtn.addEventListener('click', () => {
        if (onConfirm) onConfirm();
    });

    const modal = new bootstrap.Modal(document.getElementById('customAlertModal'));
    modal.show();
}

// ฟังก์ชันสลับหน้าเพจ
function showPage(pageId, event) {
    if (event && event.preventDefault) event.preventDefault();
    
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
    showAlert('<i class="fa-solid fa-coins me-2"></i>สำเร็จ', `ได้รับเครดิตทดลองฟรีจำนวน <b class="text-warning">${amount} บาท</b> เรียบร้อยแล้ว!`);
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
    if (event && event.preventDefault) event.preventDefault();
    const amountInput = document.getElementById('topup-amount');
    const amount = parseFloat(amountInput.value);

    if (isNaN(amount) || amount <= 0) {
        showAlert('<i class="fa-solid fa-triangle-exclamation text-danger me-2"></i>ข้อผิดพลาด', 'กรุณากรอกจำนวนเงินให้ถูกต้อง');
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
    showAlert('<i class="fa-solid fa-circle-check text-success me-2"></i>เติมเงินสำเร็จ', `เติมเงินจำนวน <b class="text-warning">${amount} บาท</b> เรียบร้อยแล้ว!`, () => {
        showPage('history-topup');
    });
}

// ฟังก์ชันสั่งซื้อสินค้า
function processBuy(productName, price) {
    if (credit < price) {
        showAlert(
            '<i class="fa-solid fa-circle-xmark text-danger me-2"></i>เครดิตไม่เพียงพอ', 
            `เครดิตของคุณไม่พอซื้อสินค้าชิ้นนี้!<br><span class="text-danger fw-bold">(ขาดอีก ${price - credit} บาท)</span><br><small class="text-muted">กรุณากดรับเครดิตทดลองฟรี หรือเติมเงินเข้าระบบ</small>`
        );
        return;
    }

    showAlert(
        '<i class="fa-solid fa-cart-shopping me-2"></i>ยืนยันการสั่งซื้อ',
        `คุณต้องการยืนยันการซื้อ <b class="text-warning">${productName}</b><br>ในราคา <b class="text-info">${price} บาท</b> หรือไม่?`,
        function() {
            // ทำงานเมื่อกดตกลง
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

            setTimeout(() => {
                showAlert(
                    '<i class="fa-solid fa-box-open text-success me-2"></i>สั่งซื้อสำเร็จ!',
                    `<div class="bg-black p-3 rounded border border-secondary text-start">
                        <p class="mb-1"><b>สินค้า:</b> ${productName}</p>
                        <p class="mb-1"><b>Username:</b> <code class="text-warning fs-6">${randomUser}</code></p>
                        <p class="mb-0"><b>Password:</b> <code class="text-warning fs-6">${randomPass}</code></p>
                    </div>`,
                    function() {
                        showPage('history-buy');
                    }
                );
            }, 300);
        },
        true // แสดงปุ่มยกเลิก
    );
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
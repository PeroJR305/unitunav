
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
 >
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

        let credit = 0;
        let topupHistory = [];
        let buyHistory = [];

        function updateCreditDisplay() {
            document.getElementById('user-credit').innerText = credit;
        }

        function showPage(pageId, event) {
            if(event) event.preventDefault();
            document.querySelectorAll('.page-section').forEach(el => el.classList.remove('active'));
            document.getElementById('page-' + pageId).classList.add('active');
            
            document.querySelectorAll('.navbar-nav .nav-link').forEach(el => {
                el.classList.remove('text-warning', 'active');
                el.classList.add('text-light');
            });
            if(event && event.currentTarget) {
                event.currentTarget.classList.remove('text-light');
                event.currentTarget.classList.add('text-warning', 'active');
            }
        }

        function addFreeMoney(amount) {
            credit += amount;
            updateCreditDisplay();
            
            let now = new Date().toLocaleString('th-TH');
            topupHistory.unshift({
                time: now,
                channel: 'เครดิตทดลองฟรี',
                amount: amount,
                status: 'สำเร็จ'
            });
            renderTopupHistory();
            
            Swal.fire({
                title: 'สำเร็จ!',
                text: 'เติมเครดิตทดลองฟรีสำเร็จ ' + amount + ' บาท!',
                icon: 'success',
                confirmButtonColor: '#ffc107',
                confirmButtonText: '<span style="color:#000; font-weight:bold;">ตกลง</span>'
            });
        }

        function processTopup(e) {
            e.preventDefault();
            let amount = parseFloat(document.getElementById('topup-amount').value);
            if(amount > 0) {
                credit += amount;
                updateCreditDisplay();
                
                let now = new Date().toLocaleString('th-TH');
                topupHistory.unshift({
                    time: now,
                    channel: 'TrueMoney ซองของขวัญ',
                    amount: amount,
                    status: 'สำเร็จ'
                });
                renderTopupHistory();
                
                Swal.fire({
                    title: 'เติมเงินสำเร็จ!',
                    text: 'เติมเงินสำเร็จจำนวน ' + amount + ' บาท!',
                    icon: 'success',
                    confirmButtonColor: '#ffc107',
                    confirmButtonText: '<span style="color:#000; font-weight:bold;">ตกลง</span>'
                }).then(() => {
                    showPage('shop');
                });
            }
        }

        function processBuy(itemName, price, itemType = 'account') {
            if(credit < price) {
                Swal.fire({
                    title: 'เครดิตไม่เพียงพอ!',
                    text: 'เครดิตของคุณไม่เพียงพอ กรุณาเติมเงินก่อนทำรายการ',
                    icon: 'error',
                    showCancelButton: true,
                    confirmButtonColor: '#ffc107',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: '<span style="color:#000; font-weight:bold;">ไปหน้าเติมเงิน</span>',
                    cancelButtonText: 'ยกเลิก'
                }).then((result) => {
                    if (result.isConfirmed) {
                        showPage('topup');
                    }
                });
                return;
            }

            credit -= price;
            updateCreditDisplay();

            let itemData = "";
            let dataLabel = "";
            if(itemType === 'item') {
                let randomCode = Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
                                 Math.random().toString(36).substring(2, 6).toUpperCase() + '-' +
                                 Math.random().toString(36).substring(2, 6).toUpperCase();
                itemData = "ITEM-CODE: " + randomCode;
                dataLabel = "โค้ดสินค้าของคุณ:";
            } else {
                let randomId = Math.floor(1000 + Math.random() * 9000);
                itemData = "Roblox_User" + randomId + " : Pass" + Math.floor(10000 + Math.random() * 90000);
                dataLabel = "รหัสผ่านและข้อมูลไอดีของคุณ:";
            }

            let now = new Date().toLocaleString('th-TH');
            buyHistory.unshift({
                time: now,
                name: itemName,
                price: price,
                data: itemData
            });
            renderBuyHistory();

            document.getElementById('buyModalItemName').innerText = "สินค้า: " + itemName;
            document.getElementById('buyModalDataTypeLabel').innerText = dataLabel;
            document.getElementById('buyModalAccountData').innerText = itemData;
            
            let modal = new bootstrap.Modal(document.getElementById('buyResultModal'));
            modal.show();
        }

        function renderTopupHistory() {
            let tbody = document.getElementById('history-topup-list');
            if (topupHistory.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">ยังไม่มีประวัติการเติมเงิน</td></tr>';
                return;
            }
            tbody.innerHTML = topupHistory.map((item, index) => `
                <tr>
                    <td>${topupHistory.length - index}</td>
                    <td>${item.time}</td>
                    <td>${item.channel}</td>
                    <td class="text-warning fw-bold">+${item.amount} ฿</td>
                    <td><span class="badge bg-success">${item.status}</span></td>
                </tr>
            `).join('');
        }

        function renderBuyHistory() {
            let tbody = document.getElementById('history-buy-list');
            if (buyHistory.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">ยังไม่มีประวัติการสั่งซื้อ</td></tr>';
                return;
            }
            tbody.innerHTML = buyHistory.map((item, index) => `
                <tr>
                    <td>${buyHistory.length - index}</td>
                    <td>${item.time}</td>
                    <td>${item.name}</td>
                    <td class="text-info fw-bold">${item.price} ฿</td>
                    <td><code class="text-warning">${item.data}</code></td>
                </tr>
            `).join('');
        }

        function copyAccountData() {
            let text = document.getElementById('buyModalAccountData').innerText;
            navigator.clipboard.writeText(text).then(() => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'คัดลอกข้อมูลสำเร็จ!',
                    showConfirmButton: false,
                    timer: 1500
                });
            });
        }

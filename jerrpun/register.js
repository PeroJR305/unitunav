// กำหนด URL ของหลังบ้านบน Render เรียบร้อยแล้ว
const API_URL = 'https://unitunav.onrender.com'; 

function showMessage(text, type = "error") {
    const message = document.getElementById("message");
    if (!message) return;
    message.textContent = text;
    message.className = "message show " + type;
}

// ==================================================
// REGISTER (สมัครสมาชิก)
// ==================================================
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (username.length < 3) {
            showMessage("Username ต้องมีอย่างน้อย 3 ตัวอักษร");
            return;
        }

        if (password.length < 6) {
            showMessage("Password ต้องมีอย่างน้อย 6 ตัวอักษร");
            return;
        }

        if (password !== confirmPassword) {
            showMessage("Password และยืนยัน Password ไม่ตรงกัน");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                showMessage("สมัครสมาชิกสำเร็จ! กำลังไปหน้า Login...", "success");
                setTimeout(function () {
                    window.location.href = "Login.html";
                }, 900);
            } else {
                showMessage(data.error || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            showMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        }
    });
}

// ==================================================
// LOGIN (เข้าสู่ระบบ)
// ==================================================
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const loginId = document.getElementById("loginId").value.trim();
        const password = document.getElementById("password").value;

        try {
            const response = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ loginId, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("jeratou_logged_in", "true");
                localStorage.setItem("jeratou_current_user", JSON.stringify(data.user));

                showMessage("เข้าสู่ระบบสำเร็จ กำลังเข้าสู่หน้าหลัก...", "success");

                setTimeout(function () {
                    window.location.href = "index.html";
                }, 700);
            } else {
                showMessage(data.error || "Email/Username หรือ Password ไม่ถูกต้อง");
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            showMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
        }
    });
}
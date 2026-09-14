
const USERS_KEY = "jeratou_users";

function getUsers() {

    try {

        return JSON.parse(
            localStorage.getItem(USERS_KEY)
        ) || [];

    } catch (error) {

        return [];

    }

}


// ===============================
// SAVE USERS
// ===============================

function saveUsers(users) {

    localStorage.setItem(
        USERS_KEY,
        JSON.stringify(users)
    );

}


// ===============================
// SHOW MESSAGE
// ===============================

function showMessage(text, type = "error") {

    const message =
        document.getElementById("message");

    if (!message) return;

    message.textContent = text;

    message.className =
        "message show " + type;

}


// ==================================================
// LOGIN
// ==================================================

const loginForm =
    document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const loginId =
                document
                    .getElementById("loginId")
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("password")
                    .value;


            const users = getUsers();


            // ตรวจสอบ Username หรือ Email
            const user = users.find(

                function (u) {

                    return (

                        (
                            u.username
                                .toLowerCase() ===
                            loginId

                        ||

                            u.email
                                .toLowerCase() ===
                            loginId

                        )

                        &&

                        u.password === password

                    );

                }

            );


            // Login ไม่สำเร็จ
            if (!user) {

                showMessage(
                    "Email/Username หรือ Password ไม่ถูกต้อง"
                );

                return;

            }


            // Login สำเร็จ
            localStorage.setItem(
                "jeratou_logged_in",
                "true"
            );


            localStorage.setItem(

                "jeratou_current_user",

                JSON.stringify({

                    username: user.username,

                    email: user.email

                })

            );


            showMessage(
                "เข้าสู่ระบบสำเร็จ กำลังเข้าสู่หน้าหลัก...",
                "success"
            );


            // ไป index.html
            setTimeout(

                function () {

                    window.location.href =
                        "index.html";

                },

                700

            );

        }

    );

}


// ==================================================
// REGISTER
// ==================================================

const registerForm =
    document.getElementById("registerForm");


if (registerForm) {

    registerForm.addEventListener(

        "submit",

        function (event) {

            event.preventDefault();


            const username =
                document
                    .getElementById("username")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim()
                    .toLowerCase();


            const password =
                document
                    .getElementById("registerPassword")
                    .value;


            const confirmPassword =
                document
                    .getElementById("confirmPassword")
                    .value;


            // ตรวจ Username
            if (username.length < 3) {

                showMessage(
                    "Username ต้องมีอย่างน้อย 3 ตัวอักษร"
                );

                return;

            }


            // ตรวจ Password
            if (password.length < 6) {

                showMessage(
                    "Password ต้องมีอย่างน้อย 6 ตัวอักษร"
                );

                return;

            }


            // ตรวจ Password ซ้ำ
            if (password !== confirmPassword) {

                showMessage(
                    "Password และยืนยัน Password ไม่ตรงกัน"
                );

                return;

            }


            const users = getUsers();


            // ตรวจ Username / Email ซ้ำ
            const duplicate = users.some(

                function (u) {

                    return (

                        u.username
                            .toLowerCase() ===
                        username.toLowerCase()

                        ||

                        u.email
                            .toLowerCase() ===
                        email

                    );

                }

            );


            if (duplicate) {

                showMessage(
                    "Username หรือ Email นี้ถูกใช้งานแล้ว"
                );

                return;

            }


            // เพิ่ม User
            users.push({

                username: username,

                email: email,

                password: password

            });


            saveUsers(users);


            // สมัครสำเร็จ
            showMessage(
                "สมัครสมาชิกสำเร็จ! กำลังไปหน้า Login...",
                "success"
            );


            // กลับ Login
            setTimeout(

                function () {

                    window.location.href =
                        "login.html";

                },

                900

            );

        }

    );

}
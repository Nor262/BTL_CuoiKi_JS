document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.querySelector('#registerForm');
    const usernameInput = document.querySelector('#username');
    const passwordInput = document.querySelector('#password');
    const confirmPasswordInput = document.querySelector('#confirmPassword');

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Ngăn form submit mặc định
        
        // Kiểm tra mật khẩu khớp nhau
        if (passwordInput.value !== confirmPasswordInput.value) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        fetch('http://127.0.0.1:3000/createUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username: usernameInput.value, password: passwordInput.value })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                window.location.href = '../login/index.html';
            })
            .catch(err => {
                alert('Lỗi: ' + 'Tài khoản đã tồn tại!');
            });
    });
});


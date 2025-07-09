document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.querySelector('#loginForm');
    const usernameInput = document.querySelector('#username');
    const passwordInput = document.querySelector('#password');

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        fetch('http://localhost:3000/getUser?username=' + encodeURIComponent(usernameInput.value))
            .then(response => {
                if (!response.ok) throw new Error('Tài khoản không tồn tại!');
                return response.json();
            })
            .then(data => {
                if (data.password === passwordInput.value) {
                    localStorage.setItem('username', usernameInput.value);
                    localStorage.setItem('loggedIn', 'true');
                    window.location.href = '../loading/index.html';
                } else {
                    alert('Sai mật khẩu!');
                }
            })
            .catch(err => {
                alert('Lỗi: ' + err.message);
            });
    });
});


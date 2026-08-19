async function iniciarSesion() {
    const identificador = document.getElementById('login-identificador').value;
    const pass = document.getElementById('login-pass').value;
    if(!identificador || !pass) return alert("Faltan datos.");
    try {
        const response = await fetch('../api/login.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identificador, pass })
        });
        const result = await response.json();
        if(result.status === 'success') {
            localStorage.setItem('usuario_id', result.usuario_id);
            window.location.href = '../dashboard/';
        } else { alert(result.message); }
    } catch (e) { alert("Error de conexión con el servidor."); }
}

async function registrarUsuario() {
    const username = document.getElementById('reg-user').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-pass').value;
    if(!username || !email || !pass) return alert("Faltan datos.");
    try {
        const response = await fetch('../api/register.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, pass })
        });
        const result = await response.json();
        if(result.status === 'success') {
            alert("Cuenta creada exitosamente. Ahora puedes iniciar sesión.");
            window.location.href = '../login/';
        } else { alert(result.message); }
    } catch (e) { alert("Error de conexión con el servidor."); }
}

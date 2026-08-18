
function cerrarSesion() { localStorage.removeItem('usuario_id'); window.location.href = '../login/'; }
function abrirModalNuevo() { document.getElementById('modalNuevo').classList.add('active'); document.body.style.overflow = 'hidden'; }
function cerrarModal(event, id) { const overlay = document.getElementById(id); if (event.target === overlay) { overlay.classList.remove('active'); document.body.style.overflow = ''; } }
function formatearMonto(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor === '') { input.value = ''; return; }
    let valorFormateado = parseInt(valor, 10).toLocaleString('es-CL');
    input.value = '$' + valorFormateado;
}
function mostrarToast(mensaje) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerText = mensaje;
    container.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3000);
}

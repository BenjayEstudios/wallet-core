
async function cargarCategoriasListado() {
    const lista = document.getElementById('lista-categorias');
    if(!lista) return;
    const uid = localStorage.getItem('usuario_id') || 1;
    try {
        const resp = await fetch(`../api/get_categorias.php?usuario_id=${uid}`);
        const result = await resp.json();
        if(result.status === 'success') {
            lista.innerHTML = '';
            result.data.forEach(c => {
                const esDefault = c.id_usuario === null;
                const cColor = c.tipo_flujo === 'gasto' ? 'var(--txt-pendiente)' : 'var(--txt-pagado)';
                const lockIcon = esDefault ? '🔒' : '✏️';
                const tagColor = c.color_hex || '#4A5568';
                
                const badgeStyle = `background-color: ${tagColor}; color: #fff;`;

                const html = `
                <div class="btn-secondary" style="display:flex; justify-content:space-between; align-items:center; padding: 15px; border-color: var(--borde); text-align:left;" onclick="abrirModalCategoria('${c.id}', '${c.nombre_categoria}', '${c.icono}', '${c.tipo_flujo}', '${tagColor}', ${esDefault})">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:1.5rem;">${c.icono}</span>
                        <div style="display:flex; flex-direction:column;">
                            <span style="color:var(--texto-principal); font-size:1.1rem; font-weight:600;">${c.nombre_categoria}</span>
                            <div style="margin-top: 4px;">
                                <span class="badge" style="${badgeStyle} border: none;">Badge Preview</span>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:0.8rem; color:${cColor}; text-transform:uppercase; font-weight:bold;">${c.tipo_flujo}</span>
                        <span style="font-size:1rem; opacity:0.5;">${lockIcon}</span>
                    </div>
                </div>`;
                lista.insertAdjacentHTML('beforeend', html);
            });
        }
    } catch(e) {}
}

function abrirModalCategoria(id = '', nombre = '', icono = '', tipo = 'gasto', color = '#4A5568', esDefault = false) {
    if (esDefault) {
        alert("Las categorías por defecto no se pueden editar. ¡Crea una nueva!");
        return;
    }
    
    // Decodificar el HTML entity (ej: &#127968;) para que el input muestre el emoji
    const decodificador = document.createElement('textarea');
    decodificador.innerHTML = icono;
    const iconoDecodificado = decodificador.value;
    
    document.getElementById('cat-id').value = id;
    document.getElementById('cat-nombre').value = nombre;
    document.getElementById('cat-icono').value = iconoDecodificado; // Aqui pasamos el emoji visible
    document.getElementById('cat-tipo').value = tipo;
    document.getElementById('cat-color').value = color;
    
    const titulo = id === '' ? 'Nueva Categoría' : 'Editar Categoría';
    document.getElementById('titulo-modal-cat').innerText = titulo;
    
    document.getElementById('modalCategoria').classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function guardarCategoria() {
    const id = document.getElementById('cat-id').value;
    const nombre = document.getElementById('cat-nombre').value.trim();
    const icono = document.getElementById('cat-icono').value.trim();
    const tipo = document.getElementById('cat-tipo').value;
    const color = document.getElementById('cat-color').value;
    const usuario_id = localStorage.getItem('usuario_id') || 1;

    if(!nombre || !icono) return alert('Por favor ingresa nombre e ícono.');

    const datos = { id, usuario_id, nombre_categoria: nombre, icono, tipo_flujo: tipo, color_hex: color };
    const url = id === '' ? '../api/insert_categoria.php' : '../api/update_categoria.php';

    try {
        const response = await fetch(url, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const resultado = await response.json();
        if (response.ok && resultado.status === 'success') {
            cerrarModal({target: document.getElementById('modalCategoria')}, 'modalCategoria');
            cargarCategoriasListado();
        } else {
            alert("Error: " + resultado.message);
        }
    } catch (error) { alert("Error al conectar con el servidor."); }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarCategoriasListado();
});

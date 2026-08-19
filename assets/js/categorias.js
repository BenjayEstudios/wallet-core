
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
                
                const catColorHex = c.color_hex || '#4A5568'; 
                const bgTransparente = hexToRgba(catColorHex, 0.2); 
                
                // Aplicado mismo diseño que en Movimientos
                const badgeCatHtml = `<span class="badge" style="background-color: ${bgTransparente}; color: ${catColorHex}; border: none;">${c.nombre_categoria}</span>`;

                const html = `
                <div class="btn-secondary" style="display:flex; justify-content:space-between; align-items:center; padding: 15px; border-color: var(--borde); text-align:left; cursor:pointer;" onclick="abrirModalCategoria('${c.id}', '${c.nombre_categoria}', '${c.icono}', '${c.tipo_flujo}', '${catColorHex}', ${esDefault})">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:1.8rem; background: var(--surface); padding:8px; border-radius:10px; border:1px solid var(--borde);">${c.icono}</span>
                        <div style="display:flex; flex-direction:column;">
                            <span style="color:var(--texto-principal); font-size:1.05rem; font-weight:700;">${c.nombre_categoria}</span>
                            <div style="margin-top: 4px;">
                                ${badgeCatHtml}
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

function actualizarPreview() {
    const nombre = document.getElementById('cat-nombre').value.trim() || 'Nombre Categoría';
    const icono = document.getElementById('cat-icono').value.trim() || '🏷️';
    const colorHex = document.getElementById('cat-color').value || '#4A5568';
    
    document.getElementById('preview-icon').innerText = icono;
    document.getElementById('preview-badge').innerText = nombre;
    
    const bgTransparente = hexToRgba(colorHex, 0.2);
    document.getElementById('preview-badge').style.backgroundColor = bgTransparente;
    document.getElementById('preview-badge').style.color = colorHex;
}

function abrirModalCategoria(id = '', nombre = '', icono = '', tipo = 'gasto', color = '#4A5568', esDefault = false) {
    if (esDefault) {
        mostrarToast("Las categorías por defecto no se pueden editar.");
        return;
    }
    
    document.getElementById('cat-id').value = id;
    document.getElementById('cat-nombre').value = nombre;
    document.getElementById('cat-icono').value = icono;
    document.getElementById('cat-tipo').value = tipo;
    document.getElementById('cat-color').value = color;
    
    const titulo = id === '' ? 'Nueva Categoría' : 'Editar Categoría';
    document.getElementById('titulo-modal-cat').innerText = titulo;
    
    // Forzar actualización del preview al abrir
    actualizarPreview();
    
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

    if(!nombre || !icono) return mostrarToast('Por favor ingresa nombre e ícono.');

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
            mostrarToast("Error: " + resultado.message);
        }
    } catch (error) { mostrarToast("Error al conectar con el servidor."); }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarCategoriasListado();
    
    // Escuchar cambios para el preview en vivo
    document.getElementById('cat-nombre').addEventListener('input', actualizarPreview);
    document.getElementById('cat-icono').addEventListener('input', actualizarPreview);
    document.getElementById('cat-color').addEventListener('input', actualizarPreview);
});


let categoriasCargadas = [];
let transaccionesCargadas = [];
let txActualId = null;

let filtroMesActual = new Date().getMonth() + 1;
let filtroAnioActual = new Date().getFullYear();

async function cargarCategoriasDropdown() {
    const uid = localStorage.getItem('usuario_id') || 1;
    try {
        const resp = await fetch(`../api/get_categorias.php?usuario_id=${uid}`);
        const result = await resp.json();
        if(result.status === 'success') {
            categoriasCargadas = result.data;
            const tipoActual = document.getElementById('btnGasto').classList.contains('active') ? 'gasto' : 'ingreso';
            filtrarCategoriasPorTipo(tipoActual, 'categoria-select');
            filtrarCategoriasPorTipo(tipoActual, 'edit-categoria-select');
        }
    } catch(e) {}
}

function filtrarCategoriasPorTipo(tipo, selectId) {
    const select = document.getElementById(selectId);
    if(!select) return;
    select.innerHTML = '';
    const filtradas = categoriasCargadas.filter(c => c.tipo_flujo === tipo);
    if(filtradas.length === 0) {
        select.innerHTML = '<option value="">No hay categorías</option>';
    } else {
        filtradas.forEach(c => {
            select.insertAdjacentHTML('beforeend', `<option value="${c.id}">${c.icono} ${c.nombre_categoria}</option>`);
        });
    }
}

function toggleTipo(tipo, isEdit = false) {
    const prefix = isEdit ? 'edit-' : '';
    const btnG = document.getElementById(prefix + 'btnGasto');
    const btnI = document.getElementById(prefix + 'btnIngreso');
    btnG.classList.remove('active', 'gasto');
    btnI.classList.remove('active', 'ingreso');
    if(tipo === 'gasto') btnG.classList.add('active', 'gasto');
    else btnI.classList.add('active', 'ingreso');
    filtrarCategoriasPorTipo(tipo, prefix + 'categoria-select');
}

function toggleEstado(estado, isEdit = false) {
    const prefix = isEdit ? '.edit-estado-btn' : '.estado-btn';
    const idPrefix = isEdit ? 'edit-btnEst' : 'btnEst';
    document.querySelectorAll(prefix).forEach(btn => btn.classList.remove('active', 'pendiente', 'pagado', 'guardado'));
    let btnId = idPrefix + estado.charAt(0).toUpperCase() + estado.slice(1);
    const btn = document.getElementById(btnId);
    if(btn) btn.classList.add('active', estado);
}

function getEstadoSeleccionado(isEdit = false) {
    const prefix = isEdit ? 'edit-btnEst' : 'btnEst';
    if(document.getElementById(prefix + 'Pendiente').classList.contains('active')) return 'pendiente';
    if(document.getElementById(prefix + 'Pagado').classList.contains('active')) return 'pagado';
    return 'guardado';
}

async function guardarNuevoRegistro() {
    const inputMonto = document.getElementById('nuevo-monto').value;
    const desc = document.getElementById('nuevo-desc').value;
    const id_categoria = document.getElementById('categoria-select').value;
    const fecha = document.getElementById('nuevo-fecha').value; 
    const estado = getEstadoSeleccionado();
    const tipo = document.getElementById('btnGasto').classList.contains('active') ? 'gasto' : 'ingreso';
    const usuario_id = localStorage.getItem('usuario_id') || 1; 
    
    if(!inputMonto || !desc || !id_categoria || !fecha) return mostrarToast("Por favor, llena todos los campos.");

    const montoLimpio = inputMonto.replace(/\D/g, ''); 
    const datos = { usuario_id, tipo, monto: montoLimpio, descripcion: desc, id_categoria, estado, fecha_transaccion: fecha };
    
    try {
        const response = await fetch('../api/insert_registro.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const resultado = await response.json();
        if (response.ok && resultado.status === 'success') {
            mostrarToast("Registro guardado exitosamente");
            cerrarModal({target: document.getElementById('modalNuevo')}, 'modalNuevo');
            document.getElementById('nuevo-monto').value = '';
            document.getElementById('nuevo-desc').value = '';
            cargarDatosGlobales();
        } else { mostrarToast("Error: " + resultado.message); }
    } catch (error) { mostrarToast("Error con el servidor."); }
}

function inicializarFiltroMeses() {
    const container = document.getElementById('filtro-meses-container');
    if(!container) return;
    container.innerHTML = '';
    
    if (transaccionesCargadas.length === 0) {
        container.innerHTML = '<div style="color: var(--texto-secundario); padding: 10px; font-size: 0.9rem;">No hay meses con movimientos</div>';
        renderizarListaFiltrada();
        return;
    }
    
    const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const periodosUnicos = [...new Set(transaccionesCargadas.map(tx => {
        const p = tx.fecha_transaccion.split('-');
        return `${p[0]}-${parseInt(p[1])}`; 
    }))];
    
    periodosUnicos.sort((a, b) => {
        const [anioA, mesA] = a.split('-');
        const [anioB, mesB] = b.split('-');
        return new Date(anioA, mesA - 1) - new Date(anioB, mesB - 1);
    });
    
    const periodoActualStr = `${filtroAnioActual}-${filtroMesActual}`;
    if (filtroMesActual !== 'ALL' && !periodosUnicos.includes(periodoActualStr)) {
        const ultimoPeriodo = periodosUnicos[periodosUnicos.length - 1];
        const [ultimoAnio, ultimoMes] = ultimoPeriodo.split('-');
        filtroAnioActual = parseInt(ultimoAnio);
        filtroMesActual = parseInt(ultimoMes);
    }
    
    // PÍLDORA "ALL" ACTUALIZADA (Sin infinito, fuente Bold/Black)
    let html = `<div class="mes-pill ${filtroMesActual === 'ALL' ? 'active' : ''}" id="pill-ALL" onclick="seleccionarMes('ALL', 'ALL', this)" style="font-family: 'Inter', sans-serif; font-weight: 900; font-size: 1.1rem; letter-spacing: 0.5px;">
                    ALL
                </div>`;
                
    let pillActivoId = filtroMesActual === 'ALL' ? 'pill-ALL' : '';
    
    periodosUnicos.forEach(periodo => {
        const [anioStr, mesStr] = periodo.split('-');
        const mes = parseInt(mesStr);
        const anio = parseInt(anioStr);
        const nombreMes = mesesNombres[mes - 1];
        const anioCorto = String(anio).slice(-2);
        const isActive = (mes === filtroMesActual && anio === filtroAnioActual) ? 'active' : '';
        const id = `pill-${mes}-${anio}`;
        if(isActive) pillActivoId = id;
        
        html += `<div class="mes-pill ${isActive}" id="${id}" onclick="seleccionarMes(${mes}, ${anio}, this)">
                    ${nombreMes} <span class="anio">${anioCorto}</span>
                 </div>`;
    });
    
    container.innerHTML = html;
    setTimeout(() => {
        const pill = document.getElementById(pillActivoId);
        if(pill) pill.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
    }, 100);
    renderizarListaFiltrada();
}

function seleccionarMes(mes, anio, elemento) {
    document.querySelectorAll('.mes-pill').forEach(el => el.classList.remove('active'));
    elemento.classList.add('active');
    elemento.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    filtroMesActual = mes;
    filtroAnioActual = anio;
    renderizarListaFiltrada();
}

async function cargarDatosGlobales() {
    const uid = localStorage.getItem('usuario_id') || 1;
    try {
        const resp = await fetch(`../api/get_transacciones.php?usuario_id=${uid}`);
        const result = await resp.json();
        if(result.status === 'success') {
            transaccionesCargadas = result.data;
            inicializarFiltroMeses();
        }
    } catch(e) { console.error(e) }
}

function renderizarListaFiltrada() {
    const lista = document.getElementById('lista-transacciones');
    if(!lista) return;
    lista.innerHTML = ''; 
    
    const filtradas = transaccionesCargadas.filter(tx => {
        if(filtroMesActual === 'ALL') return true;
        const p = tx.fecha_transaccion.split('-');
        return parseInt(p[0]) === filtroAnioActual && parseInt(p[1]) === filtroMesActual;
    });

    if(filtradas.length === 0) {
        lista.innerHTML = '<p style="text-align:center; color:var(--texto-secundario); padding: 20px;">No hay transacciones en este mes.</p>';
        return;
    }

    let mesActualAgrupador = '';

    filtradas.forEach(tx => {
        const montoF = parseInt(tx.monto).toLocaleString('es-CL');
        const cColor = tx.tipo_flujo === 'gasto' ? 'monto-negativo' : 'monto-positivo';
        const signo = tx.tipo_flujo === 'gasto' ? '-' : '+';
        const montoCompleto = `${signo}$${montoF}`;
        
        const fechaParts = tx.fecha_transaccion.split('-');
        const f = new Date(fechaParts[0], fechaParts[1] - 1, fechaParts[2]);
        const dia = String(f.getDate()).padStart(2, '0');
        const mesCorto = f.toLocaleString('es-CL', { month: 'short' });
        const fechaCorta = `${dia} ${mesCorto}`;

        const mesLargo = f.toLocaleString('es-CL', { month: 'long' });
        const anio = f.getFullYear();
        const mesAnio = `${mesLargo} ${anio}`.toUpperCase();

        if (mesAnio !== mesActualAgrupador) {
            mesActualAgrupador = mesAnio;
            lista.insertAdjacentHTML('beforeend', `<div class="fecha-separador">${mesActualAgrupador}</div>`);
        }
        
        const catColor = tx.color_hex || '#4A5568'; 
        const badgeCatHtml = tx.nombre_categoria 
            ? `<span class="badge" style="background-color: ${catColor}; color: #fff; border: none; font-size: 0.75rem; text-transform: none; padding: 4px 8px; border-radius: 6px;">${tx.nombre_categoria}</span>`
            : `<span class="badge" style="background-color: #4A5568; color: #fff; border: none;">Sin Categoría</span>`;

        const html = `
        <div class="tx-card" onclick="abrirDetalle(${tx.id})">
            <div class="tx-icon">${tx.icono || '🏷️'}</div>
            <div class="tx-date">${fechaCorta}</div>
            <div class="tx-state"><span class="badge st-${tx.estado_pago}">${tx.estado_pago}</span></div>
            <div class="tx-title">${tx.titulo}</div>
            <div class="tx-tag-wrap">${badgeCatHtml}</div>
            <div class="tx-amount ${cColor}">${montoCompleto}</div>
        </div>`;
        lista.insertAdjacentHTML('beforeend', html);
    });
}

function abrirDetalle(id) {
    const tx = transaccionesCargadas.find(t => t.id == id);
    if(!tx) return;
    txActualId = id;
    
    document.getElementById('modTitle').innerText = tx.titulo;
    document.getElementById('modIcon').innerHTML = tx.icono || '🏷️';
    
    const fechaParts = tx.fecha_transaccion.split('-');
    const f = new Date(fechaParts[0], fechaParts[1] - 1, fechaParts[2]);
    const dia = String(f.getDate()).padStart(2, '0');
    const mes = f.toLocaleString('es-CL', { month: 'short' });
    document.getElementById('modDate').innerText = `${dia} ${mes} ${f.getFullYear()}`;
    
    const montoF = parseInt(tx.monto).toLocaleString('es-CL');
    const signo = tx.tipo_flujo === 'gasto' ? '-' : '+';
    const cColor = tx.tipo_flujo === 'gasto' ? 'monto-negativo' : 'monto-positivo';
    const amnt = document.getElementById('modAmount');
    amnt.innerText = `${signo}$${montoF}`;
    amnt.className = 'mod-monto ' + cColor;
    
    document.getElementById('modDesc').innerText = tx.descripcion || 'Sin descripción detallada';
    document.getElementById('modStateTag').innerText = tx.estado_pago;
    document.getElementById('modStateTag').className = 'badge st-' + tx.estado_pago;
    
    document.getElementById('modalInfo').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function abrirModalEditar() {
    const tx = transaccionesCargadas.find(t => t.id == txActualId);
    if(!tx) return;
    
    cerrarModal({target: document.getElementById('modalInfo')}, 'modalInfo');
    toggleTipo(tx.tipo_flujo, true);
    
    setTimeout(() => {
        document.getElementById('edit-monto').value = '$' + parseInt(tx.monto).toLocaleString('es-CL');
        document.getElementById('edit-desc').value = tx.descripcion || tx.titulo;
        document.getElementById('edit-categoria-select').value = tx.id_categoria;
        document.getElementById('edit-fecha').value = tx.fecha_transaccion; 
        toggleEstado(tx.estado_pago, true);
        
        document.getElementById('modalEditar').classList.add('active');
        document.body.style.overflow = 'hidden';
    }, 150);
}

async function guardarEdicionRegistro() {
    const inputMonto = document.getElementById('edit-monto').value;
    const desc = document.getElementById('edit-desc').value;
    const id_categoria = document.getElementById('edit-categoria-select').value;
    const fecha = document.getElementById('edit-fecha').value; 
    const estado = getEstadoSeleccionado(true);
    const tipo = document.getElementById('edit-btnGasto').classList.contains('active') ? 'gasto' : 'ingreso';
    const usuario_id = localStorage.getItem('usuario_id') || 1; 
    
    if(!inputMonto || !desc || !id_categoria || !fecha) return mostrarToast("Por favor, llena todos los campos.");

    const montoLimpio = inputMonto.replace(/\D/g, ''); 
    const datos = { id: txActualId, usuario_id, tipo, monto: montoLimpio, descripcion: desc, id_categoria, estado, fecha_transaccion: fecha };
    
    try {
        const response = await fetch('../api/update_registro.php', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        const resultado = await response.json();
        if (response.ok && resultado.status === 'success') {
            mostrarToast("Registro actualizado correctamente");
            cerrarModal({target: document.getElementById('modalEditar')}, 'modalEditar');
            cargarDatosGlobales();
        } else { mostrarToast("Error: " + resultado.message); }
    } catch (error) { mostrarToast("Error con el servidor."); }
}

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosGlobales();
    cargarCategoriasDropdown();
    const today = new Date().toISOString().split('T')[0];
    if(document.getElementById('nuevo-fecha')) document.getElementById('nuevo-fecha').value = today;
});

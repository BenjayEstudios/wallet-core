
let transaccionesCargadas = [];
let filtroMesActual = new Date().getMonth() + 1;
let filtroAnioActual = new Date().getFullYear();

// Instancias globales para Chart.js
let donutChartInstance = null;
let lineChartInstance = null;

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

function inicializarFiltroMeses() {
    const container = document.getElementById('filtro-meses-container');
    if(!container) return;
    container.innerHTML = '';
    
    if (transaccionesCargadas.length === 0) {
        container.innerHTML = '<div style="color: var(--texto-secundario); padding: 10px; font-size: 0.9rem;">No hay meses con movimientos</div>';
        renderizarDashboard();
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
    
    let html = `<div class="mes-pill ${filtroMesActual === 'ALL' ? 'active' : ''}" id="pill-ALL" onclick="seleccionarMes('ALL', 'ALL', this)" style="font-weight: 800;">ALL</div>`;
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
                    <span>${nombreMes}</span> <span class="anio">${anioCorto}</span>
                 </div>`;
    });
    
    container.innerHTML = html;
    setTimeout(() => {
        const pill = document.getElementById(pillActivoId);
        if(pill) pill.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
    }, 100);
    
    renderizarDashboard();
}

function seleccionarMes(mes, anio, elemento) {
    document.querySelectorAll('.mes-pill').forEach(el => el.classList.remove('active'));
    elemento.classList.add('active');
    elemento.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    filtroMesActual = mes;
    filtroAnioActual = anio;
    renderizarDashboard();
}

function renderizarDashboard() {
    let ingresosTotales = 0;
    let gastosPagados = 0;
    let gastosPendientes = 0;
    let dineroGuardado = 0;

    const filtradas = transaccionesCargadas.filter(tx => {
        if(filtroMesActual === 'ALL') return true;
        const p = tx.fecha_transaccion.split('-');
        return parseInt(p[0]) === filtroAnioActual && parseInt(p[1]) === filtroMesActual;
    });

    filtradas.forEach(tx => {
        const monto = parseInt(tx.monto);
        if (tx.tipo_flujo === 'ingreso') {
            ingresosTotales += monto;
        } else if (tx.tipo_flujo === 'gasto') {
            if (tx.estado_pago === 'pagado') gastosPagados += monto;
            if (tx.estado_pago === 'pendiente') gastosPendientes += monto;
            if (tx.estado_pago === 'guardado') dineroGuardado += monto;
        }
    });

    const balanceReal = ingresosTotales - gastosPagados;

    // Actualizar Panel de Balance
    document.getElementById('dash-balance').innerText = '$' + balanceReal.toLocaleString('es-CL');
    document.getElementById('dash-ingresos').innerText = '$' + ingresosTotales.toLocaleString('es-CL');
    document.getElementById('dash-gastos').innerText = '$' + gastosPagados.toLocaleString('es-CL');
    document.getElementById('dash-guardado').innerText = '$' + dineroGuardado.toLocaleString('es-CL');
    document.getElementById('dash-pendiente').innerText = '$' + gastosPendientes.toLocaleString('es-CL');

    // --- FASE 2: PREPARAR DATOS PARA GRÁFICOS ---
    const gastos = filtradas.filter(tx => tx.tipo_flujo === 'gasto');

    if (gastos.length === 0) {
        document.getElementById('chartCategorias').style.display = 'none';
        document.getElementById('chartEvolucion').style.display = 'none';
        document.getElementById('ph-donut').style.display = 'flex';
        document.getElementById('ph-line').style.display = 'flex';
        return;
    }

    // 1. Datos para Donut Chart (Sumatoria por Categoría)
    const categoriasMap = {};
    gastos.forEach(tx => {
        const cat = tx.nombre_categoria || 'Sin Categoría';
        const color = tx.color_hex || '#4A5568';
        if (!categoriasMap[cat]) categoriasMap[cat] = { total: 0, color: color };
        categoriasMap[cat].total += parseInt(tx.monto);
    });

    const donutLabels = Object.keys(categoriasMap);
    const donutData = donutLabels.map(cat => categoriasMap[cat].total);
    const donutColors = donutLabels.map(cat => categoriasMap[cat].color);

    // 2. Datos para Line Chart (Evolución diaria cronológica)
    const diasMap = {};
    gastos.forEach(tx => {
        const fecha = tx.fecha_transaccion; // Formato YYYY-MM-DD
        if (!diasMap[fecha]) diasMap[fecha] = 0;
        diasMap[fecha] += parseInt(tx.monto);
    });

    const lineFechasOriginales = Object.keys(diasMap).sort();
    const lineData = lineFechasOriginales.map(f => diasMap[f]);
    const lineLabels = lineFechasOriginales.map(f => {
        const parts = f.split('-');
        return `${parts[2]}/${parts[1]}`; // Formato DD/MM
    });

    renderizarGraficos(donutLabels, donutData, donutColors, lineLabels, lineData);
}

function renderizarGraficos(dLabels, dData, dColors, lLabels, lData) {
    const canvasDonut = document.getElementById('chartCategorias');
    const canvasLine = document.getElementById('chartEvolucion');
    
    canvasDonut.style.display = 'block';
    canvasLine.style.display = 'block';
    
    document.getElementById('ph-donut').style.display = 'none';
    document.getElementById('ph-line').style.display = 'none';

    if (donutChartInstance) donutChartInstance.destroy();
    if (lineChartInstance) lineChartInstance.destroy();

    // Defaults para modo oscuro
    Chart.defaults.color = '#A0ABC0';
    Chart.defaults.font.family = 'Inter';

    // Gráfico de Donut (Categorías)
    const ctxDonut = canvasDonut.getContext('2d');
    donutChartInstance = new Chart(ctxDonut, {
        type: 'doughnut',
        data: {
            labels: dLabels,
            datasets: [{
                data: dData,
                backgroundColor: dColors,
                borderWidth: 2,
                borderColor: '#1C2127', // color del var(--surface) para bordes limpios
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { boxWidth: 12, padding: 15 } }
            }
        }
    });

    // Gráfico de Líneas (Tendencia)
    const ctxLine = canvasLine.getContext('2d');
    lineChartInstance = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: lLabels,
            datasets: [{
                label: 'Gastos por Día',
                data: lData,
                borderColor: '#38A169',
                backgroundColor: 'rgba(56, 161, 105, 0.1)',
                borderWidth: 3,
                pointBackgroundColor: '#1C2127',
                pointBorderColor: '#38A169',
                pointBorderWidth: 2,
                pointRadius: 4,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: 'rgba(255, 255, 255, 0.05)' },
                    ticks: { callback: function(value) { return '$' + value.toLocaleString('es-CL'); } }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

function exportarCSV() {
    if(transaccionesCargadas.length === 0) return mostrarToast("No hay datos para exportar.");
    
    const filtradas = transaccionesCargadas.filter(tx => {
        if(filtroMesActual === 'ALL') return true;
        const p = tx.fecha_transaccion.split('-');
        return parseInt(p[0]) === filtroAnioActual && parseInt(p[1]) === filtroMesActual;
    });

    if(filtradas.length === 0) return mostrarToast("No hay datos en este mes.");

    let csvContent = "\uFEFF"; 
    csvContent += "ID,Fecha,Tipo,Categoría,Título,Monto,Estado\n";

    filtradas.forEach(tx => {
        const tituloLimpio = `"${tx.titulo.replace(/"/g, '""')}"`;
        const catNombre = tx.nombre_categoria ? `"${tx.nombre_categoria}"` : '"Sin Categoría"';
        const row = [ tx.id, tx.fecha_transaccion, tx.tipo_flujo, catNombre, tituloLimpio, tx.monto, tx.estado_pago ];
        csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const nombreArchivo = filtroMesActual === 'ALL' ? 'MisFinanzas_Historial_Completo.csv' : `MisFinanzas_${filtroMesActual}_${filtroAnioActual}.csv`;
    link.setAttribute("download", nombreArchivo);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarToast("CSV exportado exitosamente. Listo para IA 🤖");
}

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosGlobales();
});

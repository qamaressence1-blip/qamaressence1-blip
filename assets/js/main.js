/* =============================================
   Qamar Essence - Lógica Principal (JavaScript)
   =============================================
*/

// --- VARIABLES GLOBALES ---
let perfumesData = []; // Aquí se guardarán los datos leídos del CSV
let currentCategory = 'Todos'; // Categoría seleccionada por defecto

// Elementos del DOM
const grid = document.getElementById("grid");
const loader = document.getElementById("loader");
const noResults = document.getElementById("noResults");
const searchInput = document.getElementById("searchInput");
const filterContainer = document.getElementById("filterContainer");

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    loadCSVData();

    // Event Listener para el buscador en tiempo real
    searchInput.addEventListener("input", renderGrid);
    
    // Event Listeners para cerrar el modal
    document.getElementById("closeModalBtn").addEventListener("click", closeModal);
    document.getElementById("modal").addEventListener("click", (e) => {
        if (e.target.id === "modal") closeModal(); // Cerrar si se hace clic fuera de la tarjeta
    });
});

// --- CARGAR DATOS DESDE EL EXCEL (CSV) ---
function loadCSVData() {
    // Usamos PapaParse para leer el archivo data/perfumes.csv
    Papa.parse("assets/perfumes.csv", {
        download: true,       // Descarga el archivo de la ruta especificada
        header: true,         // La primera fila contiene los nombres de las columnas
        skipEmptyLines: true, // Ignora filas vacías en el Excel
        complete: function(results) {
            // Se ejecuta cuando termina de leer el CSV
            perfumesData = results.data;
            loader.style.display = "none"; // Oculta el loader animado
            
            generateFilters(); // Genera los botones dinámicamente según las categorías
            renderGrid();      // Dibuja las tarjetas
        },
        error: function(err) {
            console.error("Error al cargar el CSV:", err);
            loader.innerHTML = "<p class='text-red-500'>Error al cargar el catálogo. Comprueba que el archivo data/perfumes.csv existe.</p>";
        }
    });
}

// --- GENERAR BOTONES DE FILTRO DINÁMICAMENTE ---
function generateFilters() {
    // Obtener categorías únicas del CSV (ignorando vacíos)
    const categorias = new Set();
    perfumesData.forEach(p => {
        if(p.Categoria) categorias.add(p.Categoria.trim());
    });

    // Crear array de categorías (Todos siempre va primero)
    const filterOptions = ['Todos', ...Array.from(categorias)];
    
    filterContainer.innerHTML = ""; // Limpiar contenedor

    filterOptions.forEach(cat => {
        const btn = document.createElement("button");
        btn.innerText = cat;
        btn.onclick = () => {
            currentCategory = cat;
            updateFilterButtons();
            renderGrid();
        };
        filterContainer.appendChild(btn);
    });

    updateFilterButtons();
}

// Actualizar el estilo visual de los botones de filtro
function updateFilterButtons() {
    const buttons = filterContainer.querySelectorAll("button");
    buttons.forEach(btn => {
        if (btn.innerText === currentCategory) {
            btn.className = "btn-filter active shadow-sm";
        } else {
            btn.className = "btn-filter inactive hover:bg-gray-100 dark:hover:bg-white/5";
        }
    });
}

// --- RENDERIZAR LAS TARJETAS ---
function renderGrid() {
    const txtSearch = searchInput.value.toLowerCase().trim();
    grid.innerHTML = ""; // Limpiar grid

    // Filtrar los datos basándonos en la categoría y el texto buscado
    const filtered = perfumesData.filter(p => {
        // Ignorar filas incompletas o corruptas
        if (!p.Nombre || !p.Marca) return false;

        const matchSearch = p.Nombre.toLowerCase().includes(txtSearch) || p.Marca.toLowerCase().includes(txtSearch);
        const matchCat = currentCategory === 'Todos' || p.Categoria.trim() === currentCategory;
        
        // ¡IMPORTANTE! El campo p.Stock existe en el objeto (porque está en el CSV) 
        // pero NO lo usamos aquí para mostrarlo, manteniendo tu control de inventario oculto al cliente.
        // Opcional: Podrías hacer que si p.Stock == "0", no se muestre el producto.
        // if (parseInt(p.Stock) <= 0) return false; 

        return matchSearch && matchCat;
    });

    // Mostrar mensaje si no hay resultados
    if (filtered.length === 0) {
        noResults.classList.remove("hidden");
    } else {
        noResults.classList.add("hidden");
    }

    // Crear las tarjetas para cada producto filtrado
    filtered.forEach(p => {
        const card = document.createElement("div");
        card.className = "glass-card rounded-2xl p-3 sm:p-4 flex flex-col justify-between cursor-pointer dark:gold-glow-hover transition transform hover:-translate-y-1 shadow-md hover:shadow-lg border border-gray-200 dark:border-transparent";
        
        // Al hacer clic, abre el modal
        card.onclick = () => openModal(p);
        
        // Formatear precio
        const precioFormateado = parseFloat(p.Precio).toFixed(2);

        card.innerHTML = `
            <div class="w-full h-32 sm:h-40 bg-gray-50 dark:bg-white/[0.01] rounded-xl flex items-center justify-center p-2 mb-3 overflow-hidden relative border border-gray-100 dark:border-white/[0.02]">
                <img src="${p.Imagen}" alt="${p.Nombre}" class="max-h-full max-w-full object-contain filter drop-shadow-sm dark:drop-shadow-[0_4px_6px_rgba(0,0,0,0.5)]" onerror="this.src='https://via.placeholder.com/150?text=Sin+Imagen'">
                <span class="absolute top-1.5 right-1.5 bg-white/90 dark:bg-black/70 text-[8px] text-gray-700 dark:text-gray-400 px-1.5 py-0.5 rounded-md backdrop-blur-sm border border-gray-200 dark:border-white/5 font-medium shadow-sm">${p.Tamano}</span>
            </div>
            <div>
                <p class="text-[8px] sm:text-[9px] tracking-widest text-gold uppercase font-bold mb-0.5">${p.Marca}</p>
                <h4 class="text-gray-800 dark:text-white text-xs sm:text-sm font-medium truncate mb-3 tracking-wide">${p.Nombre}</h4>
            </div>
            <div class="flex items-center justify-between pt-2.5 border-t border-gray-200 dark:border-white/5">
                <span class="text-gray-900 dark:text-white font-bold font-luxury text-sm sm:text-base">${precioFormateado}€</span>
                <span class="text-[10px] text-gold font-medium flex items-center gap-1">Ver notas <i class="fas fa-chevron-right text-[7px]"></i></span>
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- LÓGICA DEL MODAL ---
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");

function openModal(p) {
    // Rellenar datos
    document.getElementById("mImg").src = p.Imagen;
    document.getElementById("mMarca").innerText = p.Marca;
    document.getElementById("mNombre").innerText = p.Nombre;
    
    // Si no hay notas especificadas en el Excel, poner un guion
    document.getElementById("nS").innerText = p.Salida || "-";
    document.getElementById("nC").innerText = p.Corazon || "-";
    document.getElementById("nF").innerText = p.Fondo || "-";
    
    document.getElementById("mPrecio").innerText = parseFloat(p.Precio).toFixed(2) + "€";
    
    // Personalizar el mensaje de Instagram (Opcional)
    const mensaje = encodeURIComponent(`Hola, me interesa el perfume ${p.Nombre} de ${p.Marca}.`);
    // Ojo: Instagram no soporta links con texto predefinido directamente por DM web fácilmente, pero lo dejamos listo por si usas WhatsApp en el futuro (ej. wa.me/TuNumero?text=...)
    // Mantenemos el link a tu perfil
    document.getElementById("mLink").href = "https://www.instagram.com/qmaressence/";

    // Mostrar con animación
    modal.classList.remove("hidden");
    // Pequeño delay para que la transición de opacidad funcione
    setTimeout(() => {
        modal.classList.remove("opacity-0");
        modalContent.classList.remove("scale-95");
        modalContent.classList.add("scale-100");
    }, 10);
    
    // Evitar scroll en el body
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    // Animación de salida
    modal.classList.add("opacity-0");
    modalContent.classList.remove("scale-100");
    modalContent.classList.add("scale-95");
    
    setTimeout(() => {
        modal.classList.add("hidden");
        // Restaurar scroll
        document.body.style.overflow = 'auto';
    }, 300); // 300ms es la duración de la transición en CSS
}

// --- MODO CLARO / OSCURO ---
const themeToggleBtn = document.getElementById("themeToggle");

function initTheme() {
    // Verifica si hay una preferencia guardada, sino usa oscuro por defecto (como pediste)
    if (localStorage.theme === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.theme = 'dark';
    }
}

themeToggleBtn.addEventListener("click", () => {
    if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
        localStorage.theme = 'light';
    } else {
        document.documentElement.classList.add("dark");
        localStorage.theme = 'dark';
    }
});

// --- VARIABLES GLOBALES ---
let perfumesData = [];
let currentCategory = 'Todos';
let currentMarca = 'Todas';  // ← NUEVO

const grid = document.getElementById("grid");
const loader = document.getElementById("loader");
const noResults = document.getElementById("noResults");
const searchInput = document.getElementById("searchInput");
const filterContainer = document.getElementById("filterContainer");
const brandContainer = document.getElementById("brandContainer"); // ← NUEVO elemento en el HTML

// --- INICIALIZACIÓN ---
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    loadCSVData();
    searchInput.addEventListener("input", renderGrid);
    document.getElementById("closeModalBtn").addEventListener("click", closeModal);
    document.getElementById("modal").addEventListener("click", (e) => {
        if (e.target.id === "modal") closeModal();
    });
});

// --- CARGAR CSV ---
function loadCSVData() {
    Papa.parse("assets/perfumes.csv", {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            perfumesData = results.data;
            loader.style.display = "none";
            generateFilters();
            renderGrid();
        },
        error: function(err) {
            console.error("Error al cargar el CSV:", err);
            loader.innerHTML = "<p class='text-red-500'>Error al cargar el catálogo.</p>";
        }
    });
}

// --- FILTROS DE CATEGORÍA ---
function generateFilters() {
    const categorias = new Set();
    perfumesData.forEach(p => {
        if (p.Categoria) categorias.add(p.Categoria.trim());
    });

    const filterOptions = ['Todos', ...Array.from(categorias)];
    filterContainer.innerHTML = "";

    filterOptions.forEach(cat => {
        const btn = document.createElement("button");
        btn.innerText = cat;
        btn.onclick = () => {
            currentCategory = cat;
            currentMarca = 'Todas'; // ← Resetear marca al cambiar categoría
            updateFilterButtons();
            generateBrandFilters(); // ← NUEVO: regenerar marcas
            renderGrid();
        };
        filterContainer.appendChild(btn);
    });

    updateFilterButtons();
    generateBrandFilters(); // ← NUEVO: mostrar marcas al inicio
}

function updateFilterButtons() {
    filterContainer.querySelectorAll("button").forEach(btn => {
        btn.className = btn.innerText === currentCategory
            ? "btn-filter active shadow-sm"
            : "btn-filter inactive hover:bg-gray-100 dark:hover:bg-white/5";
    });
}

// --- FILTROS DE MARCA (NUEVO) ---
function generateBrandFilters() {
    if (!brandContainer) return;

    // Obtener marcas únicas del subconjunto filtrado por categoría actual
    const marcas = new Set();
    perfumesData.forEach(p => {
        if (!p.Marca) return;
        const matchCat = currentCategory === 'Todos' || (p.Categoria && p.Categoria.trim() === currentCategory);
        if (matchCat) marcas.add(p.Marca.trim());
    });

    // Si solo hay una marca (o ninguna), ocultar el contenedor
    if (marcas.size <= 1) {
        brandContainer.innerHTML = "";
        brandContainer.style.display = "none";
        return;
    }

    brandContainer.style.display = "";
    brandContainer.innerHTML = "";

    const brandOptions = ['Todas', ...Array.from(marcas).sort()];

    brandOptions.forEach(marca => {
        const btn = document.createElement("button");
        btn.innerText = marca;
        btn.onclick = () => {
            currentMarca = marca;
            updateBrandButtons();
            renderGrid();
        };
        brandContainer.appendChild(btn);
    });

    updateBrandButtons();
}

function updateBrandButtons() {
    if (!brandContainer) return;
    brandContainer.querySelectorAll("button").forEach(btn => {
        // Estilo más sutil que los filtros de categoría (usa clases diferentes o inline)
        btn.className = btn.innerText === currentMarca
            ? "btn-filter active shadow-sm"
            : "btn-filter inactive hover:bg-gray-100 dark:hover:bg-white/5";
    });
}

// --- RENDERIZAR GRID ---
function renderGrid() {
    const txtSearch = searchInput.value.toLowerCase().trim();
    grid.innerHTML = "";

    const filtered = perfumesData.filter(p => {
        if (!p.Nombre || !p.Marca) return false;

        const matchSearch = p.Nombre.toLowerCase().includes(txtSearch) || p.Marca.toLowerCase().includes(txtSearch);
        const matchCat = currentCategory === 'Todos' || p.Categoria.trim() === currentCategory;
        const matchMarca = currentMarca === 'Todas' || p.Marca.trim() === currentMarca; // ← NUEVO

        return matchSearch && matchCat && matchMarca;
    });

    if (filtered.length === 0) {
        noResults.classList.remove("hidden");
    } else {
        noResults.classList.add("hidden");
    }

    filtered.forEach(p => {
        const card = document.createElement("div");
        card.className = "glass-card rounded-2xl p-3 sm:p-4 flex flex-col justify-between cursor-pointer dark:gold-glow-hover transition transform hover:-translate-y-1 shadow-md hover:shadow-lg border border-gray-200 dark:border-transparent";
        card.onclick = () => openModal(p);

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

// --- MODAL (sin cambios) ---
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");

function openModal(p) {
    document.getElementById("mImg").src = p.Imagen;
    document.getElementById("mMarca").innerText = p.Marca;
    document.getElementById("mNombre").innerText = p.Nombre;
    document.getElementById("nS").innerText = p.Salida || "-";
    document.getElementById("nC").innerText = p.Corazon || "-";
    document.getElementById("nF").innerText = p.Fondo || "-";
    document.getElementById("mPrecio").innerText = parseFloat(p.Precio).toFixed(2) + "€";
    document.getElementById("mLink").href = "https://www.instagram.com/qmaressence/";

    modal.classList.remove("hidden");
    setTimeout(() => {
        modal.classList.remove("opacity-0");
        modalContent.classList.remove("scale-95");
        modalContent.classList.add("scale-100");
    }, 10);
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    modal.classList.add("opacity-0");
    modalContent.classList.remove("scale-100");
    modalContent.classList.add("scale-95");
    setTimeout(() => {
        modal.classList.add("hidden");
        document.body.style.overflow = 'auto';
    }, 300);
}

// --- TEMA ---
const themeToggleBtn = document.getElementById("themeToggle");

function initTheme() {
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


// 1. Bloquear clic derecho (Menú contextual)
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // 2. Bloquear atajos de teclado comunes de las DevTools
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.key === 'F12') {
            e.preventDefault();
        }
        // Ctrl+Shift+I (Windows/Linux) o Cmd+Opt+I (Mac)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i')) {
            e.preventDefault();
        }
        // Ctrl+Shift+J (Consola)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
            e.preventDefault();
        }
        // Ctrl+U o Cmd+Opt+U (Ver código fuente)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u')) {
            e.preventDefault();
        }
        // Ctrl+Shift+C (Inspector de elementos)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'C' || e.key === 'c')) {
            e.preventDefault();
        }
    });

    // 3. El truco del "Debugger infinito"
    // Si consiguen abrir las DevTools por el menú del navegador, esto pausará la ejecución de la página constantemente en la pestaña "Sources"
    setInterval(function() {
        debugger;
    }, 100);

    //Script de Inauguración y Confeti

     document.addEventListener("DOMContentLoaded", () => {
            const welcomeModal = document.getElementById("welcomeModal");
            const welcomeContent = document.getElementById("welcomeModalContent");
            const closeWelcomeBtn = document.getElementById("closeWelcomeBtn");

            // Configuración de colores personalizados de confeti (Tonos Dorados y Blancos de lujo)
            const goldColors = ['#D4AF37', '#F3E5AB', '#AA7C11', '#FFFFFF', '#ECE1B4'];

            // Función para lanzar ráfagas de confeti continuo de fondo
            function launchInaugurationConfetti() {
                var duration = 4 * 1000;
                var end = Date.now() + duration;

                (function frame() {
                    confetti({
                        particleCount: 3,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0, y: 0.8 },
                        colors: goldColors
                    });
                    confetti({
                        particleCount: 3,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1, y: 0.8 },
                        colors: goldColors
                    });

                    if (Date.now() < end) {
                        requestAnimationFrame(frame);
                    }
                }());
            }

            // Lanzar primer confeti al cargar la web
            setTimeout(() => {
                launchInaugurationConfetti();
            }, 300);

            // Cierre del modal con animación fluida
            closeWelcomeBtn.addEventListener("click", () => {
                welcomeContent.classList.add("scale-95");
                welcomeModal.classList.add("opacity-0");
                
                // Lanzar una explosión final masiva desde el centro al entrar al catálogo
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: goldColors
                });

                setTimeout(() => {
                    welcomeModal.style.display = "none";
                }, 500);
            });
        });
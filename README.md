# Qamar Essence Web - Guía de Uso

Esta es tu página web estática, mejorada con Modo Claro/Oscuro, diseño responsive, y conectada a un archivo CSV que funciona como tu "Excel" de base de datos.

## Estructura de Carpetas

* `index.html` -> El archivo principal de tu página web.
* `data/perfumes.csv` -> **¡TU BASE DE DATOS!** Aquí es donde gestionas tu inventario.
* `assets/css/styles.css` -> Estilos visuales extra (colores, sombras, scroll).
* `assets/js/main.js` -> Toda la lógica de programación (filtros, leer el CSV, modo oscuro).
* `assets/images/` -> (Opcional) Carpeta por si quieres descargar las fotos y ponerlas aquí en lugar de usar links de internet.

## ¿Cómo editar los perfumes (El "Excel")?

1. Abre el archivo `data/perfumes.csv` con **Microsoft Excel**, **Google Sheets** o cualquier editor de hojas de cálculo.
2. Verás columnas claras: Nombre, Marca, Categoria, Tamano, Precio, Imagen, Salida, Corazon, Fondo, y Stock.
3. Añade filas nuevas o modifica las existentes.
4. **IMPORTANTE AL GUARDAR:** Asegúrate de guardar el archivo con formato **CSV (Valores separados por comas)**. Si lo guardas como `.xlsx`, la web no lo entenderá. 
5. La columna **Stock** se lee, pero como me pediste, **NO** se muestra en la web. Es solo para tu control interno.

## ¿Cómo probarla en tu ordenador (Local)?

Como la web lee un archivo externo (`perfumes.csv`), los navegadores bloquean esto si solo haces "Doble Clic" en `index.html` por motivos de seguridad (CORS).
Para verla en tu PC antes de subirla necesitas un servidor local:
* Si usas **VS Code**, instala la extensión **"Live Server"** y dale a "Go Live".
* Alternativa usando Python en consola: Abre la carpeta en la terminal y escribe `python -m http.server`, luego entra a `http://localhost:8000` en tu navegador.

## ¿Cómo publicarla en GitHub Pages?

1. Sube toda esta carpeta a tu repositorio especial de GitHub.
2. Ve a los `Settings` (Ajustes) de tu repositorio.
3. Busca el apartado `Pages` en la barra lateral izquierda.
4. En "Source", selecciona la rama `main` y guarda.
5. ¡En unos minutos tu web estará online y leyendo los datos de tu Excel (CSV)!

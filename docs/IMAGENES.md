# Estrategia de imágenes

## Estado actual

- **Prioridad 1 (aplicada):** 15 fotografías de Unsplash con licencia verificada una a una. Las fuentes y los autores están en [IMAGE_CREDITS.md](IMAGE_CREDITS.md) y la web los muestra en `/creditos`.
- **Prioridad 2 (no aplicada):** generación con IA. No hizo falta, porque se encontraron fotos adecuadas. Además, en este entorno no hay credenciales de ningún proveedor de imágenes.

Criterio de selección: luz cálida, fondos oscuros o de madera, cerámica artesanal, texturas reales y una temperatura de color homogénea. Se descartaron fotos saturadas o con estética de catálogo.

## Cómo sustituir una imagen

1. Guarda la nueva foto en `src/assets/images/` (JPG de unos 2000 px de ancho como máximo).
2. En `src/content/images.ts`, cambia el `import` de la clave correspondiente y actualiza `alt` y `credit`.
3. Si es fotografía propia de Maná, pon `contentStatus.photos: true` en `src/config/site.ts` para quitar las etiquetas «Imagen ilustrativa».

Next.js genera automáticamente las versiones AVIF/WebP, el `srcset` responsive y el desenfoque de carga.

## Integración futura con IA (opcional)

Si algún día se quiere generar imágenes con IA:

- **Una clave de Claude/Anthropic no sirve para generar imágenes.** La API de Claude produce texto. Necesitas un proveedor de imágenes independiente (por ejemplo, la API de imágenes de OpenAI) con su propia clave.
- Consulta su documentación oficial vigente antes de integrar: los endpoints, los modelos y los precios cambian.
- La clave debe ir **solo en el servidor**, como variable sin prefijo `NEXT_PUBLIC_` (p. ej. `OPENAI_API_KEY`). Nunca en código del navegador.
- Recomendación: no generar imágenes en tiempo de ejecución desde la web. Es mejor un script local (p. ej. `scripts/generate-image.mjs`) que guarde el resultado aprobado en `src/assets/images/`. Así no hay costes por visita, no hay riesgo de abuso y alguien revisa cada imagen antes de publicarla.
- Las imágenes generadas **no deben presentarse como fotografías reales** de platos o instalaciones de Maná. Usa `alt` descriptivos y conserva la etiqueta «Imagen ilustrativa».
- Revisa cada resultado en busca de comida con aspecto artificial, manos deformes o texto ilegible.
- Costes: se cobran por imagen generada según el proveedor, el tamaño y la calidad. Consulta la tarifa vigente.

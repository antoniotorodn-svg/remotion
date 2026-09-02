import {Config} from '@remotion/cli/config';

// Chromium preinstalado en el entorno de render.
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
	Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
// Tres minutos para cada delayRender (fuentes, imágenes): en GitHub Actions la
// carga de una fuente pasó de los 30 s por defecto y tumbó el render en el
// fotograma 156. Aquí y no en la línea de comandos, porque `npm run render:all
// -- --timeout=…` solo se lo pega al último render de la cadena.
Config.setDelayRenderTimeoutInMilliseconds(180000);
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCrf(21);

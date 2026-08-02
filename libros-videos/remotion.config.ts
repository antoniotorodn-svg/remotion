import {Config} from '@remotion/cli/config';

// Chromium preinstalado en el entorno de render.
if (process.env.REMOTION_BROWSER_EXECUTABLE) {
	Config.setBrowserExecutable(process.env.REMOTION_BROWSER_EXECUTABLE);
}
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCrf(21);

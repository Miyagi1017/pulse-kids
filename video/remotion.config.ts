import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Environ 3 Mo par vidéo : assez léger pour être servi directement par l'app.
Config.setCrf(30);
Config.setAudioBitrate('96k'); // largement suffisant pour une voix
// Machine modeste : on laisse de la marge pour ne pas tout bloquer pendant le rendu.
Config.setConcurrency(2);

import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Le grain du papier coûte cher à compresser : qualité réglée pour rester vers 4 Mo par vidéo.
Config.setCrf(33);
Config.setAudioBitrate('96k'); // largement suffisant pour une voix
// Machine modeste : on laisse de la marge pour ne pas tout bloquer pendant le rendu.
Config.setConcurrency(Number(process.env.RENDER_CONCURRENCY ?? 2));

import { Composition, Folder } from 'remotion';
import './fonts';
import { compositionId, VIDEO_ACTIVITIES } from './activities';
import { EduVideo, eduVideoFrames } from './EduVideo';
import { EDU_SCRIPTS } from './eduScripts';
import { FPS, HEIGHT, SportVideo, sportVideoFrames, WIDTH } from './SportVideo';

export const Root = () => (
  <Folder name="Activites-sportives">
    {VIDEO_ACTIVITIES.map((tip) => (
      <Composition key={tip.id} id={compositionId(tip.id)} component={EDU_SCRIPTS[tip.id] ? EduVideo : SportVideo} defaultProps={{ tip }} fps={FPS} width={WIDTH} height={HEIGHT} durationInFrames={EDU_SCRIPTS[tip.id] ? eduVideoFrames(tip) : sportVideoFrames(tip)} />
    ))}
  </Folder>
);

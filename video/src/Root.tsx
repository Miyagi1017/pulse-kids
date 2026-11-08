import { Composition, Folder } from 'remotion';
import './fonts';
import { compositionId, VIDEO_ACTIVITIES } from './activities';
import { FPS, HEIGHT, SportVideo, sportVideoFrames, WIDTH } from './SportVideo';

export const Root = () => (
  <Folder name="Activites-sportives">
    {VIDEO_ACTIVITIES.map((tip) => (
      <Composition key={tip.id} id={compositionId(tip.id)} component={SportVideo} defaultProps={{ tip }} fps={FPS} width={WIDTH} height={HEIGHT} durationInFrames={sportVideoFrames(tip)} />
    ))}
  </Folder>
);

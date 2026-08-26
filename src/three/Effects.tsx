/**
 * Effects — bloom, desktop only (CLAUDE.md §6).
 *
 * One pass, low intensity, high threshold. Bloom here exists to let the ridge
 * crest catch light where it turns red; anything stronger turns the scene into
 * the neon look DESIGN.md §9 rules out.
 *
 * `mipmapBlur` is off deliberately. It looks marginally softer and costs a
 * downsample/upsample chain — measured at 21 draw calls per frame against a
 * scene that only draws five, which breaks the ≤12 budget in CLAUDE.md §4.5 on
 * its own. A small fixed kernel is indistinguishable at this intensity.
 */
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { KernelSize } from 'postprocessing';

export function Effects() {
  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom
        intensity={0.5}
        luminanceThreshold={0.62}
        luminanceSmoothing={0.3}
        mipmapBlur={false}
        kernelSize={KernelSize.SMALL}
      />
    </EffectComposer>
  );
}

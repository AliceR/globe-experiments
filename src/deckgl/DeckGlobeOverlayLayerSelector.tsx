import { VedaLayerSelector } from '../components/VedaLayerSelector';
import type { VedaLayer } from '../data/fetchVedaLayers';

export function DeckGlobeOverlayLayerSelector({
  value,
  onChange,
  layers
}: {
  value: string[];
  onChange: (layerIds: string[]) => void;
  layers: VedaLayer[];
}) {
  return (
    <div className='fixed top-50 left-4 z-50 w-80 max-w-xs rounded-lg bg-gray-900 p-4 shadow-lg ring-1 ring-black/10 backdrop-blur-md'>
      <h2 className='mb-2 text-base font-semibold text-gray-200'>
        Select VEDA Layer
      </h2>
      <VedaLayerSelector value={value} onChange={onChange} layers={layers} />
    </div>
  );
}

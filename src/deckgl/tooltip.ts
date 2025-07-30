import type { PickingInfo } from 'deck.gl';
import type { MarkerData } from './types';

export const getTooltip = (layerId: string) => {
  return (info: PickingInfo) => {
    const { object, layer } = info as {
      object: MarkerData | null;
      layer: { id: string } | null;
    };
    if (layer?.id === layerId && object) {
      return {
        html: `<div style="background: rgba(0,0,0,0.8); color: white; padding: 8px; border-radius: 4px;">
                <strong>${object.name}</strong><br/>
                Lat: ${object.lat.toFixed(4)}<br/>
                Lon: ${object.lon.toFixed(4)}
              </div>`,
        style: {
          fontSize: '12px',
          pointerEvents: 'none'
        }
      };
    }
    return null;
  };
};

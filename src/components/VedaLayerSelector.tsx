import React from 'react';
import type { VedaLayer } from '../data/fetchVedaLayers';

interface VedaLayerSelectorProps {
  value: string[];
  onChange: (layerIds: string[]) => void;
  layers: VedaLayer[];
}

export const VedaLayerSelector: React.FC<VedaLayerSelectorProps> = ({
  value,
  onChange,
  layers
}) => {
  return (
    <div
      role='list'
      className='max-h-72 overflow-y-auto rounded border border-gray-500'
    >
      {layers.map((layer) => {
        const checked = value.includes(layer.id);
        return (
          <label
            key={layer.id}
            className='mb-1 block cursor-pointer rounded px-2 py-1 transition-colors hover:bg-gray-800'
          >
            <input
              type='checkbox'
              name='veda-layer'
              value={layer.id}
              checked={checked}
              onChange={() => {
                if (checked) {
                  onChange(value.filter((id) => id !== layer.id));
                } else {
                  onChange([...value, layer.id]);
                }
              }}
              className='mr-2 accent-blue-600'
            />
            <span className={checked ? 'font-bold' : 'font-normal'}>
              {layer.title}
            </span>
            {layer.description && (
              <p className='ml-2 text-xs text-gray-500'>{layer.description}</p>
            )}
          </label>
        );
      })}
    </div>
  );
};

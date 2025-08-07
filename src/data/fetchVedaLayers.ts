export interface VedaLayer {
  id: string;
  title: string;
  description?: string;
  renders?: {
    dashboard?: {
      assets?: string[];
      bidx?: number[];
      colormap_name?: string;
      resampling?: string;
      rescale?: [number, number] | number[];
      title?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export interface VedaGetUrl {
  (z: number, x: number, y: number): string;
}

// Registers a raster search for a collection and returns the tile URL
interface RasterSearchResponse {
  links: { rel: string; href: string }[];
  [key: string]: unknown;
}

function isRasterSearchResponse(data: unknown): data is RasterSearchResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    Array.isArray((data as RasterSearchResponse).links) &&
    (data as RasterSearchResponse).links.length > 1 &&
    typeof (data as RasterSearchResponse).links[1].href === 'string'
  );
}

function rendersToApiParams(renders?: VedaLayer['renders']): {
  assets?: string[];
  bidx?: number[];
  colormap_name?: string;
  rescale?: string;
  [key: string]: unknown;
} {
  const dash = renders?.dashboard;
  const params: {
    assets?: string[];
    bidx?: number[];
    colormap_name?: string;
    rescale?: string;
    [key: string]: unknown;
  } = {};
  if (!dash) return params;
  if (dash.assets) params.assets = dash.assets;
  if (dash.bidx) params.bidx = dash.bidx;
  if (dash.colormap_name) params.colormap_name = dash.colormap_name;
  if (dash.rescale)
    params.rescale = Array.isArray(dash.rescale)
      ? dash.rescale.join(',')
      : String(dash.rescale);
  // Add more as needed
  return params;
}

function rendersToQuery(renders?: VedaLayer['renders']): string {
  const dash = renders?.dashboard;
  if (!dash) return '';
  const params = new URLSearchParams();
  if (dash.assets) params.set('assets', dash.assets.join(','));
  if (dash.bidx) params.set('bidx', dash.bidx.join(','));
  if (dash.colormap_name) params.set('colormap_name', dash.colormap_name);
  if (dash.rescale)
    params.set(
      'rescale',
      Array.isArray(dash.rescale)
        ? dash.rescale.join(',')
        : String(dash.rescale)
    );
  // Add more as needed
  return params.toString();
}

export async function registerVedaRasterSearch(
  collectionId: string,
  renders?: VedaLayer['renders']
): Promise<VedaGetUrl> {
  const payload = {
    'filter-lang': 'cql2-json',
    filter: {},
    collections: [collectionId],
    ...rendersToApiParams(renders)
  };
  const response = await fetch(
    'https://openveda.cloud/api/raster/searches/register',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  if (!response.ok) {
    throw new Error(`Failed to register raster search: ${response.status}`);
  }
  const data: unknown = await response.json();
  if (isRasterSearchResponse(data)) {
    const id = typeof data.id === 'string' ? data.id : '';
    return (z: number, x: number, y: number) => {
      const query = rendersToQuery(renders);
      return `https://openveda.cloud/api/raster/searches/${id}/tiles/WebMercatorQuad/${z}/${x}/${y}${query ? `?${query}` : ''}`;
    };
  }
  throw new Error('Could not get tile URL from raster search response');
}

function isVedaLayer(obj: unknown): obj is VedaLayer {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as { id?: unknown }).id === 'string' &&
    typeof (obj as { title?: unknown }).title === 'string'
  );
}

interface StacCollectionsResponse {
  collections: unknown[];
}

function isStacCollectionsResponse(
  obj: unknown
): obj is StacCollectionsResponse {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    Array.isArray((obj as { collections?: unknown }).collections)
  );
}

export async function fetchVedaLayers(): Promise<VedaLayer[]> {
  const response = await fetch('https://openveda.cloud/api/stac/collections');
  if (!response.ok) {
    throw new Error(`Failed to fetch VEDA layers: ${response.status}`);
  }
  const data: unknown = await response.json();
  if (!isStacCollectionsResponse(data)) {
    throw new Error('VEDA STAC API did not return a collections array');
  }
  const validLayers = data.collections.filter(isVedaLayer);
  console.log('Fetched VEDA layers:', validLayers);
  return validLayers.map((item) => ({
    id: item.id,
    title: item.title,
    description:
      typeof item.description === 'string' ? item.description : undefined,
    renders: item.renders
  }));
}

export async function getVedaLayerTileUrl(
  collectionId: string,
  renders?: VedaLayer['renders']
): Promise<VedaGetUrl> {
  return registerVedaRasterSearch(collectionId, renders);
}

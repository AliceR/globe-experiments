// TODO: To be replaced with the veda data catalog: https://github.com/NASA-IMPACT/veda-config/tree/develop/datasets

export const tileUrls = [
  {
    id: 'ef5766e5684b02f6bf65185f542354f3',
    name: 'Mean Carbon Dioxide',
    getUrl: (z: number, x: number, y: number) =>
      `https://openveda.cloud/api/raster/searches/ef5766e5684b02f6bf65185f542354f3/tiles/WebMercatorQuad/${z}/${x}/${y}?title=Mean-Carbon-Dioxide&rescale=0.000408%2C0.000419&colormap_name=rdylbu_r&reScale=NaN%2CNaN&assets=cog_default`
  }
];

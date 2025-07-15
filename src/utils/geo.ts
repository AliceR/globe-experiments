export function latLonToVector3(lat: number, lon: number, radius = 1.01) {
  // slightly more than the globe radius (+ .01) to place markers on top of the globe surface.
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  return [
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  ] as [number, number, number];
}

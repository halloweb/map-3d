export function jsonToGeojsonLine (data) {
  const arr = data.l
  const base = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: { name: '' },
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
    ]
  }
  return arr.map(v => {
    const item = JSON.parse(JSON.stringify(base))
    item.features[0].geometry.coordinates = v.st.reduce((t, s) => {
      t.push([Number(s.sl.split(',')[0]), Number(s.sl.split(',')[1])])
      return t
    }, [])
    item.features[0].properties.name = v.ln
    return item
  })
}

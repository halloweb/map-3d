import * as turf from '@turf/turf'
export function jsonToGeojsonLine (subWayData) {
  const arr = subWayData.l
  const base = {
    id: 'route',
    type: 'line',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
    },
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': 'rgba(47, 183, 156, 0.57)',
      'line-width': 5
    }
  }
  // return arr.map(v => {
  //   const item = JSON.parse(JSON.stringify(base))
  //   item.id = 'line' + v.x
  //   item.source.data.geometry.coordinates = v.st.reduce((t, s) => {
  //     t.push([Number(s.sl.split(',')[0]), Number(s.sl.split(',')[1])])
  //     return t
  //   }, [])
  //   item.source.data.name = v.ln
  //   return item
  // })
  const lines = arr.map(v => {
    const item = Object.create(null)
    item.id = v.x
    item.name = v.ln
    item.coordinates = v.st.reduce((t, s) => {
      t.push([Number(s.sl.split(',')[0]), Number(s.sl.split(',')[1])])
      return t
    }, [])
    return item
  })
  return lines.reduce((t, v) => {
    const line = turf.lineString(v.coordinates)
    const line1 = turf.lineOffset(line, 20, { units: 'meters' })
    console.log(line1)
    line1.name = `${v.name}-上行`
    t.push(packLayer({ id: `${v.id}-right` }, line1))
    const line2 = turf.lineOffset(line, -20, { units: 'meters' })
    line2.name = `${v.name}-下行`
    t.push(packLayer({ id: `${v.id}-left` }, line2))
    return t
  }, [])
}
function packLayer (des, data) {
  const base = {
    id: 'route',
    type: 'line',
    source: {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      }
    },
    layout: {
      'line-join': 'round',
      'line-cap': 'round'
    },
    paint: {
      'line-color': 'rgba(47, 183, 156, 0.57)',
      'line-width': 10
    }
  }
  base.id = des.id
  base.source.data = data
  return base
}
export function drawStation (subWayData) {
  const icon = require('../assets/st.png')
  const base = {
    id: 'points',
    type: 'symbol',
    source: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    },
    layout: {
      'icon-image': 'icon-st',
      'text-field': '{title}',
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      'text-offset': [0, 0.6],
      'text-anchor': 'left'
    },
    paint: {
      'text-color': '#fff'
    }
  }
  const confObj = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: []
    },
    properties: {
    }
  }
  const transferStation = []
  const allStation = subWayData.l.reduce((t, value) => {
    value.st.forEach(v => {
      const item = t.find(val => val.sl === v.sl)
      if (item) {
        !transferStation.some(val => val.sl === v.sl) && transferStation.push(item)
      } else {
        t.push(v)
      }
    })
    return t
  }, [])
  const data = transferStation.map(s => {
    const item = JSON.parse(JSON.stringify(confObj))
    item.geometry.coordinates = [Number(s.sl.split(',')[0]), Number(s.sl.split(',')[1])]
    item.properties.title = s.n
    return item
  })
  base.source.data.features = data
  return base
}

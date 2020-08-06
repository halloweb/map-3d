import EchartsLayer from './echartsLayer'
import * as turf from '@turf/turf'
export class FlyLine {
  static route = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: []
      }
    }]
  }

  static point = {
    type: 'FeatureCollection',
    features: [{
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: []
      }
    }]
  };

  static defaultOpts = {
    name: 'flyLine',
    map: null,
    from: [0, 0],
    to: [0, 0],
    steps: 100,
    type: 'loop'
  }

  constructor (opts = {}) {
    this.options = Object.assign({}, FlyLine.defaultOpts, opts)
    this.running = true
  }

  render () {
    const route = JSON.parse(JSON.stringify(FlyLine.route))
    route.features[0].geometry.coordinates = [this.options.from, this.options.to]
    const point = JSON.parse(JSON.stringify(FlyLine.point))
    point.features[0].geometry.coordinates = this.options.from
    this.options.map.addSource('source' + this.options.name, {
      type: 'geojson',
      data: route
    })
    this.options.map.addSource('source' + this.options.name + '_flyPoint', {
      type: 'geojson',
      data: point
    })
    this.options.map.addLayer({
      id: this.options.name,
      source: 'source' + this.options.name,
      type: 'line',
      paint: {
        'line-width': 5,
        'line-color': '#007cbf'
      }
    })
    this.options.map.addLayer({
      id: this.options.name + '_flyPoint',
      source: 'source' + this.options.name + '_flyPoint',
      type: 'symbol',
      layout: {
        'icon-image': 'airport-15',
        'icon-rotate': ['get', 'bearing'],
        'icon-rotation-alignment': 'map',
        'icon-allow-overlap': true,
        'icon-ignore-placement': true
      }
    })
    const lineDistance = turf.lineDistance(route.features[0])
    const arc = []
    for (var i = 0; i < lineDistance; i += lineDistance / this.options.steps) {
      var segment = turf.along(route.features[0], i)
      arc.push(segment.geometry.coordinates)
    }
    route.features[0].geometry.coordinates = arc
    const counter = 0
    this.animate(route, point, counter)
  }

  animate (route, point, counter) {
    if (!this.running) return
    point.features[0].geometry.coordinates = route.features[0].geometry.coordinates[counter]
    point.features[0].properties.bearing = turf.bearing(
      turf.point(route.features[0].geometry.coordinates[counter - 2 < 0 ? 0 : counter - 2]),
      turf.point(route.features[0].geometry.coordinates[counter - 1 < 0 ? 0 : counter - 1])
    )
    this.options.map.getSource('source' + this.options.name + '_flyPoint').setData(point)
    if (counter < this.options.steps) {
      counter = counter + 1
      requestAnimationFrame(() => this.animate(route, point, counter))
    } else {
      if (this.options.type === 'loop') {
        point.features[0].geometry.coordinates = this.options.from
        this.options.map.getSource('source' + this.options.name + '_flyPoint').setData(point)
        counter = 0
        this.animate(route, point, counter)
      }
    }
  }

  stop () {
    this.running = false
  }

  run () {
    this.running = true
  }
}
export function flyLine (map) {
  var option = {
    GLMap: {
      roam: true
    },
    coordinateSystem: 'GLMap',
    geo: {
      map: 'GLMap',
      label: {
        emphasis: {
          show: false
        }
      },
      roam: true,
      itemStyle: {
        normal: {
          areaColor: '#323c48',
          borderColor: '#404a59'
        },
        emphasis: {
          areaColor: '#2a333d'
        }
      }
    },
    series: [
      {
        // 动态线
        name: '人流流向',
        type: 'lines',
        coordinateSystem: 'geo',
        zlevel: 2,
        effect: {
          show: true,
          period: 6,
          trailLength: 0.7,
          symbol: 'circle',
          symbolSize: 5
        },
        lineStyle: {
          normal: {
            color: 'orange',
            width: 1,
            curveness: 0.5
          }
        },
        data: [{ coords: [[121.484208, 31.252035], [121.513088, 31.257938]] }]
      },
      {
        // 动态圈
        name: '人流流向',
        type: 'effectScatter',
        zlevel: 2,
        coordinateSystem: 'geo',
        rippleEffect: {
          brushType: 'stroke'
        },
        label: {
          normal: {
            show: true,
            position: 'right',
            formatter: '{b}'
          }
        },
        symbolSize: function () {
          // const r = val[2] / 10
          // return r < 5 ? 5 : r
          return 10
        },
        itemStyle: {
          normal: {
            color: 'orange'
          }
        },
        data: [{ value: [121.484208, 31.252035] }, { value: [121.513088, 31.257938] }]
      }
    ]
  }
  var echartslayer = new EchartsLayer(map, option)
}

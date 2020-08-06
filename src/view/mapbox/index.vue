<template>
  <div class="map"></div>
</template>
<script>
import { jsonToGeojsonLine, drawStation } from '@/util'
import subWayData from '@/data/subway_shanghai.json'
import { FlyLine, flyLine } from './layers'
export default {
  methods: {
    initMap () {
      window.mapboxgl.accessToken = 'pk.eyJ1IjoiaGFsbG93ZWIiLCJhIjoiY2tkNnJqZzc3MTFzejMxb2R6c3Rvc29vOCJ9.MuAOk3atDH33TriLAqsIqQ'
      const mapEl = document.querySelector('.map')
      this.map = new window.mapboxgl.Map({
        container: mapEl,
        style: 'mapbox://styles/mapbox/dark-v9',
        center: [121.506377, 31.245105],
        zoom: 16,
        pitch: 45,
        bearing: -17.6
      })
      this.map.addControl(new window.MapboxLanguage({
        defaultLanguage: 'zh'
      }))
      this.map.on('load', () => {
        this.addLine()
        this.addImage()
        this.addStation()
        new FlyLine({ map: this.map, from: [121.484208, 31.252035], to: [121.513088, 31.257938] }).render()
        this.map.addLayer({
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          // minzoom: 20,
          paint: {
            // 'fill-extrusion-color': '#aaa',
            'fill-extrusion-color': [
              'interpolate',
              ['exponential', 0.99],
              ['get', 'height'],
              0,
              '#FFF6B7',
              500,
              '#0166b6'
            ],
            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            'fill-extrusion-height': [
              'interpolate', ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate', ['linear'],
              ['zoom'],
              15, 0,
              15.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.6
          }
        })
      })
      this.map.addControl(new window.mapboxgl.NavigationControl())
    },
    addLine () {
      const lines = jsonToGeojsonLine(subWayData)
      lines.forEach(v => {
        this.map.addLayer(v)
      })
    },
    addStation () {
      const wayGeo = drawStation(subWayData)
      const imgSrc = require('../../assets/st.png')
      wayGeo.source.data.features.forEach(v => {
        var el = document.createElement('div')
        el.className = 'st-marker'
        el.innerHTML = `<img src="${imgSrc}"/> ${v.properties.title}`

        el.addEventListener('click', function () {
          window.alert(v.properties.title + '_' + v.geometry.coordinates.join())
        })

        new window.mapboxgl.Marker(el)
          .setLngLat(v.geometry.coordinates)
          .addTo(this.map)
      })
    },
    addImage () {
      const imgSrc = require('../../assets/st.png')
      this.map.loadImage(imgSrc, (error, image) => {
        if (error) throw error
        // 先判断是否加载了该 id 的图片资源，没有则加载
        if (!this.map.hasImage('icon-st')) {
          this.map.addImage('icon-st', image)
        }
      })
    }
  },
  mounted () {
    this.initMap()
  }
}
</script>

<style>
.map {
  height: 100%;
}
.st-marker {
  color: #fff;
  display: flex;
  align-items: center;
  font-size: 16px;
  margin-left: 30px;
  margin-top: -20px;
  animation: st-animation 1s infinite;
}
@keyframes st-animation {
  50% {
    margin-top: -30px;
  }
  100% {
    margin-top: -20px;
  }
}
.dynamic-marker {
  display: block;
  border: none;
  cursor: pointer;
  padding: 0;
  background: url("https://lxqjss.github.io/img/loc.png");
  width: 20px;
  height: 20px;
  padding-left: 5px;
}
.dynamic-marker p {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: myfirst 1.5s infinite;
  box-shadow: 0px 0px 1px #009fd9;
}
/* .marker span{position: absolute;display:block;width: 10px;height: 10px;border-radius:50%;animation: myfirst 1.5s  infinite;box-shadow: 0px 0px 1px #009FD9; animation-delay: 0.5s;}   */
@keyframes myfirst {
  20% {
    transform: scale(2);
  }
  40% {
    transform: scale(3);
  }
  60% {
    transform: scale(4);
  }
  80% {
    transform: scale(5);
  }
  100% {
    transform: scale(6);
  }
}
</style>

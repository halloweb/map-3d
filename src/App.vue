<template>
  <div id="map"></div>
</template>

<script>
/* eslint-disable */
import * as maptalks from 'maptalks'
import { ThreeLayer } from 'maptalks.three'
import subWayData from './subway_shanghai.json'
import { jsonToGeojsonLine } from '@/util'
export default {
  name: 'App',
  mounted () {
    function getColor (level) {
      if (level < 2) {
        return 0xff2e00;
      } else if (level >= 2 && level <= 5) {
        return 0xff5733;
      } else {
        return 0x175dc6;
      }
    }
    const map = new maptalks.Map('map', {
      center: [121.506377, 31.245105],
      zoom: 15,
      baseLayer: new maptalks.TileLayer('base', {
        urlTemplate: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd']
      })
    })
    var threeLayer = new ThreeLayer('t', {
      forceRenderOnMoving: true,
      forceRenderOnRotating: true
    })
    import('./shanghai.json')
      .then(res => {

        var features = res.default.features
        threeLayer.prepareToDraw = function (gl, scene, camera) {
          var me = this;
          var light = new THREE.DirectionalLight(0xffffff);
          light.position.set(0, -10, 10).normalize();
          scene.add(light);

          features.forEach(function (g) {
            var heightPerLevel = 10;
            var levels = g.properties.Floor || 1;
            var color = getColor(levels);

            var m = new THREE.MeshPhongMaterial({ color: color, opacity: 0.7 });
            //change to back side with THREE <= v0.94
            // m.side = THREE.BackSide;

            var mesh = me.toExtrudeMesh(maptalks.GeoJSON.toGeometry(g), levels * heightPerLevel, m, levels * heightPerLevel)
            if(mesh && mesh.isObject3D) scene.add(mesh)
          
          })
            // 画地铁线
             var material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
             const geojson = jsonToGeojsonLine(subWayData)
             var lineStrings = maptalks.GeoJSON.toGeometry(geojson)
             let lines = lineStrings.slice(0, Infinity).map(function(lineString) {
               return threeLayer.toLine(lineString, { altitude: 0 }, material)
             })
             threeLayer.addMesh(lines)
      }
        threeLayer.addTo(map)
      })
  }
}
</script>
<style>
html,
body,
#map {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>

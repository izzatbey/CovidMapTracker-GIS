import React, { useEffect } from "react";
import Helmet from "react-helmet";
import L from "leaflet";
import { Marker, useMap } from "react-leaflet";

import Layout from "components/Layout";
import Map from "components/Map";

import { aggregate_faskes } from "data/aggregate_faskes_indo";
import { provinces } from "../data/chloropleth_indo";

const LOCATION = {
  lat: 0,
  lng: 0,
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 1;

const ChloroplethPage = () => {
  /**
   * MapEffect
   * @description This is an example of creating an effect used to zoom in and set a popup on load
   */

  const MapEffect = ({}) => {
    const leafletElement = useMap();

    useEffect(() => {
      leafletElement.eachLayer((layer) => leafletElement.removeLayer(layer));
      var legend = L.control({ position: "topright" });

      legend.onAdd = function (map) {
        var div = L.DomUtil.create("div", "info legend"),
          grades = [10, 20, 50, 100, 200, 500, 1000],
          labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
            '<i style="background:' +
            getColor(grades[i] + 1) +
            '"></i> ' +
            grades[i] +
            (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }

        return div;
      };
      const hospitalProvinceChloroplethGeoJsonLayers = new L.geoJson(
        provinces,
        { style: style, onEachFeature: onEachFeature }
      );
      hospitalProvinceChloroplethGeoJsonLayers.addTo(leafletElement);

      const bounds = hospitalProvinceChloroplethGeoJsonLayers.getBounds();

      leafletElement.fitBounds(bounds);
      legend.addTo(leafletElement);
    });

    return null;
  };

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: "OpenStreetMap",
    zoom: DEFAULT_ZOOM,
    //  mapEffect
  };

  return (
    <Layout pageName="chloropleth-hospital">
      <Helmet>
        <title>Chloropleth Rumah Sakit yang Menangani Vaksinasi</title>
      </Helmet>

      <Map {...mapSettings}>
        <MapEffect />
      </Map>
    </Layout>
  );
};

export default ChloroplethPage;

function onEachFeature(feature, layer) {
  // does this feature have a property named popupContent?
  if (feature.properties) {
    const text = `
    <span class="icon-marker">
    <span class="icon-marker-tooltip">
      <h4>${feature.properties.Propinsi}</h4>
      <center><h5>${feature.properties.jumlah_rs} Rumah Sakit</h5></center>
    </span>
    </span>
    `;
    // layer.bindPopup(feature.properties.Propinsi + " " + feature.properties.jumlah_rs);
    layer.bindPopup(text);
  }
}

function getColor(d) {
  return d > 1000
    ? "#800026"
    : d > 500
    ? "#BD0026"
    : d > 200
    ? "#E31A1C"
    : d > 100
    ? "#FC4E2A"
    : d > 50
    ? "#FD8D3C"
    : d > 20
    ? "#FEB24C"
    : d > 10
    ? "#FED976"
    : "#FFEDA0";
}

function style(feature) {
  return {
    fillColor: getColor(feature.properties.jumlah_rs),
    weight: 2,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
  };
}

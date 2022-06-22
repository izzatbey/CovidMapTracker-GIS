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

const ChloroplethVaccinatedPage = () => {
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
          grades = [
            5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000,
          ],
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

      const provinceVaccinatedJsonLayers = new L.geoJson(provinces, {
        style: style,
        onEachFeature: onEachFeature,
      });
      provinceVaccinatedJsonLayers.addTo(leafletElement);

      const bounds = provinceVaccinatedJsonLayers.getBounds();

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
    <Layout pageName="chloropleth-vaccinated">
      <Helmet>
        <title>Chloropleth Vaksinasi</title>
      </Helmet>

      <Map {...mapSettings}>
        <MapEffect />
      </Map>
    </Layout>
  );
};

export default ChloroplethVaccinatedPage;

function onEachFeature(feature, layer) {
  // does this feature have a property named popupContent?
  if (feature.properties) {
    const text = `
    <span class="icon-marker">
    <span class="icon-marker-tooltip">
      <h4>${feature.properties.Propinsi}</h4>
      <center><h5>${feature.properties.total_vaksinasi} Tervaksinasi</h5></center>
    </span>
    </span>
    `;
    // layer.bindPopup(feature.properties.Propinsi + " " + feature.properties.jumlah_rs);
    layer.bindPopup(text);
  }
}

function getColor(d) {
  return d > 2000000
    ? "#1DC34C"
    : d > 1000000
    ? "#56C947"
    : d > 500000
    ? "#8ECF42"
    : d > 200000
    ? "#C7D53D"
    : d > 100000
    ? "#FFDA38"
    : d > 50000
    ? "#FFBD24"
    : d > 20000
    ? "#FFAE1A"
    : d > 10000
    ? "#FF9F10"
    : d > 5000
    ? "#FF7226"
    : "#EE5724";
}

function style(feature) {
  return {
    fillColor: getColor(feature.properties.total_vaksinasi),
    weight: 1.5,
    opacity: 1,
    color: "white",
    dashArray: "3",
    fillOpacity: 0.7,
  };
}

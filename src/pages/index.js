import React, { useEffect } from "react";
import Helmet from "react-helmet";
import L from "leaflet";
import { Marker, useMap } from "react-leaflet";

import Layout from "components/Layout";
import Container from "components/Container";
import Map from "components/Map";

import { aggregate_faskes } from "data/aggregate_faskes_indo";

const LOCATION = {
  lat: 0,
  lng: 0,
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 1;

const IndexPage = () => {
  /**
   * MapEffect
   * @description This is an example of creating an effect used to zoom in and set a popup on load
   */

  const MapEffect = ({}) => {
    const leafletElement = useMap();

    useEffect(() => {
      leafletElement.eachLayer((layer) => leafletElement.removeLayer(layer));

      const tripPoints = createTripPointsGeoJson(aggregate_faskes);

      const tripPointsGeoJsonLayers = new L.geoJson(tripPoints, {
        pointToLayer: tripStopPointToLayer,
      });
      tripPointsGeoJsonLayers.addTo(leafletElement);

      const bounds = tripPointsGeoJsonLayers.getBounds();

      leafletElement.fitBounds(bounds);
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
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>

      <Map {...mapSettings}>
        <MapEffect />
      </Map>
    </Layout>
  );
};

export default IndexPage;

function createTripPointsGeoJson(locations = []) {
  return {
    type: "FeatureCollection",
    features: locations.map(
      ({
        nama,
        alamat,
        kota,
        provinsi,
        status,
        kelas_rs,
        details = [],
        longitude,
        latitude,
      } = {}) => {
        return {
          type: "Feature",
          properties: {
            nama,
            alamat,
            kota,
            provinsi,
            status,
            kelas_rs,
            details,
          },
          geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        };
      }
    ),
  };
}

function tripStopPointToLayer(feature = {}, latlng) {
  const { properties = {} } = feature;
  const {
    nama,
    alamat,
    kota,
    provinsi,
    status,
    kelas_rs,
    details = [],
  } = properties;

  // console.log(alamat);
  // console.log(latlng);

  const list = details.map(
    (what) => `<li><strong>${what.batch}</strong>: ${what.total_vaksin}</li>`
  );
  let listString = "";
  if (Array.isArray(list) && list.length > 0) {
    listString = list.join("");
    listString = `
      <ul>${listString}</ul>
    `;
  }

  const text = `
  <span class="icon-marker">
  <span class="icon-marker-tooltip">
    <h2>${nama}, ${kota} - ${provinsi}</h2>
    <ul>
      <li><strong>Status:</strong> ${status}</li>
      <li><strong>Kelas RS:</strong> ${kelas_rs}</li>
      <li><strong>Alamat:</strong> ${alamat}</li>
    </ul>
    <h3>Total Vaksinasi</h3>
    ${listString}
  </span>
  </span>
  `;
  // console.log(locations);

  const popup = L.popup({
    maxWidth: 400,
  }).setContent(text);

  const layer = L.marker(latlng, {
    icon: L.divIcon({
      className: "icon",
      html: `<span class="icon-trip-stop"></span>`,
      iconSize: 20,
    }),
    riseOnHover: true,
  }).bindPopup(popup);

  return layer;
}

import React, { useEffect } from "react";
import Helmet from "react-helmet";
import L from "leaflet";
import { Marker, useMap } from "react-leaflet";

import Layout from "components/Layout";
import Container from "components/Container";
import Map from "components/Map";

import { locations } from "data/locations";

let data = [];
let merged = [];
let aggregate = [];

const LOCATION = {
  lat: 0,
  lng: 0,
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 1;

const fetchData = async () => {
  for (let i = 0; i < 1; i++) {
    try {
      const response = await axios.get(
        `https://kipi.covid19.go.id/api/get-faskes-vaksinasi?skip=${i}`
      );

      data.push(response.data.data);
    } catch (e) {
      console.log(`Failed to fetch API: ${e.message}`, e);
      return;
    }
  }
  merged = data.flat(1);
  console.log(merged[5]);

  aggregate = merged.filter(function (data) {
    return data.jenis_faskes == "RUMAH SAKIT";
  });
  console.log(aggregate);
};

const IndexPage = () => {
  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement } = {}) {
    if (!leafletElement) {
      console.log("Leaflet Map Not Found");
      return;
    }
    console.log("Leaflet Map Found");

    leafletElement.eachLayer((layer) => leafletElement.removeLayer(layer));

    const tripPoints = createTripPointsGeoJson({ locations });
    const tripLines = createTripLinesGeoJson({ locations });

    const tripPointsGeoJsonLayers = new L.geoJson(tripPoints, {
      pointToLayer: tripStopPointToLayer,
    });

    const tripLinesGeoJsonLayers = new L.geoJson(tripLines);

    tripPointsGeoJsonLayers.addTo(leafletElement);
    tripLinesGeoJsonLayers.addTo(leafletElement);

    const bounds = tripPointsGeoJsonLayers.getBounds();

    leafletElement.fitBounds(bounds);
  }

  /**
   * MapEffect
   * @description This is an example of creating an effect used to zoom in and set a popup on load
   */

  const MapEffect = ({}) => {
    //   if (!markerRef.current || !map) return;

    //   (async function run() {
    //     const popup = L.popup({
    //       maxWidth: 800,
    //     });

    //     const location = await getCurrentLocation().catch(() => LOCATION);

    //     const { current: marker } = markerRef || {};

    //     marker.setLatLng(location);
    //     popup.setLatLng(location);
    //     popup.setContent(popupContentHello);

    //     setTimeout(async () => {
    //       await promiseToFlyTo(map, {
    //         zoom: ZOOM,
    //         center: location,
    //       });

    //       marker.bindPopup(popup);

    //       setTimeout(() => marker.openPopup(), timeToOpenPopupAfterZoom);
    //       setTimeout(
    //         () => marker.setPopupContent(popupContentGatsby),
    //         timeToUpdatePopupAfterZoom
    //       );
    //     }, timeToZoom);
    //   })();
    // }, [map, markerRef]);

    const leafletElement = useMap();

    useEffect(() => {
      leafletElement.eachLayer((layer) => leafletElement.removeLayer(layer));

      const tripPoints = createTripPointsGeoJson({ locations });
      // const tripLines = createTripLinesGeoJson({ locations });

      const tripPointsGeoJsonLayers = new L.geoJson(tripPoints, {
        pointToLayer: tripStopPointToLayer,
      });

      // const tripLinesGeoJsonLayers = new L.geoJson(tripLines);

      tripPointsGeoJsonLayers.addTo(leafletElement);
      // tripLinesGeoJsonLayers.addTo(leafletElement);

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

/**
 * tripStopPointToLayer
 */

function createTripPointsGeoJson({ locations } = {}) {
  return {
    type: "FeatureCollection",
    features: locations.map(
      ({
        alamat,
        jenis_faskes,
        kota,
        latitude,
        longitude,
        nama,
        provinsi,
        detail = [],
        status,
      } = {}) => {
        return {
          type: "Feature",
          properties: {
            alamat,
            jenis_faskes,
            kota,
            nama,
            provinsi,
            detail,
            status,
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

/**
 * tripStopPointToLayer
 */

function createTripLinesGeoJson({ locations } = {}) {
  return {
    type: "FeatureCollection",
    features: locations.map((stop = {}, index) => {
      const prevStop = locations[index - 1];

      if (!prevStop) return [];

      const { placename, location = {}, date, todo = [] } = stop;
      const { lat, lng } = location;
      const properties = {
        placename,
        todo,
        date,
      };

      const { location: prevLocation = {} } = prevStop;
      const { lat: prevLat, lng: prevLng } = prevLocation;

      return {
        type: "Feature",
        properties,
        geometry: {
          type: "LineString",
          coordinates: [
            [prevLng, prevLat],
            [lng, lat],
          ],
        },
      };
    }),
  };
}

/**
 * tripStopPointToLayer
 */

function tripStopPointToLayer(feature = {}, latlng) {
  const { properties = {} } = feature;
  const {
    alamat,
    jenis_faskes,
    kota,
    nama,
    provinsi,
    detail = [],
    status,
  } = properties;

  console.log(alamat);
  console.log(latlng);

  const list = detail.map((what) => `<li>${what.batch}</li>`);
  let listString = "";

  if (Array.isArray(list) && list.length > 0) {
    listString = list.join("");
    listString = `
      <p>Things we will or have done...</p>
      <ul>${listString}</ul>
    `;
  }

  const text = `
  <span class="icon-marker">
  <span class="icon-marker-tooltip">
    <h2>${kota}</h2>
    <ul>
      <li><strong>Faskes:</strong> ${jenis_faskes}</li>
      <li><strong>Nama Lokasi:</strong> ${nama}</li>
      <li><strong>Provinsi:</strong> ${provinsi}</li>
      <li><strong>Status:</strong> ${status}</li>
    </ul>
  </span>
  </span>
  `;
  console.log(locations);

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

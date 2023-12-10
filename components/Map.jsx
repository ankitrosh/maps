import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from "react-leaflet";
import { useState, useRef, useEffect } from 'react'
import "leaflet/dist/leaflet.css"
import L, { icon, map } from "leaflet"
import 'leaflet-routing-machine'
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'

import { Button } from "@chakra-ui/react";
import axios from "axios";
import { decode, encode } from "@googlemaps/polyline-codec";
import { headers } from "@/next.config";

const LocationFinder = ({setCoordinates, setMap}) => {
  const map = useMapEvents({
      click(e) {
          console.log(e.latlng);
          
          setCoordinates((coords) => {
            return [...coords, [e.latlng.lat, e.latlng.lng]]
          });
      },
  });
  setMap(map);
  return null;
};


const markerIcon = icon({
  iconSize: [35, 45],
  iconAnchor: [17, 46],
  popupAnchor: [3, -46],
  className: "mymarker",
  iconUrl: "/marker.png",
});
const limeOptions = { color: 'lime' }

const getRouteDetails = async (coordinates, map) => {
  console.log(coordinates);
  const route = L.Routing.control({
    waypoints: coordinates
  }).addTo(map);
  let path = [];
  route.on('routeselected', async function(e) {
    var route = e.route;
    console.log("coords",route?.coordinates);
    path = route?.coordinates;
    const encodedPath = encode(path, 5);
    try{
   const response = await axios.post("https://apis.tollguru.com/toll/v2/complete-polyline-from-mapping-service",
   
    {
    
      "mapProvider": "here",
      "polyline": encodedPath,
      "vehicle": {
        "type": "2AxlesTaxi",
        "weight": {
          "value": 20000,
          "unit": "pound"
        },
        "height": {
          "value": 7.5,
          "unit": "meter"
        },
        "length": {
          "value": 7.5,
          "unit": "meter"
        },
        "axles": 4,
        "emissionClass": "euro_5"
      },
      "fuelOptions": {
        "fuelCost": {
          "value": 1.305,
          "units": "USD/gallon",
          "currency": "USD",
          "fuelUnit": "gallon"
        },
        "fuelEfficiency": {
          "city": 28.57,
          "hwy": 22.4,
          "units": "mpg"
        }
      },
      "units": {
        "currency": "USD"
      },
      "departure_time": 1609507347
    }, {
      mode: "no-cors",
      headers: {
        'Access-Control-Allow-Origin': '*',
        "x-api-key": "PDj6jPGTNHdGg4hHB2DJP4pP43DM9dRj"
      }
    },
   );
   console.log(response);
  } catch(err) {
    console.log(err);
  }
    
  });  
}

const Map = () => {
  const [center, setCenter] = useState({lat: 40.371, lng:-75.0064})
  const [coordinates, setCoordinates] = useState([]);
  const [path, setPath] = useState(null);
  const [map, setMap] = useState(null);
  const [routingMachine, setRoutingMachine] = useState(null)
 
  const ZOOM_LEVEL = 8;
    return (
      <>
         <MapContainer
          center={center}
          zoom={ZOOM_LEVEL}
        >
          <TileLayer
           url="https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}.png?key=vUWnXXWWY79KWTVTmJLy"
          />
          <LocationFinder  setCoordinates={setCoordinates} setMap={setMap} />
        
          {coordinates?.map(point => {
            return (
              <Marker position={point} icon={markerIcon}></Marker>
            )
          })}

          {/* { path ? 
            <Polyline pathOptions={limeOptions} positions={path} /> : null
          }         
         */}
        </MapContainer> 

        <Button onClick={() => {
          getRouteDetails(coordinates, map);
        }}> Get details </Button>
        </>
    )
}

export default Map;
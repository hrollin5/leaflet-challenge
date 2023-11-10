// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p><strong>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]} km</strong></p>`);
    }
  
    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            radius: feature.properties.mag*2,
            fillColor: getColor(feature.geometry.coordinates[2]),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });
    }
    });
  
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);

// Function to generate color based on depth using a gradient scale
 function getColor(depth) {
        let depthRanges = [-5, 5, 25, 75, 100, 200, 700]; // Define depth ranges
        let colors = ['#EB7D5B', '#FED23F', '#B5D33D', '#6CA2EA', '#442288', '#404040']; // Corresponding colors for depth ranges
    
        // Loop through depth ranges and return the corresponding color for the given depth
        for (let i = 0; i < depthRanges.length - 1; i++) {
            if (depth >= depthRanges[i] && depth < depthRanges[i + 1]) {
                return colors[i];
            }
        }
    
        // If depth is greater than the last defined range, return the last color
        return colors[depthRanges.length - 1];
    }
  }
  
  function createMap(earthquakes) {
  
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'})
    
    let satellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3']
    });
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo,
      "Satellite Map": satellite
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [street, earthquakes]
    });
  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

// Add a basic legend to the map
let legend = L.control({ position: "bottomright" });

legend.onAdd = function (map) {
    let div = L.DomUtil.create("div", "info legend");
    div.innerHTML = '<h3 style="margin-top: 0;">Depth</h3>' +
                    '<i style="background:#EB7D5B"></i> -5&ndash;5 km<br><br>' +
                    '<i style="background:#FED23F"></i> 5&ndash;25 km<br><br>' +
                    '<i style="background:#B5D33D"></i> 25&ndash;75 km<br><br>' +
                    '<i style="background:#6CA2EA"></i> 75&ndash;100 km<br><br>' +
                    '<i style="background:#442288"></i> 100&ndash;200 km<br><br>' +
                    '<i style="background:#404040"></i> 200+ km';
    return div;
};

legend.addTo(myMap);
  }
  
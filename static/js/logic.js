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
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Depth: ${feature.geometry.coordinates[2]}<p>`);
    }

    // Define a markerSize() function that will give each earthquake a different radius based on its magnitud.
    function markerSize(mag) {
        if (mag < 1) {
          return 1;
        } else if (mag <= 10) {
          return mag * 20000; 
        } else {
          return mag * 15000;
        }
      }

    // Add markerColor function here 
    function markerColor(depth) {
        if (depth >= -10 && depth < 10) {
          return "#7FFF00";
        } else if (depth >= 10 && depth < 30) {
          return "#ADFF2F";
        } else if (depth >= 30 && depth < 50) {
          return "#FFDC00";
        } else if (depth >= 50 && depth < 70) {
          return "#FFA500";
        } else if (depth >= 70 && depth < 90) {
          return "#FF4500";
        } else {
          return "#FF0000";
        }
      
      }



    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {

        pointToLayer: function(feature, latlng) {
          return L.circle(latlng, {
            radius: markerSize(feature.properties.mag),
            color: markerColor(feature.geometry.coordinates[2]),
            fillOpacity: 1,
                // color: "black",
                // weight: 1,
                // opacity: 1,
                // Wasn't able to create a black circumference.
          });
        },
      
        onEachFeature: onEachFeature
      
      });
  
     
    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
  }
  
  function createMap(earthquakes) {
  
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Earthquakes: earthquakes
//      Legend: legend
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
  
    // Create a custom legend.
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function (map) {
        let div = L.DomUtil.create("div", "info legend");
        let depths = [-10, 10, 30, 50, 70, 90];
        let colors = ["#7FFF00", "#ADFF2F", "#FFDC00", "#FFA500", "#FF4500", "#FF0000"];
        let labels = [];

    for (let i = 0; i < depths.length; i++) {
      div.innerHTML += '<i style="background:' + colors[i] + '"></i> ' +
        depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');
    }

    return div;
  };

  // Add the legend to the map.
  legend.addTo(myMap);
  }
  
// assign the access token
mapboxgl.accessToken =
    'pk.eyJ1IjoiaWxlZTE3IiwiYSI6ImNsb290d3ZuNTAza3Mya21jOTE1Z2Q4Y2EifQ.psZvBkGOMupJVM6ZjFeSYw';

    // declare the map object
let map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/dark-v10',
    zoom: 10.70, // starting zoom
    minZoom: 10.70,
    center: [-122.331198, 47.613766] // starting center
});

    

        // add navigation controls \(zoom buttons, pitch & rotate\)
  map.addControl(new mapboxgl.NavigationControl());

// define the asynchronous function to load geojson data.
async function geojsonFetch() {

    // Await operator is used to wait for a promise. 
    // An await can cause an async function to pause until a Promise is settled.
    let response;
    response = await fetch('assets/APIData.geojson');
    resturants = await response.json();

  map.on("load", () => {
    
    // add the source to the map styles
    map.addSource('APIData', {
      type: 'geojson',
      data: APIData
    });

    map.addLayer({
      id: 'APIData-point',
      type: 'fill',
      source: 'hexGrid',
      layout: {},
      paint: {
        'fill-color': {
          property: 'bin',
          stops: colorRamp.map((d, i) => [i, d])
        },
        'fill-opacity': 0.6
      }
    });
  });

  // Be careful to clean up the map's resources using \`map.remove()\` whenever
  // this cell is re-evaluated.
  try {
    yield map;
    yield invalidation;
  } finally {
    map.remove();
  }
}

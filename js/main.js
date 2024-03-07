        // assign the access token
        mapboxgl.accessToken =
        'pk.eyJ1IjoiaWxlZTE3IiwiYSI6ImNsb290d3ZuNTAza3Mya21jOTE1Z2Q4Y2EifQ.psZvBkGOMupJVM6ZjFeSYw';

        // declare the map object
        let map = new mapboxgl.Map({
            container: 'map', // container ID
            style: 'mapbox://styles/mapbox/dark-v10',
            zoom: 11, // starting zoom
            minZoom: 2,
            center: [-122.4, 47.613766] // starting center
        });

        // declare the coordinated chart as well as other variables.
        let reviewsChart = null,
            Rating = {},
            numreviews = 0;

        // create a few constant variables.
        const grades = [1, 2, 3, 4],
            colors = ['rgb(249, 46, 2 )', 'rgb(250, 235, 3)', 'rgb(250, 149, 3 )', 'rgb(3, 250, 227)'],
            radii = [5, 10, 15, 20];

        // create the legend object and anchor it to the html element with id legend.
        const legend = document.getElementById('legend');

        //set up legend grades content and labels
        let labels = ['<strong>Review Ratings</strong>'],
            vbreak;

        //iterate through grades and create a scaled circle and label for each
        for (var i = 0; i < Rating.length; i++) {
            vbreak = Rating[i];
            // you need to manually adjust the radius of each dot on the legend
            // in order to make sure the legend can be properly referred to the dot on the map.
            dot_radii = 2 * radii[i];
            labels.push(
                '<p class="break"><i class="dot" style="background:' + colors[i] + '; width: ' + dot_radii +
                'px; height: ' +
                dot_radii + 'px; "></i> <span class="dot-label" style="top: ' + dot_radii / 2 + 'px;">' + vbreak +
                '</span></p>');

        }
        // link group csv file!
        const source =
            '<p style="text-align: right; font-size:10pt">Source: <a href="https://www.yelp.com">yelp</a></p>';

        // join all the labels and the source to create the legend content.
        legend.innerHTML = labels.join('') + source;



        // define the asynchronous function to load geojson 'geojsonFetch()' data.
        async function geojsonFetch() {

            // Await operator is used to wait for a promise.
            // An await can cause an async function to pause until a Promise is settled.
            let response;
            response = await fetch('assets/reviews.geojson');
            reviews = await response.json();



            //load data to the map as new layers.
            //map.on('load', function loadingData() {
            map.on('load', () => { //simplifying the function statement: arrow with brackets to define a function

                // when loading a geojson, there are two steps
                // add a source of the data and then add the layer out of the source
                map.addSource('reviews', {
                    type: 'geojson',
                    data: reviews
                });


                map.addLayer({
                        'id': 'reviews-point',
                        'type': 'circle',
                        'source': 'reviews',
                        'minzoom': 2,
                        'paint': {
                            // increase the radii of the circle as mag value increases
                            'circle-radius': {
                                'property': 'rating',
                                'stops': [
                                    [grades[0], radii[0]],
                                    [grades[1], radii[1]],
                                    [grades[2], radii[2]],
                                    [grades[3], radii[3]]
                                ]
                            },
                            // change the color of the circle as mag value increases
                            'circle-color': {
                                'property': 'rating',
                                'stops': [
                                    [grades[0], colors[0]],
                                    [grades[1], colors[1]],
                                    [grades[2], colors[2]],
                                    [grades[3], grades[3]],
                                ]
                            },
                            'circle-stroke-color': 'white',
                            'circle-stroke-width': 1,
                            'circle-opacity': 0.6
                        }
                    },
                    'waterway-label' // make the thematic layer above the waterway-label layer.
                );


                // click on each dot to view magnitude in a popup
                map.on('click', 'reviews-point', (event) => {
                    new mapboxgl.Popup()
                        .setLngLat(event.features[0].geometry.coordinates)
                        .setHTML(`<strong>Ratings:</strong> ${event.features[0].properties.rating}`)
                        .addTo(map);
                });



                // the coordinated chart relevant operations

                // found the the magnitudes of all the earthquakes in the displayed map view.
                Ratings = calreviews(reviews, map.getBounds());

                // enumerate the number of earthquakes.
                numreviews = Ratings[1] + Ratings[2] + Ratings[3] + Ratings[4];

                // update the content of the element earthquake-count.
                document.getElementById("reviews-count").innerHTML = numreviews;

                // add "mag" to the beginning of the x variable - the magnitude, and "#" to the beginning of the y variable - the number of earthquake of similar magnitude.
                x = Object.keys(Ratings);
                x.unshift("rating")
                y = Object.values(Ratings);
                y.unshift("#")


                // generate the chart
                reviewsChart = c3.generate({
                    size: {
                        height: 350,
                        width: 460
                    },
                    data: {
                        x: 'rating',
                        columns: [x, y],
                        type: 'bar', // make a bar chart.
                        colors: {
                            '#': (d) => {
                                return colors[d["x"]];
                            }
                        },
                        onclick: function (
                        d) { // update the map and sidebar once the bar is clicked.
                            let floor = parseInt(x[1 + d["x"]]),
                                ceiling = floor + 1;
                            // combine two filters, the first is ['>=', 'mag', floor], the second is ['<', 'mag', ceiling]
                            // the first indicates all the earthquakes with magnitude greater than floor, the second indicates
                            // all the earthquakes with magnitude smaller than the ceiling.
                            map.setFilter('reviews-point',
                                ['all',
                                    ['>=', 'rating', floor],
                                    ['<', 'rating', ceiling]
                                ]);
                        }
                    },
                    axis: {
                        x: { //magnitude
                            type: 'category',
                            tick: {
                                color: 'white'
                            }
                        },
                        y: { //count
                            tick: {
                                values: [15, 30, 45, 60, 75],
                                color: 'white'
                            }
                        }
                    },
                    legend: {
                        show: false
                    },
                    bindto: "#reviews-chart" //bind the chart to the place holder element "earthquake-chart".
                });

            });



            //load data to the map as new layers.
            //map.on('load', function loadingData() {
            map.on('idle', () => { //simplifying the function statement: arrow with brackets to define a function

                Ratings = calreviews(reviews, map.getBounds());
                numreviews = Ratings[1] + Ratings[2] + Ratings[3] + Ratings[4];
                document.getElementById("reviews-count").innerHTML = numreviews;


                x = Object.keys(Ratings);
                x.unshift("rating")
                y = Object.values(Ratings);
                y.unshift("#")

                // after finishing each map reaction, the chart will be rendered in case the current bbox changes.
                reviewsChart.load({
                    columns: [x, y]
                });
            });
        }

        // call the geojson loading function
        geojsonFetch();

        function calreviews(currentreviews, currentMapBounds) {

            let RatingClasses = {
                1: 0,
                2: 0,
                3: 0,
                4: 0
            };
            currentreviews.features.forEach(function (d) { // d indicate a feature of currentEarthquakes
                // contains is a spatial operation to determine whether a point within a bbox or not.
                if (currentMapBounds.contains(d.geometry.coordinates)) {
                    // if within, the # of the earthquake in the same magnitude increase by 1.
                    RatingClasses[Math.floor(d.properties.rating)] += 1;
                }

            })
            return RatingClasses;
        }

        // capture the element reset and add a click event to it.
        const reset = document.getElementById('reset');
        reset.addEventListener('click', event => {

            // this event will trigger the map fly to its origin location and zoom level.
            map.flyTo({
                zoom: 11,
                center: [-122.4, 47.613766]
            });
            // also remove all the applied filters
            map.setFilter('reviews-point', null)


        });
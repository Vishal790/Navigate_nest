
// console.log(query);

fetch(`https://api.tomtom.com/search/2/geocode/${encodeURIComponent(query)}.json?key=${mapToken}`)
    .then(response => response.json())
    .then(data => {
        // Extract latitude and longitude from the response
        const coordinates = data.results[0].position;
      //  console.log('Coordinates:', coordinates);
       // console.log(coordinates.lon, "  ", coordinates.lat);
        let center = [coordinates.lon, coordinates.lat]
       
        var map = tt.map({
            key: mapToken,
            container: 'map',
            center: center,
            zoom: 10

        })
        map.on('load', () => {
            new tt.Marker().setLngLat(center).addTo(map)
        })
    })
    .catch(error => {
        console.error('Error:', error);
    });







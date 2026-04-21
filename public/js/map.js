
    mapboxgl.accessToken = mapToken;

    if (Array.isArray(coordinates) && coordinates.length === 2) {
        const map = new mapboxgl.Map({
            container: 'map', // container ID
            //style: 'mapbox://styles/mapbox/streets-v11', // style URL
            center: coordinates, // use existing [lng, lat] from listing data
            zoom: 9 // starting zoom
        }); 


         const marker = new mapboxgl.Marker({ color: 'red' })
             .setLngLat(coordinates)
             .setPopup(new mapboxgl.Popup({ offset: 25 })
             .setHTML(`<h4>${listing.title}</h4><p>Exact Location will be provided after booking</p>`))
             .addTo(map);
    }
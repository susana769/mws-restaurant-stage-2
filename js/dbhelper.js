/**
 * Common database helper functions.
 */
class DBHelper {
  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http:\//localhost:${port}/restaurants`;
  }

  /**
   * Fetch all restaurants.
   */
   /*
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        const restaurants = json.restaurants;
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
  }
*/



  static openDatabase() {
    // If the browser doesn't support service worker,
    // we don't care about having a database
    if (!navigator.serviceWorker) {
      return Promise.resolve();
    }

    return idb.open('restaurantDb', 1, function(upgradeDb){
      var store = upgradeDb.createObjectStore('restaurantDb', {
        keyPath: 'id'
      });
      store.createIndex('by-id', 'id');
      var reviewStore = upgradeDb.createObjectStore('reviewsDb', {keyPath: 'id'});
    });
  }

  static saveReviewToDatabase(reviews) {
    return DBHelper.openDatabase().then(function(db){
      if(!db) return;

      var tx = db.transaction('reviewsDb', 'readwrite');
      var store = tx.objectStore('reviewsDb');
      reviews.forEach(function(review){
        store.put(review);
      });
      return tx.complete;
    });
  }

  static addReviewsFromAPI(id) {
    return fetch('http://localhost:1337/restaurants/?id=${id}')
      .then(function(response){
        return response.json();
    }).then(reviews => {
      DBHelper.saveReviewToDatabase(reviews);
      return reviews;
    });
  }

  static saveRestaurantToDatabase(data){
    return DBHelper.openDatabase().then(function(db){
      if(!db) return;

      var tx = db.transaction('restaurantDb', 'readwrite');
      var store = tx.objectStore('restaurantDb');
      data.forEach(function(restaurant){
        store.put(restaurant);
      });
      return tx.complete;
    });
  }

  static addRestaurantsFromAPI(){
    return fetch(DBHelper.DATABASE_URL)
      .then(function(response){
        return response.json();
    }).then(restaurants => {
      DBHelper.saveRestaurantToDatabase(restaurants);
      return restaurants;
    });
  }

  static getCachedRestaurants() {
    return DBHelper.openDatabase().then(function(db){
      if(!db) return;

      var store = db.transaction('restaurantDb').objectStore('restaurantDb');
      return store.getAll();
    });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    return DBHelper.getCachedRestaurants().then(restaurants => {
      if(restaurants.length) {
        return Promise.resolve(restaurants);
      } else {
        return DBHelper.addRestaurantsFromAPI();
      }
    })
    .then(restaurants=> {
      callback(null, restaurants);
    })
    .catch(error => {
      callback(error, null);
    })
  }





  /* Fetch a restaurant by id */
  static fetchRestaurantById(id, callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) {
          callback(null, restaurant);
        } else { 
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  /* Fetch restaurants by a cuisine */
  static fetchRestaurantByCuisine(cuisine, callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /* Fetch restaurants by neighborhood */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {

    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /* Fetch restaurants by a cuisine and one neighborhood */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { 
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') {
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /* Fetch all neighborhoods */
  static fetchNeighborhoods(callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /* Fetch all cuisines */
  static fetchCuisines(callback) {
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /* Restaurant id URL */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /* Restaurant image URL */
  static imageUrlForRestaurant(restaurant) {
    return (`/images_src/${restaurant.photograph}`);
  }

  /* Map marker for a restaurant */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }
}

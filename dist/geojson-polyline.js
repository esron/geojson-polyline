(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.GeoJSONPolyline = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var assign = require('object-assign')
var polyline = require('polyline')

var GeoJSONPolyline = module.exports = {
  // Pick and choose your verbs
  encode: geo2poly,
  decode: poly2geo,
  //
  geojson: poly2geo,
  geoJson: poly2geo,
  geoJSON: poly2geo,
  //
  polyline: geo2poly,
  polyLine: geo2poly,
  //
  toEncoded: geo2poly,
  fromEncoded: poly2geo,
  //
  toGeoJSON: poly2geo,
  fromGeoJSON: geo2poly,
  //
  toPolyline: geo2poly,
  fromPolyline: poly2geo
}

/**
 * Encodes a GeoJSON geometry as a polyline.
 *
 * @param {Object} geojson
 * @param {Object} options
 * @returns {Object} encoded geojson
 */
function geo2poly (geojson, options) {
  var precision = typeof (options) === 'object' && options.precision

  switch (geojson.type) {
    // Coordinate arrays
    case 'Point': {
      return assign({}, geojson, {
        coordinates: encode([geojson.coordinates], precision)
      })
    }
    case 'MultiPoint':
    case 'LineString': {
      return assign({}, geojson, {
        coordinates: encode(geojson.coordinates, precision)
      })
    }
    // Arrays of coordinates
    case 'MultiLineString':
    case 'Polygon': {
      return assign({}, geojson, {
        coordinates: geojson.coordinates.map(function (coords) {
          return encode(coords, precision)
        })
      })
    }
    case 'Feature': {
      return assign({}, geojson, {
        geometry: geo2poly(geojson.geometry, precision)
      })
    }
    case 'FeatureCollection': {
      return assign({}, geojson, {
        features: geojson.features.map(function (feature) {
          return geo2poly(feature, precision)
        })
      })
    }
    case 'GeometryCollection': {
      return assign({}, geojson, {
        geometries: geojson.geometries.map(function (geo) {
          return geo2poly(geo, precision)
        })
      })
    }
    case 'MultiPolygon': {
      return assign({}, geojson, {
        coordinates: geojson.coordinates.map(function (polygons) {
          return polygons.map(function (coords) {
            return encode(coords, precision)
          })
        })
      })
    }
    // Return the original object for unsupported types
    default:
      return geojson
  }
}

/**
 * Decode a polyline-encoded GeoJSON geometry.
 *
 * @param {Object} geojson
 * @param {Object} options
 * @returns {Object} decoded geojson
 */
function poly2geo (geojson, options) {
  var precision = typeof (options) === 'object' && options.precision

  switch (geojson.type) {
    // Translate a single-element array back to a single coordinate array
    case 'Point': {
      return assign({}, geojson, {
        coordinates: decode(geojson.coordinates, precision)[0]
      })
    }
    // Decode into a coordinate array
    case 'MultiPoint':
    case 'LineString': {
      return assign({}, geojson, {
        coordinates: decode(geojson.coordinates, precision)
      })
    }
    // Arrays of coordinate arrays
    case 'MultiLineString':
    case 'Polygon': {
      return assign({}, geojson, {
        coordinates: geojson.coordinates.map(function (coords) {
          return decode(coords, precision)
        })
      })
    }
    // Arrays of polygons
    case 'MultiPolygon': {
      return assign({}, geojson, {
        coordinates: geojson.coordinates.map(function (polygons) {
          return polygons.map(function (coords) {
            return decode(coords, precision)
          })
        })
      })
    }
    // GeoJSON object is
    case 'Feature': {
      return assign({}, geojson, {
        geometry: poly2geo(geojson.geometry, precision)
      })
    }
    case 'FeatureCollection': {
      return assign({}, geojson, {
        features: geojson.features.map(function (feature) {
          return poly2geo(feature, precision)
        })
      })
    }
    case 'GeometryCollection': {
      return assign({}, geojson, {
        geometries: geojson.geometries.map(function (geometry) {
          return poly2geo(geometry, precision)
        })
      })
    }
    // Return the original object for unsupported types
    default:
      return geojson
  }
}

function encode (coordinates, precision) {
  return polyline.encode(flip(coordinates), precision)
}
function decode (str, precision) {
  return flip(polyline.decode(str, precision))
}
function flip (coords) {
  var flipped = []
  for (var i = 0; i < coords.length; i++) {
    flipped.push(coords[i].slice().reverse())
  }
  return flipped
}

if (typeof addEventListener !== 'undefined') {
  /* global addEventListener, postMessage */
  addEventListener('message', function (message) {
    var method = message.data[0]
    var geojson = message.data[1]
    var precision = message.data[2]
    var converted = GeoJSONPolyline[method](geojson, precision)
    postMessage(converted)
  })
}

},{"object-assign":2,"polyline":3}],2:[function(require,module,exports){
'use strict';
/* eslint-disable no-unused-vars */
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (e) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],3:[function(require,module,exports){
'use strict';

/**
 * Based off of [the offical Google document](https://developers.google.com/maps/documentation/utilities/polylinealgorithm)
 *
 * Some parts from [this implementation](http://facstaff.unca.edu/mcmcclur/GoogleMaps/EncodePolyline/PolylineEncoder.js)
 * by [Mark McClure](http://facstaff.unca.edu/mcmcclur/)
 *
 * @module polyline
 */

var polyline = {};

function encode(coordinate, factor) {
    coordinate = Math.round(coordinate * factor);
    coordinate <<= 1;
    if (coordinate < 0) {
        coordinate = ~coordinate;
    }
    var output = '';
    while (coordinate >= 0x20) {
        output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 63);
        coordinate >>= 5;
    }
    output += String.fromCharCode(coordinate + 63);
    return output;
}

/**
 * Decodes to a [latitude, longitude] coordinates array.
 *
 * This is adapted from the implementation in Project-OSRM.
 *
 * @param {String} str
 * @param {Number} precision
 * @returns {Array}
 *
 * @see https://github.com/Project-OSRM/osrm-frontend/blob/master/WebContent/routing/OSRM.RoutingGeometry.js
 */
polyline.decode = function(str, precision) {
    var index = 0,
        lat = 0,
        lng = 0,
        coordinates = [],
        shift = 0,
        result = 0,
        byte = null,
        latitude_change,
        longitude_change,
        factor = Math.pow(10, precision || 5);

    // Coordinates have variable length when encoded, so just keep
    // track of whether we've hit the end of the string. In each
    // loop iteration, a single coordinate is decoded.
    while (index < str.length) {

        // Reset shift, result, and byte
        byte = null;
        shift = 0;
        result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        shift = result = 0;

        do {
            byte = str.charCodeAt(index++) - 63;
            result |= (byte & 0x1f) << shift;
            shift += 5;
        } while (byte >= 0x20);

        longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

        lat += latitude_change;
        lng += longitude_change;

        coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
};

/**
 * Encodes the given [latitude, longitude] coordinates array.
 *
 * @param {Array.<Array.<Number>>} coordinates
 * @param {Number} precision
 * @returns {String}
 */
polyline.encode = function(coordinates, precision) {
    if (!coordinates.length) { return ''; }

    var factor = Math.pow(10, precision || 5),
        output = encode(coordinates[0][0], factor) + encode(coordinates[0][1], factor);

    for (var i = 1; i < coordinates.length; i++) {
        var a = coordinates[i], b = coordinates[i - 1];
        output += encode(a[0] - b[0], factor);
        output += encode(a[1] - b[1], factor);
    }

    return output;
};

function flipped(coords) {
    var flipped = [];
    for (var i = 0; i < coords.length; i++) {
        flipped.push(coords[i].slice().reverse());
    }
    return flipped;
}

/**
 * Encodes a GeoJSON LineString feature/geometry.
 *
 * @param {Object} geojson
 * @param {Number} precision
 * @returns {String}
 */
polyline.fromGeoJSON = function(geojson, precision) {
    if (geojson && geojson.type === 'Feature') {
        geojson = geojson.geometry;
    }
    if (!geojson || geojson.type !== 'LineString') {
        throw new Error('Input must be a GeoJSON LineString');
    }
    return polyline.encode(flipped(geojson.coordinates), precision);
};

/**
 * Decodes to a GeoJSON LineString geometry.
 *
 * @param {String} str
 * @param {Number} precision
 * @returns {Object}
 */
polyline.toGeoJSON = function(str, precision) {
    var coords = polyline.decode(str, precision);
    return {
        type: 'LineString',
        coordinates: flipped(coords)
    };
};

if (typeof module === 'object' && module.exports) {
    module.exports = polyline;
}

},{}]},{},[1])(1)
});
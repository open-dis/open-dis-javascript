/**
 * @namespace dis
 */

/**
 * @typedef {Object} LatLonAlt
 * @memberof dis
 * @property {number} latitude
 * @property {number} longitude
 * @property {number} altitude
 */

/**
 * Unfortunate re-typing of original LatLonAlt because one function
 * in CoordinateConversion uses different variable names.
 * 
 * TODO: Remove when getXYZfromLatLonAltDegrees uses LatLonAlt.
 * @typedef {Object} LatLonAltShort
 * @memberof dis
 * @property {number} lat
 * @property {number} lon
 * @property {number} alt
 */
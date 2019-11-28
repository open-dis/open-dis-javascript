/**
 * Sets up a local tangent place (ENU) coordinate system at a given location
 * and altitude, and handles conversions between geodetic, ECEF, and local
 * tangent plane coordinate systems.
 * 
 * For reference see  "Conversion of Geodetic coordinates to the Local
 * Tangent Plane", version 2.01, 
 * http://www.psas.pdx.edu/CoordinateSystem/Latitude_to_LocalTangent.pdf
 * 
 * and "Geodetic Systems", 
 * http://wiki.gis.com/wiki/index.php/Geodetic_system#From_geodetic_coordinates_to_local_ENU_coordinates
 * 
 * There's also a bunch of ancient code from older versions that someone, somewhere,
 * lifted from a military handbook, originally written in C, translated to Java,
 * and now translated to Javascript. 
 * 
 * Terminology: 
 * 
 * ECEF: earth centered, earth fixed coordinate system, same as DIS. Cartesian,
 * origin at center of the earth, z through north pole, x out the equator and
 * prime meridian, y out equator and 90 deg east. This coordinate system rotates
 * with the earth, ie the x axis always points out the prime meridian and equator
 * even as the earth rotates.
 * 
 * Geodetic: latitude, longitude, altitude.
 * 
 * WGS84: Shape of the earth, an ellipsoid roughly, with a and b the semimajor and semiminor axes
 * 
 * ENU: East, North, Up: local coordinate system with a given geodetic origin. Tangent
 * plane to the earth.
 *
 * All Errors mine
 * 
 * @DMcG
 * 
 * @param {float} lat latitude in degrees of the origin of the local tangent plane coordinate system
 * @param {float} lon longitude, in degrees, of origin
 * @param {float} alt altitude, in meters, of the origin of the local tangent plane coordinate system
 */

if (typeof dis === "undefined")
 dis = {};
 
// Support for node.js style modules; ignore if not using node.js require
if (typeof exports === "undefined")
   exports = {};
 
/** Constructor, creates an object that can do coordinate systems conversions.
 * Takes a geodetic point that is the origin of a tangent plane to the surface
 * of the earth. This is useful for doing local simulation work. The local
 * coordinate system has postive x east, positive y north, and positive Z up,
 * aka an ENU coordinate system. Methods for converting from that coordinate system
 * to the DIS (ECEF) coordinate system or geotetic coordinate systems are provided.
 * 
 * @param {type} lat latitude, in degrees, of where the local tangent plane is located
 * @param {type} lon longitude, in degrees, of the origin of the local tangent plane
 * @param {type} alt altitude, in meters, of the origin of the local tangent plane
 * @returns {RangeCoordinates} An object that can do coordinate system conversions
 */
dis.RangeCoordinates = function(lat, lon, alt)
{
    this.RADIANS_PER_DEGREE = 2 * Math.PI / 360.0;
    this.DEGREES_PER_RADIAN = 360.0 / (2* Math.PI);
    
    /** WGS84 semimajor axis (constant) */
    this.a = 6378137.0;
    
    /** WGS84 semiminor axis (constant) */
    this.b = 6356752.3142; 
    
    /** Ellipsoidal Flatness (constant) */
    this.f = (this.a - this.b) / this.a;                      // Should be 3.3528107 X 10^-3
    
    /** Eccentricity (constant) */
    this.e = Math.sqrt(this.f * (2 - this.f)); // Should be 8.1819191 X 10^-2
    
    // The origin of the local, East-North-Up (ENU) coordinate system, in lat/lon degrees and meters.
    this.ENUOrigin = {};
    this.ENUOrigin.latitude  = lat;
    this.ENUOrigin.longitude = lon;
    this.ENUOrigin.altitude   = alt;
    
    // Find the origin of the ENU in earth-centered, earth-fixed ECEF aka DIS coordinates
    this.ENUOriginInECEF = {};
    this.ENUOriginInECEF = this.latLonAltDegreesToECEF(lat, lon, alt);
};
    
    /** Determines N, the distance from a normal plane at the given
     * latitude to the Z-axis running through the center of the earth.
     * This is NOT the same as the distance to the center of the earth.
     * 
     * @param {float} lambda the latitude, in radians.
     * @returns {float} distance in meters from the latitude to the axis of the earth
     */
    dis.RangeCoordinates.prototype.N = function(lambda)
    {
        //N(lambda) = a / sqrt( 1 - e^2 * sin^2(lambda) )
        var val = this.a / Math.sqrt(1- ( Math.pow(this.e, 2) * Math.pow( Math.sin(lambda), 2) ) );
        return val;
    };
    
    /**
     * Converts a latitude, longitude, and altitude object to DIS rectilinear
     * coordinates, aka earth-centered, earth-fixed, rectilinear. 
     *
     * @param {latitude:longitude:altitude:} latLonAlt The lat/lon/alt, in degrees and meters
     * @returns {x, y, z}  rectilienar coordinates in ECEF, aka DIS coordinates
     */
    dis.RangeCoordinates.prototype.latLonAltDegreesObjectToECEF = function(latLonAlt)
    {
        return this.latLonAltDegreesToECEF(latLonAlt.latitude, latLonAlt.longitude, latLonAlt.altitude);
    };
    
    /**
     * Converts a latitude, longitude, and altitude to DIS rectilinear
     * coordinates, aka earth-centered, earth-fixed, rectilinear. 
     *
     * @param {float} latitude (in radians)
     * @param {float} longitude (in radians)
     * @param {float} altitude (in meters)
     * @returns {x, y, z} rectilienar coordinates in ECEF-r, aka DIS coordinates
     */
    dis.RangeCoordinates.prototype.latLonAltRadiansToECEF = function(latitude, longitude, altitude)
    {
        /*
        // altitude corresponds to h in the paper, lambda to latitude, phi to longitude
       var x = (altitude + this.N(latitude)) * Math.cos(latitude) * Math.cos(longitude);
       var y = (altitude + this.N(latitude)) * Math.cos(latitude) * Math.sin(longitude);
       var z = (altitude + (1 - Math.pow(this.e, 2) )  * this.N(latitude)) * Math.sin(longitude);
       
       var coordinates = {};
       coordinates.x = x;
       coordinates.y = y;
       coordinates.z = z;
        */
       
        var cosLat = Math.cos(latitude);
        var sinLat = Math.sin(latitude);

        var rSubN = (this.a*this.a) / Math.sqrt(((this.a*this.a) * (cosLat*cosLat) + ((this.b*this.b) * (sinLat*sinLat))));

        var X = (rSubN + altitude) * cosLat * Math.cos(longitude);
        var Y = (rSubN + altitude) * cosLat * Math.sin(longitude);
        var Z = ((((this.b*this.b) / (this.a*this.a)) * rSubN) + altitude) * sinLat;

        return {x:X, y:Y, z:Z};
    };
    
    /*
     * 
     * @param {type} latitude in degrees
     * @param {type} longitude in degrees
     * @param {type} altitude in meters
     * @returns {x,y,z} coordinates in ECEF, in meters aka DIS global coordinates
     */
    dis.RangeCoordinates.prototype.latLonAltDegreesToECEF = function(latitude, longitude, altitude)
    {
        return this.latLonAltRadiansToECEF(latitude * this.RADIANS_PER_DEGREE, longitude * this.RADIANS_PER_DEGREE, altitude);
    };
    
    /**
     * Converts DIS xyz world coordinates to latitude and longitude (IN DEGREES). This algorithm may not be 100% accurate
     * near the poles. Uses WGS84 , though you can change the ellipsoid constants a and b if you want to use something
     * else. These formulas were obtained from Military Handbook 600008. The code itself has been
     * translated from C to Java to Javascript over the years, so hold onto your hats. (This is
     * copied from other sources than those listed above. Seems to work, though.)
     *
     * @param position {x:, y:, z:}
     * @return {latitude:, longitude: altitude:}
     */
    dis.RangeCoordinates.prototype.ECEFObjectToLatLongAltInDegrees = function(position)
    {
        var x = position.x;
        var y = position.y;
        var z = position.z;
        
        var answer = [];
        answer[0] = 0.0;
        answer[1] = 0.0;
        answer[2] = 0.0;
        var a = this.a;   // semi major axis (WGS 84)
        var b = this.b;   //semi minor axis (WGS 84)

        var eSquared;     //first eccentricity squared
        var rSubN;        //radius of the curvature of the prime vertical
        var ePrimeSquared;//second eccentricity squared
        var W = Math.sqrt((x*x + y*y));

        eSquared = (a*a - b*b) / (a*a);
        ePrimeSquared = (a*a - b*b) / (b*b);

        /**
         * Get the longitude.
         */
        if(x >= 0 )
        {
            answer[1] = Math.atan(y/x);
        }
        else if(x < 0 && y >= 0)
        {
            answer[1] = Math.atan(y/x) + Math.PI;
        }
        else
        {
            answer[1] = Math.atan(y/x) - Math.PI;
        }
        /**
         * Longitude calculation done. Now calculate latitude.
         * NOTE: The handbook mentions using the calculated phi (latitude) value to recalculate B
         * using tan B = (1-f) tan phi and then performing the entire calculation again to get more accurate values.
         * However, for terrestrial applications, one iteration is accurate to .1 millimeter on the surface  of the
         * earth (Rapp, 1984, p.124), so one iteration is enough for our purposes
         */
        var tanBZero = (a*z) / (b * W);
        var BZero = Math.atan((tanBZero));
        var tanPhi = (z + (ePrimeSquared * b * (Math.pow(Math.sin(BZero), 3))) ) /(W - (a * eSquared * (Math.pow(Math.cos(BZero), 3))));
        var phi = Math.atan(tanPhi);
        answer[0] = phi;
        /**
         * Latitude done, now get the elevation. Note: The handbook states that near the poles, it is preferable to use
         * h = (Z / sin phi ) - rSubN + (eSquared * rSubN). Our applications are never near the poles, so this formula
         * was left unimplemented.
         */
        rSubN = (a*a) / Math.sqrt(((a*a) * (Math.cos(phi)*Math.cos(phi)) + ((b*b) * (Math.sin(phi)*Math.sin(phi)))));

        answer[2] = (W / Math.cos(phi)) - rSubN;

        var ld = answer[0] * this.DEGREES_PER_RADIAN;
        var lnd = answer[1] * this.DEGREES_PER_RADIAN;
        var result = {latitude:ld, longitude:lnd, altitude:answer[2]};
        return result;

    };
    
   /**
    *  Converts an ECEF position to the local ENU coordinate system. Units are meters,
    *  and the origin of the ENU coordinate system is set in the constructor.
    *  
    *  @param {x:y:z:} ecefPosition ecef position (in meters)
    *  @returns {x:y:z:} object with x, y, and z local coordinates, ENU 
    */
   dis.RangeCoordinates.prototype.ECEFObjectToENU = function(ecefPosition)
   {
       return this.ECEFtoENU(ecefPosition.x, ecefPosition.y, ecefPosition.z);
   };
  
   /**
    *  Converts an ECEF position to the local ENU coordinate system. Units are meters,
    *  and the origin of the ENU coordinate system is set in the constructor.
    *  
    *  @param {float} X the X coordinate of the ECEF position
    *  @param {float} Y the Y coordinate 
    *  @param {float} Z the Z coordinate
    *  @returns {x:y:z:} object with x, y, and z local coordinates, ENU 
    */
   dis.RangeCoordinates.prototype.ECEFtoENU = function(X, Y, Z)
   {
     // Origin of ENU tangent plane coordinate system in ECEF coordinate system
     var Xr = this.ENUOriginInECEF.x;
     var Yr = this.ENUOriginInECEF.y;
     var Zr = this.ENUOriginInECEF.z;
     
     var originLonRadians = this.ENUOrigin.longitude * this.RADIANS_PER_DEGREE;
     var originLatRadians = this.ENUOrigin.latitude * this.RADIANS_PER_DEGREE;
     
     e = -(Math.sin(originLonRadians)) * (X-Xr) + Math.cos(originLonRadians) * (Y-Yr);
     n = -(Math.sin(originLatRadians))  * Math.cos(originLonRadians) * (X-Xr) - Math.sin(originLatRadians) * Math.sin(originLonRadians) * (Y-Yr) + Math.cos(originLatRadians) * (Z-Zr);
     u = Math.cos(originLatRadians) * Math.cos(originLonRadians) * (X-Xr) + Math.cos(originLatRadians) * Math.sin(originLonRadians) * (Y-Yr) + Math.sin(originLatRadians) * (Z-Zr);
    
     // Local coordinate system x, y, z
     return {x:e, y:n, z:u};
   };
   
   /**
   * Converts a local coordinate system / ENU/ Local Tangent Plane object to ECEF, aka DIS coordinates.
   * 
   * @param enuPosition {x:y:z:} local coordinate object
   * @returns {x:y:z:} point in ECEF / DIS coordinate system
   */
   dis.RangeCoordinates.prototype.ENUObjectToECEF = function(enuPosition)
   {
       return this.ENUtoECEF(enuPosition.x, enuPosition.y, enuPosition.z);
   };
   
  /**
   * Converts a local coordinate system / ENU/ Local Tangent Plane point to ECEF, aka DIS coordinates.
   * 
   * @param localX {float} local coordinate system X
   * @param localY {float} local coordinate system Y
   * @param localZ {float} local coordinate system Z
   * @returns {x:y:z:} point in ECEF / DIS coordinate system
   */
   dis.RangeCoordinates.prototype.ENUtoECEF = function(localX, localY, localZ)
   {
       // ENU local coordinate system origin, in ECEF
       var Xr = this.ENUOriginInECEF.x;
       var Yr = this.ENUOriginInECEF.y;
       var Zr = this.ENUOriginInECEF.z;
       
       var refLong = this.ENUOrigin.longitude;
       var refLat = this.ENUOrigin.latitude;       
      
      /** original code this was copied from 
      
       function [X, Y, Z] = enu2xyz(refLat, refLong, refH, e, n, u)
  % Convert east, north, up coordinates (labeled e, n, u) to ECEF
  % coordinates. The reference point (phi, lambda, h) must be given. All distances are in metres
 
  [Xr,Yr,Zr] = llh2xyz(refLat,refLong, refH); % location of reference point
 
  X = -sin(refLong)*e - cos(refLong)*sin(refLat)*n + cos(refLong)*cos(refLat)*u + Xr;
  Y = cos(refLong)*e - sin(refLong)*sin(refLat)*n + cos(refLat)*sin(refLong)*u + Yr;
  Z = cos(refLat)*n + sin(refLat)*u + Zr;
       */
 
       X = -(Math.sin(refLong)) * localX - Math.cos(refLong) * Math.sin(refLat) * localY + Math.cos(refLong) * Math.cos(refLat) * localZ + Xr;
       Y = Math.cos(refLong) * localX - Math.sin(refLong) * Math.sin(refLat) * localY + Math.cos(refLat) * Math.sin(refLong) * localZ + Yr;
       Z = Math.cos(refLat)  * localY + Math.sin(refLat) * localZ + Zr;
       
       return {x:X, y:Y, z:Z};
   };
   
exports.RangeCoordinates = dis.RangeCoordinates;
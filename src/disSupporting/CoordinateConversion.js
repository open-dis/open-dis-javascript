if (typeof dis === "undefined")
   dis = {};
 
// Support for node.js style modules; ignore if not using node.js require
if (typeof exports === "undefined")
   exports = {};

dis.CoordinateConversion = function()
 {
     
    this.RADIANS_TO_DEGREES = 180.0/Math.PI;
    this.DEGREES_TO_RADIANS = Math.PI/180.0;
    
    this.a = 6378137.0;    //semi major axis (WGS 84)
    this.b = 6356752.3142; //semi minor axis (WGS 84)
    
    /**
     * Converts DIS xyz world coordinates to latitude and longitude (IN DEGREES). This algorithm may not be 100% accurate
     * near the poles. Uses WGS84 , though you can change the ellipsoid constants a and b if you want to use something
     * else. These formulas were obtained from Military Handbook 600008. The code itself has been 
     * translated from C to Java to Javascript over the years, so hold onto your hats.
     * 
     * @param position {x:, y:, z:}
     * @return {latitude:, longitude: altitude:}
     */
    dis.CoordinateConversion.prototype.convertDisToLatLongInDegrees = function(position)
    {
        var x = position.x;
        var y = position.y;
        var z = position.z;
        var answer = [];
        answer[0] = 0.0;
        answer[1] = 0.0;
        answer[2] = 0.0;

        var eSquared;      //first eccentricity squared
        var rSubN;         //radius of the curvature of the prime vertical
        var ePrimeSquared; //second eccentricity squared
        var W = Math.sqrt((x*x + y*y));
        var a = 6378137.0;    // shorter variable names
        var b = 6356752.3142;
        
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
        rSubN = (a * a) / Math.sqrt(((a * a) * (Math.cos(phi)*Math.cos(phi)) + ((b*b) * (Math.sin(phi)*Math.sin(phi)))));

        answer[2] = (W / Math.cos(phi)) - rSubN;
    
        var result = {latitude:answer[0] * this.RADIANS_TO_DEGREES, longitude:answer[1] * this.RADIANS_TO_DEGREES, altitude:answer[2]};
        return result;

    };
   
    /**
     * Converts lat long and geodetic height (elevation) into DIS XYZ
     * This algorithm also uses the WGS84 ellipsoid, though you can change the values
     * of a and b for a different ellipsoid. Adapted from Military Handbook 600008
     * @param latLonAlt {lat: lon: alt:} in degrees and meters
     * @return {x: y: z:} in meters
     */
    dis.CoordinateConversion.prototype.getXYZfromLatLonAltDegrees = function(latLonAlt)
    {
        var latitudeRadians = latLonAlt.lat   * this.DEGREES_TO_RADIANS;
        var longtitudeRadians = latLonAlt.lon * this.DEGREES_TO_RADIANS;
        
        var cosLat = Math.cos(latitudeRadians);
        var sinLat = Math.sin(latitudeRadians);


        var rSubN = (this.a * this.a) / Math.sqrt(((this.a * this.a) * (cosLat * cosLat) + ((this.b * this.b) * (sinLat*sinLat))));

        var X = (rSubN + latLonAlt.alt) * cosLat * Math.cos(longtitudeRadians);
        var Y = (rSubN + latLonAlt.alt) * cosLat * Math.sin(longtitudeRadians);
        var Z = ((((this.b * this.b) / (this.a * this.a)) * rSubN) + latLonAlt.alt) * sinLat;

        return {x:X, y:Y, z:Z};
    };
 };
 
 exports.CoordinateConversion = dis.CoordinateConversion;

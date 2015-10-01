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
        var a = 6378137.0;    //semi major axis (WGS 84)
        var b = 6356752.3142; //semi minor axis (WGX 84)

        var eSquared; //first eccentricity squared
        var rSubN; //radius of the curvature of the prime vertical
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
    
        var result = {latitude:answer[0] * this.RADIANS_TO_DEGREES, longitude:answer[1] * this.RADIANS_TO_DEGREES, altitude:answer[2] * this.RADIANS_TO_DEGREES};
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
        
        //var a = 6378137.0; //semi major axis
        //var b = 6356752.3142; //semi minor axis
        var cosLat = Math.cos(latitudeRadians);
        var sinLat = Math.sin(latitudeRadians);


        var rSubN = (this.a*this.a) / Math.sqrt(((this.a*this.a) * (cosLat*cosLat) + ((this.b*this.b) * (sinLat*sinLat))));

        var X = (rSubN + latLonAlt.alt) * cosLat * Math.cos(longtitudeRadians);
        var Y = (rSubN + latLonAlt.alt) * cosLat * Math.sin(longtitudeRadians);
        var Z = ((((this.b*this.b) / (this.a*this.a)) * rSubN) + latLonAlt.alt) * sinLat;

        return {x:X, y:Y, z:Z};
    };
 };
 
 exports.CoordinateConversion = dis.CoordinateConversion;
/**
 * Some code to extract the entity apperance bit fields.<p>
 * 
 * The entityAppearance field in the espdu is a 32 bit integer. To save
 * space, several different fields are contained within it. 
 * Specifically:
 * 
 *  Name      bit position        Purpose
 *  ----      ------------        --------
 *  Paint            0            0 = uniform color, 1=camo
 *  Mobility         1            0 = no mobility kill, 1 = mobility kill
 *  Fire Power       2            0 = no firepower kill, 1 = firepower kill
 *  Damage           3-4          0=no damange, 1=slight, 2=moderate, 3=destroyed
 *  Smoke            5-6          0=not smoking, 1=smoke plume, 2=emitting engine smoke, 3=engine smoke + smoke plume
 *  Trailing effects 7-8          dust cloud, 0=none, 1=small, 2=medium, 3=large
 *  hatch            9-11         0=NA, 1=hatch closed, 2=popped, 3=popped + person visible, 4=open, 5=open and visible
 *  head lights      12           0=off, 1=on
 *  tail light       13           0=off, 1=on
 *  brake lights     14           0=off, 1=on
 *  flaming          15           0=none, 1=flames present
 *  launcher         16           0=not raised, 1=raised
 *  camo type        17-18        0=desert, 1=winter, 2=forest
 *  concealed        19           0=not concealed, 1=prepared concealed position (netting, etc)
 *  frozen status    20           0=not frozen, 1=frozen (in simulation terms)
 *  power plant      22           0=power plant off 1=on
 *  state            23           0=active, 1=deactivated
 *  tent             24           0=not extended 1=extended
 *  ramp             25           0=not extended, 1=extended
 *  blackout lights  26           0=off, 1=on
 *  blackout brake   27           0=off, 1=on
 *  spot lights      28           0=off, 1=on
 *  interior lights  29           0=off, 1=on
 *  unused           30-31
 *  
 *  Typical use:
 *  
 *  var entityAppearance = new DisAppearance(espdu.entityAppearance);
 *  var damage = entityAppearance.getBitfield(3, 4);
 *  
 *  This returns the "damage" bitfield in bits 3-4.
 *  
 *  var mobility = entityAppearance.getBitfield(1, 1);
 *  
 *  Returns the mobility field, 0 = no mobo kill, 1 = mobility kill
 *  
 *  @author DMcG
 **/

if (typeof dis === "undefined")
 dis = {};
 
// Support for node.js style modules; ignore if not using node.js require
if (typeof exports === "undefined")
   exports = {};

/** Constructor. Takes the integer value extracted from the DIS Entity State Field appearance
 * 
 * @param {type} integerValue the entity appearance from the espdu
 * @returns {undefined}
 */
dis.DisAppearance = function(integerValue)
{
    this.entityAppearance = integerValue; 
}

/**
 * Test code for creating the correct bitmask
 * @returns {undefined}
 */
dis.DisAppearance.prototype.getTestMask = function()
{
    mask = 0;
    for(var idx = 0; idx < 7; idx++)
    {
        mask = mask + this.bit_set(mask, idx);
    }
    
    return mask;
};

/**
 * 
 * @param {integer} startPosition
 * @param {integer} finishPosition
 * @returns {integer}
 */
dis.DisAppearance.prototype.getBitField = function(startPosition, finishPosition)
{
    // do some sanity checks
    if(startPosition < 0 || startPosition > 31 || finishPosition < 0 || finishPosition > 31 || startPosition > finishPosition)
    {
        console.log("invalid start or finish for bitfield values: ", startPosition, " ", finishPosition);
        return 0;
    }
    
    // Develop the mask. Addition is equivalent to setting multiple bits.
    var mask = 0;
    for(var idx = startPosition; idx <= finishPosition; idx++)
    {
        mask = mask + this.bit_set(0, idx);
    }
        
    // do the bitmask
    var maskedValue = this.entityAppearance & mask;
    // Shift bits to get the normalized value
    var fieldValue = maskedValue >>> startPosition;  
    
    return fieldValue;
};

/** Set the "bit" position in a number to 1
 * 
 * @param {integer}  num the number whose bit we are setting. Typically zero.
 * @param {integer} bit which bit to set
 * @return {integer} the number passed in, with the "bit"th bit flipped on.
 **/
dis.DisAppearance.prototype.bit_set = function(num, bit)
{
    return num | 1<<bit;
}

exports.DisAppearance = dis.DisAppearance;

//var BigInteger = require('BigInteger');

if (typeof dis === "undefined")
   dis = {};
   
// Support for node.js style modules; ignore if not using node.js require
if (typeof exports === "undefined")
   exports = {};

dis.InputStream = function(binaryData)
{
    this.dataView = new DataView(binaryData, 0); // data, byte offset
    this.currentPosition = 0;                    // ptr to "current" position in array
    
    dis.InputStream.prototype.readUByte = function()
    {
        var data = this.dataView.getUint8(this.currentPosition);
        this.currentPosition = this.currentPosition + 1;
        return data;
    };
    
    dis.InputStream.prototype.readByte = function()
    {
        var data = this.dataView.getInt8(this.currentPosition);
        this.currentPosition = this.currentPosition + 1;
        return data;
    };
    
    dis.InputStream.prototype.readUShort = function()
    {
        var data = this.dataView.getUint16(this.currentPosition);
        this.currentPosition = this.currentPosition + 2;
        return data;
    };
    
    dis.InputStream.prototype.readShort = function()
    {
        var data = this.dataView.getInt16(this.currentPosition);
        this.currentPosition = this.currentPosition + 2;
        return data;
    };
    
    dis.InputStream.prototype.readUInt = function()
    {
        var data = this.dataView.getUint32(this.currentPosition);
        this.currentPosition = this.currentPosition + 4;
        return data;
    };
    
    dis.InputStream.prototype.readInt = function()
    {
        var data = this.dataView.getInt32(this.currentPosition);
        this.currentPosition = this.currentPosition + 4;
        return data;
    };
    
    /** Read a long integer. Assumes big endian format. Uses the BigInteger package. */
    dis.InputStream.prototype.readLongInt = function()
    {
        var data1 = this.dataView.getInt32(this.currentPosition);
        var data2 = this.dataView.getInt32(this.currentPosition + 4);
        
        this.currentPosition = this.currentPosition + 8;
        
    };
   
    dis.InputStream.prototype.readFloat32 = function()
    {
        var data = this.dataView.getFloat32(this.currentPosition);
        this.currentPosition = this.currentPosition + 4;
        return data;
    };
    
    dis.InputStream.prototype.readFloat64 = function()
    {
        var data = this.dataView.getFloat64(this.currentPosition);
        this.currentPosition = this.currentPosition + 8;
        return data;
    };
    
    dis.InputStream.prototype.readLong = function()
    {
        console.log("Problem in dis.InputStream. Javascript cannot natively handle 64 bit ints");
        console.log("Returning 0 from read, which is almost certainly wrong");
        this.currentPosition = this.currentPosition + 8;
        return 0;
    };
};

exports.InputStream = dis.InputStream;
if (typeof dis === "undefined")
   dis = {};
   
// Support for node.js style modules; ignore if not using node.js require
if (typeof exports === "undefined")
   exports = {};

/**
 * @param binaryDataBuffer ArrayBuffer
*/
dis.OutputStream = function(binaryDataBuffer)
{
    this.binaryData = binaryDataBuffer;
    this.dataView = new DataView(this.binaryData); // data, byte offset
    this.currentPosition = 0;                    // ptr to current position in array
    
    dis.OutputStream.prototype.writeUByte = function(userData)
    {   
        this.dataView.setUint8(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 1;
    };
    
    dis.OutputStream.prototype.writeByte = function(userData)
    {
        this.dataView.setInt8(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 1;
    };
    
    dis.OutputStream.prototype.writeUShort = function(userData)
    {
        this.dataView.setUint16(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 2;
    };
    
    dis.OutputStream.prototype.writeShort = function(userData)
    {
        this.dataView.setInt16(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 2;
    };
    
    dis.OutputStream.prototype.writeUInt = function(userData)
    {
        this.dataView.setUint32(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 4;
    };
    
    dis.OutputStream.prototype.writeInt = function(userData)
    {
        this.dataView.setInt32(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 4;
    };
   
    dis.OutputStream.prototype.writeFloat32 = function(userData)
    {
        this.dataView.setFloat32(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 4;
    };
    
    dis.OutputStream.prototype.writeFloat64 = function(userData)
    {
        this.dataView.setFloat64(this.currentPosition, userData);
        this.currentPosition = this.currentPosition + 8;
    };
    
    dis.OutputStream.prototype.writeLong = function(userData)
    {
        console.log("Problem in dis.outputStream. Javascript cannot natively handle 64 bit ints");
        console.log("writing 0, which is almost certainly wrong");
        this.dataView.setInt32(this.currentPosition, 0);
        this.dataView.setInt32(this.currentPosition + 4, 0);
        this.currentPosition = this.currentPosition + 8;
    };
};

exports.OutputStream = dis.OutputStream;

if (typeof dis === "undefined")
 dis = {};
 
// Support for node.js style modules; ignore if not using node.js require
if (typeof exports === "undefined")
   exports = {};
 
 /**
  * The PDU factory is responsible for decoding binary data and turning
  * it into the appropriate type of PDU.
  * 
  * The websocket will typically send the web page a IEEE 1278.1 binary
  * array of data. It could be any one of dozens of PDUs. The start of
  * all PDUs is the same--they have the same header. One of the fields in 
  * the header is the PduType, an 8 bit integer with a unqiue value for
  * each type of PDU. We have to peak at that value, decide what type
  * of PDU to create of the binary we have received, and then decode it.
  * 
  *     * @DMcG
  */
 
 dis.PduFactory = function()
 {
     
 };
 
 /**
  * decode incoming binary data and
  * return the correct type of PDU.
  * 
  * @param {type} data the IEEE 1278.1 binary data
  * @returns {Pdu} Returns an instance of some PDU, be it espdu, fire, detonation, etc. Exception if PduType not known.
  */
 dis.PduFactory.prototype.createPdu = function(data)
 {
     var asUint8Array = new Uint8Array(data);
     var pduType = asUint8Array[2];
     var inputStream = new dis.InputStream(data);
     var newPdu = null;
     
     //try
     //{
        switch(pduType)
        {
            case 1:     // entity state PDU
                newPdu = new dis.EntityStatePdu();
                newPdu.initFromBinary(inputStream);
                break;

            case 2:     // Fire
                newPdu = new dis.FirePdu();
                newPdu.initFromBinary(inputStream);
                break; 

            case 3:     // detonation
                newPdu = new dis.DetonationPdu();
                newPdu.initFromBinary(inputStream);
                break;

            case 4:     // Collision
                newPdu = new dis.CollisionPdu();
                newPdu.initFromBinary(inputStream);
                break;

            case 11:    // Create entity
                newPdu = new dis.CreateEntityPdu();
                newPdu.initFromBinary(inputStream);
                break;

            case 12:    // Remove entity
                newPdu = new dis.RemoveEntityPdu();
                newPdu.initFromBinary(inputStream);
                break;

            case 20:    // data
                newPdu = new dis.DataPdu();
                newPdu.initFromBinary(inputStream);
                break;

            default:
               throw  "PduType: " + pduType + " Unrecognized PDUType. Add PDU in dis.PduFactory.";
        }
    //}
    // This also picks up any errors decoding what we though was a "normal" PDU
    //catch(error)
    //{
    //  newPdu = null;
    //}
     
     return newPdu;
 };
 
 dis.PduFactory.prototype.getPdusFromBundle = function(data)
 {
 }


exports.PduFactory = dis.PduFactory;
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
   
exports.RangeCoordinates = dis.RangeCoordinates;if (typeof dis === "undefined")
   dis = {};
   
// Support for node.js style modules; ignore if not using node.js require
if (typeof exports === "undefined")
   exports = {};

/**
 * Utility class that converts between strings and the DIS ESPDU marking
 * field. The marking field is 12 bytes long, with the first byte being
 * the character set used, and the remaining 11 bytes character codes in
 * that character set. This is often used for debugging or "billboard"
 * displays in 3D; it's intended for humans. The string character values
 * are clamped (or filled) to exactly 11 bytes, so "This is a long string"
 * will be clamped to "This is a l" (in charachter codes) and "foo" will
 * be filled to "foo\0\0\0\0\0\0\0\0".<p>
 * 
 * It is recommended that only ASCII character set (character set = 1)
 * be used.
 * 
 * @returns {undefined}
 */
dis.StringConversion = function()
{
};

/**
 * Given a string, returns a DIS marking field. The character set is set to
 * 1, for ascii. The length is clamped to 11, and zero-filled if the string
 * is shorter than 11.
 * 
 * @returns {array} disMarking field, 12 bytes long, character set = 1 (ascii) in 0, zero-filled to 11 character codes 
 */
dis.StringConversion.prototype.StringToDisMarking = function(markingString)
{
    var byteMarking = [];
    
    // character set 1 = ascii
    byteMarking.push(1);
    
    var markingLength = markingString.length;
    
    // Clamp it to 11 bytes of character data
    if(markingLength > 11)
        markingLength = 11;
    
    // If the string is shorter than 11 bytes, we zero-fill the array
    var  diff = 11 - markingLength;
    
    for(var idx = 0; idx < markingLength; idx++)
    {
        byteMarking.push(markingString.charCodeAt(idx));
    }
    
    for(var idx = markingLength; idx < 11; idx++)
    {
        byteMarking.push(0);
    }

    return byteMarking;
};

/**
 * Given a DIS marking field, returns a string. Assumes always ascii.
 * 
 * @param {array} disMarking dis marking field, [0] = character set, the rest character codes
 * @returns {string} string equivalent of the marking field
 */
dis.StringConversion.prototype.DisMarkingToString = function(disMarking)
{
    var marking = "";
    
    for(var idx = 1; idx < disMarking.length; idx++)
    {
        marking = marking + String.fromCharCode(disMarking[idx]);
    }
    
    return marking;
};

// This is a temporary placeholder until full require.js code
// support is present.
if (typeof exports === "undefined")
   exports = {};

exports.RangeCoordinates = dis.RangeCoordinates;
exports.InputStream = dis.InputStream;
exports.OutputStream = dis.OutputStream;

/**
 * Section 7.5.6. Acknowledge the receipt of a start/resume, stop/freeze, or RemoveEntityPDU. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.AcknowledgePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 15;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** Identifier for originating entity(or simulation) */
   this.originatingID = new dis.EntityID(); 

   /** Identifier for the receiving entity(or simulation) */
   this.receivingID = new dis.EntityID(); 

   /** type of message being acknowledged */
   this.acknowledgeFlag = 0;

   /** Whether or not the receiving entity was able to comply with the request */
   this.responseFlag = 0;

   /** Request ID that is unique */
   this.requestID = 0;

  dis.AcknowledgePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.originatingID.initFromBinary(inputStream);
       this.receivingID.initFromBinary(inputStream);
       this.acknowledgeFlag = inputStream.readUShort();
       this.responseFlag = inputStream.readUShort();
       this.requestID = inputStream.readUInt();
  };

  dis.AcknowledgePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.originatingID.encodeToBinary(outputStream);
       this.receivingID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.acknowledgeFlag);
       outputStream.writeUShort(this.responseFlag);
       outputStream.writeUInt(this.requestID);
  };
}; // end of class

 // node.js module support
exports.AcknowledgePdu = dis.AcknowledgePdu;

// End of AcknowledgePdu class

/**
 * Section 5.3.12.5: Ack receipt of a start-resume, stop-freeze, create-entity or remove enitty (reliable) pdus. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.AcknowledgeReliablePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 55;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Object originatig the request */
   this.originatingEntityID = new dis.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis.EntityID(); 

   /** ack flags */
   this.acknowledgeFlag = 0;

   /** response flags */
   this.responseFlag = 0;

   /** Request ID */
   this.requestID = 0;

  dis.AcknowledgeReliablePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.acknowledgeFlag = inputStream.readUShort();
       this.responseFlag = inputStream.readUShort();
       this.requestID = inputStream.readUInt();
  };

  dis.AcknowledgeReliablePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.acknowledgeFlag);
       outputStream.writeUShort(this.responseFlag);
       outputStream.writeUInt(this.requestID);
  };
}; // end of class

 // node.js module support
exports.AcknowledgeReliablePdu = dis.AcknowledgeReliablePdu;

// End of AcknowledgeReliablePdu class

/**
 *  information about a specific UA emmtter. Section 6.2.2.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.AcousticEmitter = function()
{
   /** the system for a particular UA emitter, and an enumeration */
   this.acousticSystemName = 0;

   /** The function of the acoustic system */
   this.acousticFunction = 0;

   /** The UA emitter identification number relative to a specific system */
   this.acousticIDNumber = 0;

  dis.AcousticEmitter.prototype.initFromBinary = function(inputStream)
  {
       this.acousticSystemName = inputStream.readUShort();
       this.acousticFunction = inputStream.readUByte();
       this.acousticIDNumber = inputStream.readUByte();
  };

  dis.AcousticEmitter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.acousticSystemName);
       outputStream.writeUByte(this.acousticFunction);
       outputStream.writeUByte(this.acousticIDNumber);
  };
}; // end of class

 // node.js module support
exports.AcousticEmitter = dis.AcousticEmitter;

// End of AcousticEmitter class

/**
 * Section 7.5.7. Request from simulation manager to a managed entity to perform a specified action. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ActionRequestPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 16;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** Identifier for originating entity(or simulation) */
   this.originatingID = new dis.EntityID(); 

   /** Identifier for the receiving entity(or simulation) */
   this.receivingID = new dis.EntityID(); 

   /** identifies the request being made by the simulaton manager */
   this.requestID = 0;

   /** identifies the particular action being requested(see Section 7 of SISO-REF-010). */
   this.actionID = 0;

   /** Number of fixed datum records */
   this.numberOfFixedDatumRecords = 0;

   /** Number of variable datum records */
   this.numberOfVariableDatumRecords = 0;

   /** variable length list of fixed datums */
    this.fixedDatums = new Array();
 
   /** variable length list of variable length datums */
    this.variableDatums = new Array();
 
  dis.ActionRequestPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.originatingID.initFromBinary(inputStream);
       this.receivingID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
       this.actionID = inputStream.readUInt();
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatums.push(anX);
       }

  };

  dis.ActionRequestPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.originatingID.encodeToBinary(outputStream);
       this.receivingID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.requestID);
       outputStream.writeUInt(this.actionID);
       outputStream.writeUInt(this.numberOfFixedDatumRecords);
       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.fixedDatums.length; idx++)
       {
           fixedDatums[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatums.length; idx++)
       {
           variableDatums[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ActionRequestPdu = dis.ActionRequestPdu;

// End of ActionRequestPdu class

/**
 * Section 5.3.12.6: request from a simulation manager to a managed entity to perform a specified action. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ActionRequestReliablePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 56;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Object originatig the request */
   this.originatingEntityID = new dis.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis.EntityID(); 

   /** level of reliability service used for this transaction */
   this.requiredReliabilityService = 0;

   /** padding */
   this.pad1 = 0;

   /** padding */
   this.pad2 = 0;

   /** request ID */
   this.requestID = 0;

   /** request ID */
   this.actionID = 0;

   /** Fixed datum record count */
   this.numberOfFixedDatumRecords = 0;

   /** variable datum record count */
   this.numberOfVariableDatumRecords = 0;

   /** Fixed datum records */
    this.fixedDatumRecords = new Array();
 
   /** Variable datum records */
    this.variableDatumRecords = new Array();
 
  dis.ActionRequestReliablePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.requiredReliabilityService = inputStream.readUByte();
       this.pad1 = inputStream.readUShort();
       this.pad2 = inputStream.readUByte();
       this.requestID = inputStream.readUInt();
       this.actionID = inputStream.readUInt();
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatumRecords.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumRecords.push(anX);
       }

  };

  dis.ActionRequestReliablePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.requiredReliabilityService);
       outputStream.writeUShort(this.pad1);
       outputStream.writeUByte(this.pad2);
       outputStream.writeUInt(this.requestID);
       outputStream.writeUInt(this.actionID);
       outputStream.writeUInt(this.numberOfFixedDatumRecords);
       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.fixedDatumRecords.length; idx++)
       {
           fixedDatumRecords[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatumRecords.length; idx++)
       {
           variableDatumRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ActionRequestReliablePdu = dis.ActionRequestReliablePdu;

// End of ActionRequestReliablePdu class

/**
 * Section 7.5.8. response to an action request PDU. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ActionResponsePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 17;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** Identifier for originating entity(or simulation) */
   this.originatingID = new dis.EntityID(); 

   /** Identifier for the receiving entity(or simulation) */
   this.receivingID = new dis.EntityID(); 

   /** Request ID that is unique */
   this.requestID = 0;

   /** Status of response */
   this.requestStatus = 0;

   /** Number of fixed datum records */
   this.numberOfFixedDatumRecords = 0;

   /** Number of variable datum records */
   this.numberOfVariableDatumRecords = 0;

   /** variable length list of fixed datums */
    this.fixedDatums = new Array();
 
   /** variable length list of variable length datums */
    this.variableDatums = new Array();
 
  dis.ActionResponsePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.originatingID.initFromBinary(inputStream);
       this.receivingID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
       this.requestStatus = inputStream.readUInt();
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatums.push(anX);
       }

  };

  dis.ActionResponsePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.originatingID.encodeToBinary(outputStream);
       this.receivingID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.requestID);
       outputStream.writeUInt(this.requestStatus);
       outputStream.writeUInt(this.numberOfFixedDatumRecords);
       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.fixedDatums.length; idx++)
       {
           fixedDatums[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatums.length; idx++)
       {
           variableDatums[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ActionResponsePdu = dis.ActionResponsePdu;

// End of ActionResponsePdu class

/**
 * Section 5.3.12.7: Response from an entity to an action request PDU. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ActionResponseReliablePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 57;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Object originatig the request */
   this.originatingEntityID = new dis.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis.EntityID(); 

   /** request ID */
   this.requestID = 0;

   /** status of response */
   this.responseStatus = 0;

   /** Fixed datum record count */
   this.numberOfFixedDatumRecords = 0;

   /** variable datum record count */
   this.numberOfVariableDatumRecords = 0;

   /** Fixed datum records */
    this.fixedDatumRecords = new Array();
 
   /** Variable datum records */
    this.variableDatumRecords = new Array();
 
  dis.ActionResponseReliablePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
       this.responseStatus = inputStream.readUInt();
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatumRecords.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumRecords.push(anX);
       }

  };

  dis.ActionResponseReliablePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.requestID);
       outputStream.writeUInt(this.responseStatus);
       outputStream.writeUInt(this.numberOfFixedDatumRecords);
       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.fixedDatumRecords.length; idx++)
       {
           fixedDatumRecords[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatumRecords.length; idx++)
       {
           variableDatumRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ActionResponseReliablePdu = dis.ActionResponseReliablePdu;

// End of ActionResponseReliablePdu class

/**
 * The unique designation of each aggrgate in an exercise is specified by an aggregate identifier record. The aggregate ID is not an entity and shall not be treated as such. Section 6.2.3.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.AggregateIdentifier = function()
{
   /** Simulation address, ie site and application, the first two fields of the entity ID */
   this.simulationAddress = new dis.SimulationAddress(); 

   /** the aggregate ID */
   this.aggregateID = 0;

  dis.AggregateIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.aggregateID = inputStream.readUShort();
  };

  dis.AggregateIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.aggregateID);
  };
}; // end of class

 // node.js module support
exports.AggregateIdentifier = dis.AggregateIdentifier;

// End of AggregateIdentifier class

/**
 * Specifies the character set used in the first byte, followed by up to 31 characters of text data. Section 6.2.4. 
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.AggregateMarking = function()
{
   /** The character set */
   this.characterSet = 0;

   /** The characters */
   this.characters = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

  dis.AggregateMarking.prototype.initFromBinary = function(inputStream)
  {
       this.characterSet = inputStream.readUByte();
       for(var idx = 0; idx < 31; idx++)
       {
          this.characters[ idx ] = inputStream.readUByte();
       }
  };

  dis.AggregateMarking.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.characterSet);
       for(var idx = 0; idx < 31; idx++)
       {
          outputStream.writeUByte(this.characters[ idx ] );
       }
  };
}; // end of class

 // node.js module support
exports.AggregateMarking = dis.AggregateMarking;

// End of AggregateMarking class

/**
 * Identifies the type and organization of an aggregate. Section 6.2.5
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.AggregateType = function()
{
   /** Grouping criterion used to group the aggregate. Enumeration from EBV document */
   this.aggregateKind = 0;

   /** Domain of entity (air, surface, subsurface, space, etc) Zero means domain does not apply. */
   this.domain = 0;

   /** country to which the design of the entity is attributed */
   this.country = 0;

   /** category of entity */
   this.category = 0;

   /** subcategory of entity */
   this.subcategory = 0;

   /** specific info based on subcategory field. specific is a reserved word in sql. */
   this.specificInfo = 0;

   this.extra = 0;

  dis.AggregateType.prototype.initFromBinary = function(inputStream)
  {
       this.aggregateKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.country = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.specificInfo = inputStream.readUByte();
       this.extra = inputStream.readUByte();
  };

  dis.AggregateType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.aggregateKind);
       outputStream.writeUByte(this.domain);
       outputStream.writeUShort(this.country);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
       outputStream.writeUByte(this.specificInfo);
       outputStream.writeUByte(this.extra);
  };
}; // end of class

 // node.js module support
exports.AggregateType = dis.AggregateType;

// End of AggregateType class

/**
 * The Angle Deception attribute record may be used to communicate discrete values that are associated with angle deception jamming that cannot be referenced to an emitter mode. The values provided in the record records (provided in the associated Electromagnetic Emission PDU). (The victim radar beams are those that are targeted by the jammer.) Section 6.2.21.2.2
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.AngleDeception = function()
{
   this.recordType = 3501;

   this.recordLength = 48;

   this.padding = 0;

   this.emitterNumber = 0;

   this.beamNumber = 0;

   this.stateIndicator = 0;

   this.padding2 = 0;

   this.azimuthOffset = 0;

   this.azimuthWidth = 0;

   this.azimuthPullRate = 0;

   this.azimuthPullAcceleration = 0;

   this.elevationOffset = 0;

   this.elevationWidth = 0;

   this.elevationPullRate = 0;

   this.elevationPullAcceleration = 0;

   this.padding3 = 0;

  dis.AngleDeception.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.padding = inputStream.readUShort();
       this.emitterNumber = inputStream.readUByte();
       this.beamNumber = inputStream.readUByte();
       this.stateIndicator = inputStream.readUByte();
       this.padding2 = inputStream.readUByte();
       this.azimuthOffset = inputStream.readFloat32();
       this.azimuthWidth = inputStream.readFloat32();
       this.azimuthPullRate = inputStream.readFloat32();
       this.azimuthPullAcceleration = inputStream.readFloat32();
       this.elevationOffset = inputStream.readFloat32();
       this.elevationWidth = inputStream.readFloat32();
       this.elevationPullRate = inputStream.readFloat32();
       this.elevationPullAcceleration = inputStream.readFloat32();
       this.padding3 = inputStream.readUInt();
  };

  dis.AngleDeception.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUShort(this.padding);
       outputStream.writeUByte(this.emitterNumber);
       outputStream.writeUByte(this.beamNumber);
       outputStream.writeUByte(this.stateIndicator);
       outputStream.writeUByte(this.padding2);
       outputStream.writeFloat32(this.azimuthOffset);
       outputStream.writeFloat32(this.azimuthWidth);
       outputStream.writeFloat32(this.azimuthPullRate);
       outputStream.writeFloat32(this.azimuthPullAcceleration);
       outputStream.writeFloat32(this.elevationOffset);
       outputStream.writeFloat32(this.elevationWidth);
       outputStream.writeFloat32(this.elevationPullRate);
       outputStream.writeFloat32(this.elevationPullAcceleration);
       outputStream.writeUInt(this.padding3);
  };
}; // end of class

 // node.js module support
exports.AngleDeception = dis.AngleDeception;

// End of AngleDeception class

/**
 * Angular velocity measured in radians per second out each of the entity's own coordinate axes. Order of measurement is angular velocity around the x, y, and z axis of the entity. The positive direction is determined by the right hand rule. Section 6.2.7
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.AngularVelocityVector = function()
{
   /** velocity about the x axis */
   this.x = 0;

   /** velocity about the y axis */
   this.y = 0;

   /** velocity about the zaxis */
   this.z = 0;

  dis.AngularVelocityVector.prototype.initFromBinary = function(inputStream)
  {
       this.x = inputStream.readFloat32();
       this.y = inputStream.readFloat32();
       this.z = inputStream.readFloat32();
  };

  dis.AngularVelocityVector.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.x);
       outputStream.writeFloat32(this.y);
       outputStream.writeFloat32(this.z);
  };
}; // end of class

 // node.js module support
exports.AngularVelocityVector = dis.AngularVelocityVector;

// End of AngularVelocityVector class

/**
 * Location of the radiating portion of the antenna, specified in world coordinates and entity coordinates. Section 6.2.8
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.AntennaLocation = function()
{
   /** Location of the radiating portion of the antenna in world    coordinates */
   this.antennaLocation = new dis.Vector3Double(); 

   /** Location of the radiating portion of the antenna     in entity coordinates */
   this.relativeAntennaLocation = new dis.Vector3Float(); 

  dis.AntennaLocation.prototype.initFromBinary = function(inputStream)
  {
       this.antennaLocation.initFromBinary(inputStream);
       this.relativeAntennaLocation.initFromBinary(inputStream);
  };

  dis.AntennaLocation.prototype.encodeToBinary = function(outputStream)
  {
       this.antennaLocation.encodeToBinary(outputStream);
       this.relativeAntennaLocation.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.AntennaLocation = dis.AntennaLocation;

// End of AntennaLocation class

/**
 * Information about the addition/modification of an oobject that is geometrically anchored to the terrain with a set of three or more points that come to a closure. Section 7.10.6 COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ArealObjectStatePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 45;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 9;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Object in synthetic environment */
   this.objectID = new dis.EntityID(); 

   /** Object with which this point object is associated */
   this.referencedObjectID = new dis.EntityID(); 

   /** unique update number of each state transition of an object */
   this.updateNumber = 0;

   /** force ID */
   this.forceID = 0;

   /** modifications enumeration */
   this.modifications = 0;

   /** Object type */
   this.objectType = new dis.EntityType(); 

   /** Object appearance */
   this.specificObjectAppearance = 0;

   /** Object appearance */
   this.generalObjectAppearance = 0;

   /** Number of points */
   this.numberOfPoints = 0;

   /** requesterID */
   this.requesterID = new dis.SimulationAddress(); 

   /** receiver ID */
   this.receivingID = new dis.SimulationAddress(); 

   /** location of object */
    this.objectLocation = new Array();
 
  dis.ArealObjectStatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.objectID.initFromBinary(inputStream);
       this.referencedObjectID.initFromBinary(inputStream);
       this.updateNumber = inputStream.readUShort();
       this.forceID = inputStream.readUByte();
       this.modifications = inputStream.readUByte();
       this.objectType.initFromBinary(inputStream);
       this.specificObjectAppearance = inputStream.readUInt();
       this.generalObjectAppearance = inputStream.readUShort();
       this.numberOfPoints = inputStream.readUShort();
       this.requesterID.initFromBinary(inputStream);
       this.receivingID.initFromBinary(inputStream);
       for(var idx = 0; idx < this.numberOfPoints; idx++)
       {
           var anX = new dis.Vector3Double();
           anX.initFromBinary(inputStream);
           this.objectLocation.push(anX);
       }

  };

  dis.ArealObjectStatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.objectID.encodeToBinary(outputStream);
       this.referencedObjectID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.updateNumber);
       outputStream.writeUByte(this.forceID);
       outputStream.writeUByte(this.modifications);
       this.objectType.encodeToBinary(outputStream);
       outputStream.writeUInt(this.specificObjectAppearance);
       outputStream.writeUShort(this.generalObjectAppearance);
       outputStream.writeUShort(this.numberOfPoints);
       this.requesterID.encodeToBinary(outputStream);
       this.receivingID.encodeToBinary(outputStream);
       for(var idx = 0; idx < this.objectLocation.length; idx++)
       {
           objectLocation[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ArealObjectStatePdu = dis.ArealObjectStatePdu;

// End of ArealObjectStatePdu class

/**
 *  articulated parts for movable parts and a combination of moveable/attached parts of an entity. Section 6.2.94.2
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ArticulatedParts = function()
{
   /** the identification of the Variable Parameter record. Enumeration from EBV */
   this.recordType = 0;

   /** indicate the change of any parameter for any articulated part. Starts at zero, incremented for each change  */
   this.changeIndicator = 0;

   /** the identification of the articulated part to which this articulation parameter is attached. This field shall be specified by a 16-bit unsigned integer. This field shall contain the value zero if the articulated part is attached directly to the entity. */
   this.partAttachedTo = 0;

   /** the type of parameter represented, 32 bit enumeration */
   this.parameterType = 0;

   /** The definition of the 64 bits shall be determined based on the type of parameter specified in the Parameter Type field  */
   this.parameterValue = 0;

  dis.ArticulatedParts.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUByte();
       this.changeIndicator = inputStream.readUByte();
       this.partAttachedTo = inputStream.readUShort();
       this.parameterType = inputStream.readUInt();
       this.parameterValue = inputStream.readLong();
  };

  dis.ArticulatedParts.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.recordType);
       outputStream.writeUByte(this.changeIndicator);
       outputStream.writeUShort(this.partAttachedTo);
       outputStream.writeUInt(this.parameterType);
       outputStream.writeLong(this.parameterValue);
  };
}; // end of class

 // node.js module support
exports.ArticulatedParts = dis.ArticulatedParts;

// End of ArticulatedParts class

/**
 * An entity's associations with other entities and/or locations. For each association, this record shall specify the type of the association, the associated entity's EntityID and/or the associated location's world coordinates. This record may be used (optionally) in a transfer transaction to send internal state data from the divesting simulation to the acquiring simulation (see 5.9.4). This record may also be used for other purposes. Section 6.2.9
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.Association = function()
{
   this.associationType = 0;

   this.padding4 = 0;

   /** identity of associated entity. If none, NO_SPECIFIC_ENTITY */
   this.associatedEntityID = new dis.EntityID(); 

   /** location, in world coordinates */
   this.associatedLocation = new dis.Vector3Double(); 

  dis.Association.prototype.initFromBinary = function(inputStream)
  {
       this.associationType = inputStream.readUByte();
       this.padding4 = inputStream.readUByte();
       this.associatedEntityID.initFromBinary(inputStream);
       this.associatedLocation.initFromBinary(inputStream);
  };

  dis.Association.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.associationType);
       outputStream.writeUByte(this.padding4);
       this.associatedEntityID.encodeToBinary(outputStream);
       this.associatedLocation.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.Association = dis.Association;

// End of Association class

/**
 * Removable parts that may be attached to an entity.  Section 6.2.93.3
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.AttachedParts = function()
{
   /** the identification of the Variable Parameter record. Enumeration from EBV */
   this.recordType = 1;

   /** 0 = attached, 1 = detached. See I.2.3.1 for state transition diagram */
   this.detachedIndicator = 0;

   /** the identification of the articulated part to which this articulation parameter is attached. This field shall be specified by a 16-bit unsigned integer. This field shall contain the value zero if the articulated part is attached directly to the entity. */
   this.partAttachedTo = 0;

   /** The location or station to which the part is attached */
   this.parameterType = 0;

   /** The definition of the 64 bits shall be determined based on the type of parameter specified in the Parameter Type field  */
   this.parameterValue = 0;

  dis.AttachedParts.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUByte();
       this.detachedIndicator = inputStream.readUByte();
       this.partAttachedTo = inputStream.readUShort();
       this.parameterType = inputStream.readUInt();
       this.parameterValue = inputStream.readLong();
  };

  dis.AttachedParts.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.recordType);
       outputStream.writeUByte(this.detachedIndicator);
       outputStream.writeUShort(this.partAttachedTo);
       outputStream.writeUInt(this.parameterType);
       outputStream.writeLong(this.parameterValue);
  };
}; // end of class

 // node.js module support
exports.AttachedParts = dis.AttachedParts;

// End of AttachedParts class

/**
 * Used to convey information for one or more attributes. Attributes conform to the standard variable record format of 6.2.82. Section 6.2.10. NOT COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.Attribute = function()
{
   this.recordType = 0;

   this.recordLength = 0;

   this.recordSpecificFields = 0;

  dis.Attribute.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.recordSpecificFields = inputStream.readLong();
  };

  dis.Attribute.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeLong(this.recordSpecificFields);
  };
}; // end of class

 // node.js module support
exports.Attribute = dis.Attribute;

// End of Attribute class

/**
 * Information about individual attributes for a particular entity, other object, or event may be communicated using an Attribute PDU. The Attribute PDU shall not be used to exchange data available in any other PDU except where explicitly mentioned in the PDU issuance instructions within this standard. See 5.3.6 for the information requirements and issuance and receipt rules for this PDU. Section 7.2.6. INCOMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.AttributePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 1;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** This field shall identify the simulation issuing the Attribute PDU. It shall be represented by a Simulation Address record (see 6.2.79). */
   this.originatingSimulationAddress = new dis.SimulationAddress(); 

   /** Padding */
   this.padding1 = 0;

   /** Padding */
   this.padding2 = 0;

   /** This field shall represent the type of the PDU that is being extended or updated, if applicable. It shall be represented by an 8-bit enumeration. */
   this.attributeRecordPduType = 0;

   /** This field shall indicate the Protocol Version associated with the Attribute Record PDU Type. It shall be represented by an 8-bit enumeration. */
   this.attributeRecordProtocolVersion = 0;

   /** This field shall contain the Attribute record type of the Attribute records in the PDU if they all have the same Attribute record type. It shall be represented by a 32-bit enumeration. */
   this.masterAttributeRecordType = 0;

   /** This field shall identify the action code applicable to this Attribute PDU. The Action Code shall apply to all Attribute records contained in the PDU. It shall be represented by an 8-bit enumeration. */
   this.actionCode = 0;

   /** Padding */
   this.padding3 = 0;

   /** This field shall specify the number of Attribute Record Sets that make up the remainder of the PDU. It shall be represented by a 16-bit unsigned integer. */
   this.numberAttributeRecordSet = 0;

  dis.AttributePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingSimulationAddress.initFromBinary(inputStream);
       this.padding1 = inputStream.readInt();
       this.padding2 = inputStream.readShort();
       this.attributeRecordPduType = inputStream.readUByte();
       this.attributeRecordProtocolVersion = inputStream.readUByte();
       this.masterAttributeRecordType = inputStream.readUInt();
       this.actionCode = inputStream.readUByte();
       this.padding3 = inputStream.readByte();
       this.numberAttributeRecordSet = inputStream.readUShort();
  };

  dis.AttributePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingSimulationAddress.encodeToBinary(outputStream);
       outputStream.writeInt(this.padding1);
       outputStream.writeShort(this.padding2);
       outputStream.writeUByte(this.attributeRecordPduType);
       outputStream.writeUByte(this.attributeRecordProtocolVersion);
       outputStream.writeUInt(this.masterAttributeRecordType);
       outputStream.writeUByte(this.actionCode);
       outputStream.writeByte(this.padding3);
       outputStream.writeUShort(this.numberAttributeRecordSet);
  };
}; // end of class

 // node.js module support
exports.AttributePdu = dis.AttributePdu;

// End of AttributePdu class

/**
 * Used when the antenna pattern type field has a value of 1. Specifies the direction, pattern, and polarization of radiation from an antenna. Section 6.2.9.2
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.BeamAntennaPattern = function()
{
   /** The rotation that transforms the reference coordinate sytem into the beam coordinate system. Either world coordinates or entity coordinates may be used as the reference coordinate system, as specified by the reference system field of the antenna pattern record. */
   this.beamDirection = new dis.EulerAngles(); 

   this.azimuthBeamwidth = 0;

   this.elevationBeamwidth = 0;

   this.referenceSystem = 0;

   this.padding1 = 0;

   this.padding2 = 0;

   /** This field shall specify the magnitude of the Z-component (in beam coordinates) of the Electrical field at some arbitrary single point in the main beam and in the far field of the antenna.  */
   this.ez = 0.0;

   /** This field shall specify the magnitude of the X-component (in beam coordinates) of the Electri- cal field at some arbitrary single point in the main beam and in the far field of the antenna. */
   this.ex = 0.0;

   /** This field shall specify the phase angle between EZ and EX in radians. If fully omni-direc- tional antenna is modeled using beam pattern type one, the omni-directional antenna shall be repre- sented by beam direction Euler angles psi, theta, and phi of zero, an azimuth beamwidth of 2PI, and an elevation beamwidth of PI */
   this.phase = 0.0;

   /** padding */
   this.padding3 = 0;

  dis.BeamAntennaPattern.prototype.initFromBinary = function(inputStream)
  {
       this.beamDirection.initFromBinary(inputStream);
       this.azimuthBeamwidth = inputStream.readFloat32();
       this.elevationBeamwidth = inputStream.readFloat32();
       this.referenceSystem = inputStream.readUByte();
       this.padding1 = inputStream.readUByte();
       this.padding2 = inputStream.readUShort();
       this.ez = inputStream.readFloat32();
       this.ex = inputStream.readFloat32();
       this.phase = inputStream.readFloat32();
       this.padding3 = inputStream.readUInt();
  };

  dis.BeamAntennaPattern.prototype.encodeToBinary = function(outputStream)
  {
       this.beamDirection.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.azimuthBeamwidth);
       outputStream.writeFloat32(this.elevationBeamwidth);
       outputStream.writeUByte(this.referenceSystem);
       outputStream.writeUByte(this.padding1);
       outputStream.writeUShort(this.padding2);
       outputStream.writeFloat32(this.ez);
       outputStream.writeFloat32(this.ex);
       outputStream.writeFloat32(this.phase);
       outputStream.writeUInt(this.padding3);
  };
}; // end of class

 // node.js module support
exports.BeamAntennaPattern = dis.BeamAntennaPattern;

// End of BeamAntennaPattern class

/**
 * Describes the scan volue of an emitter beam. Section 6.2.11.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.BeamData = function()
{
   /** Specifies the beam azimuth an elevation centers and corresponding half-angles to describe the scan volume */
   this.beamAzimuthCenter = 0;

   /** Specifies the beam azimuth sweep to determine scan volume */
   this.beamAzimuthSweep = 0;

   /** Specifies the beam elevation center to determine scan volume */
   this.beamElevationCenter = 0;

   /** Specifies the beam elevation sweep to determine scan volume */
   this.beamElevationSweep = 0;

   /** allows receiver to synchronize its regenerated scan pattern to that of the emmitter. Specifies the percentage of time a scan is through its pattern from its origion. */
   this.beamSweepSync = 0;

  dis.BeamData.prototype.initFromBinary = function(inputStream)
  {
       this.beamAzimuthCenter = inputStream.readFloat32();
       this.beamAzimuthSweep = inputStream.readFloat32();
       this.beamElevationCenter = inputStream.readFloat32();
       this.beamElevationSweep = inputStream.readFloat32();
       this.beamSweepSync = inputStream.readFloat32();
  };

  dis.BeamData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.beamAzimuthCenter);
       outputStream.writeFloat32(this.beamAzimuthSweep);
       outputStream.writeFloat32(this.beamElevationCenter);
       outputStream.writeFloat32(this.beamElevationSweep);
       outputStream.writeFloat32(this.beamSweepSync);
  };
}; // end of class

 // node.js module support
exports.BeamData = dis.BeamData;

// End of BeamData class

/**
 * Information related to the status of a beam. This is contained in the beam status field of the electromagnitec emission PDU. The first bit determines whether the beam is active (0) or deactivated (1). Section 6.2.12.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.BeamStatus = function()
{
   /** First bit zero means beam is active, first bit = 1 means deactivated. The rest is padding. */
   this.beamState = 0;

  dis.BeamStatus.prototype.initFromBinary = function(inputStream)
  {
       this.beamState = inputStream.readUByte();
  };

  dis.BeamStatus.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.beamState);
  };
}; // end of class

 // node.js module support
exports.BeamStatus = dis.BeamStatus;

// End of BeamStatus class

/**
 * The Blanking Sector attribute record may be used to convey persistent areas within a scan volume where emitter power for a specific active emitter beam is reduced to an insignificant value. Section 6.2.21.2
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.BlankingSector = function()
{
   this.recordType = 3500;

   this.recordLength = 40;

   this.padding = 0;

   this.emitterNumber = 0;

   this.beamNumber = 0;

   this.stateIndicator = 0;

   this.padding2 = 0;

   this.leftAzimuth = 0;

   this.rightAzimuth = 0;

   this.lowerElevation = 0;

   this.upperElevation = 0;

   this.residualPower = 0;

   this.padding3 = 0;

   this.padding4 = 0;

  dis.BlankingSector.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readInt();
       this.recordLength = inputStream.readUShort();
       this.padding = inputStream.readUShort();
       this.emitterNumber = inputStream.readUByte();
       this.beamNumber = inputStream.readUByte();
       this.stateIndicator = inputStream.readUByte();
       this.padding2 = inputStream.readUByte();
       this.leftAzimuth = inputStream.readFloat32();
       this.rightAzimuth = inputStream.readFloat32();
       this.lowerElevation = inputStream.readFloat32();
       this.upperElevation = inputStream.readFloat32();
       this.residualPower = inputStream.readFloat32();
       this.padding3 = inputStream.readInt();
       this.padding4 = inputStream.readInt();
  };

  dis.BlankingSector.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUShort(this.padding);
       outputStream.writeUByte(this.emitterNumber);
       outputStream.writeUByte(this.beamNumber);
       outputStream.writeUByte(this.stateIndicator);
       outputStream.writeUByte(this.padding2);
       outputStream.writeFloat32(this.leftAzimuth);
       outputStream.writeFloat32(this.rightAzimuth);
       outputStream.writeFloat32(this.lowerElevation);
       outputStream.writeFloat32(this.upperElevation);
       outputStream.writeFloat32(this.residualPower);
       outputStream.writeInt(this.padding3);
       outputStream.writeInt(this.padding4);
  };
}; // end of class

 // node.js module support
exports.BlankingSector = dis.BlankingSector;

// End of BlankingSector class

/**
 * This is wrong and breaks serialization. See section 6.2.13 aka B.2.41
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ChangeOptions = function()
{
  dis.ChangeOptions.prototype.initFromBinary = function(inputStream)
  {
  };

  dis.ChangeOptions.prototype.encodeToBinary = function(outputStream)
  {
  };
}; // end of class

 // node.js module support
exports.ChangeOptions = dis.ChangeOptions;

// End of ChangeOptions class

/**
 * Time measurements that exceed one hour are represented by this record. The first field is the hours since the unix epoch (Jan 1 1970, used by most Unix systems and java) and the second field the timestamp units since the top of the hour. Section 6.2.14
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ClockTime = function()
{
   /** Hours in UTC */
   this.hour = 0;

   /** Time past the hour */
   this.timePastHour = 0;

  dis.ClockTime.prototype.initFromBinary = function(inputStream)
  {
       this.hour = inputStream.readUInt();
       this.timePastHour = inputStream.readUInt();
  };

  dis.ClockTime.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.hour);
       outputStream.writeUInt(this.timePastHour);
  };
}; // end of class

 // node.js module support
exports.ClockTime = dis.ClockTime;

// End of ClockTime class

/**
 * Information about elastic collisions in a DIS exercise shall be communicated using a Collision-Elastic PDU. Section 7.2.4. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.CollisionElasticPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 66;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 1;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** This field shall identify the entity that is issuing the PDU and shall be represented by an Entity Identifier record (see 6.2.28) */
   this.issuingEntityID = new dis.EntityID(); 

   /** This field shall identify the entity that has collided with the issuing entity. This field shall be a valid identifier of an entity or server capable of responding to the receipt of this Collision-Elastic PDU. This field shall be represented by an Entity Identifier record (see 6.2.28). */
   this.collidingEntityID = new dis.EntityID(); 

   /** This field shall contain an identification generated by the issuing simulation application to associate related collision events. This field shall be represented by an Event Identifier record (see 6.2.34). */
   this.collisionEventID = new dis.EventIdentifier(); 

   /** some padding */
   this.pad = 0;

   /** This field shall contain the velocity at the time the collision is detected at the point the collision is detected. The velocity shall be represented in world coordinates. This field shall be represented by the Linear Velocity Vector record [see 6.2.95 item c)] */
   this.contactVelocity = new dis.Vector3Float(); 

   /** This field shall contain the mass of the issuing entity and shall be represented by a 32-bit floating point number representing kilograms */
   this.mass = 0;

   /** This field shall specify the location of the collision with respect to the entity with which the issuing entity collided. This field shall be represented by an Entity Coordinate Vector record [see 6.2.95 item a)]. */
   this.locationOfImpact = new dis.Vector3Float(); 

   /** These six records represent the six independent components of a positive semi-definite matrix formed by pre-multiplying and post-multiplying the tensor of inertia, by the anti-symmetric matrix generated by the moment arm, and shall be represented by 32-bit floating point numbers (see 5.3.4.4) */
   this.collisionIntermediateResultXX = 0;

   /** tensor values */
   this.collisionIntermediateResultXY = 0;

   /** tensor values */
   this.collisionIntermediateResultXZ = 0;

   /** tensor values */
   this.collisionIntermediateResultYY = 0;

   /** tensor values */
   this.collisionIntermediateResultYZ = 0;

   /** tensor values */
   this.collisionIntermediateResultZZ = 0;

   /** This record shall represent the normal vector to the surface at the point of collision detection. The surface normal shall be represented in world coordinates. This field shall be represented by an Entity Coordinate Vector record [see 6.2.95 item a)]. */
   this.unitSurfaceNormal = new dis.Vector3Float(); 

   /** This field shall represent the degree to which energy is conserved in a collision and shall be represented by a 32-bit floating point number. In addition, it represents a free parameter by which simulation application developers may “tune” their collision interactions. */
   this.coefficientOfRestitution = 0;

  dis.CollisionElasticPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.issuingEntityID.initFromBinary(inputStream);
       this.collidingEntityID.initFromBinary(inputStream);
       this.collisionEventID.initFromBinary(inputStream);
       this.pad = inputStream.readShort();
       this.contactVelocity.initFromBinary(inputStream);
       this.mass = inputStream.readFloat32();
       this.locationOfImpact.initFromBinary(inputStream);
       this.collisionIntermediateResultXX = inputStream.readFloat32();
       this.collisionIntermediateResultXY = inputStream.readFloat32();
       this.collisionIntermediateResultXZ = inputStream.readFloat32();
       this.collisionIntermediateResultYY = inputStream.readFloat32();
       this.collisionIntermediateResultYZ = inputStream.readFloat32();
       this.collisionIntermediateResultZZ = inputStream.readFloat32();
       this.unitSurfaceNormal.initFromBinary(inputStream);
       this.coefficientOfRestitution = inputStream.readFloat32();
  };

  dis.CollisionElasticPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.issuingEntityID.encodeToBinary(outputStream);
       this.collidingEntityID.encodeToBinary(outputStream);
       this.collisionEventID.encodeToBinary(outputStream);
       outputStream.writeShort(this.pad);
       this.contactVelocity.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.mass);
       this.locationOfImpact.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.collisionIntermediateResultXX);
       outputStream.writeFloat32(this.collisionIntermediateResultXY);
       outputStream.writeFloat32(this.collisionIntermediateResultXZ);
       outputStream.writeFloat32(this.collisionIntermediateResultYY);
       outputStream.writeFloat32(this.collisionIntermediateResultYZ);
       outputStream.writeFloat32(this.collisionIntermediateResultZZ);
       this.unitSurfaceNormal.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.coefficientOfRestitution);
  };
}; // end of class

 // node.js module support
exports.CollisionElasticPdu = dis.CollisionElasticPdu;

// End of CollisionElasticPdu class

/**
 * Section 7.2.3 Collisions between entities shall be communicated by issuing a Collision PDU. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.CollisionPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 4;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 1;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** This field shall identify the entity that is issuing the PDU, and shall be represented by an Entity Identifier record (see 6.2.28). */
   this.issuingEntityID = new dis.EntityID(); 

   /** This field shall identify the entity that has collided with the issuing entity (see 5.3.3.4). This field shall be represented by an Entity Identifier record (see 6.2.28). */
   this.collidingEntityID = new dis.EntityID(); 

   /** This field shall contain an identification generated by the issuing simulation application to associate related collision events. This field shall be represented by an Event Identifier record (see 6.2.34). */
   this.eventID = new dis.EventIdentifier(); 

   /** This field shall identify the type of collision. The Collision Type field shall be represented by an 8-bit record of enumerations */
   this.collisionType = 0;

   /** some padding */
   this.pad = 0;

   /** This field shall contain the velocity (at the time the collision is detected) of the issuing entity. The velocity shall be represented in world coordinates. This field shall be represented by the Linear Velocity Vector record [see 6.2.95 item c)]. */
   this.velocity = new dis.Vector3Float(); 

   /** This field shall contain the mass of the issuing entity, and shall be represented by a 32-bit floating point number representing kilograms. */
   this.mass = 0;

   /** This field shall specify the location of the collision with respect to the entity with which the issuing entity collided. The Location field shall be represented by an Entity Coordinate Vector record [see 6.2.95 item a)]. */
   this.location = new dis.Vector3Float(); 

  dis.CollisionPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.issuingEntityID.initFromBinary(inputStream);
       this.collidingEntityID.initFromBinary(inputStream);
       this.eventID.initFromBinary(inputStream);
       this.collisionType = inputStream.readUByte();
       this.pad = inputStream.readByte();
       this.velocity.initFromBinary(inputStream);
       this.mass = inputStream.readFloat32();
       this.location.initFromBinary(inputStream);
  };

  dis.CollisionPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.issuingEntityID.encodeToBinary(outputStream);
       this.collidingEntityID.encodeToBinary(outputStream);
       this.eventID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.collisionType);
       outputStream.writeByte(this.pad);
       this.velocity.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.mass);
       this.location.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.CollisionPdu = dis.CollisionPdu;

// End of CollisionPdu class

/**
 *  Arbitrary messages can be entered into the data stream via use of this PDU. Section 7.5.13 COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.CommentPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 22;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** Number of fixed datum records */
   this.numberOfFixedDatumRecords = 0;

   /** Number of variable datum records */
   this.numberOfVariableDatumRecords = 0;

   /** variable length list of fixed datums */
    this.fixedDatums = new Array();
 
   /** variable length list of variable length datums */
    this.variableDatums = new Array();
 
  dis.CommentPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatums.push(anX);
       }

  };

  dis.CommentPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.numberOfFixedDatumRecords);
       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.fixedDatums.length; idx++)
       {
           fixedDatums[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatums.length; idx++)
       {
           variableDatums[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.CommentPdu = dis.CommentPdu;

// End of CommentPdu class

/**
 * Section 5.3.12.12: Arbitrary messages. Only reliable this time. Neds manual intervention     to fix padding in variable datums. UNFINISHED
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.CommentReliablePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 62;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Object originatig the request */
   this.originatingEntityID = new dis.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis.EntityID(); 

   /** Fixed datum record count */
   this.numberOfFixedDatumRecords = 0;

   /** variable datum record count */
   this.numberOfVariableDatumRecords = 0;

   /** Fixed datum records */
    this.fixedDatumRecords = new Array();
 
   /** Variable datum records */
    this.variableDatumRecords = new Array();
 
  dis.CommentReliablePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatumRecords.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumRecords.push(anX);
       }

  };

  dis.CommentReliablePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.numberOfFixedDatumRecords);
       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.fixedDatumRecords.length; idx++)
       {
           fixedDatumRecords[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatumRecords.length; idx++)
       {
           variableDatumRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.CommentReliablePdu = dis.CommentReliablePdu;

// End of CommentReliablePdu class

/**
 * Identity of a communications node. Section 6.2.48.4
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.CommunicationsNodeID = function()
{
   this.entityID = new dis.EntityID(); 

   this.elementID = 0;

  dis.CommunicationsNodeID.prototype.initFromBinary = function(inputStream)
  {
       this.entityID.initFromBinary(inputStream);
       this.elementID = inputStream.readUShort();
  };

  dis.CommunicationsNodeID.prototype.encodeToBinary = function(outputStream)
  {
       this.entityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.elementID);
  };
}; // end of class

 // node.js module support
exports.CommunicationsNodeID = dis.CommunicationsNodeID;

// End of CommunicationsNodeID class

/**
 * Section 7.5.2. Create a new entity. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.CreateEntityPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 11;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** Identifier for the request */
   this.originatingID = new dis.EntityID(); 

   /** Identifier for the request */
   this.receivingID = new dis.EntityID(); 

   /** Identifier for the request.  See 6.2.75 */
   this.requestID = 0;

  dis.CreateEntityPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.originatingID.initFromBinary(inputStream);
       this.receivingID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
  };

  dis.CreateEntityPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.originatingID.encodeToBinary(outputStream);
       this.receivingID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.requestID);
  };
}; // end of class

 // node.js module support
exports.CreateEntityPdu = dis.CreateEntityPdu;

// End of CreateEntityPdu class

/**
 * Section 5.3.12.1: creation of an entity , reliable. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.CreateEntityReliablePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 51;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Object originatig the request */
   this.originatingEntityID = new dis.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis.EntityID(); 

   /** level of reliability service used for this transaction */
   this.requiredReliabilityService = 0;

   /** padding */
   this.pad1 = 0;

   /** padding */
   this.pad2 = 0;

   /** Request ID */
   this.requestID = 0;

  dis.CreateEntityReliablePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.requiredReliabilityService = inputStream.readUByte();
       this.pad1 = inputStream.readUShort();
       this.pad2 = inputStream.readUByte();
       this.requestID = inputStream.readUInt();
  };

  dis.CreateEntityReliablePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.requiredReliabilityService);
       outputStream.writeUShort(this.pad1);
       outputStream.writeUByte(this.pad2);
       outputStream.writeUInt(this.requestID);
  };
}; // end of class

 // node.js module support
exports.CreateEntityReliablePdu = dis.CreateEntityReliablePdu;

// End of CreateEntityReliablePdu class

/**
 * identify which of the optional data fields are contained in the Minefield Data PDU or requested in the Minefield Query PDU. This is a 32-bit record. For each field, true denotes that the data is requested or present and false denotes that the data is neither requested nor present. Section 6.2.16
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.DataFilterRecord = function()
{
   /** Bitflags field */
   this.bitFlags = 0;

  dis.DataFilterRecord.prototype.initFromBinary = function(inputStream)
  {
       this.bitFlags = inputStream.readUInt();
  };

  dis.DataFilterRecord.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.bitFlags);
  };
}; // end of class

 // node.js module support
exports.DataFilterRecord = dis.DataFilterRecord;

// End of DataFilterRecord class

/**
 *  Information issued in response to a data query pdu or a set data pdu is communicated using a data pdu. Section 7.5.11 COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.DataPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 20;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** ID of request */
   this.requestID = 0;

   /** padding */
   this.padding1 = 0;

   /** Number of fixed datum records */
   this.numberOfFixedDatumRecords = 0;

   /** Number of variable datum records */
   this.numberOfVariableDatumRecords = 0;

   /** variable length list of fixed datums */
    this.fixedDatums = new Array();
 
   /** variable length list of variable length datums */
    this.variableDatums = new Array();
 
  dis.DataPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
       this.padding1 = inputStream.readUInt();
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatums.push(anX);
       }

  };

  dis.DataPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.requestID);
       outputStream.writeUInt(this.padding1);
       outputStream.writeUInt(this.numberOfFixedDatumRecords);
       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.fixedDatums.length; idx++)
       {
           fixedDatums[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatums.length; idx++)
       {
           variableDatums[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.DataPdu = dis.DataPdu;

// End of DataPdu class

/**
 * List of fixed and variable datum records. Section 6.2.17 
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.DataQueryDatumSpecification = function()
{
   /** Number of fixed datums */
   this.numberOfFixedDatums = 0;

   /** Number of variable datums */
   this.numberOfVariableDatums = 0;

   /** variable length list fixed datum IDs */
    this.fixedDatumIDList = new Array();
 
   /** variable length list variable datum IDs */
    this.variableDatumIDList = new Array();
 
  dis.DataQueryDatumSpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfFixedDatums = inputStream.readUInt();
       this.numberOfVariableDatums = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatums; idx++)
       {
           var anX = new dis.UnsignedDISInteger();
           anX.initFromBinary(inputStream);
           this.fixedDatumIDList.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatums; idx++)
       {
           var anX = new dis.UnsignedDISInteger();
           anX.initFromBinary(inputStream);
           this.variableDatumIDList.push(anX);
       }

  };

  dis.DataQueryDatumSpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.numberOfFixedDatums);
       outputStream.writeUInt(this.numberOfVariableDatums);
       for(var idx = 0; idx < this.fixedDatumIDList.length; idx++)
       {
           fixedDatumIDList[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatumIDList.length; idx++)
       {
           variableDatumIDList[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.DataQueryDatumSpecification = dis.DataQueryDatumSpecification;

// End of DataQueryDatumSpecification class

/**
 * Section 7.5.9. Request for data from an entity. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.DataQueryPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 18;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** ID of request */
   this.requestID = 0;

   /** time issues between issues of Data PDUs. Zero means send once only. */
   this.timeInterval = 0;

   /** Number of fixed datum records */
   this.numberOfFixedDatumRecords = 0;

   /** Number of variable datum records */
   this.numberOfVariableDatumRecords = 0;

   /** variable length list of fixed datums */
    this.fixedDatums = new Array();
 
   /** variable length list of variable length datums */
    this.variableDatums = new Array();
 
  dis.DataQueryPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
       this.timeInterval = inputStream.readUInt();
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatums.push(anX);
       }

  };

  dis.DataQueryPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.requestID);
       outputStream.writeUInt(this.timeInterval);
       outputStream.writeUInt(this.numberOfFixedDatumRecords);
       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.fixedDatums.length; idx++)
       {
           fixedDatums[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatums.length; idx++)
       {
           variableDatums[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.DataQueryPdu = dis.DataQueryPdu;

// End of DataQueryPdu class

/**
 * Section 5.3.12.8: request for data from an entity. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.DataQueryReliablePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 58;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Object originatig the request */
   this.originatingEntityID = new dis.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis.EntityID(); 

   /** level of reliability service used for this transaction */
   this.requiredReliabilityService = 0;

   /** padding */
   this.pad1 = 0;

   /** padding */
   this.pad2 = 0;

   /** request ID */
   this.requestID = 0;

   /** time interval between issuing data query PDUs */
   this.timeInterval = 0;

   /** Fixed datum record count */
   this.numberOfFixedDatumRecords = 0;

   /** variable datum record count */
   this.numberOfVariableDatumRecords = 0;

   /** Fixed datum records */
    this.fixedDatumRecords = new Array();
 
   /** Variable datum records */
    this.variableDatumRecords = new Array();
 
  dis.DataQueryReliablePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.requiredReliabilityService = inputStream.readUByte();
       this.pad1 = inputStream.readUShort();
       this.pad2 = inputStream.readUByte();
       this.requestID = inputStream.readUInt();
       this.timeInterval = inputStream.readUInt();
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatumRecords.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumRecords.push(anX);
       }

  };

  dis.DataQueryReliablePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.requiredReliabilityService);
       outputStream.writeUShort(this.pad1);
       outputStream.writeUByte(this.pad2);
       outputStream.writeUInt(this.requestID);
       outputStream.writeUInt(this.timeInterval);
       outputStream.writeUInt(this.numberOfFixedDatumRecords);
       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.fixedDatumRecords.length; idx++)
       {
           fixedDatumRecords[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatumRecords.length; idx++)
       {
           variableDatumRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.DataQueryReliablePdu = dis.DataQueryReliablePdu;

// End of DataQueryReliablePdu class

/**
 * Section 5.3.12.10: issued in response to a data query R or set dataR pdu. Needs manual intervention      to fix padding on variable datums. UNFINSIHED
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.DataReliablePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 60;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Object originatig the request */
   this.originatingEntityID = new dis.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis.EntityID(); 

   /** Request ID */
   this.requestID = 0;

   /** level of reliability service used for this transaction */
   this.requiredReliabilityService = 0;

   /** padding */
   this.pad1 = 0;

   /** padding */
   this.pad2 = 0;

   /** Fixed datum record count */
   this.numberOfFixedDatumRecords = 0;

   /** variable datum record count */
   this.numberOfVariableDatumRecords = 0;

   /** Fixed datum records */
    this.fixedDatumRecords = new Array();
 
   /** Variable datum records */
    this.variableDatumRecords = new Array();
 
  dis.DataReliablePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
       this.requiredReliabilityService = inputStream.readUByte();
       this.pad1 = inputStream.readUShort();
       this.pad2 = inputStream.readUByte();
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatumRecords.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumRecords.push(anX);
       }

  };

  dis.DataReliablePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.requestID);
       outputStream.writeUByte(this.requiredReliabilityService);
       outputStream.writeUShort(this.pad1);
       outputStream.writeUByte(this.pad2);
       outputStream.writeUInt(this.numberOfFixedDatumRecords);
       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.fixedDatumRecords.length; idx++)
       {
           fixedDatumRecords[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatumRecords.length; idx++)
       {
           variableDatumRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.DataReliablePdu = dis.DataReliablePdu;

// End of DataReliablePdu class

/**
 * List of fixed and variable datum records. Section 6.2.18 
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.DatumSpecification = function()
{
   /** Number of fixed datums */
   this.numberOfFixedDatums = 0;

   /** Number of variable datums */
   this.numberOfVariableDatums = 0;

   /** variable length list fixed datums */
    this.fixedDatumIDList = new Array();
 
   /** variable length list variable datums */
    this.variableDatumIDList = new Array();
 
  dis.DatumSpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfFixedDatums = inputStream.readUInt();
       this.numberOfVariableDatums = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatums; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatumIDList.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatums; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumIDList.push(anX);
       }

  };

  dis.DatumSpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.numberOfFixedDatums);
       outputStream.writeUInt(this.numberOfVariableDatums);
       for(var idx = 0; idx < this.fixedDatumIDList.length; idx++)
       {
           fixedDatumIDList[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatumIDList.length; idx++)
       {
           variableDatumIDList[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.DatumSpecification = dis.DatumSpecification;

// End of DatumSpecification class

/**
 * Not specified in the standard. This is used by the ESPDU
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.DeadReckoningParameters = function()
{
   /** Algorithm to use in computing dead reckoning. See EBV doc. */
   this.deadReckoningAlgorithm = 0;

   /** Dead reckoning parameters. Contents depends on algorithm. */
   this.parameters = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /** Linear acceleration of the entity */
   this.entityLinearAcceleration = new dis.Vector3Float(); 

   /** Angular velocity of the entity */
   this.entityAngularVelocity = new dis.Vector3Float(); 

  dis.DeadReckoningParameters.prototype.initFromBinary = function(inputStream)
  {
       this.deadReckoningAlgorithm = inputStream.readUByte();
       for(var idx = 0; idx < 15; idx++)
       {
          this.parameters[ idx ] = inputStream.readUByte();
       }
       this.entityLinearAcceleration.initFromBinary(inputStream);
       this.entityAngularVelocity.initFromBinary(inputStream);
  };

  dis.DeadReckoningParameters.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.deadReckoningAlgorithm);
       for(var idx = 0; idx < 15; idx++)
       {
          outputStream.writeUByte(this.parameters[ idx ] );
       }
       this.entityLinearAcceleration.encodeToBinary(outputStream);
       this.entityAngularVelocity.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.DeadReckoningParameters = dis.DeadReckoningParameters;

// End of DeadReckoningParameters class

/**
 * Section 5.3.7.2. Handles designating operations. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.DesignatorPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 24;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 6;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity designating */
   this.designatingEntityID = new dis.EntityID(); 

   /** This field shall specify a unique emitter database number assigned to  differentiate between otherwise similar or identical emitter beams within an emitter system. */
   this.codeName = 0;

   /** ID of the entity being designated */
   this.designatedEntityID = new dis.EntityID(); 

   /** This field shall identify the designator code being used by the designating entity  */
   this.designatorCode = 0;

   /** This field shall identify the designator output power in watts */
   this.designatorPower = 0;

   /** This field shall identify the designator wavelength in units of microns */
   this.designatorWavelength = 0;

   /** designtor spot wrt the designated entity */
   this.designatorSpotWrtDesignated = new dis.Vector3Float(); 

   /** designtor spot wrt the designated entity */
   this.designatorSpotLocation = new dis.Vector3Double(); 

   /** Dead reckoning algorithm */
   this.deadReckoningAlgorithm = 0;

   /** padding */
   this.padding1 = 0;

   /** padding */
   this.padding2 = 0;

   /** linear accelleration of entity */
   this.entityLinearAcceleration = new dis.Vector3Float(); 

  dis.DesignatorPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.designatingEntityID.initFromBinary(inputStream);
       this.codeName = inputStream.readUShort();
       this.designatedEntityID.initFromBinary(inputStream);
       this.designatorCode = inputStream.readUShort();
       this.designatorPower = inputStream.readFloat32();
       this.designatorWavelength = inputStream.readFloat32();
       this.designatorSpotWrtDesignated.initFromBinary(inputStream);
       this.designatorSpotLocation.initFromBinary(inputStream);
       this.deadReckoningAlgorithm = inputStream.readByte();
       this.padding1 = inputStream.readUShort();
       this.padding2 = inputStream.readByte();
       this.entityLinearAcceleration.initFromBinary(inputStream);
  };

  dis.DesignatorPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.designatingEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.codeName);
       this.designatedEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.designatorCode);
       outputStream.writeFloat32(this.designatorPower);
       outputStream.writeFloat32(this.designatorWavelength);
       this.designatorSpotWrtDesignated.encodeToBinary(outputStream);
       this.designatorSpotLocation.encodeToBinary(outputStream);
       outputStream.writeByte(this.deadReckoningAlgorithm);
       outputStream.writeUShort(this.padding1);
       outputStream.writeByte(this.padding2);
       this.entityLinearAcceleration.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.DesignatorPdu = dis.DesignatorPdu;

// End of DesignatorPdu class

/**
 * Detonation or impact of munitions, as well as, non-munition explosions, the burst or initial bloom of chaff, and the ignition of a flare shall be indicated. Section 7.3.3  COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.DetonationPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 3;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 2;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that shot */
   this.firingEntityID = new dis.EntityID(); 

   /** ID of the entity that is being shot at */
   this.targetEntityID = new dis.EntityID(); 

   /** ID of the expendable entity, Section 7.3.3  */
   this.explodingEntityID = new dis.EntityID(); 

   /** ID of event, Section 7.3.3 */
   this.eventID = new dis.EventIdentifier(); 

   /** velocity of the munition immediately before detonation/impact, Section 7.3.3  */
   this.velocity = new dis.Vector3Float(); 

   /** location of the munition detonation, the expendable detonation, Section 7.3.3  */
   this.locationInWorldCoordinates = new dis.Vector3Double(); 

   /** Describes the detonation represented, Section 7.3.3  */
   this.descriptor = new dis.MunitionDescriptor(); 

   /** Velocity of the ammunition, Section 7.3.3  */
   this.locationOfEntityCoordinates = new dis.Vector3Float(); 

   /** result of the detonation, Section 7.3.3  */
   this.detonationResult = 0;

   /** How many articulation parameters we have, Section 7.3.3  */
   this.numberOfVariableParameters = 0;

   /** padding */
   this.pad = 0;

   /** specify the parameter values for each Variable Parameter record, Section 7.3.3  */
    this.variableParameters = new Array();
 
  dis.DetonationPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.firingEntityID.initFromBinary(inputStream);
       this.targetEntityID.initFromBinary(inputStream);
       this.explodingEntityID.initFromBinary(inputStream);
       this.eventID.initFromBinary(inputStream);
       this.velocity.initFromBinary(inputStream);
       this.locationInWorldCoordinates.initFromBinary(inputStream);
       this.descriptor.initFromBinary(inputStream);
       this.locationOfEntityCoordinates.initFromBinary(inputStream);
       this.detonationResult = inputStream.readUByte();
       this.numberOfVariableParameters = inputStream.readUByte();
       this.pad = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfVariableParameters; idx++)
       {
           var anX = new dis.VariableParameter();
           anX.initFromBinary(inputStream);
           this.variableParameters.push(anX);
       }

  };

  dis.DetonationPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.firingEntityID.encodeToBinary(outputStream);
       this.targetEntityID.encodeToBinary(outputStream);
       this.explodingEntityID.encodeToBinary(outputStream);
       this.eventID.encodeToBinary(outputStream);
       this.velocity.encodeToBinary(outputStream);
       this.locationInWorldCoordinates.encodeToBinary(outputStream);
       this.descriptor.encodeToBinary(outputStream);
       this.locationOfEntityCoordinates.encodeToBinary(outputStream);
       outputStream.writeUByte(this.detonationResult);
       outputStream.writeUByte(this.numberOfVariableParameters);
       outputStream.writeUShort(this.pad);
       for(var idx = 0; idx < this.variableParameters.length; idx++)
       {
           variableParameters[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.DetonationPdu = dis.DetonationPdu;

// End of DetonationPdu class

/**
 * DE Precision Aimpoint Record. NOT COMPLETE. Section 6.2.20.2
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.DirectedEnergyAreaAimpoint = function()
{
   /** Type of Record enumeration */
   this.recordType = 4001;

   /** Length of Record */
   this.recordLength = 0;

   /** Padding */
   this.padding = 0;

   /** Number of beam antenna pattern records */
   this.beamAntennaPatternRecordCount = 0;

   /** Number of DE target energy depositon records */
   this.directedEnergyTargetEnergyDepositionRecordCount = 0;

   /** list of beam antenna records. See 6.2.9.2 */
    this.beamAntennaParameterList = new Array();
 
   /** list of DE target deposition records. See 6.2.21.4 */
    this.directedEnergyTargetEnergyDepositionRecordList = new Array();
 
  dis.DirectedEnergyAreaAimpoint.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.padding = inputStream.readUShort();
       this.beamAntennaPatternRecordCount = inputStream.readUShort();
       this.directedEnergyTargetEnergyDepositionRecordCount = inputStream.readUShort();
       for(var idx = 0; idx < this.beamAntennaPatternRecordCount; idx++)
       {
           var anX = new dis.BeamAntennaPattern();
           anX.initFromBinary(inputStream);
           this.beamAntennaParameterList.push(anX);
       }

       for(var idx = 0; idx < this.directedEnergyTargetEnergyDepositionRecordCount; idx++)
       {
           var anX = new dis.DirectedEnergyTargetEnergyDeposition();
           anX.initFromBinary(inputStream);
           this.directedEnergyTargetEnergyDepositionRecordList.push(anX);
       }

  };

  dis.DirectedEnergyAreaAimpoint.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUShort(this.padding);
       outputStream.writeUShort(this.beamAntennaPatternRecordCount);
       outputStream.writeUShort(this.directedEnergyTargetEnergyDepositionRecordCount);
       for(var idx = 0; idx < this.beamAntennaParameterList.length; idx++)
       {
           beamAntennaParameterList[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.directedEnergyTargetEnergyDepositionRecordList.length; idx++)
       {
           directedEnergyTargetEnergyDepositionRecordList[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.DirectedEnergyAreaAimpoint = dis.DirectedEnergyAreaAimpoint;

// End of DirectedEnergyAreaAimpoint class

/**
 * Damage sustained by an entity due to directed energy. Location of the damage based on a relative x,y,z location from the center of the entity. Section 6.2.15.2
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.DirectedEnergyDamage = function()
{
   /** DE Record Type. */
   this.recordType = 4500;

   /** DE Record Length (bytes). */
   this.recordLength = 40;

   /** padding. */
   this.padding = 0;

   /** location of damage, relative to center of entity */
   this.damageLocation = new dis.Vector3Float(); 

   /** Size of damaged area, in meters. */
   this.damageDiameter = 0;

   /** average temp of the damaged area, in degrees celsius. If firing entitty does not model this, use a value of -273.15 */
   this.temperature = -273.15;

   /** enumeration */
   this.componentIdentification = 0;

   /** enumeration */
   this.componentDamageStatus = 0;

   /** enumeration */
   this.componentVisualDamageStatus = 0;

   /** enumeration */
   this.componentVisualSmokeColor = 0;

   /** For any component damage resulting this field shall be set to the fire event ID from that PDU. */
   this.fireEventID = new dis.EventIdentifier(); 

   /** padding */
   this.padding2 = 0;

  dis.DirectedEnergyDamage.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.padding = inputStream.readUShort();
       this.damageLocation.initFromBinary(inputStream);
       this.damageDiameter = inputStream.readFloat32();
       this.temperature = inputStream.readFloat32();
       this.componentIdentification = inputStream.readUByte();
       this.componentDamageStatus = inputStream.readUByte();
       this.componentVisualDamageStatus = inputStream.readUByte();
       this.componentVisualSmokeColor = inputStream.readUByte();
       this.fireEventID.initFromBinary(inputStream);
       this.padding2 = inputStream.readUShort();
  };

  dis.DirectedEnergyDamage.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUShort(this.padding);
       this.damageLocation.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.damageDiameter);
       outputStream.writeFloat32(this.temperature);
       outputStream.writeUByte(this.componentIdentification);
       outputStream.writeUByte(this.componentDamageStatus);
       outputStream.writeUByte(this.componentVisualDamageStatus);
       outputStream.writeUByte(this.componentVisualSmokeColor);
       this.fireEventID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding2);
  };
}; // end of class

 // node.js module support
exports.DirectedEnergyDamage = dis.DirectedEnergyDamage;

// End of DirectedEnergyDamage class

/**
 * Firing of a directed energy weapon shall be communicated by issuing a Directed Energy Fire PDU Section 7.3.4  COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.DirectedEnergyFirePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 68;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 2;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that shot */
   this.firingEntityID = new dis.EntityID(); 

   /** ID of the entity that is being shot at */
   this.targetEntityID = new dis.EntityID(); 

   /** Field shall identify the munition type enumeration for the DE weapon beam, Section 7.3.4  */
   this.munitionType = new dis.EntityType(); 

   /** Field shall indicate the simulation time at start of the shot, Section 7.3.4  */
   this.shotStartTime = new dis.ClockTime(); 

   /** Field shall indicate the current cumulative duration of the shot, Section 7.3.4  */
   this.commulativeShotTime = 0;

   /** Field shall identify the location of the DE weapon aperture/emitter, Section 7.3.4  */
   this.ApertureEmitterLocation = new dis.Vector3Float(); 

   /** Field shall identify the beam diameter at the aperture/emitter, Section 7.3.4  */
   this.apertureDiameter = 0;

   /** Field shall identify the emissions wavelength in units of meters, Section 7.3.4  */
   this.wavelength = 0;

   /** Field shall identify the current peak irradiance of emissions in units of Watts per square meter, Section 7.3.4  */
   this.peakIrradiance = 0;

   /** field shall identify the current pulse repetition frequency in units of cycles per second (Hertz), Section 7.3.4  */
   this.pulseRepetitionFrequency = 0;

   /** field shall identify the pulse width emissions in units of seconds, Section 7.3.4 */
   this.pulseWidth = 0;

   /** 16bit Boolean field shall contain various flags to indicate status information needed to process a DE, Section 7.3.4  */
   this.flags = 0;

   /** Field shall identify the pulse shape and shall be represented as an 8-bit enumeration, Section 7.3.4  */
   this.pulseShape = 0;

   /** padding, Section 7.3.4  */
   this.padding1 = 0;

   /** padding, Section 7.3.4  */
   this.padding2 = 0;

   /** padding, Section 7.3.4  */
   this.padding3 = 0;

   /** Field shall specify the number of DE records, Section 7.3.4  */
   this.numberOfDERecords = 0;

   /** Fields shall contain one or more DE records, records shall conform to the variable record format (Section6.2.82), Section 7.3.4 */
    this.dERecords = new Array();
 
  dis.DirectedEnergyFirePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.firingEntityID.initFromBinary(inputStream);
       this.targetEntityID.initFromBinary(inputStream);
       this.munitionType.initFromBinary(inputStream);
       this.shotStartTime.initFromBinary(inputStream);
       this.commulativeShotTime = inputStream.readFloat32();
       this.ApertureEmitterLocation.initFromBinary(inputStream);
       this.apertureDiameter = inputStream.readFloat32();
       this.wavelength = inputStream.readFloat32();
       this.peakIrradiance = inputStream.readFloat32();
       this.pulseRepetitionFrequency = inputStream.readFloat32();
       this.pulseWidth = inputStream.readInt();
       this.flags = inputStream.readInt();
       this.pulseShape = inputStream.readByte();
       this.padding1 = inputStream.readUByte();
       this.padding2 = inputStream.readUInt();
       this.padding3 = inputStream.readUShort();
       this.numberOfDERecords = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfDERecords; idx++)
       {
           var anX = new dis.StandardVariableSpecification();
           anX.initFromBinary(inputStream);
           this.dERecords.push(anX);
       }

  };

  dis.DirectedEnergyFirePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.firingEntityID.encodeToBinary(outputStream);
       this.targetEntityID.encodeToBinary(outputStream);
       this.munitionType.encodeToBinary(outputStream);
       this.shotStartTime.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.commulativeShotTime);
       this.ApertureEmitterLocation.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.apertureDiameter);
       outputStream.writeFloat32(this.wavelength);
       outputStream.writeFloat32(this.peakIrradiance);
       outputStream.writeFloat32(this.pulseRepetitionFrequency);
       outputStream.writeInt(this.pulseWidth);
       outputStream.writeInt(this.flags);
       outputStream.writeByte(this.pulseShape);
       outputStream.writeUByte(this.padding1);
       outputStream.writeUInt(this.padding2);
       outputStream.writeUShort(this.padding3);
       outputStream.writeUShort(this.numberOfDERecords);
       for(var idx = 0; idx < this.dERecords.length; idx++)
       {
           dERecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.DirectedEnergyFirePdu = dis.DirectedEnergyFirePdu;

// End of DirectedEnergyFirePdu class

/**
 * DE Precision Aimpoint Record. Section 6.2.20.3
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.DirectedEnergyPrecisionAimpoint = function()
{
   /** Type of Record */
   this.recordType = 4000;

   /** Length of Record */
   this.recordLength = 88;

   /** Padding */
   this.padding = 0;

   /** Position of Target Spot in World Coordinates. */
   this.targetSpotLocation = new dis.Vector3Double(); 

   /** Position (meters) of Target Spot relative to Entity Position. */
   this.targetSpotEntityLocation = new dis.Vector3Float(); 

   /** Velocity (meters/sec) of Target Spot. */
   this.targetSpotVelocity = new dis.Vector3Float(); 

   /** Acceleration (meters/sec/sec) of Target Spot. */
   this.targetSpotAcceleration = new dis.Vector3Float(); 

   /** Unique ID of the target entity. */
   this.targetEntityID = new dis.EntityID(); 

   /** Target Component ID ENUM, same as in DamageDescriptionRecord. */
   this.targetComponentID = 0;

   /** Spot Shape ENUM. */
   this.beamSpotType = 0;

   /** Beam Spot Cross Section Semi-Major Axis. */
   this.beamSpotCrossSectionSemiMajorAxis = 0;

   /** Beam Spot Cross Section Semi-Major Axis. */
   this.beamSpotCrossSectionSemiMinorAxis = 0;

   /** Beam Spot Cross Section Orientation Angle. */
   this.beamSpotCrossSectionOrientationAngle = 0;

   /** Peak irradiance */
   this.peakIrradiance = 0;

   /** padding */
   this.padding2 = 0;

  dis.DirectedEnergyPrecisionAimpoint.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.padding = inputStream.readUShort();
       this.targetSpotLocation.initFromBinary(inputStream);
       this.targetSpotEntityLocation.initFromBinary(inputStream);
       this.targetSpotVelocity.initFromBinary(inputStream);
       this.targetSpotAcceleration.initFromBinary(inputStream);
       this.targetEntityID.initFromBinary(inputStream);
       this.targetComponentID = inputStream.readUByte();
       this.beamSpotType = inputStream.readUByte();
       this.beamSpotCrossSectionSemiMajorAxis = inputStream.readFloat32();
       this.beamSpotCrossSectionSemiMinorAxis = inputStream.readFloat32();
       this.beamSpotCrossSectionOrientationAngle = inputStream.readFloat32();
       this.peakIrradiance = inputStream.readFloat32();
       this.padding2 = inputStream.readUInt();
  };

  dis.DirectedEnergyPrecisionAimpoint.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUShort(this.padding);
       this.targetSpotLocation.encodeToBinary(outputStream);
       this.targetSpotEntityLocation.encodeToBinary(outputStream);
       this.targetSpotVelocity.encodeToBinary(outputStream);
       this.targetSpotAcceleration.encodeToBinary(outputStream);
       this.targetEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.targetComponentID);
       outputStream.writeUByte(this.beamSpotType);
       outputStream.writeFloat32(this.beamSpotCrossSectionSemiMajorAxis);
       outputStream.writeFloat32(this.beamSpotCrossSectionSemiMinorAxis);
       outputStream.writeFloat32(this.beamSpotCrossSectionOrientationAngle);
       outputStream.writeFloat32(this.peakIrradiance);
       outputStream.writeUInt(this.padding2);
  };
}; // end of class

 // node.js module support
exports.DirectedEnergyPrecisionAimpoint = dis.DirectedEnergyPrecisionAimpoint;

// End of DirectedEnergyPrecisionAimpoint class

/**
 * DE energy depostion properties for a target entity. Section 6.2.20.4
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.DirectedEnergyTargetEnergyDeposition = function()
{
   /** Unique ID of the target entity. */
   this.targetEntityID = new dis.EntityID(); 

   /** padding */
   this.padding = 0;

   /** Peak irrandiance */
   this.peakIrradiance = 0;

  dis.DirectedEnergyTargetEnergyDeposition.prototype.initFromBinary = function(inputStream)
  {
       this.targetEntityID.initFromBinary(inputStream);
       this.padding = inputStream.readUShort();
       this.peakIrradiance = inputStream.readFloat32();
  };

  dis.DirectedEnergyTargetEnergyDeposition.prototype.encodeToBinary = function(outputStream)
  {
       this.targetEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding);
       outputStream.writeFloat32(this.peakIrradiance);
  };
}; // end of class

 // node.js module support
exports.DirectedEnergyTargetEnergyDeposition = dis.DirectedEnergyTargetEnergyDeposition;

// End of DirectedEnergyTargetEnergyDeposition class

/**
 * Section 5.3.7. Electronic Emissions. Abstract superclass for distirubted emissions PDU
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.DistributedEmissionsFamilyPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 6;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

  dis.DistributedEmissionsFamilyPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.DistributedEmissionsFamilyPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.DistributedEmissionsFamilyPdu = dis.DistributedEmissionsFamilyPdu;

// End of DistributedEmissionsFamilyPdu class

/**
 * Contains electromagnetic emmission regeneration parameters that are variable throught a scenario. Section 6.2.22.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EEFundamentalParameterData = function()
{
   /** center frequency of the emission in hertz. */
   this.frequency = 0;

   /** Bandwidth of the frequencies corresponding to the fequency field. */
   this.frequencyRange = 0;

   /** Effective radiated power for the emission in DdBm. For a radar noise jammer, indicates the peak of the transmitted power. */
   this.effectiveRadiatedPower = 0;

   /** Average repetition frequency of the emission in hertz. */
   this.pulseRepetitionFrequency = 0;

   /** Average pulse width  of the emission in microseconds. */
   this.pulseWidth = 0;

  dis.EEFundamentalParameterData.prototype.initFromBinary = function(inputStream)
  {
       this.frequency = inputStream.readFloat32();
       this.frequencyRange = inputStream.readFloat32();
       this.effectiveRadiatedPower = inputStream.readFloat32();
       this.pulseRepetitionFrequency = inputStream.readFloat32();
       this.pulseWidth = inputStream.readFloat32();
  };

  dis.EEFundamentalParameterData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.frequency);
       outputStream.writeFloat32(this.frequencyRange);
       outputStream.writeFloat32(this.effectiveRadiatedPower);
       outputStream.writeFloat32(this.pulseRepetitionFrequency);
       outputStream.writeFloat32(this.pulseWidth);
  };
}; // end of class

 // node.js module support
exports.EEFundamentalParameterData = dis.EEFundamentalParameterData;

// End of EEFundamentalParameterData class

/**
 * 64 bit piece of data
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EightByteChunk = function()
{
   /** Eight bytes of arbitrary data */
   this.otherParameters = new Array(0, 0, 0, 0, 0, 0, 0, 0);

  dis.EightByteChunk.prototype.initFromBinary = function(inputStream)
  {
       for(var idx = 0; idx < 8; idx++)
       {
          this.otherParameters[ idx ] = inputStream.readByte();
       }
  };

  dis.EightByteChunk.prototype.encodeToBinary = function(outputStream)
  {
       for(var idx = 0; idx < 8; idx++)
       {
          outputStream.writeByte(this.otherParameters[ idx ] );
       }
  };
}; // end of class

 // node.js module support
exports.EightByteChunk = dis.EightByteChunk;

// End of EightByteChunk class

/**
 * Section 5.3.7.1. Information about active electronic warfare (EW) emissions and active EW countermeasures shall be communicated using an Electromagnetic Emission PDU. NOT COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ElectronicEmissionsPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 23;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 6;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity emitting */
   this.emittingEntityID = new dis.EntityID(); 

   /** ID of event */
   this.eventID = new dis.EventIdentifier(); 

   /** This field shall be used to indicate if the data in the PDU represents a state update or just data that has changed since issuance of the last Electromagnetic Emission PDU [relative to the identified entity and emission system(s)]. */
   this.stateUpdateIndicator = 0;

   /** This field shall specify the number of emission systems being described in the current PDU. */
   this.numberOfSystems = 0;

   /** padding */
   this.paddingForEmissionsPdu = 0;

   /**  this field shall specify the length of this emitter system's data in 32-bit words. */
   this.systemDataLength = 0;

   /** the number of beams being described in the current PDU for the emitter system being described.  */
   this.numberOfBeams = 0;

   /**  information about a particular emitter system and shall be represented by an Emitter System record (see 6.2.23). */
   this.emitterSystem = new dis.EmitterSystem(); 

   /** the location of the antenna beam source with respect to the emitting entity's coordinate system. This location shall be the origin of the emitter coordinate system that shall have the same orientation as the entity coordinate system. This field shall be represented by an Entity Coordinate Vector record see 6.2.95  */
   this.location = new dis.Vector3Float(); 

   /** Electronic emmissions systems THIS IS WRONG. It has the WRONG class type and will cause problems in any marshalling. */
    this.systems = new Array();
 
  dis.ElectronicEmissionsPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.emittingEntityID.initFromBinary(inputStream);
       this.eventID.initFromBinary(inputStream);
       this.stateUpdateIndicator = inputStream.readUByte();
       this.numberOfSystems = inputStream.readUByte();
       this.paddingForEmissionsPdu = inputStream.readUShort();
       this.systemDataLength = inputStream.readUByte();
       this.numberOfBeams = inputStream.readUByte();
       this.emitterSystem.initFromBinary(inputStream);
       this.location.initFromBinary(inputStream);
       for(var idx = 0; idx < this.numberOfSystems; idx++)
       {
           var anX = new dis.Vector3Float();
           anX.initFromBinary(inputStream);
           this.systems.push(anX);
       }

  };

  dis.ElectronicEmissionsPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.emittingEntityID.encodeToBinary(outputStream);
       this.eventID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.stateUpdateIndicator);
       outputStream.writeUByte(this.numberOfSystems);
       outputStream.writeUShort(this.paddingForEmissionsPdu);
       outputStream.writeUByte(this.systemDataLength);
       outputStream.writeUByte(this.numberOfBeams);
       this.emitterSystem.encodeToBinary(outputStream);
       this.location.encodeToBinary(outputStream);
       for(var idx = 0; idx < this.systems.length; idx++)
       {
           systems[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ElectronicEmissionsPdu = dis.ElectronicEmissionsPdu;

// End of ElectronicEmissionsPdu class

/**
 * This field shall specify information about a particular emitter system. Section 6.2.23.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EmitterSystem = function()
{
   /** Name of the emitter, 16 bit enumeration */
   this.emitterName = 0;

   /** function of the emitter, 8 bit enumeration */
   this.emitterFunction = 0;

   /** emitter ID, 8 bit enumeration */
   this.emitterIDNumber = 0;

  dis.EmitterSystem.prototype.initFromBinary = function(inputStream)
  {
       this.emitterName = inputStream.readUShort();
       this.emitterFunction = inputStream.readUByte();
       this.emitterIDNumber = inputStream.readUByte();
  };

  dis.EmitterSystem.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.emitterName);
       outputStream.writeUByte(this.emitterFunction);
       outputStream.writeUByte(this.emitterIDNumber);
  };
}; // end of class

 // node.js module support
exports.EmitterSystem = dis.EmitterSystem;

// End of EmitterSystem class

/**
 * Information about an entity's engine fuel. Section 6.2.24.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EngineFuel = function()
{
   /** Fuel quantity, units specified by next field */
   this.fuelQuantity = 0;

   /** Units in which the fuel is measured */
   this.fuelMeasurementUnits = 0;

   /** Type of fuel */
   this.fuelType = 0;

   /** Location of fuel as related to entity. See section 14 of EBV document */
   this.fuelLocation = 0;

   /** padding */
   this.padding = 0;

  dis.EngineFuel.prototype.initFromBinary = function(inputStream)
  {
       this.fuelQuantity = inputStream.readUInt();
       this.fuelMeasurementUnits = inputStream.readUByte();
       this.fuelType = inputStream.readUByte();
       this.fuelLocation = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.EngineFuel.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.fuelQuantity);
       outputStream.writeUByte(this.fuelMeasurementUnits);
       outputStream.writeUByte(this.fuelType);
       outputStream.writeUByte(this.fuelLocation);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.EngineFuel = dis.EngineFuel;

// End of EngineFuel class

/**
 * For each type or location of engine fuell, this record specifies the type, location, fuel measurement units, and reload quantity and maximum quantity. Section 6.2.25.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EngineFuelReload = function()
{
   /** standard quantity of fuel loaded */
   this.standardQuantity = 0;

   /** maximum quantity of fuel loaded */
   this.maximumQuantity = 0;

   /** seconds normally required to to reload standard qty */
   this.standardQuantityReloadTime = 0;

   /** seconds normally required to to reload maximum qty */
   this.maximumQuantityReloadTime = 0;

   /** Units of measure */
   this.fuelMeasurmentUnits = 0;

   /** fuel  location as related to the entity */
   this.fuelLocation = 0;

   /** padding */
   this.padding = 0;

  dis.EngineFuelReload.prototype.initFromBinary = function(inputStream)
  {
       this.standardQuantity = inputStream.readUInt();
       this.maximumQuantity = inputStream.readUInt();
       this.standardQuantityReloadTime = inputStream.readUInt();
       this.maximumQuantityReloadTime = inputStream.readUInt();
       this.fuelMeasurmentUnits = inputStream.readUByte();
       this.fuelLocation = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.EngineFuelReload.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.standardQuantity);
       outputStream.writeUInt(this.maximumQuantity);
       outputStream.writeUInt(this.standardQuantityReloadTime);
       outputStream.writeUInt(this.maximumQuantityReloadTime);
       outputStream.writeUByte(this.fuelMeasurmentUnits);
       outputStream.writeUByte(this.fuelLocation);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.EngineFuelReload = dis.EngineFuelReload;

// End of EngineFuelReload class

/**
 * Association or disassociation of two entities.  Section 6.2.94.4.3
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EntityAssociation = function()
{
   /** the identification of the Variable Parameter record. Enumeration from EBV */
   this.recordType = 4;

   /** Indicates if this VP has changed since last issuance */
   this.changeIndicator = 0;

   /** Indicates association status between two entities; 8 bit enum */
   this.associationStatus = 0;

   /** Type of association; 8 bit enum */
   this.associationType = 0;

   /** Object ID of entity associated with this entity */
   this.entityID = new dis.EntityID(); 

   /** Station location on one's own entity. EBV doc. */
   this.ownStationLocation = 0;

   /** Type of physical connection. EBV doc */
   this.physicalConnectionType = 0;

   /** Type of member the entity is within th egroup */
   this.groupMemberType = 0;

   /** Group if any to which the entity belongs */
   this.groupNumber = 0;

  dis.EntityAssociation.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUByte();
       this.changeIndicator = inputStream.readUByte();
       this.associationStatus = inputStream.readUByte();
       this.associationType = inputStream.readUByte();
       this.entityID.initFromBinary(inputStream);
       this.ownStationLocation = inputStream.readUShort();
       this.physicalConnectionType = inputStream.readUByte();
       this.groupMemberType = inputStream.readUByte();
       this.groupNumber = inputStream.readUShort();
  };

  dis.EntityAssociation.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.recordType);
       outputStream.writeUByte(this.changeIndicator);
       outputStream.writeUByte(this.associationStatus);
       outputStream.writeUByte(this.associationType);
       this.entityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.ownStationLocation);
       outputStream.writeUByte(this.physicalConnectionType);
       outputStream.writeUByte(this.groupMemberType);
       outputStream.writeUShort(this.groupNumber);
  };
}; // end of class

 // node.js module support
exports.EntityAssociation = dis.EntityAssociation;

// End of EntityAssociation class

/**
 * shall be used to communicate detailed damage information sustained by an entity regardless of the source of the damage Section 7.3.5  COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EntityDamageStatusPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 69;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 2;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that shot */
   this.firingEntityID = new dis.EntityID(); 

   /** ID of the entity that is being shot at */
   this.targetEntityID = new dis.EntityID(); 

   /** Field shall identify the damaged entity (see 6.2.28), Section 7.3.4 COMPLETE */
   this.damagedEntityID = new dis.EntityID(); 

   /** Padding. */
   this.padding1 = 0;

   /** Padding. */
   this.padding2 = 0;

   /** field shall specify the number of Damage Description records, Section 7.3.5 */
   this.numberOfDamageDescription = 0;

   /** Fields shall contain one or more Damage Description records (see 6.2.17) and may contain other Standard Variable records, Section 7.3.5 */
    this.damageDescriptionRecords = new Array();
 
  dis.EntityDamageStatusPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.firingEntityID.initFromBinary(inputStream);
       this.targetEntityID.initFromBinary(inputStream);
       this.damagedEntityID.initFromBinary(inputStream);
       this.padding1 = inputStream.readUShort();
       this.padding2 = inputStream.readUShort();
       this.numberOfDamageDescription = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfDamageDescription; idx++)
       {
           var anX = new dis.DirectedEnergyDamage();
           anX.initFromBinary(inputStream);
           this.damageDescriptionRecords.push(anX);
       }

  };

  dis.EntityDamageStatusPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.firingEntityID.encodeToBinary(outputStream);
       this.targetEntityID.encodeToBinary(outputStream);
       this.damagedEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding1);
       outputStream.writeUShort(this.padding2);
       outputStream.writeUShort(this.numberOfDamageDescription);
       for(var idx = 0; idx < this.damageDescriptionRecords.length; idx++)
       {
           damageDescriptionRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.EntityDamageStatusPdu = dis.EntityDamageStatusPdu;

// End of EntityDamageStatusPdu class

/**
 * more laconically named EntityIdentifier
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EntityID = function()
{
   /** Site ID */
   this.siteID = 0;

   /** application number ID */
   this.applicationID = 0;

   /** Entity number ID */
   this.entityID = 0;

  dis.EntityID.prototype.initFromBinary = function(inputStream)
  {
       this.siteID = inputStream.readUShort();
       this.applicationID = inputStream.readUShort();
       this.entityID = inputStream.readUShort();
  };

  dis.EntityID.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.siteID);
       outputStream.writeUShort(this.applicationID);
       outputStream.writeUShort(this.entityID);
  };
}; // end of class

 // node.js module support
exports.EntityID = dis.EntityID;

// End of EntityID class

/**
 * Entity Identifier. Unique ID for entities in the world. Consists of an simulation address and a entity number. Section 6.2.28.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EntityIdentifier = function()
{
   /** Site and application IDs */
   this.simulationAddress = new dis.SimulationAddress(); 

   /** Entity number */
   this.entityNumber = 0;

  dis.EntityIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.entityNumber = inputStream.readUShort();
  };

  dis.EntityIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.entityNumber);
  };
}; // end of class

 // node.js module support
exports.EntityIdentifier = dis.EntityIdentifier;

// End of EntityIdentifier class

/**
 * Section 5.3.3. Common superclass for EntityState, Collision, collision-elastic, and entity state update PDUs. This should be abstract. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EntityInformationFamilyPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 1;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

  dis.EntityInformationFamilyPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.EntityInformationFamilyPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.EntityInformationFamilyPdu = dis.EntityInformationFamilyPdu;

// End of EntityInformationFamilyPdu class

/**
 *  Managment of grouping of PDUs, and more. Section 7.8
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EntityManagementFamilyPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 7;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

  dis.EntityManagementFamilyPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.EntityManagementFamilyPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.EntityManagementFamilyPdu = dis.EntityManagementFamilyPdu;

// End of EntityManagementFamilyPdu class

/**
 * Specifies the character set used inthe first byte, followed by 11 characters of text data. Section 6.29
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EntityMarking = function()
{
   /** The character set */
   this.characterSet = 0;

   /** The characters */
   this.characters = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

  dis.EntityMarking.prototype.initFromBinary = function(inputStream)
  {
       this.characterSet = inputStream.readUByte();
       for(var idx = 0; idx < 11; idx++)
       {
          this.characters[ idx ] = inputStream.readByte();
       }
  };

  dis.EntityMarking.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.characterSet);
       for(var idx = 0; idx < 11; idx++)
       {
          outputStream.writeByte(this.characters[ idx ] );
       }
  };

  /*
   * Returns the byte array marking, in string format.
   * @return string format marking characters
   */
  dis.EntityMarking.prototype.getMarking = function()
  {
      var marking = "";
      for(var idx = 0; idx < 11; idx++)
      {
          marking = marking + String.fromCharCode(this.characters[idx]);
      }

      return marking;
  };

/**
   * Given a string format marking, sets the bytes of the marking object
   * to the appropriate character values. Clamps the string to no more
   * than 11 characters.
   *
   * @param {String} newMarking string format marking
   * @returns {nothing}
   */
  dis.EntityMarking.prototype.setMarking = function(newMarking)
  {
      var stringLen = newMarking.length;
      if(stringLen > 11)
          stringLen = 11;

      // Copy over up to 11 characters from the string to the array
      var charsCopied = 0;
      while(charsCopied < stringLen)
      {
          this.characters[charsCopied] = newMarking.charCodeAt( charsCopied );
          charsCopied++;
      }

      // Zero-fill the remainer of the character array
      while(charsCopied < 11)
      {
          this.characters[ charsCopied ] = 0;
          charsCopied++;
      }

  };

}; // end of class

 // node.js module support
exports.EntityMarking = dis.EntityMarking;

// End of EntityMarking class

/**
 * Specifies the character set used inthe first byte, followed by 11 characters of text data. Section 6.29
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EntityMarking = function()
{
   /** The character set */
   this.characterSet = 0;

   /** The characters */
   this.characters = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

  dis.EntityMarking.prototype.initFromBinary = function(inputStream)
  {
       this.characterSet = inputStream.readUByte();
       for(var idx = 0; idx < 11; idx++)
       {
          this.characters[ idx ] = inputStream.readByte();
       }
  };

  dis.EntityMarking.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.characterSet);
       for(var idx = 0; idx < 11; idx++)
       {
          outputStream.writeByte(this.characters[ idx ] );
       }
  };
}; // end of class

 // node.js module support
exports.EntityMarking = dis.EntityMarking;

// End of EntityMarking class

/**
 * Represents the postion and state of one entity in the world. Section 7.2.2. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EntityStatePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 1;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 1;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Unique ID for an entity that is tied to this state information */
   this.entityID = new dis.EntityID(); 

   /** What force this entity is affiliated with, eg red, blue, neutral, etc */
   this.forceID = 0;

   /** How many variable parameters are in the variable length list. In earlier versions of DIS these were known as articulation parameters */
   this.numberOfVariableParameters = 0;

   /** Describes the type of entity in the world */
   this.entityType = new dis.EntityType(); 

   this.alternativeEntityType = new dis.EntityType(); 

   /** Describes the speed of the entity in the world */
   this.entityLinearVelocity = new dis.Vector3Float(); 

   /** describes the location of the entity in the world */
   this.entityLocation = new dis.Vector3Double(); 

   /** describes the orientation of the entity, in euler angles */
   this.entityOrientation = new dis.EulerAngles(); 

   /** a series of bit flags that are used to help draw the entity, such as smoking, on fire, etc. */
   this.entityAppearance = 0;

   /** parameters used for dead reckoning */
   this.deadReckoningParameters = new dis.DeadReckoningParameters(); 

   /** characters that can be used for debugging, or to draw unique strings on the side of entities in the world */
   this.marking = new dis.EntityMarking(); 

   /** a series of bit flags */
   this.capabilities = 0;

   /** variable length list of variable parameters. In earlier DIS versions this was articulation parameters. */
    this.variableParameters = new Array();
 
  dis.EntityStatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.entityID.initFromBinary(inputStream);
       this.forceID = inputStream.readUByte();
       this.numberOfVariableParameters = inputStream.readUByte();
       this.entityType.initFromBinary(inputStream);
       this.alternativeEntityType.initFromBinary(inputStream);
       this.entityLinearVelocity.initFromBinary(inputStream);
       this.entityLocation.initFromBinary(inputStream);
       this.entityOrientation.initFromBinary(inputStream);
       this.entityAppearance = inputStream.readUInt();
       this.deadReckoningParameters.initFromBinary(inputStream);
       this.marking.initFromBinary(inputStream);
       this.capabilities = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfVariableParameters; idx++)
       {
           var anX = new dis.VariableParameter();
           anX.initFromBinary(inputStream);
           this.variableParameters.push(anX);
       }

  };

  dis.EntityStatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.entityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.forceID);
       outputStream.writeUByte(this.numberOfVariableParameters);
       this.entityType.encodeToBinary(outputStream);
       this.alternativeEntityType.encodeToBinary(outputStream);
       this.entityLinearVelocity.encodeToBinary(outputStream);
       this.entityLocation.encodeToBinary(outputStream);
       this.entityOrientation.encodeToBinary(outputStream);
       outputStream.writeUInt(this.entityAppearance);
       this.deadReckoningParameters.encodeToBinary(outputStream);
       this.marking.encodeToBinary(outputStream);
       outputStream.writeUInt(this.capabilities);
       for(var idx = 0; idx < this.variableParameters.length; idx++)
       {
           variableParameters[idx].encodeToBinary(outputStream);
       }

  };

/** 0 uniform color, 1 camouflage */
dis.EntityStatePdu.prototype.getPaintScheme = function()
{
   var val = this.entityAppearance & 0x1
   return val >> 0
};


/** 0 uniform color, 1 camouflage */
dis.EntityStatePdu.prototype.setPaintScheme= function(val)
{
  var aVal = 0
  this.entityAppearance &= ~0x1; // Zero existing bits
  val = val << 0
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no mobility kill, 1 mobility kill */
dis.EntityStatePdu.prototype.getMobility = function()
{
   var val = this.entityAppearance & 0x2
   return val >> 1
};


/** 0 no mobility kill, 1 mobility kill */
dis.EntityStatePdu.prototype.setMobility= function(val)
{
  var aVal = 0
  this.entityAppearance &= ~0x2; // Zero existing bits
  val = val << 1
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no firepower iill, 1 firepower kill */
dis.EntityStatePdu.prototype.getFirepower = function()
{
   var val = this.entityAppearance & 0x4
   return val >> 2
};


/** 0 no firepower iill, 1 firepower kill */
dis.EntityStatePdu.prototype.setFirepower= function(val)
{
  var aVal = 0
  this.entityAppearance &= ~0x4; // Zero existing bits
  val = val << 2
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no damage, 1 slight damage, 2 moderate, 3 destroyed */
dis.EntityStatePdu.prototype.getDamage = function()
{
   var val = this.entityAppearance & 0x18
   return val >> 3
};


/** 0 no damage, 1 slight damage, 2 moderate, 3 destroyed */
dis.EntityStatePdu.prototype.setDamage= function(val)
{
  var aVal = 0
  this.entityAppearance &= ~0x18; // Zero existing bits
  val = val << 3
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume */
dis.EntityStatePdu.prototype.getSmoke = function()
{
   var val = this.entityAppearance & 0x60
   return val >> 5
};


/** 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume */
dis.EntityStatePdu.prototype.setSmoke= function(val)
{
  var aVal = 0
  this.entityAppearance &= ~0x60; // Zero existing bits
  val = val << 5
  this.entityAppearance = this.entityAppearance | val; 
};


/** dust cloud, 0 none 1 small 2 medium 3 large */
dis.EntityStatePdu.prototype.getTrailingEffects = function()
{
   var val = this.entityAppearance & 0x180
   return val >> 7
};


/** dust cloud, 0 none 1 small 2 medium 3 large */
dis.EntityStatePdu.prototype.setTrailingEffects= function(val)
{
  var aVal = 0
  this.entityAppearance &= ~0x180; // Zero existing bits
  val = val << 7
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible */
dis.EntityStatePdu.prototype.getHatch = function()
{
   var val = this.entityAppearance & 0xe00
   return val >> 9
};


/** 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible */
dis.EntityStatePdu.prototype.setHatch= function(val)
{
  var aVal = 0
  this.entityAppearance &= ~0xe00; // Zero existing bits
  val = val << 9
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.EntityStatePdu.prototype.getHeadlights = function()
{
   var val = this.entityAppearance & 0x1000
   return val >> 12
};


/** 0 off 1 on */
dis.EntityStatePdu.prototype.setHeadlights= function(val)
{
  var aVal = 0
  this.entityAppearance &= ~0x1000; // Zero existing bits
  val = val << 12
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.EntityStatePdu.prototype.getTailLights = function()
{
   var val = this.entityAppearance & 0x2000
   return val >> 13
};


/** 0 off 1 on */
dis.EntityStatePdu.prototype.setTailLights= function(val)
{
  var aVal = 0
  this.entityAppearance &= ~0x2000; // Zero existing bits
  val = val << 13
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.EntityStatePdu.prototype.getBrakeLights = function()
{
   var val = this.entityAppearance & 0x4000
   return val >> 14
};


/** 0 off 1 on */
dis.EntityStatePdu.prototype.setBrakeLights= function(val)
{
  var aVal = 0
  this.entityAppearance &= ~0x4000; // Zero existing bits
  val = val << 14
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.EntityStatePdu.prototype.getFlaming = function()
{
   var val = this.entityAppearance & 0x8000
   return val >> 15
};


/** 0 off 1 on */
dis.EntityStatePdu.prototype.setFlaming= function(val)
{
  var aVal = 0
  this.entityAppearance &= ~0x8000; // Zero existing bits
  val = val << 15
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 not raised 1 raised */
dis.EntityStatePdu.prototype.getLauncher = function()
{
   var val = this.entityAppearance & 0x10000
   return val >> 16
};


/** 0 not raised 1 raised */
dis.EntityStatePdu.prototype.setLauncher= function(val)
{
  var aVal = 0
  this.entityAppearance &= ~0x10000; // Zero existing bits
  val = val << 16
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 desert 1 winter 2 forest 3 unused */
dis.EntityStatePdu.prototype.getCamouflageType = function()
{
   var val = this.entityAppearance & 0x60000
   return val >> 17
};


/** 0 desert 1 winter 2 forest 3 unused */
dis.EntityStatePdu.prototype.setCamouflageType= function(val)
{
  var aVal = 0
  this.entityAppearance &= ~0x60000; // Zero existing bits
  val = val << 17
  this.entityAppearance = this.entityAppearance | val; 
};

}; // end of class

 // node.js module support
exports.EntityStatePdu = dis.EntityStatePdu;

// End of EntityStatePdu class

/**
 * Nonstatic information about a particular entity may be communicated by issuing an Entity State Update PDU. Section 7.2.5. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EntityStateUpdatePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 67;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 1;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** This field shall identify the entity issuing the PDU, and shall be represented by an Entity Identifier record (see 6.2.28). */
   this.entityID = new dis.EntityID(); 

   /** Padding */
   this.padding1 = 0;

   /** This field shall specify the number of variable parameters present. This field shall be represented by an 8-bit unsigned integer (see Annex I). */
   this.numberOfVariableParameters = 0;

   /** This field shall specify an entity’s linear velocity. The coordinate system for an entity’s linear velocity depends on the dead reckoning algorithm used. This field shall be represented by a Linear Velocity Vector record [see 6.2.95 item c)]). */
   this.entityLinearVelocity = new dis.Vector3Float(); 

   /** This field shall specify an entity’s physical location in the simulated world and shall be represented by a World Coordinates record (see 6.2.97). */
   this.entityLocation = new dis.Vector3Double(); 

   /** This field shall specify an entity’s orientation and shall be represented by an Euler Angles record (see 6.2.33). */
   this.entityOrientation = new dis.EulerAngles(); 

   /** This field shall specify the dynamic changes to the entity’s appearance attributes. This field shall be represented by an Entity Appearance record (see 6.2.26). */
   this.entityAppearance = 0;

   /** This field shall specify the parameter values for each Variable Parameter record that is included (see 6.2.93 and Annex I). */
    this.variableParameters = new Array();
 
  dis.EntityStateUpdatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.entityID.initFromBinary(inputStream);
       this.padding1 = inputStream.readByte();
       this.numberOfVariableParameters = inputStream.readUByte();
       this.entityLinearVelocity.initFromBinary(inputStream);
       this.entityLocation.initFromBinary(inputStream);
       this.entityOrientation.initFromBinary(inputStream);
       this.entityAppearance = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfVariableParameters; idx++)
       {
           var anX = new dis.VariableParameter();
           anX.initFromBinary(inputStream);
           this.variableParameters.push(anX);
       }

  };

  dis.EntityStateUpdatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.entityID.encodeToBinary(outputStream);
       outputStream.writeByte(this.padding1);
       outputStream.writeUByte(this.numberOfVariableParameters);
       this.entityLinearVelocity.encodeToBinary(outputStream);
       this.entityLocation.encodeToBinary(outputStream);
       this.entityOrientation.encodeToBinary(outputStream);
       outputStream.writeUInt(this.entityAppearance);
       for(var idx = 0; idx < this.variableParameters.length; idx++)
       {
           variableParameters[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.EntityStateUpdatePdu = dis.EntityStateUpdatePdu;

// End of EntityStateUpdatePdu class

/**
 * Identifies the type of Entity
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EntityType = function()
{
   /** Kind of entity */
   this.entityKind = 0;

   /** Domain of entity (air, surface, subsurface, space, etc) */
   this.domain = 0;

   /** country to which the design of the entity is attributed */
   this.country = 0;

   /** category of entity */
   this.category = 0;

   /** subcategory of entity */
   this.subcategory = 0;

   /** specific info based on subcategory field. Renamed from specific because that is a reserved word in SQL. */
   this.specific = 0;

   this.extra = 0;

  dis.EntityType.prototype.initFromBinary = function(inputStream)
  {
       this.entityKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.country = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.specific = inputStream.readUByte();
       this.extra = inputStream.readUByte();
  };

  dis.EntityType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.entityKind);
       outputStream.writeUByte(this.domain);
       outputStream.writeUShort(this.country);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
       outputStream.writeUByte(this.specific);
       outputStream.writeUByte(this.extra);
  };
}; // end of class

 // node.js module support
exports.EntityType = dis.EntityType;

// End of EntityType class

/**
 * Association or disassociation of two entities.  Section 6.2.94.5
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EntityTypeVP = function()
{
   /** the identification of the Variable Parameter record. Enumeration from EBV */
   this.recordType = 3;

   /** Indicates if this VP has changed since last issuance */
   this.changeIndicator = 0;

   /**  */
   this.entityType = new dis.EntityType(); 

   /** padding */
   this.padding = 0;

   /** padding */
   this.padding1 = 0;

  dis.EntityTypeVP.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUByte();
       this.changeIndicator = inputStream.readUByte();
       this.entityType.initFromBinary(inputStream);
       this.padding = inputStream.readUShort();
       this.padding1 = inputStream.readUInt();
  };

  dis.EntityTypeVP.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.recordType);
       outputStream.writeUByte(this.changeIndicator);
       this.entityType.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding);
       outputStream.writeUInt(this.padding1);
  };
}; // end of class

 // node.js module support
exports.EntityTypeVP = dis.EntityTypeVP;

// End of EntityTypeVP class

/**
 * Incomplete environment record; requires hand coding to fix. Section 6.2.31.1
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.Environment = function()
{
   /** type */
   this.environmentType = 0;

   /** length, in bits, of the record */
   this.length = 0;

   /** identifies the sequntially numbered record index */
   this.index = 0;

   /** padding */
   this.padding = 0;

  dis.Environment.prototype.initFromBinary = function(inputStream)
  {
       this.environmentType = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.index = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.Environment.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.environmentType);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.index);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.Environment = dis.Environment;

// End of Environment class

/**
 *  Information about a geometry, a state associated with a geometry, a bounding volume, or an associated entity ID. NOTE: this class requires hand coding. 6.2.31
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EnvironmentGeneral = function()
{
   /** Record type */
   this.environmentType = 0;

   /** length, in bits */
   this.length = 0;

   /** Identify the sequentially numbered record index */
   this.index = 0;

   /** padding */
   this.padding1 = 0;

   /** Geometry or state record */
   this.geometry = 0;

   /** padding to bring the total size up to a 64 bit boundry */
   this.padding2 = 0;

  dis.EnvironmentGeneral.prototype.initFromBinary = function(inputStream)
  {
       this.environmentType = inputStream.readUInt();
       this.length = inputStream.readUByte();
       this.index = inputStream.readUByte();
       this.padding1 = inputStream.readUByte();
       this.geometry = inputStream.readUByte();
       this.padding2 = inputStream.readUByte();
  };

  dis.EnvironmentGeneral.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.environmentType);
       outputStream.writeUByte(this.length);
       outputStream.writeUByte(this.index);
       outputStream.writeUByte(this.padding1);
       outputStream.writeUByte(this.geometry);
       outputStream.writeUByte(this.padding2);
  };
}; // end of class

 // node.js module support
exports.EnvironmentGeneral = dis.EnvironmentGeneral;

// End of EnvironmentGeneral class

/**
 * Description of environmental data in environmental process and gridded data PDUs. Section 6.2.32
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EnvironmentType = function()
{
   /** Kind of entity */
   this.entityKind = 0;

   /** Domain of entity (air, surface, subsurface, space, etc) */
   this.domain = 0;

   /** class of environmental entity */
   this.entityClass = 0;

   /** category of entity */
   this.category = 0;

   /** subcategory of entity */
   this.subcategory = 0;

   /** specific info based on subcategory field */
   this.specific = 0;

   this.extra = 0;

  dis.EnvironmentType.prototype.initFromBinary = function(inputStream)
  {
       this.entityKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.entityClass = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.specific = inputStream.readUByte();
       this.extra = inputStream.readUByte();
  };

  dis.EnvironmentType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.entityKind);
       outputStream.writeUByte(this.domain);
       outputStream.writeUShort(this.entityClass);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
       outputStream.writeUByte(this.specific);
       outputStream.writeUByte(this.extra);
  };
}; // end of class

 // node.js module support
exports.EnvironmentType = dis.EnvironmentType;

// End of EnvironmentType class

/**
 * Three floating point values representing an orientation, psi, theta, and phi, aka the euler angles, in radians. Section 6.2.33
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EulerAngles = function()
{
   this.psi = 0;

   this.theta = 0;

   this.phi = 0;

  dis.EulerAngles.prototype.initFromBinary = function(inputStream)
  {
       this.psi = inputStream.readFloat32();
       this.theta = inputStream.readFloat32();
       this.phi = inputStream.readFloat32();
  };

  dis.EulerAngles.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.psi);
       outputStream.writeFloat32(this.theta);
       outputStream.writeFloat32(this.phi);
  };
}; // end of class

 // node.js module support
exports.EulerAngles = dis.EulerAngles;

// End of EulerAngles class

/**
 * Identifies an event in the world. Use this format for every PDU EXCEPT the LiveEntityPdu. Section 6.2.34.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EventIdentifier = function()
{
   /** Site and application IDs */
   this.simulationAddress = new dis.SimulationAddress(); 

   this.eventNumber = 0;

  dis.EventIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.eventNumber = inputStream.readUShort();
  };

  dis.EventIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.eventNumber);
  };
}; // end of class

 // node.js module support
exports.EventIdentifier = dis.EventIdentifier;

// End of EventIdentifier class

/**
 * Identifies an event in the world. Use this format for ONLY the LiveEntityPdu. Section 6.2.34.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EventIdentifierLiveEntity = function()
{
   this.siteNumber = 0;

   this.applicationNumber = 0;

   this.eventNumber = 0;

  dis.EventIdentifierLiveEntity.prototype.initFromBinary = function(inputStream)
  {
       this.siteNumber = inputStream.readUByte();
       this.applicationNumber = inputStream.readUByte();
       this.eventNumber = inputStream.readUShort();
  };

  dis.EventIdentifierLiveEntity.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.siteNumber);
       outputStream.writeUByte(this.applicationNumber);
       outputStream.writeUShort(this.eventNumber);
  };
}; // end of class

 // node.js module support
exports.EventIdentifierLiveEntity = dis.EventIdentifierLiveEntity;

// End of EventIdentifierLiveEntity class

/**
 *  Reports occurance of a significant event to the simulation manager. Section 7.5.12. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EventReportPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 21;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** Type of event */
   this.eventType = 0;

   /** padding */
   this.padding1 = 0;

   /** Number of fixed datum records */
   this.numberOfFixedDatumRecords = 0;

   /** Number of variable datum records */
   this.numberOfVariableDatumRecords = 0;

   /** variable length list of fixed datums */
    this.fixedDatums = new Array();
 
   /** variable length list of variable length datums */
    this.variableDatums = new Array();
 
  dis.EventReportPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.eventType = inputStream.readUInt();
       this.padding1 = inputStream.readUInt();
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatums.push(anX);
       }

  };

  dis.EventReportPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.eventType);
       outputStream.writeUInt(this.padding1);
       outputStream.writeUInt(this.numberOfFixedDatumRecords);
       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.fixedDatums.length; idx++)
       {
           fixedDatums[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatums.length; idx++)
       {
           variableDatums[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.EventReportPdu = dis.EventReportPdu;

// End of EventReportPdu class

/**
 * Section 5.3.12.11: reports the occurance of a significatnt event to the simulation manager. Needs manual     intervention to fix padding in variable datums. UNFINISHED.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.EventReportReliablePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 61;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Object originatig the request */
   this.originatingEntityID = new dis.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis.EntityID(); 

   /** Event type */
   this.eventType = 0;

   /** padding */
   this.pad1 = 0;

   /** Fixed datum record count */
   this.numberOfFixedDatumRecords = 0;

   /** variable datum record count */
   this.numberOfVariableDatumRecords = 0;

   /** Fixed datum records */
    this.fixedDatumRecords = new Array();
 
   /** Variable datum records */
    this.variableDatumRecords = new Array();
 
  dis.EventReportReliablePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.eventType = inputStream.readUShort();
       this.pad1 = inputStream.readUInt();
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatumRecords.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumRecords.push(anX);
       }

  };

  dis.EventReportReliablePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.eventType);
       outputStream.writeUInt(this.pad1);
       outputStream.writeUInt(this.numberOfFixedDatumRecords);
       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.fixedDatumRecords.length; idx++)
       {
           fixedDatumRecords[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatumRecords.length; idx++)
       {
           variableDatumRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.EventReportReliablePdu = dis.EventReportReliablePdu;

// End of EventReportReliablePdu class

/**
 * An entity's expendable (chaff, flares, etc) information. Section 6.2.36
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.Expendable = function()
{
   /** Type of expendable */
   this.expendable = new dis.EntityType(); 

   this.station = 0;

   this.quantity = 0;

   this.expendableStatus = 0;

   this.padding = 0;

  dis.Expendable.prototype.initFromBinary = function(inputStream)
  {
       this.expendable.initFromBinary(inputStream);
       this.station = inputStream.readUInt();
       this.quantity = inputStream.readUShort();
       this.expendableStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.Expendable.prototype.encodeToBinary = function(outputStream)
  {
       this.expendable.encodeToBinary(outputStream);
       outputStream.writeUInt(this.station);
       outputStream.writeUShort(this.quantity);
       outputStream.writeUByte(this.expendableStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.Expendable = dis.Expendable;

// End of Expendable class

/**
 * Burst of chaff or expendible device. Section 6.2.19.4
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ExpendableDescriptor = function()
{
   /** Type of the object that exploded */
   this.expendableType = new dis.EntityType(); 

   /** Padding */
   this.padding = 0;

  dis.ExpendableDescriptor.prototype.initFromBinary = function(inputStream)
  {
       this.expendableType.initFromBinary(inputStream);
       this.padding = inputStream.readLong();
  };

  dis.ExpendableDescriptor.prototype.encodeToBinary = function(outputStream)
  {
       this.expendableType.encodeToBinary(outputStream);
       outputStream.writeLong(this.padding);
  };
}; // end of class

 // node.js module support
exports.ExpendableDescriptor = dis.ExpendableDescriptor;

// End of ExpendableDescriptor class

/**
 * An entity's expendable (chaff, flares, etc) information. Section 6.2.37
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ExpendableReload = function()
{
   /** Type of expendable */
   this.expendable = new dis.EntityType(); 

   this.station = 0;

   this.standardQuantity = 0;

   this.maximumQuantity = 0;

   this.standardQuantityReloadTime = 0;

   this.maximumQuantityReloadTime = 0;

  dis.ExpendableReload.prototype.initFromBinary = function(inputStream)
  {
       this.expendable.initFromBinary(inputStream);
       this.station = inputStream.readUInt();
       this.standardQuantity = inputStream.readUShort();
       this.maximumQuantity = inputStream.readUShort();
       this.standardQuantityReloadTime = inputStream.readUInt();
       this.maximumQuantityReloadTime = inputStream.readUInt();
  };

  dis.ExpendableReload.prototype.encodeToBinary = function(outputStream)
  {
       this.expendable.encodeToBinary(outputStream);
       outputStream.writeUInt(this.station);
       outputStream.writeUShort(this.standardQuantity);
       outputStream.writeUShort(this.maximumQuantity);
       outputStream.writeUInt(this.standardQuantityReloadTime);
       outputStream.writeUInt(this.maximumQuantityReloadTime);
  };
}; // end of class

 // node.js module support
exports.ExpendableReload = dis.ExpendableReload;

// End of ExpendableReload class

/**
 * Explosion of a non-munition. Section 6.2.19.3
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ExplosionDescriptor = function()
{
   /** Type of the object that exploded. See 6.2.30 */
   this.explodingObject = new dis.EntityType(); 

   /** Material that exploded. Can be grain dust, tnt, gasoline, etc. Enumeration */
   this.explosiveMaterial = 0;

   /** padding */
   this.padding = 0;

   /** Force of explosion, in equivalent KG of TNT */
   this.explosiveForce = 0;

  dis.ExplosionDescriptor.prototype.initFromBinary = function(inputStream)
  {
       this.explodingObject.initFromBinary(inputStream);
       this.explosiveMaterial = inputStream.readUShort();
       this.padding = inputStream.readUShort();
       this.explosiveForce = inputStream.readFloat32();
  };

  dis.ExplosionDescriptor.prototype.encodeToBinary = function(outputStream)
  {
       this.explodingObject.encodeToBinary(outputStream);
       outputStream.writeUShort(this.explosiveMaterial);
       outputStream.writeUShort(this.padding);
       outputStream.writeFloat32(this.explosiveForce);
  };
}; // end of class

 // node.js module support
exports.ExplosionDescriptor = dis.ExplosionDescriptor;

// End of ExplosionDescriptor class

/**
 * The False Targets attribute record shall be used to communicate discrete values that are associated with false targets jamming that cannot be referenced to an emitter mode. The values provided in the False Targets attri- bute record shall be considered valid only for the victim radar beams listed in the jamming beam's Track/Jam Data records (provided in the associated Electromagnetic Emission PDU). Section 6.2.21.3
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.FalseTargetsAttribute = function()
{
   this.recordType = 3502;

   this.recordLength = 40;

   this.padding = 0;

   this.emitterNumber = 0;

   this.beamNumber = 0;

   this.stateIndicator = 0;

   this.padding2 = 0;

   this.falseTargetCount = 0;

   this.walkSpeed = 0;

   this.walkAcceleration = 0;

   this.maximumWalkDistance = 0;

   this.keepTime = 0;

   this.echoSpacing = 0;

  dis.FalseTargetsAttribute.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.padding = inputStream.readUShort();
       this.emitterNumber = inputStream.readUByte();
       this.beamNumber = inputStream.readUByte();
       this.stateIndicator = inputStream.readUByte();
       this.padding2 = inputStream.readUByte();
       this.falseTargetCount = inputStream.readUShort();
       this.walkSpeed = inputStream.readFloat32();
       this.walkAcceleration = inputStream.readFloat32();
       this.maximumWalkDistance = inputStream.readFloat32();
       this.keepTime = inputStream.readFloat32();
       this.echoSpacing = inputStream.readFloat32();
  };

  dis.FalseTargetsAttribute.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUShort(this.padding);
       outputStream.writeUByte(this.emitterNumber);
       outputStream.writeUByte(this.beamNumber);
       outputStream.writeUByte(this.stateIndicator);
       outputStream.writeUByte(this.padding2);
       outputStream.writeUShort(this.falseTargetCount);
       outputStream.writeFloat32(this.walkSpeed);
       outputStream.writeFloat32(this.walkAcceleration);
       outputStream.writeFloat32(this.maximumWalkDistance);
       outputStream.writeFloat32(this.keepTime);
       outputStream.writeFloat32(this.echoSpacing);
  };
}; // end of class

 // node.js module support
exports.FalseTargetsAttribute = dis.FalseTargetsAttribute;

// End of FalseTargetsAttribute class

/**
 * Represents the postion and state of one entity in the world. This is identical in function to entity state pdu, but generates less garbage to collect in the Java world. Section 7.2.2. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.FastEntityStatePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 1;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 1;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** The site ID */
   this.site = 0;

   /** The application ID */
   this.application = 0;

   /** the entity ID */
   this.entity = 0;

   /** what force this entity is affiliated with, eg red, blue, neutral, etc */
   this.forceID = 0;

   /** How many variable (nee articulation) parameters are in the variable length list */
   this.numberOfVariableParameters = 0;

   /** Kind of entity */
   this.entityKind = 0;

   /** Domain of entity (air, surface, subsurface, space, etc) */
   this.domain = 0;

   /** country to which the design of the entity is attributed */
   this.country = 0;

   /** category of entity */
   this.category = 0;

   /** subcategory of entity */
   this.subcategory = 0;

   /** specific info based on subcategory field */
   this.specific = 0;

   this.extra = 0;

   /** Kind of entity */
   this.altEntityKind = 0;

   /** Domain of entity (air, surface, subsurface, space, etc) */
   this.altDomain = 0;

   /** country to which the design of the entity is attributed */
   this.altCountry = 0;

   /** category of entity */
   this.altCategory = 0;

   /** subcategory of entity */
   this.altSubcategory = 0;

   /** specific info based on subcategory field */
   this.altSpecific = 0;

   this.altExtra = 0;

   /** X velo */
   this.xVelocity = 0;

   /** y Value */
   this.yVelocity = 0;

   /** Z value */
   this.zVelocity = 0;

   /** X value */
   this.xLocation = 0;

   /** y Value */
   this.yLocation = 0;

   /** Z value */
   this.zLocation = 0;

   this.psi = 0;

   this.theta = 0;

   this.phi = 0;

   /** a series of bit flags that are used to help draw the entity, such as smoking, on fire, etc. */
   this.entityAppearance = 0;

   /** enumeration of what dead reckoning algorighm to use */
   this.deadReckoningAlgorithm = 0;

   /** other parameters to use in the dead reckoning algorithm */
   this.otherParameters = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /** X value */
   this.xAcceleration = 0;

   /** y Value */
   this.yAcceleration = 0;

   /** Z value */
   this.zAcceleration = 0;

   /** X value */
   this.xAngularVelocity = 0;

   /** y Value */
   this.yAngularVelocity = 0;

   /** Z value */
   this.zAngularVelocity = 0;

   /** characters that can be used for debugging, or to draw unique strings on the side of entities in the world */
   this.marking = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /** a series of bit flags */
   this.capabilities = 0;

   /** variable length list of variable parameters. In earlier versions of DIS these were known as articulation parameters */
    this.variableParameters = new Array();
 
  dis.FastEntityStatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.site = inputStream.readUShort();
       this.application = inputStream.readUShort();
       this.entity = inputStream.readUShort();
       this.forceID = inputStream.readUByte();
       this.numberOfVariableParameters = inputStream.readByte();
       this.entityKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.country = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.specific = inputStream.readUByte();
       this.extra = inputStream.readUByte();
       this.altEntityKind = inputStream.readUByte();
       this.altDomain = inputStream.readUByte();
       this.altCountry = inputStream.readUShort();
       this.altCategory = inputStream.readUByte();
       this.altSubcategory = inputStream.readUByte();
       this.altSpecific = inputStream.readUByte();
       this.altExtra = inputStream.readUByte();
       this.xVelocity = inputStream.readFloat32();
       this.yVelocity = inputStream.readFloat32();
       this.zVelocity = inputStream.readFloat32();
       this.xLocation = inputStream.readFloat64();
       this.yLocation = inputStream.readFloat64();
       this.zLocation = inputStream.readFloat64();
       this.psi = inputStream.readFloat32();
       this.theta = inputStream.readFloat32();
       this.phi = inputStream.readFloat32();
       this.entityAppearance = inputStream.readInt();
       this.deadReckoningAlgorithm = inputStream.readUByte();
       for(var idx = 0; idx < 15; idx++)
       {
          this.otherParameters[ idx ] = inputStream.readByte();
       }
       this.xAcceleration = inputStream.readFloat32();
       this.yAcceleration = inputStream.readFloat32();
       this.zAcceleration = inputStream.readFloat32();
       this.xAngularVelocity = inputStream.readFloat32();
       this.yAngularVelocity = inputStream.readFloat32();
       this.zAngularVelocity = inputStream.readFloat32();
       for(var idx = 0; idx < 12; idx++)
       {
          this.marking[ idx ] = inputStream.readByte();
       }
       this.capabilities = inputStream.readInt();
       for(var idx = 0; idx < this.numberOfVariableParameters; idx++)
       {
           var anX = new dis.VariableParameter();
           anX.initFromBinary(inputStream);
           this.variableParameters.push(anX);
       }

  };

  dis.FastEntityStatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       outputStream.writeUShort(this.site);
       outputStream.writeUShort(this.application);
       outputStream.writeUShort(this.entity);
       outputStream.writeUByte(this.forceID);
       outputStream.writeByte(this.numberOfVariableParameters);
       outputStream.writeUByte(this.entityKind);
       outputStream.writeUByte(this.domain);
       outputStream.writeUShort(this.country);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
       outputStream.writeUByte(this.specific);
       outputStream.writeUByte(this.extra);
       outputStream.writeUByte(this.altEntityKind);
       outputStream.writeUByte(this.altDomain);
       outputStream.writeUShort(this.altCountry);
       outputStream.writeUByte(this.altCategory);
       outputStream.writeUByte(this.altSubcategory);
       outputStream.writeUByte(this.altSpecific);
       outputStream.writeUByte(this.altExtra);
       outputStream.writeFloat32(this.xVelocity);
       outputStream.writeFloat32(this.yVelocity);
       outputStream.writeFloat32(this.zVelocity);
       outputStream.writeFloat64(this.xLocation);
       outputStream.writeFloat64(this.yLocation);
       outputStream.writeFloat64(this.zLocation);
       outputStream.writeFloat32(this.psi);
       outputStream.writeFloat32(this.theta);
       outputStream.writeFloat32(this.phi);
       outputStream.writeInt(this.entityAppearance);
       outputStream.writeUByte(this.deadReckoningAlgorithm);
       for(var idx = 0; idx < 15; idx++)
       {
          outputStream.writeByte(this.otherParameters[ idx ] );
       }
       outputStream.writeFloat32(this.xAcceleration);
       outputStream.writeFloat32(this.yAcceleration);
       outputStream.writeFloat32(this.zAcceleration);
       outputStream.writeFloat32(this.xAngularVelocity);
       outputStream.writeFloat32(this.yAngularVelocity);
       outputStream.writeFloat32(this.zAngularVelocity);
       for(var idx = 0; idx < 12; idx++)
       {
          outputStream.writeByte(this.marking[ idx ] );
       }
       outputStream.writeInt(this.capabilities);
       for(var idx = 0; idx < this.variableParameters.length; idx++)
       {
           variableParameters[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.FastEntityStatePdu = dis.FastEntityStatePdu;

// End of FastEntityStatePdu class

/**
 *  The firing of a weapon or expendable shall be communicated by issuing a Fire PDU. Sectioin 7.3.2. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.FirePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 2;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 2;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that shot */
   this.firingEntityID = new dis.EntityID(); 

   /** ID of the entity that is being shot at */
   this.targetEntityID = new dis.EntityID(); 

   /** This field shall specify the entity identification of the fired munition or expendable. This field shall be represented by an Entity Identifier record (see 6.2.28). */
   this.munitionExpendibleID = new dis.EntityID(); 

   /** This field shall contain an identification generated by the firing entity to associate related firing and detonation events. This field shall be represented by an Event Identifier record (see 6.2.34). */
   this.eventID = new dis.EventIdentifier(); 

   /** This field shall identify the fire mission (see 5.4.3.3). This field shall be representedby a 32-bit unsigned integer. */
   this.fireMissionIndex = 0;

   /** This field shall specify the location, in world coordinates, from which the munition was launched, and shall be represented by a World Coordinates record (see 6.2.97). */
   this.locationInWorldCoordinates = new dis.Vector3Double(); 

   /** This field shall describe the firing or launch of a munition or expendable represented by one of the following types of Descriptor records: Munition Descriptor (6.2.20.2) or Expendable Descriptor (6.2.20.4). */
   this.descriptor = new dis.MunitionDescriptor(); 

   /** This field shall specify the velocity of the fired munition at the point when the issuing simulation application intends the externally visible effects of the launch (e.g. exhaust plume or muzzle blast) to first become apparent. The velocity shall be represented in world coordinates. This field shall be represented by a Linear Velocity Vector record [see 6.2.95 item c)]. */
   this.velocity = new dis.Vector3Float(); 

   /** This field shall specify the range that an entity’s fire control system has assumed in computing the fire control solution. This field shall be represented by a 32-bit floating point number in meters. For systems where range is unknown or unavailable, this field shall contain a value of zero. */
   this.range = 0;

  dis.FirePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.firingEntityID.initFromBinary(inputStream);
       this.targetEntityID.initFromBinary(inputStream);
       this.munitionExpendibleID.initFromBinary(inputStream);
       this.eventID.initFromBinary(inputStream);
       this.fireMissionIndex = inputStream.readUInt();
       this.locationInWorldCoordinates.initFromBinary(inputStream);
       this.descriptor.initFromBinary(inputStream);
       this.velocity.initFromBinary(inputStream);
       this.range = inputStream.readFloat32();
  };

  dis.FirePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.firingEntityID.encodeToBinary(outputStream);
       this.targetEntityID.encodeToBinary(outputStream);
       this.munitionExpendibleID.encodeToBinary(outputStream);
       this.eventID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.fireMissionIndex);
       this.locationInWorldCoordinates.encodeToBinary(outputStream);
       this.descriptor.encodeToBinary(outputStream);
       this.velocity.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.range);
  };
}; // end of class

 // node.js module support
exports.FirePdu = dis.FirePdu;

// End of FirePdu class

/**
 * Fixed Datum Record. Section 6.2.38
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.FixedDatum = function()
{
   /** ID of the fixed datum, an enumeration */
   this.fixedDatumID = 0;

   /** Value for the fixed datum */
   this.fixedDatumValue = 0;

  dis.FixedDatum.prototype.initFromBinary = function(inputStream)
  {
       this.fixedDatumID = inputStream.readUInt();
       this.fixedDatumValue = inputStream.readUInt();
  };

  dis.FixedDatum.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.fixedDatumID);
       outputStream.writeUInt(this.fixedDatumValue);
  };
}; // end of class

 // node.js module support
exports.FixedDatum = dis.FixedDatum;

// End of FixedDatum class

/**
 * 32 bit piece of data
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.FourByteChunk = function()
{
   /** four bytes of arbitrary data */
   this.otherParameters = new Array(0, 0, 0, 0);

  dis.FourByteChunk.prototype.initFromBinary = function(inputStream)
  {
       for(var idx = 0; idx < 4; idx++)
       {
          this.otherParameters[ idx ] = inputStream.readByte();
       }
  };

  dis.FourByteChunk.prototype.encodeToBinary = function(outputStream)
  {
       for(var idx = 0; idx < 4; idx++)
       {
          outputStream.writeByte(this.otherParameters[ idx ] );
       }
  };
}; // end of class

 // node.js module support
exports.FourByteChunk = dis.FourByteChunk;

// End of FourByteChunk class

/**
 * Basic operational data for IFF. Section 6.2.40.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.FundamentalOperationalData = function()
{
   /** system status */
   this.systemStatus = 0;

   /** data field 1 */
   this.dataField1 = 0;

   /** eight boolean fields */
   this.informationLayers = 0;

   /** enumeration */
   this.dataField2 = 0;

   /** parameter, enumeration */
   this.parameter1 = 0;

   /** parameter, enumeration */
   this.parameter2 = 0;

   /** parameter, enumeration */
   this.parameter3 = 0;

   /** parameter, enumeration */
   this.parameter4 = 0;

   /** parameter, enumeration */
   this.parameter5 = 0;

   /** parameter, enumeration */
   this.parameter6 = 0;

  dis.FundamentalOperationalData.prototype.initFromBinary = function(inputStream)
  {
       this.systemStatus = inputStream.readUByte();
       this.dataField1 = inputStream.readUByte();
       this.informationLayers = inputStream.readUByte();
       this.dataField2 = inputStream.readUByte();
       this.parameter1 = inputStream.readUShort();
       this.parameter2 = inputStream.readUShort();
       this.parameter3 = inputStream.readUShort();
       this.parameter4 = inputStream.readUShort();
       this.parameter5 = inputStream.readUShort();
       this.parameter6 = inputStream.readUShort();
  };

  dis.FundamentalOperationalData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.systemStatus);
       outputStream.writeUByte(this.dataField1);
       outputStream.writeUByte(this.informationLayers);
       outputStream.writeUByte(this.dataField2);
       outputStream.writeUShort(this.parameter1);
       outputStream.writeUShort(this.parameter2);
       outputStream.writeUShort(this.parameter3);
       outputStream.writeUShort(this.parameter4);
       outputStream.writeUShort(this.parameter5);
       outputStream.writeUShort(this.parameter6);
  };
}; // end of class

 // node.js module support
exports.FundamentalOperationalData = dis.FundamentalOperationalData;

// End of FundamentalOperationalData class

/**
 * Grid axis record for fixed data. Section 6.2.41
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.GridAxis = function()
{
   /** coordinate of the grid origin or initial value */
   this.domainInitialXi = 0;

   /** coordinate of the endpoint or final value */
   this.domainFinalXi = 0;

   /** The number of grid points along the Xi domain axis for the enviornmental state data */
   this.domainPointsXi = 0;

   /** interleaf factor along the domain axis. */
   this.interleafFactor = 0;

   /** type of grid axis */
   this.axisType = 0;

   /** Number of grid locations along Xi axis */
   this.numberOfPointsOnXiAxis = 0;

   /** initial grid point for the current pdu */
   this.initialIndex = 0;

  dis.GridAxis.prototype.initFromBinary = function(inputStream)
  {
       this.domainInitialXi = inputStream.readFloat64();
       this.domainFinalXi = inputStream.readFloat64();
       this.domainPointsXi = inputStream.readUShort();
       this.interleafFactor = inputStream.readUByte();
       this.axisType = inputStream.readUByte();
       this.numberOfPointsOnXiAxis = inputStream.readUShort();
       this.initialIndex = inputStream.readUShort();
  };

  dis.GridAxis.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat64(this.domainInitialXi);
       outputStream.writeFloat64(this.domainFinalXi);
       outputStream.writeUShort(this.domainPointsXi);
       outputStream.writeUByte(this.interleafFactor);
       outputStream.writeUByte(this.axisType);
       outputStream.writeUShort(this.numberOfPointsOnXiAxis);
       outputStream.writeUShort(this.initialIndex);
  };
}; // end of class

 // node.js module support
exports.GridAxis = dis.GridAxis;

// End of GridAxis class

/**
 * Grid axis descriptor fo variable spacing axis data. NOT COMPLETE. Need padding to 64 bit boundary.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.GridAxisDescriptorVariable = function()
{
   /** coordinate of the grid origin or initial value */
   this.domainInitialXi = 0;

   /** coordinate of the endpoint or final value */
   this.domainFinalXi = 0;

   /** The number of grid points along the Xi domain axis for the enviornmental state data */
   this.domainPointsXi = 0;

   /** interleaf factor along the domain axis. */
   this.interleafFactor = 0;

   /** type of grid axis */
   this.axisType = 0;

   /** Number of grid locations along Xi axis */
   this.numberOfPointsOnXiAxis = 0;

   /** initial grid point for the current pdu */
   this.initialIndex = 0;

   /** value that linearly scales the coordinates of the grid locations for the xi axis */
   this.coordinateScaleXi = 0;

   /** The constant offset value that shall be applied to the grid locations for the xi axis */
   this.coordinateOffsetXi = 0.0;

   /** list of coordinates */
    this.xiValues = new Array();
 
  dis.GridAxisDescriptorVariable.prototype.initFromBinary = function(inputStream)
  {
       this.domainInitialXi = inputStream.readFloat64();
       this.domainFinalXi = inputStream.readFloat64();
       this.domainPointsXi = inputStream.readUShort();
       this.interleafFactor = inputStream.readUByte();
       this.axisType = inputStream.readUByte();
       this.numberOfPointsOnXiAxis = inputStream.readUShort();
       this.initialIndex = inputStream.readUShort();
       this.coordinateScaleXi = inputStream.readFloat64();
       this.coordinateOffsetXi = inputStream.readFloat64();
       for(var idx = 0; idx < this.numberOfPointsOnXiAxis; idx++)
       {
           var anX = new dis.TwoByteChunk();
           anX.initFromBinary(inputStream);
           this.xiValues.push(anX);
       }

  };

  dis.GridAxisDescriptorVariable.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat64(this.domainInitialXi);
       outputStream.writeFloat64(this.domainFinalXi);
       outputStream.writeUShort(this.domainPointsXi);
       outputStream.writeUByte(this.interleafFactor);
       outputStream.writeUByte(this.axisType);
       outputStream.writeUShort(this.numberOfPointsOnXiAxis);
       outputStream.writeUShort(this.initialIndex);
       outputStream.writeFloat64(this.coordinateScaleXi);
       outputStream.writeFloat64(this.coordinateOffsetXi);
       for(var idx = 0; idx < this.xiValues.length; idx++)
       {
           xiValues[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.GridAxisDescriptorVariable = dis.GridAxisDescriptorVariable;

// End of GridAxisDescriptorVariable class

/**
 * Unique designation of a group of entities contained in the isGroupOfPdu. Represents a group of entities rather than a single entity. Section 6.2.43
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.GroupID = function()
{
   /** Simulation address (site and application number) */
   this.simulationAddress = new dis.EntityType(); 

   /** group number */
   this.groupNumber = 0;

  dis.GroupID.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.groupNumber = inputStream.readUShort();
  };

  dis.GroupID.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.groupNumber);
  };
}; // end of class

 // node.js module support
exports.GroupID = dis.GroupID;

// End of GroupID class

/**
 * repeating element if IFF Data specification record
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.IFFData = function()
{
   /** enumeration for type of record */
   this.recordType = 0;

   /** length of record. Should be padded to 32 bit boundary. */
   this.recordLength = 0;

   /** IFF data. */
    this.iffData = new Array();
 
  dis.IFFData.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       for(var idx = 0; idx < this.recordLength; idx++)
       {
           var anX = new dis.OneByteChunk();
           anX.initFromBinary(inputStream);
           this.iffData.push(anX);
       }

  };

  dis.IFFData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       for(var idx = 0; idx < this.iffData.length; idx++)
       {
           iffData[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.IFFData = dis.IFFData;

// End of IFFData class

/**
 * Fundamental IFF atc data. Section 6.2.45
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.IFFFundamentalParameterData = function()
{
   /** ERP */
   this.erp = 0;

   /** frequency */
   this.frequency = 0;

   /** pgrf */
   this.pgrf = 0;

   /** Pulse width */
   this.pulseWidth = 0;

   /** Burst length */
   this.burstLength = 0;

   /** Applicable modes enumeration */
   this.applicableModes = 0;

   /** System-specific data */
   this.systemSpecificData = new Array(0, 0, 0);

  dis.IFFFundamentalParameterData.prototype.initFromBinary = function(inputStream)
  {
       this.erp = inputStream.readFloat32();
       this.frequency = inputStream.readFloat32();
       this.pgrf = inputStream.readFloat32();
       this.pulseWidth = inputStream.readFloat32();
       this.burstLength = inputStream.readUInt();
       this.applicableModes = inputStream.readUByte();
       for(var idx = 0; idx < 3; idx++)
       {
          this.systemSpecificData[ idx ] = inputStream.readUByte();
       }
  };

  dis.IFFFundamentalParameterData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.erp);
       outputStream.writeFloat32(this.frequency);
       outputStream.writeFloat32(this.pgrf);
       outputStream.writeFloat32(this.pulseWidth);
       outputStream.writeUInt(this.burstLength);
       outputStream.writeUByte(this.applicableModes);
       for(var idx = 0; idx < 3; idx++)
       {
          outputStream.writeUByte(this.systemSpecificData[ idx ] );
       }
  };
}; // end of class

 // node.js module support
exports.IFFFundamentalParameterData = dis.IFFFundamentalParameterData;

// End of IFFFundamentalParameterData class

/**
 * A communications node that is part of a simulted communcations network. Section 6.2.49.2
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.IOCommunicationsNode = function()
{
   this.recordType = 5501;

   this.recordLength = 16;

   this.communcationsNodeType = 0;

   this.padding = 0;

   this.communicationsNodeID = new dis.CommunicationsNodeID(); 

  dis.IOCommunicationsNode.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.communcationsNodeType = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.communicationsNodeID.initFromBinary(inputStream);
  };

  dis.IOCommunicationsNode.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUByte(this.communcationsNodeType);
       outputStream.writeUByte(this.padding);
       this.communicationsNodeID.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.IOCommunicationsNode = dis.IOCommunicationsNode;

// End of IOCommunicationsNode class

/**
 * Effect of IO on an entity. Section 6.2.49.3
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.IOEffect = function()
{
   this.recordType = 5500;

   this.recordLength = 16;

   this.ioStatus = 0;

   this.ioLinkType = 0;

   this.ioEffect = new dis.EntityID(); 

   this.ioEffectDutyCycle = 0;

   this.ioEffectDuration = 0;

   this.ioProcess = 0;

   this.padding = 0;

  dis.IOEffect.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.ioStatus = inputStream.readUByte();
       this.ioLinkType = inputStream.readUByte();
       this.ioEffect.initFromBinary(inputStream);
       this.ioEffectDutyCycle = inputStream.readUByte();
       this.ioEffectDuration = inputStream.readUShort();
       this.ioProcess = inputStream.readUShort();
       this.padding = inputStream.readUShort();
  };

  dis.IOEffect.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUByte(this.ioStatus);
       outputStream.writeUByte(this.ioLinkType);
       this.ioEffect.encodeToBinary(outputStream);
       outputStream.writeUByte(this.ioEffectDutyCycle);
       outputStream.writeUShort(this.ioEffectDuration);
       outputStream.writeUShort(this.ioProcess);
       outputStream.writeUShort(this.padding);
  };
}; // end of class

 // node.js module support
exports.IOEffect = dis.IOEffect;

// End of IOEffect class

/**
 * Requires hand coding to be useful. Section 6.2.43
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.IffDataSpecification = function()
{
   /** Number of iff records */
   this.numberOfIffDataRecords = 0;

   /** IFF data records */
    this.iffDataRecords = new Array();
 
  dis.IffDataSpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfIffDataRecords = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfIffDataRecords; idx++)
       {
           var anX = new dis.IFFData();
           anX.initFromBinary(inputStream);
           this.iffDataRecords.push(anX);
       }

  };

  dis.IffDataSpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.numberOfIffDataRecords);
       for(var idx = 0; idx < this.iffDataRecords.length; idx++)
       {
           iffDataRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.IffDataSpecification = dis.IffDataSpecification;

// End of IffDataSpecification class

/**
 * Intercom communcations parameters. Section 6.2.47.  This requires hand coding
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.IntercomCommunicationsParameters = function()
{
   /** Type of intercom parameters record */
   this.recordType = 0;

   /** length of record */
   this.recordLength = 0;

   /** This is a placeholder. */
   this.recordSpecificField = 0;

  dis.IntercomCommunicationsParameters.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUShort();
       this.recordLength = inputStream.readUShort();
       this.recordSpecificField = inputStream.readUInt();
  };

  dis.IntercomCommunicationsParameters.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUInt(this.recordSpecificField);
  };
}; // end of class

 // node.js module support
exports.IntercomCommunicationsParameters = dis.IntercomCommunicationsParameters;

// End of IntercomCommunicationsParameters class

/**
 *  Detailed inofrmation about the state of an intercom device and the actions it is requestion         of another intercom device, or the response to a requested action. Required manual intervention to fix the intercom parameters,        which can be of varialbe length. Section 7.7.5 UNFINSISHED
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.IntercomControlPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 32;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 4;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** control type */
   this.controlType = 0;

   /** control type */
   this.communicationsChannelType = 0;

   /** Source entity ID */
   this.sourceEntityID = new dis.EntityID(); 

   /** The specific intercom device being simulated within an entity. */
   this.sourceCommunicationsDeviceID = 0;

   /** Line number to which the intercom control refers */
   this.sourceLineID = 0;

   /** priority of this message relative to transmissons from other intercom devices */
   this.transmitPriority = 0;

   /** current transmit state of the line */
   this.transmitLineState = 0;

   /** detailed type requested. */
   this.command = 0;

   /** eid of the entity that has created this intercom channel. */
   this.masterEntityID = new dis.EntityID(); 

   /** specific intercom device that has created this intercom channel */
   this.masterCommunicationsDeviceID = 0;

   /** number of intercom parameters */
   this.intercomParametersLength = 0;

   /** ^^^This is wrong the length of the data field is variable. Using a long for now. */
    this.intercomParameters = new Array();
 
  dis.IntercomControlPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.controlType = inputStream.readUByte();
       this.communicationsChannelType = inputStream.readUByte();
       this.sourceEntityID.initFromBinary(inputStream);
       this.sourceCommunicationsDeviceID = inputStream.readUByte();
       this.sourceLineID = inputStream.readUByte();
       this.transmitPriority = inputStream.readUByte();
       this.transmitLineState = inputStream.readUByte();
       this.command = inputStream.readUByte();
       this.masterEntityID.initFromBinary(inputStream);
       this.masterCommunicationsDeviceID = inputStream.readUShort();
       this.intercomParametersLength = inputStream.readUInt();
       for(var idx = 0; idx < this.intercomParametersLength; idx++)
       {
           var anX = new dis.IntercomCommunicationsParameters();
           anX.initFromBinary(inputStream);
           this.intercomParameters.push(anX);
       }

  };

  dis.IntercomControlPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       outputStream.writeUByte(this.controlType);
       outputStream.writeUByte(this.communicationsChannelType);
       this.sourceEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.sourceCommunicationsDeviceID);
       outputStream.writeUByte(this.sourceLineID);
       outputStream.writeUByte(this.transmitPriority);
       outputStream.writeUByte(this.transmitLineState);
       outputStream.writeUByte(this.command);
       this.masterEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.masterCommunicationsDeviceID);
       outputStream.writeUInt(this.intercomParametersLength);
       for(var idx = 0; idx < this.intercomParameters.length; idx++)
       {
           intercomParameters[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.IntercomControlPdu = dis.IntercomControlPdu;

// End of IntercomControlPdu class

/**
 * Unique designation of an attached or unattached intercom in an event or exercirse. Section 6.2.48
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.IntercomIdentifier = function()
{
   this.siteNumber = 0;

   this.applicationNumber = 0;

   this.referenceNumber = 0;

   this.intercomNumber = 0;

  dis.IntercomIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.siteNumber = inputStream.readUShort();
       this.applicationNumber = inputStream.readUShort();
       this.referenceNumber = inputStream.readUShort();
       this.intercomNumber = inputStream.readUShort();
  };

  dis.IntercomIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.siteNumber);
       outputStream.writeUShort(this.applicationNumber);
       outputStream.writeUShort(this.referenceNumber);
       outputStream.writeUShort(this.intercomNumber);
  };
}; // end of class

 // node.js module support
exports.IntercomIdentifier = dis.IntercomIdentifier;

// End of IntercomIdentifier class

/**
 *  Actual transmission of intercome voice data. Section 7.7.5. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.IntercomSignalPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 31;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 4;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** entity ID */
   this.entityID = new dis.EntityID(); 

   /** ID of communications device */
   this.communicationsDeviceID = 0;

   /** encoding scheme */
   this.encodingScheme = 0;

   /** tactical data link type */
   this.tdlType = 0;

   /** sample rate */
   this.sampleRate = 0;

   /** data length */
   this.dataLength = 0;

   /** samples */
   this.samples = 0;

   /** data bytes */
    this.data = new Array();
 
  dis.IntercomSignalPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.entityID.initFromBinary(inputStream);
       this.communicationsDeviceID = inputStream.readUShort();
       this.encodingScheme = inputStream.readUShort();
       this.tdlType = inputStream.readUShort();
       this.sampleRate = inputStream.readUInt();
       this.dataLength = inputStream.readUShort();
       this.samples = inputStream.readUShort();
       for(var idx = 0; idx < this.dataLength; idx++)
       {
           var anX = new dis.OneByteChunk();
           anX.initFromBinary(inputStream);
           this.data.push(anX);
       }

  };

  dis.IntercomSignalPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.entityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.communicationsDeviceID);
       outputStream.writeUShort(this.encodingScheme);
       outputStream.writeUShort(this.tdlType);
       outputStream.writeUInt(this.sampleRate);
       outputStream.writeUShort(this.dataLength);
       outputStream.writeUShort(this.samples);
       for(var idx = 0; idx < this.data.length; idx++)
       {
           data[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.IntercomSignalPdu = dis.IntercomSignalPdu;

// End of IntercomSignalPdu class

/**
 *  The joining of two or more simulation entities is communicated by this PDU. Section 7.8.5 COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.IsPartOfPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 36;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 7;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of entity originating PDU */
   this.orginatingEntityID = new dis.EntityID(); 

   /** ID of entity receiving PDU */
   this.receivingEntityID = new dis.EntityID(); 

   /** relationship of joined parts */
   this.relationship = new dis.Relationship(); 

   /** location of part; centroid of part in host's coordinate system. x=range, y=bearing, z=0 */
   this.partLocation = new dis.Vector3Float(); 

   /** named location */
   this.namedLocationID = new dis.NamedLocationIdentification(); 

   /** entity type */
   this.partEntityType = new dis.EntityType(); 

  dis.IsPartOfPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.orginatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.relationship.initFromBinary(inputStream);
       this.partLocation.initFromBinary(inputStream);
       this.namedLocationID.initFromBinary(inputStream);
       this.partEntityType.initFromBinary(inputStream);
  };

  dis.IsPartOfPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.orginatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.relationship.encodeToBinary(outputStream);
       this.partLocation.encodeToBinary(outputStream);
       this.namedLocationID.encodeToBinary(outputStream);
       this.partEntityType.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.IsPartOfPdu = dis.IsPartOfPdu;

// End of IsPartOfPdu class

/**
 * Jamming technique. Section 6.2.49
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.JammingTechnique = function()
{
   this.kind = 0;

   this.category = 0;

   this.subcategory = 0;

   this.specific = 0;

  dis.JammingTechnique.prototype.initFromBinary = function(inputStream)
  {
       this.kind = inputStream.readUByte();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.specific = inputStream.readUByte();
  };

  dis.JammingTechnique.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.kind);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
       outputStream.writeUByte(this.specific);
  };
}; // end of class

 // node.js module support
exports.JammingTechnique = dis.JammingTechnique;

// End of JammingTechnique class

/**
 * Identity of a communications node. Section 6.2.50
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.LaunchedMunitionRecord = function()
{
   this.fireEventID = new dis.EventIdentifier(); 

   this.padding = 0;

   this.firingEntityID = new dis.EventIdentifier(); 

   this.padding2 = 0;

   this.targetEntityID = new dis.EventIdentifier(); 

   this.padding3 = 0;

   this.targetLocation = new dis.Vector3Double(); 

  dis.LaunchedMunitionRecord.prototype.initFromBinary = function(inputStream)
  {
       this.fireEventID.initFromBinary(inputStream);
       this.padding = inputStream.readUShort();
       this.firingEntityID.initFromBinary(inputStream);
       this.padding2 = inputStream.readUShort();
       this.targetEntityID.initFromBinary(inputStream);
       this.padding3 = inputStream.readUShort();
       this.targetLocation.initFromBinary(inputStream);
  };

  dis.LaunchedMunitionRecord.prototype.encodeToBinary = function(outputStream)
  {
       this.fireEventID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding);
       this.firingEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding2);
       this.targetEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding3);
       this.targetLocation.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.LaunchedMunitionRecord = dis.LaunchedMunitionRecord;

// End of LaunchedMunitionRecord class

/**
 * The identification of the additional information layer number, layer-specific information, and the length of the layer. Section 6.2.51
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.LayerHeader = function()
{
   this.layerNumber = 0;

   /** field shall specify layer-specific information that varies by System Type (see 6.2.86) and Layer Number. */
   this.layerSpecificInformation = 0;

   /** This field shall specify the length in octets of the layer, including the Layer Header record */
   this.length = 0;

  dis.LayerHeader.prototype.initFromBinary = function(inputStream)
  {
       this.layerNumber = inputStream.readUByte();
       this.layerSpecificInformation = inputStream.readUByte();
       this.length = inputStream.readUShort();
  };

  dis.LayerHeader.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.layerNumber);
       outputStream.writeUByte(this.layerSpecificInformation);
       outputStream.writeUShort(this.length);
  };
}; // end of class

 // node.js module support
exports.LayerHeader = dis.LayerHeader;

// End of LayerHeader class

/**
 * : Information abut the addition or modification of a synthecic enviroment object that      is anchored to the terrain with a single point and has size or orientation. Section 7.10.5 COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.LinearObjectStatePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 44;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 9;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Object in synthetic environment */
   this.objectID = new dis.EntityID(); 

   /** Object with which this point object is associated */
   this.referencedObjectID = new dis.EntityID(); 

   /** unique update number of each state transition of an object */
   this.updateNumber = 0;

   /** force ID */
   this.forceID = 0;

   /** number of linear segment parameters */
   this.numberOfSegments = 0;

   /** requesterID */
   this.requesterID = new dis.SimulationAddress(); 

   /** receiver ID */
   this.receivingID = new dis.SimulationAddress(); 

   /** Object type */
   this.objectType = new dis.ObjectType(); 

   /** Linear segment parameters */
    this.linearSegmentParameters = new Array();
 
  dis.LinearObjectStatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.objectID.initFromBinary(inputStream);
       this.referencedObjectID.initFromBinary(inputStream);
       this.updateNumber = inputStream.readUShort();
       this.forceID = inputStream.readUByte();
       this.numberOfSegments = inputStream.readUByte();
       this.requesterID.initFromBinary(inputStream);
       this.receivingID.initFromBinary(inputStream);
       this.objectType.initFromBinary(inputStream);
       for(var idx = 0; idx < this.numberOfSegments; idx++)
       {
           var anX = new dis.LinearSegmentParameter();
           anX.initFromBinary(inputStream);
           this.linearSegmentParameters.push(anX);
       }

  };

  dis.LinearObjectStatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.objectID.encodeToBinary(outputStream);
       this.referencedObjectID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.updateNumber);
       outputStream.writeUByte(this.forceID);
       outputStream.writeUByte(this.numberOfSegments);
       this.requesterID.encodeToBinary(outputStream);
       this.receivingID.encodeToBinary(outputStream);
       this.objectType.encodeToBinary(outputStream);
       for(var idx = 0; idx < this.linearSegmentParameters.length; idx++)
       {
           linearSegmentParameters[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.LinearObjectStatePdu = dis.LinearObjectStatePdu;

// End of LinearObjectStatePdu class

/**
 * The specification of an individual segment of a linear segment synthetic environment object in a Linear Object State PDU Section 6.2.52
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.LinearSegmentParameter = function()
{
   /** the individual segment of the linear segment  */
   this.segmentNumber = 0;

   /**  whether a modification has been made to the point object’s location or orientation */
   this.segmentModification = 0;

   /** general dynamic appearance attributes of the segment. This record shall be defined as a 16-bit record of enumerations. The values defined for this record are included in Section 12 of SISO-REF-010. */
   this.generalSegmentAppearance = 0;

   /** This field shall specify specific dynamic appearance attributes of the segment. This record shall be defined as a 32-bit record of enumerations. */
   this.specificSegmentAppearance = 0;

   /** This field shall specify the location of the linear segment in the simulated world and shall be represented by a World Coordinates record  */
   this.segmentLocation = new dis.Vector3Double(); 

   /** orientation of the linear segment about the segment location and shall be represented by a Euler Angles record  */
   this.segmentOrientation = new dis.EulerAngles(); 

   /** length of the linear segment, in meters, extending in the positive X direction */
   this.segmentLength = 0;

   /** The total width of the linear segment, in meters, shall be specified by a 16-bit unsigned integer. One-half of the width shall extend in the positive Y direction, and one-half of the width shall extend in the negative Y direction. */
   this.segmentWidth = 0;

   /** The height of the linear segment, in meters, above ground shall be specified by a 16-bit unsigned integer. */
   this.segmentHeight = 0;

   /** The depth of the linear segment, in meters, below ground level  */
   this.segmentDepth = 0;

   /** padding */
   this.padding = 0;

  dis.LinearSegmentParameter.prototype.initFromBinary = function(inputStream)
  {
       this.segmentNumber = inputStream.readUByte();
       this.segmentModification = inputStream.readUByte();
       this.generalSegmentAppearance = inputStream.readUShort();
       this.specificSegmentAppearance = inputStream.readUInt();
       this.segmentLocation.initFromBinary(inputStream);
       this.segmentOrientation.initFromBinary(inputStream);
       this.segmentLength = inputStream.readFloat32();
       this.segmentWidth = inputStream.readFloat32();
       this.segmentHeight = inputStream.readFloat32();
       this.segmentDepth = inputStream.readFloat32();
       this.padding = inputStream.readUInt();
  };

  dis.LinearSegmentParameter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.segmentNumber);
       outputStream.writeUByte(this.segmentModification);
       outputStream.writeUShort(this.generalSegmentAppearance);
       outputStream.writeUInt(this.specificSegmentAppearance);
       this.segmentLocation.encodeToBinary(outputStream);
       this.segmentOrientation.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.segmentLength);
       outputStream.writeFloat32(this.segmentWidth);
       outputStream.writeFloat32(this.segmentHeight);
       outputStream.writeFloat32(this.segmentDepth);
       outputStream.writeUInt(this.padding);
  };
}; // end of class

 // node.js module support
exports.LinearSegmentParameter = dis.LinearSegmentParameter;

// End of LinearSegmentParameter class

/**
 * The unique designation of each entity in an event or exercise that is contained in a Live Entity PDU. Section 6.2.54 
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.LiveEntityIdentifier = function()
{
   /** Live Simulation Address record (see 6.2.54)  */
   this.liveSimulationAddress = new dis.LiveSimulationAddress(); 

   /** Live entity number  */
   this.entityNumber = 0;

  dis.LiveEntityIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.liveSimulationAddress.initFromBinary(inputStream);
       this.entityNumber = inputStream.readUShort();
  };

  dis.LiveEntityIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.liveSimulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.entityNumber);
  };
}; // end of class

 // node.js module support
exports.LiveEntityIdentifier = dis.LiveEntityIdentifier;

// End of LiveEntityIdentifier class

/**
 * The live entity PDUs have a header with some different field names, but the same length. Section 9.3.2
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.LiveEntityPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 0;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** Subprotocol used to decode the PDU. Section 13 of EBV. */
   this.subprotocolNumber = 0;

   /** zero-filled array of padding */
   this.padding = 0;

  dis.LiveEntityPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.subprotocolNumber = inputStream.readUShort();
       this.padding = inputStream.readUByte();
  };

  dis.LiveEntityPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUShort(this.subprotocolNumber);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.LiveEntityPdu = dis.LiveEntityPdu;

// End of LiveEntityPdu class

/**
 * A simulation's designation associated with all Live Entity IDs contained in Live Entity PDUs. Section 6.2.55 
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.LiveSimulationAddress = function()
{
   /** facility, installation, organizational unit or geographic location may have multiple sites associated with it. The Site Number is the first component of the Live Simulation Address, which defines a live simulation. */
   this.liveSiteNumber = 0;

   /** An application associated with a live site is termed a live application. Each live application participating in an event  */
   this.liveApplicationNumber = 0;

  dis.LiveSimulationAddress.prototype.initFromBinary = function(inputStream)
  {
       this.liveSiteNumber = inputStream.readUByte();
       this.liveApplicationNumber = inputStream.readUByte();
  };

  dis.LiveSimulationAddress.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.liveSiteNumber);
       outputStream.writeUByte(this.liveApplicationNumber);
  };
}; // end of class

 // node.js module support
exports.LiveSimulationAddress = dis.LiveSimulationAddress;

// End of LiveSimulationAddress class

/**
 *  Abstract superclass for logistics PDUs. Section 7.4 COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.LogisticsFamilyPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 3;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

  dis.LogisticsFamilyPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.LogisticsFamilyPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.LogisticsFamilyPdu = dis.LogisticsFamilyPdu;

// End of LogisticsFamilyPdu class

/**
 * The unique designation of a mine contained in the Minefield Data PDU. No espdus are issued for mine entities.  Section 6.2.55 
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.MineEntityIdentifier = function()
{
   /**  */
   this.simulationAddress = new dis.SimulationAddress(); 

   /**  */
   this.mineEntityNumber = 0;

  dis.MineEntityIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.mineEntityNumber = inputStream.readUShort();
  };

  dis.MineEntityIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.mineEntityNumber);
  };
}; // end of class

 // node.js module support
exports.MineEntityIdentifier = dis.MineEntityIdentifier;

// End of MineEntityIdentifier class

/**
 *  Abstract superclass for PDUs relating to minefields. Section 7.9
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.MinefieldFamilyPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 8;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

  dis.MinefieldFamilyPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.MinefieldFamilyPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.MinefieldFamilyPdu = dis.MinefieldFamilyPdu;

// End of MinefieldFamilyPdu class

/**
 * The unique designation of a minefield Section 6.2.56 
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.MinefieldIdentifier = function()
{
   /**  */
   this.simulationAddress = new dis.SimulationAddress(); 

   /**  */
   this.minefieldNumber = 0;

  dis.MinefieldIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.minefieldNumber = inputStream.readUShort();
  };

  dis.MinefieldIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.minefieldNumber);
  };
}; // end of class

 // node.js module support
exports.MinefieldIdentifier = dis.MinefieldIdentifier;

// End of MinefieldIdentifier class

/**
 * proivde the means to request a retransmit of a minefield data pdu. Section 7.9.5 COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.MinefieldResponseNackPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 40;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 8;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Minefield ID */
   this.minefieldID = new dis.EntityID(); 

   /** entity ID making the request */
   this.requestingEntityID = new dis.EntityID(); 

   /** request ID */
   this.requestID = 0;

   /** how many pdus were missing */
   this.numberOfMissingPdus = 0;

   /** PDU sequence numbers that were missing */
    this.missingPduSequenceNumbers = new Array();
 
  dis.MinefieldResponseNackPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.minefieldID.initFromBinary(inputStream);
       this.requestingEntityID.initFromBinary(inputStream);
       this.requestID = inputStream.readUByte();
       this.numberOfMissingPdus = inputStream.readUByte();
       for(var idx = 0; idx < this.numberOfMissingPdus; idx++)
       {
           var anX = new dis.EightByteChunk();
           anX.initFromBinary(inputStream);
           this.missingPduSequenceNumbers.push(anX);
       }

  };

  dis.MinefieldResponseNackPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.minefieldID.encodeToBinary(outputStream);
       this.requestingEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.requestID);
       outputStream.writeUByte(this.numberOfMissingPdus);
       for(var idx = 0; idx < this.missingPduSequenceNumbers.length; idx++)
       {
           missingPduSequenceNumbers[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.MinefieldResponseNackPdu = dis.MinefieldResponseNackPdu;

// End of MinefieldResponseNackPdu class

/**
 * Information about a minefield sensor. Section 6.2.57
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.MinefieldSensorType = function()
{
   /** sensor type. bit fields 0-3 are the type category, 4-15 are teh subcategory */
   this.sensorType = 0;

  dis.MinefieldSensorType.prototype.initFromBinary = function(inputStream)
  {
       this.sensorType = inputStream.readUShort();
  };

  dis.MinefieldSensorType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.sensorType);
  };
}; // end of class

 // node.js module support
exports.MinefieldSensorType = dis.MinefieldSensorType;

// End of MinefieldSensorType class

/**
 * information about the complete minefield. The minefield presence, perimiter, etc. Section 7.9.2 COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.MinefieldStatePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 37;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 8;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Minefield ID */
   this.minefieldID = new dis.MinefieldIdentifier(); 

   /** Minefield sequence */
   this.minefieldSequence = 0;

   /** force ID */
   this.forceID = 0;

   /** Number of permieter points */
   this.numberOfPerimeterPoints = 0;

   /** type of minefield */
   this.minefieldType = new dis.EntityType(); 

   /** how many mine types */
   this.numberOfMineTypes = 0;

   /** location of center of minefield in world coords */
   this.minefieldLocation = new dis.Vector3Double(); 

   /** orientation of minefield */
   this.minefieldOrientation = new dis.EulerAngles(); 

   /** appearance bitflags */
   this.appearance = 0;

   /** protocolMode. First two bits are the protocol mode, 14 bits reserved. */
   this.protocolMode = 0;

   /** perimeter points for the minefield */
    this.perimeterPoints = new Array();
 
   /** Type of mines */
    this.mineType = new Array();
 
  dis.MinefieldStatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.minefieldID.initFromBinary(inputStream);
       this.minefieldSequence = inputStream.readUShort();
       this.forceID = inputStream.readUByte();
       this.numberOfPerimeterPoints = inputStream.readUByte();
       this.minefieldType.initFromBinary(inputStream);
       this.numberOfMineTypes = inputStream.readUShort();
       this.minefieldLocation.initFromBinary(inputStream);
       this.minefieldOrientation.initFromBinary(inputStream);
       this.appearance = inputStream.readUShort();
       this.protocolMode = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfPerimeterPoints; idx++)
       {
           var anX = new dis.Vector2Float();
           anX.initFromBinary(inputStream);
           this.perimeterPoints.push(anX);
       }

       for(var idx = 0; idx < this.numberOfMineTypes; idx++)
       {
           var anX = new dis.EntityType();
           anX.initFromBinary(inputStream);
           this.mineType.push(anX);
       }

  };

  dis.MinefieldStatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.minefieldID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.minefieldSequence);
       outputStream.writeUByte(this.forceID);
       outputStream.writeUByte(this.numberOfPerimeterPoints);
       this.minefieldType.encodeToBinary(outputStream);
       outputStream.writeUShort(this.numberOfMineTypes);
       this.minefieldLocation.encodeToBinary(outputStream);
       this.minefieldOrientation.encodeToBinary(outputStream);
       outputStream.writeUShort(this.appearance);
       outputStream.writeUShort(this.protocolMode);
       for(var idx = 0; idx < this.perimeterPoints.length; idx++)
       {
           perimeterPoints[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.mineType.length; idx++)
       {
           mineType[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.MinefieldStatePdu = dis.MinefieldStatePdu;

// End of MinefieldStatePdu class

/**
 * Modulation parameters associated with a specific radio system. INCOMPLETE. 6.2.58 
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ModulationParameters = function()
{
  dis.ModulationParameters.prototype.initFromBinary = function(inputStream)
  {
  };

  dis.ModulationParameters.prototype.encodeToBinary = function(outputStream)
  {
  };
}; // end of class

 // node.js module support
exports.ModulationParameters = dis.ModulationParameters;

// End of ModulationParameters class

/**
 * Information about the type of modulation used for radio transmission. 6.2.59 
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ModulationType = function()
{
   /** This field shall indicate the spread spectrum technique or combination of spread spectrum techniques in use. Bit field. 0=freq hopping, 1=psuedo noise, time hopping=2, reamining bits unused */
   this.spreadSpectrum = 0;

   /** the major classification of the modulation type.  */
   this.majorModulation = 0;

   /** provide certain detailed information depending upon the major modulation type */
   this.detail = 0;

   /** the radio system associated with this Transmitter PDU and shall be used as the basis to interpret other fields whose values depend on a specific radio system. */
   this.radioSystem = 0;

  dis.ModulationType.prototype.initFromBinary = function(inputStream)
  {
       this.spreadSpectrum = inputStream.readUShort();
       this.majorModulation = inputStream.readUShort();
       this.detail = inputStream.readUShort();
       this.radioSystem = inputStream.readUShort();
  };

  dis.ModulationType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.spreadSpectrum);
       outputStream.writeUShort(this.majorModulation);
       outputStream.writeUShort(this.detail);
       outputStream.writeUShort(this.radioSystem);
  };
}; // end of class

 // node.js module support
exports.ModulationType = dis.ModulationType;

// End of ModulationType class

/**
 * An entity's munition (e.g., bomb, missile) information shall be represented by one or more Munition records. For each type or location of munition, this record shall specify the type, location, quantity and status of munitions that an entity contains. Section 6.2.60 
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.Munition = function()
{
   /**  This field shall identify the entity type of the munition. See section 6.2.30. */
   this.munitionType = new dis.EntityType(); 

   /** the station or launcher to which the munition is assigned. See Annex I */
   this.station = 0;

   /** the quantity remaining of this munition. */
   this.quantity = 0;

   /**  the status of the munition. It shall be represented by an 8-bit enumeration.  */
   this.munitionStatus = 0;

   /** padding  */
   this.padding = 0;

  dis.Munition.prototype.initFromBinary = function(inputStream)
  {
       this.munitionType.initFromBinary(inputStream);
       this.station = inputStream.readUInt();
       this.quantity = inputStream.readUShort();
       this.munitionStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.Munition.prototype.encodeToBinary = function(outputStream)
  {
       this.munitionType.encodeToBinary(outputStream);
       outputStream.writeUInt(this.station);
       outputStream.writeUShort(this.quantity);
       outputStream.writeUByte(this.munitionStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.Munition = dis.Munition;

// End of Munition class

/**
 * Represents the firing or detonation of a munition. Section 6.2.19.2
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.MunitionDescriptor = function()
{
   /** What munition was used in the burst */
   this.munitionType = new dis.EntityType(); 

   /** type of warhead enumeration */
   this.warhead = 0;

   /** type of fuse used enumeration */
   this.fuse = 0;

   /** how many of the munition were fired */
   this.quantity = 0;

   /** rate at which the munition was fired */
   this.rate = 0;

  dis.MunitionDescriptor.prototype.initFromBinary = function(inputStream)
  {
       this.munitionType.initFromBinary(inputStream);
       this.warhead = inputStream.readUShort();
       this.fuse = inputStream.readUShort();
       this.quantity = inputStream.readUShort();
       this.rate = inputStream.readUShort();
  };

  dis.MunitionDescriptor.prototype.encodeToBinary = function(outputStream)
  {
       this.munitionType.encodeToBinary(outputStream);
       outputStream.writeUShort(this.warhead);
       outputStream.writeUShort(this.fuse);
       outputStream.writeUShort(this.quantity);
       outputStream.writeUShort(this.rate);
  };
}; // end of class

 // node.js module support
exports.MunitionDescriptor = dis.MunitionDescriptor;

// End of MunitionDescriptor class

/**
 * indicate weapons (munitions) previously communicated via the Munition record. Section 6.2.61 
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.MunitionReload = function()
{
   /**  This field shall identify the entity type of the munition. See section 6.2.30. */
   this.munitionType = new dis.EntityType(); 

   /** the station or launcher to which the munition is assigned. See Annex I */
   this.station = 0;

   /** the standard quantity of this munition type normally loaded at this station/launcher if a station/launcher is specified. */
   this.standardQuantity = 0;

   /** the maximum quantity of this munition type that this station/launcher is capable of holding when a station/launcher is specified  */
   this.maximumQuantity = 0;

   /** numer of seconds of sim time required to reload the std qty */
   this.standardQuantityReloadTime = 0;

   /** the number of seconds of sim time required to reload the max possible quantity */
   this.maximumQuantityReloadTime = 0;

  dis.MunitionReload.prototype.initFromBinary = function(inputStream)
  {
       this.munitionType.initFromBinary(inputStream);
       this.station = inputStream.readUInt();
       this.standardQuantity = inputStream.readUShort();
       this.maximumQuantity = inputStream.readUShort();
       this.standardQuantityReloadTime = inputStream.readUInt();
       this.maximumQuantityReloadTime = inputStream.readUInt();
  };

  dis.MunitionReload.prototype.encodeToBinary = function(outputStream)
  {
       this.munitionType.encodeToBinary(outputStream);
       outputStream.writeUInt(this.station);
       outputStream.writeUShort(this.standardQuantity);
       outputStream.writeUShort(this.maximumQuantity);
       outputStream.writeUInt(this.standardQuantityReloadTime);
       outputStream.writeUInt(this.maximumQuantityReloadTime);
  };
}; // end of class

 // node.js module support
exports.MunitionReload = dis.MunitionReload;

// End of MunitionReload class

/**
 * Information about the discrete positional relationship of the part entity with respect to the its host entity Section 6.2.62 
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.NamedLocationIdentification = function()
{
   /** the station name within the host at which the part entity is located. If the part entity is On Station, this field shall specify the representation of the part’s location data fields. This field shall be specified by a 16-bit enumeration  */
   this.stationName = 0;

   /** the number of the particular wing station, cargo hold etc., at which the part is attached.  */
   this.stationNumber = 0;

  dis.NamedLocationIdentification.prototype.initFromBinary = function(inputStream)
  {
       this.stationName = inputStream.readUShort();
       this.stationNumber = inputStream.readUShort();
  };

  dis.NamedLocationIdentification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.stationName);
       outputStream.writeUShort(this.stationNumber);
  };
}; // end of class

 // node.js module support
exports.NamedLocationIdentification = dis.NamedLocationIdentification;

// End of NamedLocationIdentification class

/**
 * The unique designation of an environmental object. Section 6.2.63
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ObjectIdentifier = function()
{
   /**  Simulation Address */
   this.simulationAddress = new dis.SimulationAddress(); 

   /** object number */
   this.objectNumber = 0;

  dis.ObjectIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.objectNumber = inputStream.readUShort();
  };

  dis.ObjectIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.objectNumber);
  };
}; // end of class

 // node.js module support
exports.ObjectIdentifier = dis.ObjectIdentifier;

// End of ObjectIdentifier class

/**
 * The unique designation of an environmental object. Section 6.2.64
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ObjectType = function()
{
   /** Domain of entity (air, surface, subsurface, space, etc) */
   this.domain = 0;

   /** country to which the design of the entity is attributed */
   this.objectKind = 0;

   /** category of entity */
   this.category = 0;

   /** subcategory of entity */
   this.subcategory = 0;

  dis.ObjectType.prototype.initFromBinary = function(inputStream)
  {
       this.domain = inputStream.readUByte();
       this.objectKind = inputStream.readUByte();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
  };

  dis.ObjectType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.domain);
       outputStream.writeUByte(this.objectKind);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
  };
}; // end of class

 // node.js module support
exports.ObjectType = dis.ObjectType;

// End of ObjectType class

/**
 * 8 bit piece of data
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.OneByteChunk = function()
{
   /** one byte of arbitrary data */
   this.otherParameters = new Array(0);

  dis.OneByteChunk.prototype.initFromBinary = function(inputStream)
  {
       for(var idx = 0; idx < 1; idx++)
       {
          this.otherParameters[ idx ] = inputStream.readByte();
       }
  };

  dis.OneByteChunk.prototype.encodeToBinary = function(outputStream)
  {
       for(var idx = 0; idx < 1; idx++)
       {
          outputStream.writeByte(this.otherParameters[ idx ] );
       }
  };
}; // end of class

 // node.js module support
exports.OneByteChunk = dis.OneByteChunk;

// End of OneByteChunk class

/**
 * used to convey entity and conflict status information associated with transferring ownership of an entity. Section 6.2.65
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.OwnershipStatus = function()
{
   /** EntityID */
   this.entityId = new dis.EntityID(); 

   /** The ownership and/or ownership conflict status of the entity represented by the Entity ID field. */
   this.ownershipStatus = 0;

   /** padding */
   this.padding = 0;

  dis.OwnershipStatus.prototype.initFromBinary = function(inputStream)
  {
       this.entityId.initFromBinary(inputStream);
       this.ownershipStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.OwnershipStatus.prototype.encodeToBinary = function(outputStream)
  {
       this.entityId.encodeToBinary(outputStream);
       outputStream.writeUByte(this.ownershipStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.OwnershipStatus = dis.OwnershipStatus;

// End of OwnershipStatus class

/**
 * Adds some fields to the the classic PDU
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.Pdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 0;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

  dis.Pdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.Pdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.Pdu = dis.Pdu;

// End of Pdu class

/**
 * Used for XML compatability. A container that holds PDUs
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.PduContainer = function()
{
   /** Number of PDUs in the container list */
   this.numberOfPdus = 0;

   /** record sets */
    this.pdus = new Array();
 
  dis.PduContainer.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfPdus = inputStream.readInt();
       for(var idx = 0; idx < this.numberOfPdus; idx++)
       {
           var anX = new dis.Pdu();
           anX.initFromBinary(inputStream);
           this.pdus.push(anX);
       }

  };

  dis.PduContainer.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeInt(this.numberOfPdus);
       for(var idx = 0; idx < this.pdus.length; idx++)
       {
           pdus[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.PduContainer = dis.PduContainer;

// End of PduContainer class

/**
 * Not used. The PDU Header Record is directly incoroporated into the PDU class. Here for completness only. Section 6.2.66
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.PduHeader = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, etc */
   this.protocolFamily = 0;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word. */
   this.pduLength = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero filled array of padding */
   this.padding = 0;

  dis.PduHeader.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUByte();
       this.pduStatus = inputStream.readUShort();
       this.padding = inputStream.readUByte();
  };

  dis.PduHeader.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUByte(this.pduLength);
       outputStream.writeUShort(this.pduStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.PduHeader = dis.PduHeader;

// End of PduHeader class

/**
 * PDU Status. These are a series of bit fields. Represented here as just a byte. Section 6.2.67
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.PduStatus = function()
{
   /** Bit fields. The semantics of the bit fields depend on the PDU type */
   this.pduStatus = 0;

  dis.PduStatus.prototype.initFromBinary = function(inputStream)
  {
       this.pduStatus = inputStream.readUByte();
  };

  dis.PduStatus.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.pduStatus);
  };
}; // end of class

 // node.js module support
exports.PduStatus = dis.PduStatus;

// End of PduStatus class

/**
 * Non-DIS class, used on SQL databases. This is not in the DIS standard but can be helpful when saving DIS to a SQL database, particularly in Java.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.PduStream = function()
{
   /** Longish description of this PDU stream */
   this.description = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /** short description of this PDU stream */
   this.name = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /** Start time of recording, in Unix time (seconds since epoch) */
   this.startTime = 0;

   /** stop time of recording, in Unix time (seconds since epoch) */
   this.stopTime = 0;

  dis.PduStream.prototype.initFromBinary = function(inputStream)
  {
       for(var idx = 0; idx < 512; idx++)
       {
          this.description[ idx ] = inputStream.readByte();
       }
       for(var idx = 0; idx < 256; idx++)
       {
          this.name[ idx ] = inputStream.readByte();
       }
       this.startTime = inputStream.readLong();
       this.stopTime = inputStream.readLong();
  };

  dis.PduStream.prototype.encodeToBinary = function(outputStream)
  {
       for(var idx = 0; idx < 512; idx++)
       {
          outputStream.writeByte(this.description[ idx ] );
       }
       for(var idx = 0; idx < 256; idx++)
       {
          outputStream.writeByte(this.name[ idx ] );
       }
       outputStream.writeLong(this.startTime);
       outputStream.writeLong(this.stopTime);
  };
}; // end of class

 // node.js module support
exports.PduStream = dis.PduStream;

// End of PduStream class

/**
 * The superclass for all PDUs, including classic and Live Entity (LE) PDUs. This incorporates the PduHeader record, section 7.2.2
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.PduSuperclass = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 0;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

  dis.PduSuperclass.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
  };

  dis.PduSuperclass.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
  };
}; // end of class

 // node.js module support
exports.PduSuperclass = dis.PduSuperclass;

// End of PduSuperclass class

/**
 * : Inormation abut the addition or modification of a synthecic enviroment object that is anchored to the terrain with a single point. Section 7.10.4 COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.PointObjectStatePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 43;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 9;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Object in synthetic environment */
   this.objectID = new dis.EntityID(); 

   /** Object with which this point object is associated */
   this.referencedObjectID = new dis.EntityID(); 

   /** unique update number of each state transition of an object */
   this.updateNumber = 0;

   /** force ID */
   this.forceID = 0;

   /** modifications */
   this.modifications = 0;

   /** Object type */
   this.objectType = new dis.ObjectType(); 

   /** Object location */
   this.objectLocation = new dis.Vector3Double(); 

   /** Object orientation */
   this.objectOrientation = new dis.EulerAngles(); 

   /** Object apperance */
   this.objectAppearance = 0;

   /** requesterID */
   this.requesterID = new dis.SimulationAddress(); 

   /** receiver ID */
   this.receivingID = new dis.SimulationAddress(); 

   /** padding */
   this.pad2 = 0;

  dis.PointObjectStatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.objectID.initFromBinary(inputStream);
       this.referencedObjectID.initFromBinary(inputStream);
       this.updateNumber = inputStream.readUShort();
       this.forceID = inputStream.readUByte();
       this.modifications = inputStream.readUByte();
       this.objectType.initFromBinary(inputStream);
       this.objectLocation.initFromBinary(inputStream);
       this.objectOrientation.initFromBinary(inputStream);
       this.objectAppearance = inputStream.readFloat64();
       this.requesterID.initFromBinary(inputStream);
       this.receivingID.initFromBinary(inputStream);
       this.pad2 = inputStream.readUInt();
  };

  dis.PointObjectStatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.objectID.encodeToBinary(outputStream);
       this.referencedObjectID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.updateNumber);
       outputStream.writeUByte(this.forceID);
       outputStream.writeUByte(this.modifications);
       this.objectType.encodeToBinary(outputStream);
       this.objectLocation.encodeToBinary(outputStream);
       this.objectOrientation.encodeToBinary(outputStream);
       outputStream.writeFloat64(this.objectAppearance);
       this.requesterID.encodeToBinary(outputStream);
       this.receivingID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.pad2);
  };
}; // end of class

 // node.js module support
exports.PointObjectStatePdu = dis.PointObjectStatePdu;

// End of PointObjectStatePdu class

/**
 * contains information describing the propulsion systems of the entity. This information shall be provided for each active propulsion system defined. Section 6.2.68
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.PropulsionSystemData = function()
{
   /** powerSetting */
   this.powerSetting = 0;

   /** engine RPMs */
   this.engineRpm = 0;

  dis.PropulsionSystemData.prototype.initFromBinary = function(inputStream)
  {
       this.powerSetting = inputStream.readFloat32();
       this.engineRpm = inputStream.readFloat32();
  };

  dis.PropulsionSystemData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.powerSetting);
       outputStream.writeFloat32(this.engineRpm);
  };
}; // end of class

 // node.js module support
exports.PropulsionSystemData = dis.PropulsionSystemData;

// End of PropulsionSystemData class

/**
 * Bit field used to identify minefield data. bits 14-15 are a 2-bit enum, other bits unused. Section 6.2.69
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ProtocolMode = function()
{
   /** Bitfields, 14-15 contain an enum */
   this.protocolMode = 0;

  dis.ProtocolMode.prototype.initFromBinary = function(inputStream)
  {
       this.protocolMode = inputStream.readUShort();
  };

  dis.ProtocolMode.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.protocolMode);
  };
}; // end of class

 // node.js module support
exports.ProtocolMode = dis.ProtocolMode;

// End of ProtocolMode class

/**
 *  Abstract superclass for radio communications PDUs. Section 7.7
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.RadioCommunicationsFamilyPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 4;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

  dis.RadioCommunicationsFamilyPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.RadioCommunicationsFamilyPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.RadioCommunicationsFamilyPdu = dis.RadioCommunicationsFamilyPdu;

// End of RadioCommunicationsFamilyPdu class

/**
 * The unique designation of an attached or unattached radio in an event or exercise Section 6.2.70
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.RadioIdentifier = function()
{
   /**  site */
   this.siteNumber = 0;

   /** application number */
   this.applicationNumber = 0;

   /**  reference number */
   this.referenceNumber = 0;

   /**  Radio number */
   this.radioNumber = 0;

  dis.RadioIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.siteNumber = inputStream.readUShort();
       this.applicationNumber = inputStream.readUShort();
       this.referenceNumber = inputStream.readUShort();
       this.radioNumber = inputStream.readUShort();
  };

  dis.RadioIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.siteNumber);
       outputStream.writeUShort(this.applicationNumber);
       outputStream.writeUShort(this.referenceNumber);
       outputStream.writeUShort(this.radioNumber);
  };
}; // end of class

 // node.js module support
exports.RadioIdentifier = dis.RadioIdentifier;

// End of RadioIdentifier class

/**
 * Identifies the type of radio. Section 6.2.71
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.RadioType = function()
{
   /** Kind of entity */
   this.entityKind = 0;

   /** Domain of entity (air, surface, subsurface, space, etc) */
   this.domain = 0;

   /** country to which the design of the entity is attributed */
   this.country = 0;

   /** category of entity */
   this.category = 0;

   /** specific info based on subcategory field */
   this.subcategory = 0;

   this.specific = 0;

   this.extra = 0;

  dis.RadioType.prototype.initFromBinary = function(inputStream)
  {
       this.entityKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.country = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.specific = inputStream.readUByte();
       this.extra = inputStream.readUByte();
  };

  dis.RadioType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.entityKind);
       outputStream.writeUByte(this.domain);
       outputStream.writeUShort(this.country);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
       outputStream.writeUByte(this.specific);
       outputStream.writeUByte(this.extra);
  };
}; // end of class

 // node.js module support
exports.RadioType = dis.RadioType;

// End of RadioType class

/**
 *  Communication of a receiver state. Section 7.7.4 COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ReceiverPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 27;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 4;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** encoding scheme used, and enumeration */
   this.receiverState = 0;

   /** padding */
   this.padding1 = 0;

   /** received power */
   this.receivedPoser = 0;

   /** ID of transmitter */
   this.transmitterEntityId = new dis.EntityID(); 

   /** ID of transmitting radio */
   this.transmitterRadioId = 0;

  dis.ReceiverPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.receiverState = inputStream.readUShort();
       this.padding1 = inputStream.readUShort();
       this.receivedPoser = inputStream.readFloat32();
       this.transmitterEntityId.initFromBinary(inputStream);
       this.transmitterRadioId = inputStream.readUShort();
  };

  dis.ReceiverPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       outputStream.writeUShort(this.receiverState);
       outputStream.writeUShort(this.padding1);
       outputStream.writeFloat32(this.receivedPoser);
       this.transmitterEntityId.encodeToBinary(outputStream);
       outputStream.writeUShort(this.transmitterRadioId);
  };
}; // end of class

 // node.js module support
exports.ReceiverPdu = dis.ReceiverPdu;

// End of ReceiverPdu class

/**
 * Section 5.3.12.13: A request for one or more records of data from an entity. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.RecordQueryReliablePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 63;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Object originatig the request */
   this.originatingEntityID = new dis.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis.EntityID(); 

   /** request ID */
   this.requestID = 0;

   /** level of reliability service used for this transaction */
   this.requiredReliabilityService = 0;

   /** padding. The spec is unclear and contradictory here. */
   this.pad1 = 0;

   /** padding */
   this.pad2 = 0;

   /** event type */
   this.eventType = 0;

   /** time */
   this.time = 0;

   /** numberOfRecords */
   this.numberOfRecords = 0;

   /** record IDs */
    this.recordIDs = new Array();
 
  dis.RecordQueryReliablePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
       this.requiredReliabilityService = inputStream.readUByte();
       this.pad1 = inputStream.readUShort();
       this.pad2 = inputStream.readUByte();
       this.eventType = inputStream.readUShort();
       this.time = inputStream.readUInt();
       this.numberOfRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfRecords; idx++)
       {
           var anX = new dis.FourByteChunk();
           anX.initFromBinary(inputStream);
           this.recordIDs.push(anX);
       }

  };

  dis.RecordQueryReliablePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.requestID);
       outputStream.writeUByte(this.requiredReliabilityService);
       outputStream.writeUShort(this.pad1);
       outputStream.writeUByte(this.pad2);
       outputStream.writeUShort(this.eventType);
       outputStream.writeUInt(this.time);
       outputStream.writeUInt(this.numberOfRecords);
       for(var idx = 0; idx < this.recordIDs.length; idx++)
       {
           recordIDs[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.RecordQueryReliablePdu = dis.RecordQueryReliablePdu;

// End of RecordQueryReliablePdu class

/**
 * The identification of the records being queried 6.2.72
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.RecordQuerySpecification = function()
{
   this.numberOfRecords = 0;

   /** variable length list of 32 bit records */
    this.records = new Array();
 
  dis.RecordQuerySpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfRecords; idx++)
       {
           var anX = new dis.FourByteChunk();
           anX.initFromBinary(inputStream);
           this.records.push(anX);
       }

  };

  dis.RecordQuerySpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.numberOfRecords);
       for(var idx = 0; idx < this.records.length; idx++)
       {
           records[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.RecordQuerySpecification = dis.RecordQuerySpecification;

// End of RecordQuerySpecification class

/**
 * This record shall specify the number of record sets contained in the Record Specification record and the record details. Section 6.2.73.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.RecordSpecification = function()
{
   /** The number of record sets */
   this.numberOfRecordSets = 0;

   /** variable length list record specifications. */
    this.recordSets = new Array();
 
  dis.RecordSpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfRecordSets = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfRecordSets; idx++)
       {
           var anX = new dis.RecordSpecificationElement();
           anX.initFromBinary(inputStream);
           this.recordSets.push(anX);
       }

  };

  dis.RecordSpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.numberOfRecordSets);
       for(var idx = 0; idx < this.recordSets.length; idx++)
       {
           recordSets[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.RecordSpecification = dis.RecordSpecification;

// End of RecordSpecification class

/**
 * Synthetic record, made up from section 6.2.72. This is used to acheive a repeating variable list element.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.RecordSpecificationElement = function()
{
   /** the data structure used to convey the parameter values of the record for each record. 32 bit enumeration. */
   this.recordID = 0;

   /** the serial number of the first record in the block of records */
   this.recordSetSerialNumber = 0;

   /**  the length, in bits, of the record. Note, bits, not bytes. */
   this.recordLength = 0;

   /**  the number of records included in the record set  */
   this.recordCount = 0;

   /** the concatenated records of the format specified by the Record ID field. The length of this field is the Record Length multiplied by the Record Count, in units of bits. ^^^This is wrong--variable sized data records, bit values. THis MUST be patched after generation. */
   this.recordValues = 0;

   /** Padding of 0 to 31 unused bits as required for 32-bit alignment of the Record Set field. ^^^This is wrong--variable sized padding. MUST be patched post-code generation */
   this.pad4 = 0;

  dis.RecordSpecificationElement.prototype.initFromBinary = function(inputStream)
  {
       this.recordID = inputStream.readUInt();
       this.recordSetSerialNumber = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.recordCount = inputStream.readUShort();
       this.recordValues = inputStream.readUShort();
       this.pad4 = inputStream.readUByte();
  };

  dis.RecordSpecificationElement.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordID);
       outputStream.writeUInt(this.recordSetSerialNumber);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUShort(this.recordCount);
       outputStream.writeUShort(this.recordValues);
       outputStream.writeUByte(this.pad4);
  };
}; // end of class

 // node.js module support
exports.RecordSpecificationElement = dis.RecordSpecificationElement;

// End of RecordSpecificationElement class

/**
 * The relationship of the part entity to its host entity. Section 6.2.74.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.Relationship = function()
{
   /** the nature or purpose for joining of the part entity to the host entity and shall be represented by a 16-bit enumeration */
   this.nature = 0;

   /** the position of the part entity with respect to the host entity and shall be represented by a 16-bit enumeration */
   this.position = 0;

  dis.Relationship.prototype.initFromBinary = function(inputStream)
  {
       this.nature = inputStream.readUShort();
       this.position = inputStream.readUShort();
  };

  dis.Relationship.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.nature);
       outputStream.writeUShort(this.position);
  };
}; // end of class

 // node.js module support
exports.Relationship = dis.Relationship;

// End of Relationship class

/**
 * Section 7.5.3 The removal of an entity from an exercise shall be communicated with a Remove Entity PDU. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.RemoveEntityPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 12;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** Identifier for originating entity(or simulation) */
   this.originatingID = new dis.EntityID(); 

   /** Identifier for the receiving entity(or simulation) */
   this.receivingID = new dis.EntityID(); 

   /** This field shall identify the specific and unique start/resume request being made by the SM */
   this.requestID = 0;

  dis.RemoveEntityPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.originatingID.initFromBinary(inputStream);
       this.receivingID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
  };

  dis.RemoveEntityPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.originatingID.encodeToBinary(outputStream);
       this.receivingID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.requestID);
  };
}; // end of class

 // node.js module support
exports.RemoveEntityPdu = dis.RemoveEntityPdu;

// End of RemoveEntityPdu class

/**
 * Section 5.3.12.2: Removal of an entity , reliable. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.RemoveEntityReliablePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 52;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Object originatig the request */
   this.originatingEntityID = new dis.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis.EntityID(); 

   /** level of reliability service used for this transaction */
   this.requiredReliabilityService = 0;

   /** padding */
   this.pad1 = 0;

   /** padding */
   this.pad2 = 0;

   /** Request ID */
   this.requestID = 0;

  dis.RemoveEntityReliablePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.requiredReliabilityService = inputStream.readUByte();
       this.pad1 = inputStream.readUShort();
       this.pad2 = inputStream.readUByte();
       this.requestID = inputStream.readUInt();
  };

  dis.RemoveEntityReliablePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.requiredReliabilityService);
       outputStream.writeUShort(this.pad1);
       outputStream.writeUByte(this.pad2);
       outputStream.writeUInt(this.requestID);
  };
}; // end of class

 // node.js module support
exports.RemoveEntityReliablePdu = dis.RemoveEntityReliablePdu;

// End of RemoveEntityReliablePdu class

/**
 * Section 7.4.6. Service Request PDU is received and repair is complete. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.RepairCompletePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 9;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 3;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is receiving service.  See 6.2.28 */
   this.receivingEntityID = new dis.EntityID(); 

   /** Entity that is supplying.  See 6.2.28 */
   this.repairingEntityID = new dis.EntityID(); 

   /** Enumeration for type of repair.  See 6.2.74 */
   this.repair = 0;

   /** padding, number prevents conflict with superclass ivar name */
   this.padding4 = 0;

  dis.RepairCompletePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.receivingEntityID.initFromBinary(inputStream);
       this.repairingEntityID.initFromBinary(inputStream);
       this.repair = inputStream.readUShort();
       this.padding4 = inputStream.readShort();
  };

  dis.RepairCompletePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.repairingEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.repair);
       outputStream.writeShort(this.padding4);
  };
}; // end of class

 // node.js module support
exports.RepairCompletePdu = dis.RepairCompletePdu;

// End of RepairCompletePdu class

/**
 * Section 7.4.7. Sent after repair complete PDU. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.RepairResponsePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 10;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 3;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that requested repairs.  See 6.2.28 */
   this.receivingEntityID = new dis.EntityID(); 

   /** Entity that is repairing.  See 6.2.28 */
   this.repairingEntityID = new dis.EntityID(); 

   /** Result of repair operation */
   this.repairResult = 0;

   /** padding */
   this.padding1 = 0;

   /** padding */
   this.padding2 = 0;

  dis.RepairResponsePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.receivingEntityID.initFromBinary(inputStream);
       this.repairingEntityID.initFromBinary(inputStream);
       this.repairResult = inputStream.readUByte();
       this.padding1 = inputStream.readShort();
       this.padding2 = inputStream.readByte();
  };

  dis.RepairResponsePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.repairingEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.repairResult);
       outputStream.writeShort(this.padding1);
       outputStream.writeByte(this.padding2);
  };
}; // end of class

 // node.js module support
exports.RepairResponsePdu = dis.RepairResponsePdu;

// End of RepairResponsePdu class

/**
 * A monotonically increasing number inserted into all simulation managment PDUs. This should be a hand-coded thingie, maybe a singleton. Section 6.2.75
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.RequestID = function()
{
   /** monotonically increasing number */
   this.requestID = 0;

  dis.RequestID.prototype.initFromBinary = function(inputStream)
  {
       this.requestID = inputStream.readUInt();
  };

  dis.RequestID.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.requestID);
  };
}; // end of class

 // node.js module support
exports.RequestID = dis.RequestID;

// End of RequestID class

/**
 * Information used to communicate the offer of supplies by a supplying entity to a receiving entity. Section 7.4.3 COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ResupplyOfferPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 6;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 3;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Field identifies the Entity and respective Entity Record ID that is receiving service (see 6.2.28), Section 7.4.3 */
   this.receivingEntityID = new dis.EntityID(); 

   /** Identifies the Entity and respective Entity ID Record that is supplying  (see 6.2.28), Section 7.4.3 */
   this.supplyingEntityID = new dis.EntityID(); 

   /** How many supplies types are being offered, Section 7.4.3 */
   this.numberOfSupplyTypes = 0;

   /** padding */
   this.padding1 = 0;

   /** padding */
   this.padding2 = 0;

   /** A Reord that Specifies the type of supply and the amount of that supply for each of the supply types in numberOfSupplyTypes (see 6.2.85), Section 7.4.3 */
    this.supplies = new Array();
 
  dis.ResupplyOfferPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.receivingEntityID.initFromBinary(inputStream);
       this.supplyingEntityID.initFromBinary(inputStream);
       this.numberOfSupplyTypes = inputStream.readUByte();
       this.padding1 = inputStream.readByte();
       this.padding2 = inputStream.readShort();
       for(var idx = 0; idx < this.numberOfSupplyTypes; idx++)
       {
           var anX = new dis.SupplyQuantity();
           anX.initFromBinary(inputStream);
           this.supplies.push(anX);
       }

  };

  dis.ResupplyOfferPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.supplyingEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.numberOfSupplyTypes);
       outputStream.writeByte(this.padding1);
       outputStream.writeShort(this.padding2);
       for(var idx = 0; idx < this.supplies.length; idx++)
       {
           supplies[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ResupplyOfferPdu = dis.ResupplyOfferPdu;

// End of ResupplyOfferPdu class

/**
 * Section 7.4.4. Receipt of supplies is communicated by issuing Resupply Received PDU. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ResupplyReceivedPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 7;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 3;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is receiving service.  Shall be represented by Entity Identifier record (see 6.2.28) */
   this.receivingEntityID = new dis.EntityID(); 

   /** Entity that is supplying.  Shall be represented by Entity Identifier record (see 6.2.28) */
   this.supplyingEntityID = new dis.EntityID(); 

   /** How many supplies are taken by receiving entity */
   this.numberOfSupplyTypes = 0;

   /** padding */
   this.padding1 = 0;

   /** padding */
   this.padding2 = 0;

   /** Type and amount of supplies for each specified supply type.  See 6.2.85 for supply quantity record. */
    this.supplies = new Array();
 
  dis.ResupplyReceivedPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.receivingEntityID.initFromBinary(inputStream);
       this.supplyingEntityID.initFromBinary(inputStream);
       this.numberOfSupplyTypes = inputStream.readUByte();
       this.padding1 = inputStream.readShort();
       this.padding2 = inputStream.readByte();
       for(var idx = 0; idx < this.numberOfSupplyTypes; idx++)
       {
           var anX = new dis.SupplyQuantity();
           anX.initFromBinary(inputStream);
           this.supplies.push(anX);
       }

  };

  dis.ResupplyReceivedPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.supplyingEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.numberOfSupplyTypes);
       outputStream.writeShort(this.padding1);
       outputStream.writeByte(this.padding2);
       for(var idx = 0; idx < this.supplies.length; idx++)
       {
           supplies[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ResupplyReceivedPdu = dis.ResupplyReceivedPdu;

// End of ResupplyReceivedPdu class

/**
 * Additional operational data for an IFF emitting system and the number of IFF Fundamental Parameter Data records Section 6.2.76.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.SecondaryOperationalData = function()
{
   /** additional operational characteristics of the IFF emitting system. Each 8-bit field will vary depending on the system type. */
   this.operationalData1 = 0;

   /** additional operational characteristics of the IFF emitting system. Each 8-bit field will vary depending on the system type. */
   this.operationalData2 = 0;

   /** the number of IFF Fundamental Parameter Data records that follow */
   this.numberOfIFFFundamentalParameterRecords = 0;

  dis.SecondaryOperationalData.prototype.initFromBinary = function(inputStream)
  {
       this.operationalData1 = inputStream.readUByte();
       this.operationalData2 = inputStream.readUByte();
       this.numberOfIFFFundamentalParameterRecords = inputStream.readUShort();
  };

  dis.SecondaryOperationalData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.operationalData1);
       outputStream.writeUByte(this.operationalData2);
       outputStream.writeUShort(this.numberOfIFFFundamentalParameterRecords);
  };
}; // end of class

 // node.js module support
exports.SecondaryOperationalData = dis.SecondaryOperationalData;

// End of SecondaryOperationalData class

/**
 *  SEES PDU, supplemental emissions entity state information. Section 7.6.6 COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.SeesPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 30;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 6;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Originating entity ID */
   this.orginatingEntityID = new dis.EntityID(); 

   /** IR Signature representation index */
   this.infraredSignatureRepresentationIndex = 0;

   /** acoustic Signature representation index */
   this.acousticSignatureRepresentationIndex = 0;

   /** radar cross section representation index */
   this.radarCrossSectionSignatureRepresentationIndex = 0;

   /** how many propulsion systems */
   this.numberOfPropulsionSystems = 0;

   /** how many vectoring nozzle systems */
   this.numberOfVectoringNozzleSystems = 0;

   /** variable length list of propulsion system data */
    this.propulsionSystemData = new Array();
 
   /** variable length list of vectoring system data */
    this.vectoringSystemData = new Array();
 
  dis.SeesPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.orginatingEntityID.initFromBinary(inputStream);
       this.infraredSignatureRepresentationIndex = inputStream.readUShort();
       this.acousticSignatureRepresentationIndex = inputStream.readUShort();
       this.radarCrossSectionSignatureRepresentationIndex = inputStream.readUShort();
       this.numberOfPropulsionSystems = inputStream.readUShort();
       this.numberOfVectoringNozzleSystems = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfPropulsionSystems; idx++)
       {
           var anX = new dis.PropulsionSystemData();
           anX.initFromBinary(inputStream);
           this.propulsionSystemData.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVectoringNozzleSystems; idx++)
       {
           var anX = new dis.VectoringNozzleSystem();
           anX.initFromBinary(inputStream);
           this.vectoringSystemData.push(anX);
       }

  };

  dis.SeesPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.orginatingEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.infraredSignatureRepresentationIndex);
       outputStream.writeUShort(this.acousticSignatureRepresentationIndex);
       outputStream.writeUShort(this.radarCrossSectionSignatureRepresentationIndex);
       outputStream.writeUShort(this.numberOfPropulsionSystems);
       outputStream.writeUShort(this.numberOfVectoringNozzleSystems);
       for(var idx = 0; idx < this.propulsionSystemData.length; idx++)
       {
           propulsionSystemData[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.vectoringSystemData.length; idx++)
       {
           vectoringSystemData[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.SeesPdu = dis.SeesPdu;

// End of SeesPdu class

/**
 * An entity's sensor information.  Section 6.2.77.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.Sensor = function()
{
   /**  the source of the Sensor Type field  */
   this.sensorTypeSource = 0;

   /** the on/off status of the sensor */
   this.sensorOnOffStatus = 0;

   /** the sensor type and shall be represented by a 16-bit enumeration.  */
   this.sensorType = 0;

   /**  the station to which the sensor is assigned. A zero value shall indi- cate that this Sensor record is not associated with any particular station and represents the total quan- tity of this sensor for this entity. If this field is non-zero, it shall either reference an attached part or an articulated part */
   this.station = 0;

   /** quantity of the sensor  */
   this.quantity = 0;

   /** padding */
   this.padding = 0;

  dis.Sensor.prototype.initFromBinary = function(inputStream)
  {
       this.sensorTypeSource = inputStream.readUByte();
       this.sensorOnOffStatus = inputStream.readUByte();
       this.sensorType = inputStream.readUShort();
       this.station = inputStream.readUInt();
       this.quantity = inputStream.readUShort();
       this.padding = inputStream.readUShort();
  };

  dis.Sensor.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.sensorTypeSource);
       outputStream.writeUByte(this.sensorOnOffStatus);
       outputStream.writeUShort(this.sensorType);
       outputStream.writeUInt(this.station);
       outputStream.writeUShort(this.quantity);
       outputStream.writeUShort(this.padding);
  };
}; // end of class

 // node.js module support
exports.Sensor = dis.Sensor;

// End of Sensor class

/**
 * Physical separation of an entity from another entity.  Section 6.2.94.6
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.SeparationVP = function()
{
   /** the identification of the Variable Parameter record. Enumeration from EBV */
   this.recordType = 2;

   /** Reason for separation. EBV */
   this.reasonForSeparation = 0;

   /** Whether the entity existed prior to separation EBV */
   this.preEntityIndicator = 0;

   /** padding */
   this.padding1 = 0;

   /** ID of parent */
   this.parentEntityID = new dis.EntityID(); 

   /** padding */
   this.padding2 = 0;

   /** Station separated from */
   this.stationLocation = 0;

  dis.SeparationVP.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUByte();
       this.reasonForSeparation = inputStream.readUByte();
       this.preEntityIndicator = inputStream.readUByte();
       this.padding1 = inputStream.readUByte();
       this.parentEntityID.initFromBinary(inputStream);
       this.padding2 = inputStream.readUShort();
       this.stationLocation = inputStream.readUInt();
  };

  dis.SeparationVP.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.recordType);
       outputStream.writeUByte(this.reasonForSeparation);
       outputStream.writeUByte(this.preEntityIndicator);
       outputStream.writeUByte(this.padding1);
       this.parentEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding2);
       outputStream.writeUInt(this.stationLocation);
  };
}; // end of class

 // node.js module support
exports.SeparationVP = dis.SeparationVP;

// End of SeparationVP class

/**
 * Service Request PDU shall be used to communicate information associated with                            one entity requesting a service from another). Section 7.4.2 COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.ServiceRequestPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 5;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 3;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is requesting service (see 6.2.28), Section 7.4.2 */
   this.requestingEntityID = new dis.EntityID(); 

   /** Entity that is providing the service (see 6.2.28), Section 7.4.2 */
   this.servicingEntityID = new dis.EntityID(); 

   /** Type of service requested, Section 7.4.2 */
   this.serviceTypeRequested = 0;

   /** How many requested, Section 7.4.2 */
   this.numberOfSupplyTypes = 0;

   /** padding */
   this.serviceRequestPadding = 0;

    this.supplies = new Array();
 
  dis.ServiceRequestPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.requestingEntityID.initFromBinary(inputStream);
       this.servicingEntityID.initFromBinary(inputStream);
       this.serviceTypeRequested = inputStream.readUByte();
       this.numberOfSupplyTypes = inputStream.readUByte();
       this.serviceRequestPadding = inputStream.readShort();
       for(var idx = 0; idx < this.numberOfSupplyTypes; idx++)
       {
           var anX = new dis.SupplyQuantity();
           anX.initFromBinary(inputStream);
           this.supplies.push(anX);
       }

  };

  dis.ServiceRequestPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.requestingEntityID.encodeToBinary(outputStream);
       this.servicingEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.serviceTypeRequested);
       outputStream.writeUByte(this.numberOfSupplyTypes);
       outputStream.writeShort(this.serviceRequestPadding);
       for(var idx = 0; idx < this.supplies.length; idx++)
       {
           supplies[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ServiceRequestPdu = dis.ServiceRequestPdu;

// End of ServiceRequestPdu class

/**
 * Section 7.5.10. Change state information with the data contained in this. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.SetDataPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 19;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** ID of request */
   this.requestID = 0;

   /** padding */
   this.padding1 = 0;

   /** Number of fixed datum records */
   this.numberOfFixedDatumRecords = 0;

   /** Number of variable datum records */
   this.numberOfVariableDatumRecords = 0;

   /** variable length list of fixed datums */
    this.fixedDatums = new Array();
 
   /** variable length list of variable length datums */
    this.variableDatums = new Array();
 
  dis.SetDataPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
       this.padding1 = inputStream.readUInt();
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatums.push(anX);
       }

  };

  dis.SetDataPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.requestID);
       outputStream.writeUInt(this.padding1);
       outputStream.writeUInt(this.numberOfFixedDatumRecords);
       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.fixedDatums.length; idx++)
       {
           fixedDatums[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatums.length; idx++)
       {
           variableDatums[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.SetDataPdu = dis.SetDataPdu;

// End of SetDataPdu class

/**
 * Section 5.3.12.9: initializing or chaning internal state information, reliable. Needs manual intervention to fix     padding on variable datums. UNFINISHED
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.SetDataReliablePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 59;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Object originatig the request */
   this.originatingEntityID = new dis.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis.EntityID(); 

   /** level of reliability service used for this transaction */
   this.requiredReliabilityService = 0;

   /** padding */
   this.pad1 = 0;

   /** padding */
   this.pad2 = 0;

   /** Request ID */
   this.requestID = 0;

   /** Fixed datum record count */
   this.numberOfFixedDatumRecords = 0;

   /** variable datum record count */
   this.numberOfVariableDatumRecords = 0;

   /** Fixed datum records */
    this.fixedDatumRecords = new Array();
 
   /** Variable datum records */
    this.variableDatumRecords = new Array();
 
  dis.SetDataReliablePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.requiredReliabilityService = inputStream.readUByte();
       this.pad1 = inputStream.readUShort();
       this.pad2 = inputStream.readUByte();
       this.requestID = inputStream.readUInt();
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatumRecords.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumRecords.push(anX);
       }

  };

  dis.SetDataReliablePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.requiredReliabilityService);
       outputStream.writeUShort(this.pad1);
       outputStream.writeUByte(this.pad2);
       outputStream.writeUInt(this.requestID);
       outputStream.writeUInt(this.numberOfFixedDatumRecords);
       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.fixedDatumRecords.length; idx++)
       {
           fixedDatumRecords[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatumRecords.length; idx++)
       {
           variableDatumRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.SetDataReliablePdu = dis.SetDataReliablePdu;

// End of SetDataReliablePdu class

/**
 *  Detailed information about a radio transmitter. This PDU requires manually written code to complete. The encodingScheme field can be used in multiple        ways, which requires hand-written code to finish. Section 7.7.3. UNFINISHED
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.SignalPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 26;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 4;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** encoding scheme used, and enumeration */
   this.encodingScheme = 0;

   /** tdl type */
   this.tdlType = 0;

   /** sample rate */
   this.sampleRate = 0;

   /** length od data */
   this.dataLength = 0;

   /** number of samples */
   this.samples = 0;

   /** list of eight bit values */
    this.data = new Array();
 
  dis.SignalPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.encodingScheme = inputStream.readUShort();
       this.tdlType = inputStream.readUShort();
       this.sampleRate = inputStream.readUInt();
       this.dataLength = inputStream.readShort();
       this.samples = inputStream.readShort();
       for(var idx = 0; idx < this.dataLength; idx++)
       {
           var anX = new dis.OneByteChunk();
           anX.initFromBinary(inputStream);
           this.data.push(anX);
       }

  };

  dis.SignalPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       outputStream.writeUShort(this.encodingScheme);
       outputStream.writeUShort(this.tdlType);
       outputStream.writeUInt(this.sampleRate);
       outputStream.writeShort(this.dataLength);
       outputStream.writeShort(this.samples);
       for(var idx = 0; idx < this.data.length; idx++)
       {
           data[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.SignalPdu = dis.SignalPdu;

// End of SignalPdu class

/**
 * information abou an enitity not producing espdus. Section 6.2.79
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.SilentEntitySystem = function()
{
   /** number of the type specified by the entity type field */
   this.numberOfEntities = 0;

   /** number of entity appearance records that follow */
   this.numberOfAppearanceRecords = 0;

   /** Entity type */
   this.entityType = new dis.EntityType(); 

   /** Variable length list of appearance records */
    this.appearanceRecordList = new Array();
 
  dis.SilentEntitySystem.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfEntities = inputStream.readUShort();
       this.numberOfAppearanceRecords = inputStream.readUShort();
       this.entityType.initFromBinary(inputStream);
       for(var idx = 0; idx < this.numberOfAppearanceRecords; idx++)
       {
           var anX = new dis.FourByteChunk();
           anX.initFromBinary(inputStream);
           this.appearanceRecordList.push(anX);
       }

  };

  dis.SilentEntitySystem.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.numberOfEntities);
       outputStream.writeUShort(this.numberOfAppearanceRecords);
       this.entityType.encodeToBinary(outputStream);
       for(var idx = 0; idx < this.appearanceRecordList.length; idx++)
       {
           appearanceRecordList[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.SilentEntitySystem = dis.SilentEntitySystem;

// End of SilentEntitySystem class

/**
 * A Simulation Address record shall consist of the Site Identification number and the Application Identification number. Section 6.2.79 
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.SimulationAddress = function()
{
   /** A site is defined as a facility, installation, organizational unit or a geographic location that has one or more simulation applications capable of participating in a distributed event.  */
   this.site = 0;

   /** An application is defined as a software program that is used to generate and process distributed simulation data including live, virtual and constructive data. */
   this.application = 0;

  dis.SimulationAddress.prototype.initFromBinary = function(inputStream)
  {
       this.site = inputStream.readUShort();
       this.application = inputStream.readUShort();
  };

  dis.SimulationAddress.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.site);
       outputStream.writeUShort(this.application);
  };
}; // end of class

 // node.js module support
exports.SimulationAddress = dis.SimulationAddress;

// End of SimulationAddress class

/**
 * The unique designation of a simulation when using the 48-bit identifier format shall be specified by the Sim- ulation Identifier record. The reason that the 48-bit format is required in addition to the 32-bit simulation address format that actually identifies a specific simulation is because some 48-bit identifier fields in PDUs may contain either an Object Identifier, such as an Entity ID, or a Simulation Identifier. Section 6.2.80
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.SimulationIdentifier = function()
{
   /** Simulation address  */
   this.simulationAddress = new dis.SimulationAddress(); 

   /** This field shall be set to zero as there is no reference number associated with a Simulation Identifier. */
   this.referenceNumber = 0;

  dis.SimulationIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.referenceNumber = inputStream.readUShort();
  };

  dis.SimulationIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.referenceNumber);
  };
}; // end of class

 // node.js module support
exports.SimulationIdentifier = dis.SimulationIdentifier;

// End of SimulationIdentifier class

/**
 * Section 7.5 Abstract superclass for PDUs relating to the simulation itself. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.SimulationManagementFamilyPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

  dis.SimulationManagementFamilyPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
  };

  dis.SimulationManagementFamilyPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.SimulationManagementFamilyPdu = dis.SimulationManagementFamilyPdu;

// End of SimulationManagementFamilyPdu class

/**
 * First part of a simulation management (SIMAN) PDU and SIMAN-Reliability (SIMAN-R) PDU. Sectionn 6.2.81
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.SimulationManagementPduHeader = function()
{
   /** Conventional PDU header */
   this.pduHeader = new dis.PduHeader(); 

   /** IDs the simulation or entity, etiehr a simulation or an entity. Either 6.2.80 or 6.2.28 */
   this.originatingID = new dis.SimulationIdentifier(); 

   /** simulation, all simulations, a special ID, or an entity. See 5.6.5 and 5.12.4 */
   this.receivingID = new dis.SimulationIdentifier(); 

  dis.SimulationManagementPduHeader.prototype.initFromBinary = function(inputStream)
  {
       this.pduHeader.initFromBinary(inputStream);
       this.originatingID.initFromBinary(inputStream);
       this.receivingID.initFromBinary(inputStream);
  };

  dis.SimulationManagementPduHeader.prototype.encodeToBinary = function(outputStream)
  {
       this.pduHeader.encodeToBinary(outputStream);
       this.originatingID.encodeToBinary(outputStream);
       this.receivingID.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.SimulationManagementPduHeader = dis.SimulationManagementPduHeader;

// End of SimulationManagementPduHeader class

/**
 * Section 5.3.12: Abstract superclass for reliable simulation management PDUs
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.SimulationManagementWithReliabilityFamilyPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Object originatig the request */
   this.originatingEntityID = new dis.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis.EntityID(); 

  dis.SimulationManagementWithReliabilityFamilyPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
  };

  dis.SimulationManagementWithReliabilityFamilyPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.SimulationManagementWithReliabilityFamilyPdu = dis.SimulationManagementWithReliabilityFamilyPdu;

// End of SimulationManagementWithReliabilityFamilyPdu class

/**
 * Does not work, and causes failure in anything it is embedded in. Section 6.2.83
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.StandardVariableSpecification = function()
{
   /** Number of static variable records */
   this.numberOfStandardVariableRecords = 0;

   /** variable length list of standard variables, The class type and length here are WRONG and will cause the incorrect serialization of any class in whihc it is embedded. */
    this.standardVariables = new Array();
 
  dis.StandardVariableSpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfStandardVariableRecords = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfStandardVariableRecords; idx++)
       {
           var anX = new dis.SimulationManagementPduHeader();
           anX.initFromBinary(inputStream);
           this.standardVariables.push(anX);
       }

  };

  dis.StandardVariableSpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.numberOfStandardVariableRecords);
       for(var idx = 0; idx < this.standardVariables.length; idx++)
       {
           standardVariables[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.StandardVariableSpecification = dis.StandardVariableSpecification;

// End of StandardVariableSpecification class

/**
 * Section 7.5.4. Start or resume an exercise. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.StartResumePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 13;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** Identifier for originating entity(or simulation) */
   this.originatingID = new dis.EntityID(); 

   /** Identifier for the receiving entity(or simulation) */
   this.receivingID = new dis.EntityID(); 

   /** This field shall specify the real-world time (UTC) at which the entity is to start/resume in the exercise. This information shall be used by the participating simulation applications to start/resume an exercise synchronously. This field shall be represented by a Clock Time record (see 6.2.16). */
   this.realWorldTime = new dis.ClockTime(); 

   /** The reference time within a simulation exercise. This time is established ahead of time by simulation management and is common to all participants in a particular exercise. Simulation time may be either Absolute Time or Relative Time. This field shall be represented by a Clock Time record (see 6.2.16) */
   this.simulationTime = new dis.ClockTime(); 

   /** Identifier for the specific and unique start/resume request */
   this.requestID = 0;

  dis.StartResumePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.originatingID.initFromBinary(inputStream);
       this.receivingID.initFromBinary(inputStream);
       this.realWorldTime.initFromBinary(inputStream);
       this.simulationTime.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
  };

  dis.StartResumePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.originatingID.encodeToBinary(outputStream);
       this.receivingID.encodeToBinary(outputStream);
       this.realWorldTime.encodeToBinary(outputStream);
       this.simulationTime.encodeToBinary(outputStream);
       outputStream.writeUInt(this.requestID);
  };
}; // end of class

 // node.js module support
exports.StartResumePdu = dis.StartResumePdu;

// End of StartResumePdu class

/**
 * Section 5.3.12.3: Start resume simulation, relaible. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.StartResumeReliablePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 53;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Object originatig the request */
   this.originatingEntityID = new dis.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis.EntityID(); 

   /** time in real world for this operation to happen */
   this.realWorldTime = new dis.ClockTime(); 

   /** time in simulation for the simulation to resume */
   this.simulationTime = new dis.ClockTime(); 

   /** level of reliability service used for this transaction */
   this.requiredReliabilityService = 0;

   /** padding */
   this.pad1 = 0;

   /** padding */
   this.pad2 = 0;

   /** Request ID */
   this.requestID = 0;

  dis.StartResumeReliablePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.realWorldTime.initFromBinary(inputStream);
       this.simulationTime.initFromBinary(inputStream);
       this.requiredReliabilityService = inputStream.readUByte();
       this.pad1 = inputStream.readUShort();
       this.pad2 = inputStream.readUByte();
       this.requestID = inputStream.readUInt();
  };

  dis.StartResumeReliablePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.realWorldTime.encodeToBinary(outputStream);
       this.simulationTime.encodeToBinary(outputStream);
       outputStream.writeUByte(this.requiredReliabilityService);
       outputStream.writeUShort(this.pad1);
       outputStream.writeUByte(this.pad2);
       outputStream.writeUInt(this.requestID);
  };
}; // end of class

 // node.js module support
exports.StartResumeReliablePdu = dis.StartResumeReliablePdu;

// End of StartResumeReliablePdu class

/**
 * Section 7.5.5. Stop or freeze an enity (or exercise). COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.StopFreezePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 14;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** Identifier for originating entity(or simulation) */
   this.originatingID = new dis.EntityID(); 

   /** Identifier for the receiving entity(or simulation) */
   this.receivingID = new dis.EntityID(); 

   /** real-world(UTC) time at which the entity shall stop or freeze in the exercise */
   this.realWorldTime = new dis.ClockTime(); 

   /** Reason the simulation was stopped or frozen (see section 7 of SISO-REF-010) represented by an 8-bit enumeration */
   this.reason = 0;

   /** Internal behavior of the entity(or simulation) and its appearance while frozen to the other participants */
   this.frozenBehavior = 0;

   /** padding */
   this.padding1 = 0;

   /** Request ID that is unique */
   this.requestID = 0;

  dis.StopFreezePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.originatingID.initFromBinary(inputStream);
       this.receivingID.initFromBinary(inputStream);
       this.realWorldTime.initFromBinary(inputStream);
       this.reason = inputStream.readUByte();
       this.frozenBehavior = inputStream.readUByte();
       this.padding1 = inputStream.readShort();
       this.requestID = inputStream.readUInt();
  };

  dis.StopFreezePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.originatingID.encodeToBinary(outputStream);
       this.receivingID.encodeToBinary(outputStream);
       this.realWorldTime.encodeToBinary(outputStream);
       outputStream.writeUByte(this.reason);
       outputStream.writeUByte(this.frozenBehavior);
       outputStream.writeShort(this.padding1);
       outputStream.writeUInt(this.requestID);
  };
}; // end of class

 // node.js module support
exports.StopFreezePdu = dis.StopFreezePdu;

// End of StopFreezePdu class

/**
 * Section 5.3.12.4: Stop freeze simulation, relaible. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.StopFreezeReliablePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 54;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Object originatig the request */
   this.originatingEntityID = new dis.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis.EntityID(); 

   /** time in real world for this operation to happen */
   this.realWorldTime = new dis.ClockTime(); 

   /** Reason for stopping/freezing simulation */
   this.reason = 0;

   /** internal behvior of the simulation while frozen */
   this.frozenBehavior = 0;

   /** reliablity level */
   this.requiredReliablityService = 0;

   /** padding */
   this.pad1 = 0;

   /** Request ID */
   this.requestID = 0;

  dis.StopFreezeReliablePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.realWorldTime.initFromBinary(inputStream);
       this.reason = inputStream.readUByte();
       this.frozenBehavior = inputStream.readUByte();
       this.requiredReliablityService = inputStream.readUByte();
       this.pad1 = inputStream.readUByte();
       this.requestID = inputStream.readUInt();
  };

  dis.StopFreezeReliablePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.realWorldTime.encodeToBinary(outputStream);
       outputStream.writeUByte(this.reason);
       outputStream.writeUByte(this.frozenBehavior);
       outputStream.writeUByte(this.requiredReliablityService);
       outputStream.writeUByte(this.pad1);
       outputStream.writeUInt(this.requestID);
  };
}; // end of class

 // node.js module support
exports.StopFreezeReliablePdu = dis.StopFreezeReliablePdu;

// End of StopFreezeReliablePdu class

/**
 * Information about an entity's engine fuel. Section 6.2.84.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.StorageFuel = function()
{
   /** Fuel quantity, units specified by next field */
   this.fuelQuantity = 0;

   /** Units in which the fuel is measured */
   this.fuelMeasurementUnits = 0;

   /** Type of fuel */
   this.fuelType = 0;

   /** Location of fuel as related to entity. See section 14 of EBV document */
   this.fuelLocation = 0;

   /** padding */
   this.padding = 0;

  dis.StorageFuel.prototype.initFromBinary = function(inputStream)
  {
       this.fuelQuantity = inputStream.readUInt();
       this.fuelMeasurementUnits = inputStream.readUByte();
       this.fuelType = inputStream.readUByte();
       this.fuelLocation = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.StorageFuel.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.fuelQuantity);
       outputStream.writeUByte(this.fuelMeasurementUnits);
       outputStream.writeUByte(this.fuelType);
       outputStream.writeUByte(this.fuelLocation);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.StorageFuel = dis.StorageFuel;

// End of StorageFuel class

/**
 * For each type or location of Storage Fuel, this record shall specify the type, location, fuel measure- ment units, reload quantity and maximum quantity for storage fuel either for the whole entity or a specific storage fuel location (tank). Section 6.2.85.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.StorageFuelReload = function()
{
   /**  the standard quantity of this fuel type normally loaded at this station/launcher if a station/launcher is specified. If the Station/Launcher field is set to zero, then this is the total quantity of this fuel type that would be present in a standard reload of all appli- cable stations/launchers associated with this entity. */
   this.standardQuantity = 0;

   /** the maximum quantity of this fuel type that this sta- tion/launcher is capable of holding when a station/launcher is specified. This would be the value used when a maximum reload was desired to be set for this station/launcher. If the Station/launcher field is set to zero, then this is the maximum quantity of this fuel type that would be present on this entity at all stations/launchers that can accept this fuel type. */
   this.maximumQuantity = 0;

   /** the seconds normally required to reload the standard quantity of this fuel type at this specific station/launcher. When the Station/Launcher field is set to zero, this shall be the time it takes to perform a standard quantity reload of this fuel type at all applicable stations/launchers for this entity. */
   this.standardQuantityReloadTime = 0;

   /** the seconds normally required to reload the maximum possible quantity of this fuel type at this station/launcher. When the Station/Launcher field is set to zero, this shall be the time it takes to perform a maximum quantity load/reload of this fuel type at all applicable stations/launchers for this entity. */
   this.maximumQuantityReloadTime = 0;

   /** the fuel measurement units. Enumeration */
   this.fuelMeasurementUnits = 0;

   /** Fuel type. Enumeration */
   this.fuelType = 0;

   /** Location of fuel as related to entity. See section 14 of EBV document */
   this.fuelLocation = 0;

   /** padding */
   this.padding = 0;

  dis.StorageFuelReload.prototype.initFromBinary = function(inputStream)
  {
       this.standardQuantity = inputStream.readUInt();
       this.maximumQuantity = inputStream.readUInt();
       this.standardQuantityReloadTime = inputStream.readUByte();
       this.maximumQuantityReloadTime = inputStream.readUByte();
       this.fuelMeasurementUnits = inputStream.readUByte();
       this.fuelType = inputStream.readUByte();
       this.fuelLocation = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.StorageFuelReload.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.standardQuantity);
       outputStream.writeUInt(this.maximumQuantity);
       outputStream.writeUByte(this.standardQuantityReloadTime);
       outputStream.writeUByte(this.maximumQuantityReloadTime);
       outputStream.writeUByte(this.fuelMeasurementUnits);
       outputStream.writeUByte(this.fuelType);
       outputStream.writeUByte(this.fuelLocation);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.StorageFuelReload = dis.StorageFuelReload;

// End of StorageFuelReload class

/**
 *  A supply, and the amount of that supply. Section 6.2.86
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.SupplyQuantity = function()
{
   /** Type of supply */
   this.supplyType = new dis.EntityType(); 

   /** the number of units of a supply type.  */
   this.quantity = 0;

  dis.SupplyQuantity.prototype.initFromBinary = function(inputStream)
  {
       this.supplyType.initFromBinary(inputStream);
       this.quantity = inputStream.readFloat32();
  };

  dis.SupplyQuantity.prototype.encodeToBinary = function(outputStream)
  {
       this.supplyType.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.quantity);
  };
}; // end of class

 // node.js module support
exports.SupplyQuantity = dis.SupplyQuantity;

// End of SupplyQuantity class

/**
 * Section 5.3.11: Abstract superclass for synthetic environment PDUs
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.SyntheticEnvironmentFamilyPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 9;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

  dis.SyntheticEnvironmentFamilyPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.SyntheticEnvironmentFamilyPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.SyntheticEnvironmentFamilyPdu = dis.SyntheticEnvironmentFamilyPdu;

// End of SyntheticEnvironmentFamilyPdu class

/**
 * The ID of the IFF emitting system. NOT COMPLETE. Section 6.2.87
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.SystemIdentifier = function()
{
   /** general type of emitting system, an enumeration */
   this.systemType = 0;

   /** named type of system, an enumeration */
   this.systemName = 0;

   /** mode of operation for the system, an enumeration */
   this.systemMode = 0;

   /** status of this PDU, see section 6.2.15 */
   this.changeOptions = new dis.ChangeOptions(); 

  dis.SystemIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.systemType = inputStream.readUShort();
       this.systemName = inputStream.readUShort();
       this.systemMode = inputStream.readUShort();
       this.changeOptions.initFromBinary(inputStream);
  };

  dis.SystemIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.systemType);
       outputStream.writeUShort(this.systemName);
       outputStream.writeUShort(this.systemMode);
       this.changeOptions.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.SystemIdentifier = dis.SystemIdentifier;

// End of SystemIdentifier class

/**
 * Total number of record sets contained in a logical set of one or more PDUs. Used to transfer ownership, etc Section 6.2.88
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.TotalRecordSets = function()
{
   /** Total number of record sets */
   this.totalRecordSets = 0;

   /** padding */
   this.padding = 0;

  dis.TotalRecordSets.prototype.initFromBinary = function(inputStream)
  {
       this.totalRecordSets = inputStream.readUShort();
       this.padding = inputStream.readUShort();
  };

  dis.TotalRecordSets.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.totalRecordSets);
       outputStream.writeUShort(this.padding);
  };
}; // end of class

 // node.js module support
exports.TotalRecordSets = dis.TotalRecordSets;

// End of TotalRecordSets class

/**
 *  Track-Jam data Section 6.2.89
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.TrackJamData = function()
{
   /** the entity tracked or illumated, or an emitter beam targeted with jamming */
   this.entityID = new dis.EntityID(); 

   /** Emitter system associated with the entity */
   this.emitterNumber = 0;

   /** Beam associated with the entity */
   this.beamNumber = 0;

  dis.TrackJamData.prototype.initFromBinary = function(inputStream)
  {
       this.entityID.initFromBinary(inputStream);
       this.emitterNumber = inputStream.readUByte();
       this.beamNumber = inputStream.readUByte();
  };

  dis.TrackJamData.prototype.encodeToBinary = function(outputStream)
  {
       this.entityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.emitterNumber);
       outputStream.writeUByte(this.beamNumber);
  };
}; // end of class

 // node.js module support
exports.TrackJamData = dis.TrackJamData;

// End of TrackJamData class

/**
 * Detailed information about a radio transmitter. This PDU requires manually written code to complete, since the modulation parameters are of variable length. Section 7.7.2 UNFINISHED
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.TransmitterPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 25;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 4;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entitythat is the source of the communication */
   this.radioReferenceID = new dis.EntityID(); 

   /** particular radio within an entity */
   this.radioNumber = 0;

   /** Type of radio */
   this.radioEntityType = new dis.EntityType(); 

   /** transmit state */
   this.transmitState = 0;

   /** input source */
   this.inputSource = 0;

   /** count field */
   this.variableTransmitterParameterCount = 0;

   /** Location of antenna */
   this.antennaLocation = new dis.Vector3Double(); 

   /** relative location of antenna */
   this.relativeAntennaLocation = new dis.Vector3Float(); 

   /** antenna pattern type */
   this.antennaPatternType = 0;

   /** atenna pattern length */
   this.antennaPatternCount = 0;

   /** frequency */
   this.frequency = 0;

   /** transmit frequency Bandwidth */
   this.transmitFrequencyBandwidth = 0;

   /** transmission power */
   this.power = 0;

   /** modulation */
   this.modulationType = new dis.ModulationType(); 

   /** crypto system enumeration */
   this.cryptoSystem = 0;

   /** crypto system key identifer */
   this.cryptoKeyId = 0;

   /** how many modulation parameters we have */
   this.modulationParameterCount = 0;

   /** padding2 */
   this.padding2 = 0;

   /** padding3 */
   this.padding3 = 0;

   /** variable length list of modulation parameters */
    this.modulationParametersList = new Array();
 
   /** variable length list of antenna pattern records */
    this.antennaPatternList = new Array();
 
  dis.TransmitterPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.radioReferenceID.initFromBinary(inputStream);
       this.radioNumber = inputStream.readUShort();
       this.radioEntityType.initFromBinary(inputStream);
       this.transmitState = inputStream.readUByte();
       this.inputSource = inputStream.readUByte();
       this.variableTransmitterParameterCount = inputStream.readUShort();
       this.antennaLocation.initFromBinary(inputStream);
       this.relativeAntennaLocation.initFromBinary(inputStream);
       this.antennaPatternType = inputStream.readUShort();
       this.antennaPatternCount = inputStream.readUShort();
       this.frequency = inputStream.readLong();
       this.transmitFrequencyBandwidth = inputStream.readFloat32();
       this.power = inputStream.readFloat32();
       this.modulationType.initFromBinary(inputStream);
       this.cryptoSystem = inputStream.readUShort();
       this.cryptoKeyId = inputStream.readUShort();
       this.modulationParameterCount = inputStream.readUByte();
       this.padding2 = inputStream.readUShort();
       this.padding3 = inputStream.readUByte();
       for(var idx = 0; idx < this.modulationParameterCount; idx++)
       {
           var anX = new dis.Vector3Float();
           anX.initFromBinary(inputStream);
           this.modulationParametersList.push(anX);
       }

       for(var idx = 0; idx < this.antennaPatternCount; idx++)
       {
           var anX = new dis.Vector3Float();
           anX.initFromBinary(inputStream);
           this.antennaPatternList.push(anX);
       }

  };

  dis.TransmitterPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.radioReferenceID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.radioNumber);
       this.radioEntityType.encodeToBinary(outputStream);
       outputStream.writeUByte(this.transmitState);
       outputStream.writeUByte(this.inputSource);
       outputStream.writeUShort(this.variableTransmitterParameterCount);
       this.antennaLocation.encodeToBinary(outputStream);
       this.relativeAntennaLocation.encodeToBinary(outputStream);
       outputStream.writeUShort(this.antennaPatternType);
       outputStream.writeUShort(this.antennaPatternCount);
       outputStream.writeLong(this.frequency);
       outputStream.writeFloat32(this.transmitFrequencyBandwidth);
       outputStream.writeFloat32(this.power);
       this.modulationType.encodeToBinary(outputStream);
       outputStream.writeUShort(this.cryptoSystem);
       outputStream.writeUShort(this.cryptoKeyId);
       outputStream.writeUByte(this.modulationParameterCount);
       outputStream.writeUShort(this.padding2);
       outputStream.writeUByte(this.padding3);
       for(var idx = 0; idx < this.modulationParametersList.length; idx++)
       {
           modulationParametersList[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.antennaPatternList.length; idx++)
       {
           antennaPatternList[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.TransmitterPdu = dis.TransmitterPdu;

// End of TransmitterPdu class

/**
 * 16 bit piece of data
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.TwoByteChunk = function()
{
   /** two bytes of arbitrary data */
   this.otherParameters = new Array(0, 0);

  dis.TwoByteChunk.prototype.initFromBinary = function(inputStream)
  {
       for(var idx = 0; idx < 2; idx++)
       {
          this.otherParameters[ idx ] = inputStream.readByte();
       }
  };

  dis.TwoByteChunk.prototype.encodeToBinary = function(outputStream)
  {
       for(var idx = 0; idx < 2; idx++)
       {
          outputStream.writeByte(this.otherParameters[ idx ] );
       }
  };
}; // end of class

 // node.js module support
exports.TwoByteChunk = dis.TwoByteChunk;

// End of TwoByteChunk class

/**
 * Regeneration parameters for active emission systems that are variable throughout a scenario. Section 6.2.91
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.UAFundamentalParameter = function()
{
   /** Which database record shall be used. An enumeration from EBV document */
   this.activeEmissionParameterIndex = 0;

   /** The type of scan pattern, If not used, zero. An enumeration from EBV document */
   this.scanPattern = 0;

   /** center azimuth bearing of th emain beam. In radians. */
   this.beamCenterAzimuthHorizontal = 0;

   /** Horizontal beamwidth of th emain beam Meastued at the 3dB down point of peak radiated power. In radians. */
   this.azimuthalBeamwidthHorizontal = 0;

   /** center of the d/e angle of th emain beam relative to the stablised de angle of the target. In radians. */
   this.beamCenterDepressionElevation = 0;

   /** vertical beamwidth of the main beam. Meastured at the 3dB down point of peak radiated power. In radians. */
   this.beamwidthDownElevation = 0;

  dis.UAFundamentalParameter.prototype.initFromBinary = function(inputStream)
  {
       this.activeEmissionParameterIndex = inputStream.readUShort();
       this.scanPattern = inputStream.readUShort();
       this.beamCenterAzimuthHorizontal = inputStream.readFloat32();
       this.azimuthalBeamwidthHorizontal = inputStream.readFloat32();
       this.beamCenterDepressionElevation = inputStream.readFloat32();
       this.beamwidthDownElevation = inputStream.readFloat32();
  };

  dis.UAFundamentalParameter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.activeEmissionParameterIndex);
       outputStream.writeUShort(this.scanPattern);
       outputStream.writeFloat32(this.beamCenterAzimuthHorizontal);
       outputStream.writeFloat32(this.azimuthalBeamwidthHorizontal);
       outputStream.writeFloat32(this.beamCenterDepressionElevation);
       outputStream.writeFloat32(this.beamwidthDownElevation);
  };
}; // end of class

 // node.js module support
exports.UAFundamentalParameter = dis.UAFundamentalParameter;

// End of UAFundamentalParameter class

/**
 *  Information about underwater acoustic emmissions. This requires manual cleanup.  The beam data records should ALL be a the finish, rather than attached to each emitter system. Section 7.6.4. UNFINISHED
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.UaPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 29;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 6;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that is the source of the emission */
   this.emittingEntityID = new dis.EntityID(); 

   /** ID of event */
   this.eventID = new dis.EventIdentifier(); 

   /** This field shall be used to indicate whether the data in the UA PDU represent a state update or data that have changed since issuance of the last UA PDU */
   this.stateChangeIndicator = 0;

   /** padding */
   this.pad = 0;

   /** This field indicates which database record (or file) shall be used in the definition of passive signature (unintentional) emissions of the entity. The indicated database record (or  file) shall define all noise generated as a function of propulsion plant configurations and associated  auxiliaries. */
   this.passiveParameterIndex = 0;

   /** This field shall specify the entity propulsion plant configuration. This field is used to determine the passive signature characteristics of an entity. */
   this.propulsionPlantConfiguration = 0;

   /**  This field shall represent the number of shafts on a platform */
   this.numberOfShafts = 0;

   /** This field shall indicate the number of APAs described in the current UA PDU */
   this.numberOfAPAs = 0;

   /** This field shall specify the number of UA emitter systems being described in the current UA PDU */
   this.numberOfUAEmitterSystems = 0;

   /** shaft RPM values. THIS IS WRONG. It has the wrong class in the list. */
    this.shaftRPMs = new Array();
 
   /** apaData. THIS IS WRONG. It has the worng class in the list. */
    this.apaData = new Array();
 
   /** THIS IS WRONG. It has the wrong class in the list. */
    this.emitterSystems = new Array();
 
  dis.UaPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.emittingEntityID.initFromBinary(inputStream);
       this.eventID.initFromBinary(inputStream);
       this.stateChangeIndicator = inputStream.readByte();
       this.pad = inputStream.readByte();
       this.passiveParameterIndex = inputStream.readUShort();
       this.propulsionPlantConfiguration = inputStream.readUByte();
       this.numberOfShafts = inputStream.readUByte();
       this.numberOfAPAs = inputStream.readUByte();
       this.numberOfUAEmitterSystems = inputStream.readUByte();
       for(var idx = 0; idx < this.numberOfShafts; idx++)
       {
           var anX = new dis.Vector3Float();
           anX.initFromBinary(inputStream);
           this.shaftRPMs.push(anX);
       }

       for(var idx = 0; idx < this.numberOfAPAs; idx++)
       {
           var anX = new dis.Vector3Float();
           anX.initFromBinary(inputStream);
           this.apaData.push(anX);
       }

       for(var idx = 0; idx < this.numberOfUAEmitterSystems; idx++)
       {
           var anX = new dis.Vector3Float();
           anX.initFromBinary(inputStream);
           this.emitterSystems.push(anX);
       }

  };

  dis.UaPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.emittingEntityID.encodeToBinary(outputStream);
       this.eventID.encodeToBinary(outputStream);
       outputStream.writeByte(this.stateChangeIndicator);
       outputStream.writeByte(this.pad);
       outputStream.writeUShort(this.passiveParameterIndex);
       outputStream.writeUByte(this.propulsionPlantConfiguration);
       outputStream.writeUByte(this.numberOfShafts);
       outputStream.writeUByte(this.numberOfAPAs);
       outputStream.writeUByte(this.numberOfUAEmitterSystems);
       for(var idx = 0; idx < this.shaftRPMs.length; idx++)
       {
           shaftRPMs[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.apaData.length; idx++)
       {
           apaData[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.emitterSystems.length; idx++)
       {
           emitterSystems[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.UaPdu = dis.UaPdu;

// End of UaPdu class

/**
 * The unique designation of one or more unattached radios in an event or exercise Section 6.2.91
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.UnattachedIdentifier = function()
{
   /** See 6.2.79 */
   this.simulationAddress = new dis.SimulationAddress(); 

   /** Reference number */
   this.referenceNumber = 0;

  dis.UnattachedIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.referenceNumber = inputStream.readUShort();
  };

  dis.UnattachedIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.referenceNumber);
  };
}; // end of class

 // node.js module support
exports.UnattachedIdentifier = dis.UnattachedIdentifier;

// End of UnattachedIdentifier class

/**
 * container class not in specification
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.UnsignedDISInteger = function()
{
   /** unsigned integer */
   this.val = 0;

  dis.UnsignedDISInteger.prototype.initFromBinary = function(inputStream)
  {
       this.val = inputStream.readUInt();
  };

  dis.UnsignedDISInteger.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.val);
  };
}; // end of class

 // node.js module support
exports.UnsignedDISInteger = dis.UnsignedDISInteger;

// End of UnsignedDISInteger class

/**
 * the variable datum type, the datum length, and the value for that variable datum type. NOT COMPLETE. Section 6.2.93
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.VariableDatum = function()
{
   /** Type of variable datum to be transmitted. 32 bit enumeration defined in EBV */
   this.variableDatumID = 0;

   /** Length, IN BITS, of the variable datum. */
   this.variableDatumLength = 0;

   /** Variable datum. This can be any number of bits long, depending on the datum. */
   this.variableDatumBits = 0;

  dis.VariableDatum.prototype.initFromBinary = function(inputStream)
  {
       this.variableDatumID = inputStream.readUInt();
       this.variableDatumLength = inputStream.readUInt();
       this.variableDatumBits = inputStream.readUInt();
  };

  dis.VariableDatum.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.variableDatumID);
       outputStream.writeUInt(this.variableDatumLength);
       outputStream.writeUInt(this.variableDatumBits);
  };
}; // end of class

 // node.js module support
exports.VariableDatum = dis.VariableDatum;

// End of VariableDatum class

/**
 * specification of additional information associated with an entity or detonation, not otherwise accounted for in a PDU 6.2.94.1
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.VariableParameter = function()
{
   /** the identification of the Variable Parameter record. Enumeration from EBV */
   this.recordType = 0;

   /** Variable parameter data fields. Two doubles minus one byte */
   this.variableParameterFields1 = 0;

   /** Variable parameter data fields.  */
   this.variableParameterFields2 = 0;

   /** Variable parameter data fields.  */
   this.variableParameterFields3 = 0;

   /** Variable parameter data fields.  */
   this.variableParameterFields4 = 0;

  dis.VariableParameter.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUByte();
       this.variableParameterFields1 = inputStream.readFloat64();
       this.variableParameterFields2 = inputStream.readUInt();
       this.variableParameterFields3 = inputStream.readUShort();
       this.variableParameterFields4 = inputStream.readUByte();
  };

  dis.VariableParameter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.recordType);
       outputStream.writeFloat64(this.variableParameterFields1);
       outputStream.writeUInt(this.variableParameterFields2);
       outputStream.writeUShort(this.variableParameterFields3);
       outputStream.writeUByte(this.variableParameterFields4);
  };
}; // end of class

 // node.js module support
exports.VariableParameter = dis.VariableParameter;

// End of VariableParameter class

/**
 * Relates to radios. NOT COMPLETE. Section 6.2.94
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.VariableTransmitterParameters = function()
{
   /** Type of VTP. Enumeration from EBV */
   this.recordType = 0;

   /** Length, in bytes */
   this.recordLength = 4;

  dis.VariableTransmitterParameters.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUInt();
  };

  dis.VariableTransmitterParameters.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUInt(this.recordLength);
  };
}; // end of class

 // node.js module support
exports.VariableTransmitterParameters = dis.VariableTransmitterParameters;

// End of VariableTransmitterParameters class

/**
 * Two floating point values, x, y
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.Vector2Float = function()
{
   /** X value */
   this.x = 0;

   /** y Value */
   this.y = 0;

  dis.Vector2Float.prototype.initFromBinary = function(inputStream)
  {
       this.x = inputStream.readFloat32();
       this.y = inputStream.readFloat32();
  };

  dis.Vector2Float.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.x);
       outputStream.writeFloat32(this.y);
  };
}; // end of class

 // node.js module support
exports.Vector2Float = dis.Vector2Float;

// End of Vector2Float class

/**
 * Three double precision floating point values, x, y, and z. Used for world coordinates Section 6.2.97.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.Vector3Double = function()
{
   /** X value */
   this.x = 0;

   /** y Value */
   this.y = 0;

   /** Z value */
   this.z = 0;

  dis.Vector3Double.prototype.initFromBinary = function(inputStream)
  {
       this.x = inputStream.readFloat64();
       this.y = inputStream.readFloat64();
       this.z = inputStream.readFloat64();
  };

  dis.Vector3Double.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat64(this.x);
       outputStream.writeFloat64(this.y);
       outputStream.writeFloat64(this.z);
  };
}; // end of class

 // node.js module support
exports.Vector3Double = dis.Vector3Double;

// End of Vector3Double class

/**
 * Three floating point values, x, y, and z. Section 6.2.95
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.Vector3Float = function()
{
   /** X value */
   this.x = 0;

   /** y Value */
   this.y = 0;

   /** Z value */
   this.z = 0;

  dis.Vector3Float.prototype.initFromBinary = function(inputStream)
  {
       this.x = inputStream.readFloat32();
       this.y = inputStream.readFloat32();
       this.z = inputStream.readFloat32();
  };

  dis.Vector3Float.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.x);
       outputStream.writeFloat32(this.y);
       outputStream.writeFloat32(this.z);
  };
}; // end of class

 // node.js module support
exports.Vector3Float = dis.Vector3Float;

// End of Vector3Float class

/**
 * Operational data for describing the vectoring nozzle systems Section 6.2.96
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.VectoringNozzleSystem = function()
{
   /** In degrees */
   this.horizontalDeflectionAngle = 0;

   /** In degrees */
   this.verticalDeflectionAngle = 0;

  dis.VectoringNozzleSystem.prototype.initFromBinary = function(inputStream)
  {
       this.horizontalDeflectionAngle = inputStream.readFloat32();
       this.verticalDeflectionAngle = inputStream.readFloat32();
  };

  dis.VectoringNozzleSystem.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.horizontalDeflectionAngle);
       outputStream.writeFloat32(this.verticalDeflectionAngle);
  };
}; // end of class

 // node.js module support
exports.VectoringNozzleSystem = dis.VectoringNozzleSystem;

// End of VectoringNozzleSystem class

/**
 * abstract superclass for fire and detonation pdus that have shared information. Section 7.3 COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis.WarfareFamilyPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 2;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that shot */
   this.firingEntityID = new dis.EntityID(); 

   /** ID of the entity that is being shot at */
   this.targetEntityID = new dis.EntityID(); 

  dis.WarfareFamilyPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.firingEntityID.initFromBinary(inputStream);
       this.targetEntityID.initFromBinary(inputStream);
  };

  dis.WarfareFamilyPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.firingEntityID.encodeToBinary(outputStream);
       this.targetEntityID.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.WarfareFamilyPdu = dis.WarfareFamilyPdu;

// End of WarfareFamilyPdu class


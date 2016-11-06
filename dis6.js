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
/**
 * Obsolete--the code generation now includes methods for accessing bit
 * fields such as this. Remains only for backward compatiblity, and I doubt
 * anyone is using it.
 * 
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
    
    /**
     * Returns a byte array trimmed to the maximum number of bytes written
     * to the stream. Eg, if we initialize with a 500 byte bufer, and we
     * only write 10 bytes to the output stream, this will return the first
     * ten bytes of the array.
     * 
     * @returns {ArrayBuffer} Only the data written
     */
    dis.OutputStream.prototype.toByteArray = function()
    {
        var trimmedData = this.binaryData.slice(0, this.currentPosition); 
        return trimmedData;
    };
    
    
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

/*
  License for the Geodesy package at https://github.com/chrisveness/geodesy

  The code was lightly modified to make it work in the browser instead of node.
The MIT License (MIT)

Copyright (c) 2014 Chris Veness

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*//* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy representation conversion functions                        (c) Chris Veness 2002-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong.html                                                    */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-dms.html                                    */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* eslint no-irregular-whitespace: [2, { skipComments: true }] */


/**
 * Latitude/longitude points may be represented as decimal degrees, or subdivided into sexagesimal
 * minutes and seconds.
 *
 * @module dms
 */


/**
 * Functions for parsing and representing degrees / minutes / seconds.
 * @class Dms
 */
var Dms = {};

// note Unicode Degree = U+00B0. Prime = U+2032, Double prime = U+2033


/**
 * Parses string representing degrees/minutes/seconds into numeric degrees.
 *
 * This is very flexible on formats, allowing signed decimal degrees, or deg-min-sec optionally
 * suffixed by compass direction (NSEW). A variety of separators are accepted (eg 3° 37′ 09″W).
 * Seconds and minutes may be omitted.
 *
 * @param   {string|number} dmsStr - Degrees or deg/min/sec in variety of formats.
 * @returns {number} Degrees as decimal number.
 *
 * @example
 *     var lat = Dms.parseDMS('51° 28′ 40.12″ N');
 *     var lon = Dms.parseDMS('000° 00′ 05.31″ W');
 *     var p1 = new LatLon(lat, lon); // 51.4778°N, 000.0015°W
 */
Dms.parseDMS = function(dmsStr) {
    // check for signed decimal degrees without NSEW, if so return it directly
    if (typeof dmsStr == 'number' && isFinite(dmsStr)) return Number(dmsStr);

    // strip off any sign or compass dir'n & split out separate d/m/s
    var dms = String(dmsStr).trim().replace(/^-/, '').replace(/[NSEW]$/i, '').split(/[^0-9.,]+/);
    if (dms[dms.length-1]=='') dms.splice(dms.length-1);  // from trailing symbol

    if (dms == '') return NaN;

    // and convert to decimal degrees...
    var deg;
    switch (dms.length) {
        case 3:  // interpret 3-part result as d/m/s
            deg = dms[0]/1 + dms[1]/60 + dms[2]/3600;
            break;
        case 2:  // interpret 2-part result as d/m
            deg = dms[0]/1 + dms[1]/60;
            break;
        case 1:  // just d (possibly decimal) or non-separated dddmmss
            deg = dms[0];
            // check for fixed-width unseparated format eg 0033709W
            //if (/[NS]/i.test(dmsStr)) deg = '0' + deg;  // - normalise N/S to 3-digit degrees
            //if (/[0-9]{7}/.test(deg)) deg = deg.slice(0,3)/1 + deg.slice(3,5)/60 + deg.slice(5)/3600;
            break;
        default:
            return NaN;
    }
    if (/^-|[WS]$/i.test(dmsStr.trim())) deg = -deg; // take '-', west and south as -ve

    return Number(deg);
};


/**
 * Separator character to be used to separate degrees, minutes, seconds, and cardinal directions.
 *
 * Set to '\u202f' (narrow no-break space) for improved formatting.
 *
 * @example
 *   var p = new LatLon(51.2, 0.33);  // 51°12′00.0″N, 000°19′48.0″E
 *   Dms.separator = '\u202f';        // narrow no-break space
 *   var pʹ = new LatLon(51.2, 0.33); // 51° 12′ 00.0″ N, 000° 19′ 48.0″ E
 */
Dms.separator = '';


/**
 * Converts decimal degrees to deg/min/sec format
 *  - degree, prime, double-prime symbols are added, but sign is discarded, though no compass
 *    direction is added.
 *
 * @private
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Dms.toDMS = function(deg, format, dp) {
    if (isNaN(deg)) return null;  // give up here if we can't make a number from deg

    // default values
    if (format === undefined) format = 'dms';
    if (dp === undefined) {
        switch (format) {
            case 'd':    case 'deg':         dp = 4; break;
            case 'dm':   case 'deg+min':     dp = 2; break;
            case 'dms':  case 'deg+min+sec': dp = 0; break;
            default:    format = 'dms'; dp = 0;  // be forgiving on invalid format
        }
    }

    deg = Math.abs(deg);  // (unsigned result ready for appending compass dir'n)

    var dms, d, m, s;
    switch (format) {
        default: // invalid format spec!
        case 'd': case 'deg':
            d = deg.toFixed(dp);                // round/right-pad degrees
            if (d<100) d = '0' + d;             // left-pad with leading zeros (note may include decimals)
            if (d<10) d = '0' + d;
            dms = d + '°';
            break;
        case 'dm': case 'deg+min':
            d = Math.floor(deg);                // get component deg
            m = ((deg*60) % 60).toFixed(dp);    // get component min & round/right-pad
            d = ('000'+d).slice(-3);            // left-pad with leading zeros
            if (m<10) m = '0' + m;              // left-pad with leading zeros (note may include decimals)
            dms = d + '°'+Dms.separator + m + '′';
            break;
        case 'dms': case 'deg+min+sec':
            d = Math.floor(deg);                // get component deg
            m = Math.floor((deg*3600)/60) % 60; // get component min
            s = (deg*3600 % 60).toFixed(dp);    // get component sec & round/right-pad
            d = ('000'+d).slice(-3);            // left-pad with leading zeros
            m = ('00'+m).slice(-2);             // left-pad with leading zeros
            if (s<10) s = '0' + s;              // left-pad with leading zeros (note may include decimals)
            dms = d + '°'+Dms.separator + m + '′'+Dms.separator + s + '″';
            break;
    }

    return dms;
};


/**
 * Converts numeric degrees to deg/min/sec latitude (2-digit degrees, suffixed with N/S).
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Dms.toLat = function(deg, format, dp) {
    var lat = Dms.toDMS(deg, format, dp);
    return lat===null ? '–' : lat.slice(1)+Dms.separator + (deg<0 ? 'S' : 'N');  // knock off initial '0' for lat!
};


/**
 * Convert numeric degrees to deg/min/sec longitude (3-digit degrees, suffixed with E/W)
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Dms.toLon = function(deg, format, dp) {
    var lon = Dms.toDMS(deg, format, dp);
    return lon===null ? '–' : lon+Dms.separator + (deg<0 ? 'W' : 'E');
};


/**
 * Converts numeric degrees to deg/min/sec as a bearing (0°..360°)
 *
 * @param   {number} deg - Degrees to be formatted as specified.
 * @param   {string} [format=dms] - Return value as 'd', 'dm', 'dms' for deg, deg+min, deg+min+sec.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use – default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Degrees formatted as deg/min/secs according to specified format.
 */
Dms.toBrng = function(deg, format, dp) {
    deg = (Number(deg)+360) % 360;  // normalise -ve values to 180°..360°
    var brng =  Dms.toDMS(deg, format, dp);
    return brng===null ? '–' : brng.replace('360', '0');  // just in case rounding took us up to 360°!
};


/**
 * Returns compass point (to given precision) for supplied bearing.
 *
 * @param   {number} bearing - Bearing in degrees from north.
 * @param   {number} [precision=3] - Precision (1:cardinal / 2:intercardinal / 3:secondary-intercardinal).
 * @returns {string} Compass point for supplied bearing.
 *
 * @example
 *   var point = Dms.compassPoint(24);    // point = 'NNE'
 *   var point = Dms.compassPoint(24, 1); // point = 'N'
 */
Dms.compassPoint = function(bearing, precision) {
    if (precision === undefined) precision = 3;
    // note precision = max length of compass point; it could be extended to 4 for quarter-winds
    // (eg NEbN), but I think they are little used

    bearing = ((bearing%360)+360)%360; // normalise to 0..360

    var point;

    switch (precision) {
        case 1: // 4 compass points
            switch (Math.round(bearing*4/360)%4) {
                case 0: point = 'N'; break;
                case 1: point = 'E'; break;
                case 2: point = 'S'; break;
                case 3: point = 'W'; break;
            }
            break;
        case 2: // 8 compass points
            switch (Math.round(bearing*8/360)%8) {
                case 0: point = 'N';  break;
                case 1: point = 'NE'; break;
                case 2: point = 'E';  break;
                case 3: point = 'SE'; break;
                case 4: point = 'S';  break;
                case 5: point = 'SW'; break;
                case 6: point = 'W';  break;
                case 7: point = 'NW'; break;
            }
            break;
        case 3: // 16 compass points
            switch (Math.round(bearing*16/360)%16) {
                case  0: point = 'N';   break;
                case  1: point = 'NNE'; break;
                case  2: point = 'NE';  break;
                case  3: point = 'ENE'; break;
                case  4: point = 'E';   break;
                case  5: point = 'ESE'; break;
                case  6: point = 'SE';  break;
                case  7: point = 'SSE'; break;
                case  8: point = 'S';   break;
                case  9: point = 'SSW'; break;
                case 10: point = 'SW';  break;
                case 11: point = 'WSW'; break;
                case 12: point = 'W';   break;
                case 13: point = 'WNW'; break;
                case 14: point = 'NW';  break;
                case 15: point = 'NNW'; break;
            }
            break;
        default:
            throw new RangeError('Precision must be between 1 and 3');
    }

    return point;
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Polyfill String.trim for old browsers
 *  (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (String.prototype.trim === undefined) {
    String.prototype.trim = function() {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Geodesy tools for an ellipsoidal earth model                       (c) Chris Veness 2005-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-convert-coords.html                                     */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-latlon-ellipsoidal.html                     */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

'use strict';
if (typeof module!='undefined' && module.exports) var Vector3d = require('./vector3d.js'); // ≡ import Vector3d from 'vector3d.js'
if (typeof module!='undefined' && module.exports) var Dms = require('./dms.js');           // ≡ import Dms from 'dms.js'


/**
 * Library of geodesy functions for operations on an ellipsoidal earth model.
 *
 * Includes ellipsoid parameters and datums for different coordinate systems, and methods for
 * converting between them and to cartesian coordinates.
 *
 * q.v. Ordnance Survey ‘A guide to coordinate systems in Great Britain’ Section 6
 * www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf.
 *
 * @module   latlon-ellipsoidal
 * @requires dms
 */


/**
 * Creates lat/lon (polar) point with latitude & longitude values, on a specified datum.
 *
 * @constructor
 * @param {number}       lat - Geodetic latitude in degrees.
 * @param {number}       lon - Longitude in degrees.
 * @param {LatLon.datum} [datum=WGS84] - Datum this point is defined within.
 *
 * @example
 *     var p1 = new LatLon(51.4778, -0.0016, LatLon.datum.WGS84);
 */
function LatLon(lat, lon, datum) {
    // allow instantiation without 'new'
    if (!(this instanceof LatLon)) return new LatLon(lat, lon, datum);

    if (datum === undefined) datum = LatLon.datum.WGS84;

    this.lat = Number(lat);
    this.lon = Number(lon);
    this.datum = datum;
}


/**
 * Ellipsoid parameters; major axis (a), minor axis (b), and flattening (f) for each ellipsoid.
 */
LatLon.ellipsoid = {
    WGS84:        { a: 6378137,     b: 6356752.31425, f: 1/298.257223563 },
    GRS80:        { a: 6378137,     b: 6356752.31414, f: 1/298.257222101 },
    Airy1830:     { a: 6377563.396, b: 6356256.909,   f: 1/299.3249646   },
    AiryModified: { a: 6377340.189, b: 6356034.448,   f: 1/299.3249646   },
    Intl1924:     { a: 6378388,     b: 6356911.946,   f: 1/297           },
    Bessel1841:   { a: 6377397.155, b: 6356078.963,   f: 1/299.152815351 },
};

/**
 * Datums; with associated ellipsoid, and Helmert transform parameters to convert from WGS 84 into
 * given datum.
 *
 * Note that precision of various datums will vary, and WGS-84 (original) is not defined to be
 * accurate to better than ±1 metre. No transformation should be assumed to be accurate to better
 * than a meter; for many datums somewhat less.
 */
LatLon.datum = {
    // transforms: t in metres, s in ppm, r in arcseconds                    tx       ty        tz       s        rx       ry       rz
    ED50:       { ellipsoid: LatLon.ellipsoid.Intl1924,      transform: [   89.5,    93.8,    123.1,    -1.2,     0.0,     0.0,     0.156  ] },
    Irl1975:    { ellipsoid: LatLon.ellipsoid.AiryModified,  transform: [ -482.530, 130.596, -564.557,  -8.150,  -1.042,  -0.214,  -0.631  ] },
    NAD27:      { ellipsoid: LatLon.ellipsoid.Clarke1866,    transform: [    8,    -160,     -176,       0,       0,       0,       0      ] },
    NAD83:      { ellipsoid: LatLon.ellipsoid.GRS80,         transform: [    1.004,  -1.910,   -0.515,  -0.0015,  0.0267,  0.00034, 0.011  ] },
    NTF:        { ellipsoid: LatLon.ellipsoid.Clarke1880IGN, transform: [  168,      60,     -320,       0,       0,       0,       0      ] },
    OSGB36:     { ellipsoid: LatLon.ellipsoid.Airy1830,      transform: [ -446.448, 125.157, -542.060,  20.4894, -0.1502, -0.2470, -0.8421 ] },
    Potsdam:    { ellipsoid: LatLon.ellipsoid.Bessel1841,    transform: [ -582,    -105,     -414,      -8.3,     1.04,    0.35,   -3.08   ] },
    TokyoJapan: { ellipsoid: LatLon.ellipsoid.Bessel1841,    transform: [  148,    -507,     -685,       0,       0,       0,       0      ] },
    WGS72:      { ellipsoid: LatLon.ellipsoid.WGS72,         transform: [    0,       0,     -4.5,      -0.22,    0,       0,       0.554  ] },
    WGS84:      { ellipsoid: LatLon.ellipsoid.WGS84,         transform: [    0.0,     0.0,      0.0,     0.0,     0.0,     0.0,     0.0    ] },
};
/* sources:
 * - ED50:          www.gov.uk/guidance/oil-and-gas-petroleum-operations-notices#pon-4
 * - Irl1975:       www.osi.ie/wp-content/uploads/2015/05/transformations_booklet.pdf
 *   ... note: many sources have opposite sign to rotations - to be checked!
 * - NAD27:         en.wikipedia.org/wiki/Helmert_transformation
 * - NAD83: (2009); www.uvm.edu/giv/resources/WGS84_NAD83.pdf
 *   ... note: functionally ≡ WGS84 - if you *really* need to convert WGS84<->NAD83, you need more knowledge than this!
 * - NTF:           Nouvelle Triangulation Francaise geodesie.ign.fr/contenu/fichiers/Changement_systeme_geodesique.pdf
 * - OSGB36:        www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf
 * - Potsdam:       kartoweb.itc.nl/geometrics/Coordinate%20transformations/coordtrans.html
 * - TokyoJapan:    www.geocachingtoolbox.com?page=datumEllipsoidDetails
 * - WGS72:         www.icao.int/safety/pbn/documentation/eurocontrol/eurocontrol wgs 84 implementation manual.pdf
 *
 * more transform parameters are available from earth-info.nga.mil/GandG/coordsys/datums/NATO_DT.pdf,
 * www.fieldenmaps.info/cconv/web/cconv_params.js
 */


/**
 * Converts ‘this’ lat/lon coordinate to new coordinate system.
 *
 * @param   {LatLon.datum} toDatum - Datum this coordinate is to be converted to.
 * @returns {LatLon} This point converted to new datum.
 *
 * @example
 *     var pWGS84 = new LatLon(51.4778, -0.0016, LatLon.datum.WGS84);
 *     var pOSGB = pWGS84.convertDatum(LatLon.datum.OSGB36); // 51.4773°N, 000.0000°E
 */
LatLon.prototype.convertDatum = function(toDatum) {
    var oldLatLon = this;
    var transform = null;

    if (oldLatLon.datum == LatLon.datum.WGS84) {
        // converting from WGS 84
        transform = toDatum.transform;
    }
    if (toDatum == LatLon.datum.WGS84) {
        // converting to WGS 84; use inverse transform (don't overwrite original!)
        transform = [];
        for (var p=0; p<7; p++) transform[p] = -oldLatLon.datum.transform[p];
    }
    if (transform == null) {
        // neither this.datum nor toDatum are WGS84: convert this to WGS84 first
        oldLatLon = this.convertDatum(LatLon.datum.WGS84);
        transform = toDatum.transform;
    }

    var oldCartesian = oldLatLon.toCartesian();                // convert polar to cartesian...
    var newCartesian = oldCartesian.applyTransform(transform); // ...apply transform...
    var newLatLon = newCartesian.toLatLonE(toDatum);           // ...and convert cartesian to polar

    return newLatLon;
};


/**
 * Converts ‘this’ point from (geodetic) latitude/longitude coordinates to (geocentric) cartesian
 * (x/y/z) coordinates.
 *
 * @returns {Vector3d} Vector pointing to lat/lon point, with x, y, z in metres from earth centre.
 */
LatLon.prototype.toCartesian = function() {
    var φ = this.lat.toRadians(), λ = this.lon.toRadians();
    var h = 0; // height above ellipsoid - not currently used
    var a = this.datum.ellipsoid.a, f = this.datum.ellipsoid.f;

    var sinφ = Math.sin(φ), cosφ = Math.cos(φ);
    var sinλ = Math.sin(λ), cosλ = Math.cos(λ);

    var eSq = 2*f - f*f;                      // 1st eccentricity squared ≡ (a²-b²)/a²
    var ν = a / Math.sqrt(1 - eSq*sinφ*sinφ); // radius of curvature in prime vertical

    var x = (ν+h) * cosφ * cosλ;
    var y = (ν+h) * cosφ * sinλ;
    var z = (ν*(1-eSq)+h) * sinφ;

    var point = new Vector3d(x, y, z);

    return point;
};


/**
 * Converts ‘this’ (geocentric) cartesian (x/y/z) point to (ellipsoidal geodetic) latitude/longitude
 * coordinates on specified datum.
 *
 * Uses Bowring’s (1985) formulation for μm precision in concise form.
 *
 * @param {LatLon.datum.transform} datum - Datum to use when converting point.
 */
Vector3d.prototype.toLatLonE = function(datum) {
    var x = this.x, y = this.y, z = this.z;
    var a = datum.ellipsoid.a, b = datum.ellipsoid.b, f = datum.ellipsoid.f;

    var e2 = 2*f - f*f;   // 1st eccentricity squared ≡ (a²-b²)/a²
    var ε2 = e2 / (1-e2); // 2nd eccentricity squared ≡ (a²-b²)/b²
    var p = Math.sqrt(x*x + y*y); // distance from minor axis
    var R = Math.sqrt(p*p + z*z); // polar radius

    // parametric latitude (Bowring eqn 17, replacing tanβ = z·a / p·b)
    var tanβ = (b*z)/(a*p) * (1+ε2*b/R);
    var sinβ = tanβ / Math.sqrt(1+tanβ*tanβ);
    var cosβ = sinβ / tanβ;

    // geodetic latitude (Bowring eqn 18: tanφ = z+ε²bsin³β / p−e²cos³β)
    var φ = isNaN(cosβ) ? 0 : Math.atan2(z + ε2*b*sinβ*sinβ*sinβ, p - e2*a*cosβ*cosβ*cosβ);

    // longitude
    var λ = Math.atan2(y, x);

    // height above ellipsoid (Bowring eqn 7) [not currently used]
    var sinφ = Math.sin(φ), cosφ = Math.cos(φ);
    var ν = a/Math.sqrt(1-e2*sinφ*sinφ); // length of the normal terminated by the minor axis
    var h = p*cosφ + z*sinφ - (a*a/ν);

    var point = new LatLon(φ.toDegrees(), λ.toDegrees(), datum);

    return point;
};

/**
 * Applies Helmert transform to ‘this’ point using transform parameters t.
 *
 * @private
 * @param   {number[]} t - Transform to apply to this point.
 * @returns {Vector3} Transformed point.
 */
Vector3d.prototype.applyTransform = function(t)   {
    // this point
    var x1 = this.x, y1 = this.y, z1 = this.z;

    // transform parameters
    var tx = t[0];                    // x-shift
    var ty = t[1];                    // y-shift
    var tz = t[2];                    // z-shift
    var s1 = t[3]/1e6 + 1;            // scale: normalise parts-per-million to (s+1)
    var rx = (t[4]/3600).toRadians(); // x-rotation: normalise arcseconds to radians
    var ry = (t[5]/3600).toRadians(); // y-rotation: normalise arcseconds to radians
    var rz = (t[6]/3600).toRadians(); // z-rotation: normalise arcseconds to radians

    // apply transform
    var x2 = tx + x1*s1 - y1*rz + z1*ry;
    var y2 = ty + x1*rz + y1*s1 - z1*rx;
    var z2 = tz - x1*ry + y1*rx + z1*s1;

    return new Vector3d(x2, y2, z2);
};


/**
 * Returns a string representation of ‘this’ point, formatted as degrees, degrees+minutes, or
 * degrees+minutes+seconds.
 *
 * @param   {string} [format=dms] - Format point as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use - default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Comma-separated latitude/longitude.
 */
LatLon.prototype.toString = function(format, dp) {
    return Dms.toLat(this.lat, format, dp) + ', ' + Dms.toLon(this.lon, format, dp);
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = LatLon, module.exports.Vector3d = Vector3d; // ≡ export { LatLon as default, Vector3d }
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Latitude/longitude spherical geodesy tools                         (c) Chris Veness 2002-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong.html                                                    */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-latlon-spherical.html                       */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/**
 * Library of geodesy functions for operations on a spherical earth model.
 *
 * @module   latlon-spherical
 * @requires dms
 */


/**
 * Creates a LatLon point on the earth's surface at the specified latitude / longitude.
 *
 * @constructor
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 */
function LatLon(lat, lon) {
    // allow instantiation without 'new'
    if (!(this instanceof LatLon)) return new LatLon(lat, lon);

    this.lat = Number(lat);
    this.lon = Number(lon);
}


/**
 * Returns the distance from ‘this’ point to destination point (using haversine formula).
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number} Distance between this point and destination point, in same units as radius.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 *     var p2 = new LatLon(48.857, 2.351);
 *     var d = p1.distanceTo(p2); // 404.3 km
 */
LatLon.prototype.distanceTo = function(point, radius) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
    radius = (radius === undefined) ? 6371e3 : Number(radius);

    var R = radius;
    var φ1 = this.lat.toRadians(),  λ1 = this.lon.toRadians();
    var φ2 = point.lat.toRadians(), λ2 = point.lon.toRadians();
    var Δφ = φ2 - φ1;
    var Δλ = λ2 - λ1;

    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2)
          + Math.cos(φ1) * Math.cos(φ2)
          * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;

    return d;
};


/**
 * Returns the (initial) bearing from ‘this’ point to destination point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Initial bearing in degrees from north.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 *     var p2 = new LatLon(48.857, 2.351);
 *     var b1 = p1.bearingTo(p2); // 156.2°
 */
LatLon.prototype.bearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    var φ1 = this.lat.toRadians(), φ2 = point.lat.toRadians();
    var Δλ = (point.lon-this.lon).toRadians();

    // see http://mathforum.org/library/drmath/view/55417.html
    var y = Math.sin(Δλ) * Math.cos(φ2);
    var x = Math.cos(φ1)*Math.sin(φ2) -
            Math.sin(φ1)*Math.cos(φ2)*Math.cos(Δλ);
    var θ = Math.atan2(y, x);

    return (θ.toDegrees()+360) % 360;
};


/**
 * Returns final bearing arriving at destination destination point from ‘this’ point; the final bearing
 * will differ from the initial bearing by varying degrees according to distance and latitude.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Final bearing in degrees from north.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 *     var p2 = new LatLon(48.857, 2.351);
 *     var b2 = p1.finalBearingTo(p2); // 157.9°
 */
LatLon.prototype.finalBearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    // get initial bearing from destination point to this point & reverse it by adding 180°
    return ( point.bearingTo(this)+180 ) % 360;
};


/**
 * Returns the midpoint between ‘this’ point and the supplied point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {LatLon} Midpoint between this point and the supplied point.
 *
 * @example
 *     var p1 = new LatLon(52.205, 0.119);
 *     var p2 = new LatLon(48.857, 2.351);
 *     var pMid = p1.midpointTo(p2); // 50.5363°N, 001.2746°E
 */
LatLon.prototype.midpointTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    // φm = atan2( sinφ1 + sinφ2, √( (cosφ1 + cosφ2⋅cosΔλ) ⋅ (cosφ1 + cosφ2⋅cosΔλ) ) + cos²φ2⋅sin²Δλ )
    // λm = λ1 + atan2(cosφ2⋅sinΔλ, cosφ1 + cosφ2⋅cosΔλ)
    // see http://mathforum.org/library/drmath/view/51822.html for derivation

    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var φ2 = point.lat.toRadians();
    var Δλ = (point.lon-this.lon).toRadians();

    var Bx = Math.cos(φ2) * Math.cos(Δλ);
    var By = Math.cos(φ2) * Math.sin(Δλ);

    var x = Math.sqrt((Math.cos(φ1) + Bx) * (Math.cos(φ1) + Bx) + By * By);
    var y = Math.sin(φ1) + Math.sin(φ2);
    var φ3 = Math.atan2(y, x);

    var λ3 = λ1 + Math.atan2(By, Math.cos(φ1) + Bx);

    return new LatLon(φ3.toDegrees(), (λ3.toDegrees()+540)%360-180); // normalise to −180..+180°
};


/**
 * Returns the point at given fraction between ‘this’ point and specified point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @param   {number} fraction - Fraction between the two points (0 = this point, 1 = specified point).
 * @returns {LatLon} Intermediate point between this point and destination point.
 *
 * @example
 *   let p1 = new LatLon(52.205, 0.119);
 *   let p2 = new LatLon(48.857, 2.351);
 *   let pMid = p1.intermediatePointTo(p2, 0.25); // 51.3721°N, 000.7073°E
 */
LatLon.prototype.intermediatePointTo = function(point, fraction) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var φ2 = point.lat.toRadians(), λ2 = point.lon.toRadians();
    var sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1), sinλ1 = Math.sin(λ1), cosλ1 = Math.cos(λ1);
    var sinφ2 = Math.sin(φ2), cosφ2 = Math.cos(φ2), sinλ2 = Math.sin(λ2), cosλ2 = Math.cos(λ2);

    // distance between points
    var Δφ = φ2 - φ1;
    var Δλ = λ2 - λ1;
    var a = Math.sin(Δφ/2) * Math.sin(Δφ/2)
        + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
    var δ = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    var A = Math.sin((1-fraction)*δ) / Math.sin(δ);
    var B = Math.sin(fraction*δ) / Math.sin(δ);

    var x = A * cosφ1 * cosλ1 + B * cosφ2 * cosλ2;
    var y = A * cosφ1 * sinλ1 + B * cosφ2 * sinλ2;
    var z = A * sinφ1 + B * sinφ2;

    var φ3 = Math.atan2(z, Math.sqrt(x*x + y*y));
    var λ3 = Math.atan2(y, x);

    return new LatLon(φ3.toDegrees(), (λ3.toDegrees()+540)%360-180); // normalise lon to −180..+180°
};


/**
 * Returns the destination point from ‘this’ point having travelled the given distance on the
 * given initial bearing (bearing normally varies around path followed).
 *
 * @param   {number} distance - Distance travelled, in same units as earth radius (default: metres).
 * @param   {number} bearing - Initial bearing in degrees from north.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {LatLon} Destination point.
 *
 * @example
 *     var p1 = new LatLon(51.4778, -0.0015);
 *     var p2 = p1.destinationPoint(7794, 300.7); // 51.5135°N, 000.0983°W
 */
LatLon.prototype.destinationPoint = function(distance, bearing, radius) {
    radius = (radius === undefined) ? 6371e3 : Number(radius);

    // sinφ2 = sinφ1⋅cosδ + cosφ1⋅sinδ⋅cosθ
    // tanΔλ = sinθ⋅sinδ⋅cosφ1 / cosδ−sinφ1⋅sinφ2
    // see http://williams.best.vwh.net/avform.htm#LL

    var δ = Number(distance) / radius; // angular distance in radians
    var θ = Number(bearing).toRadians();

    var φ1 = this.lat.toRadians();
    var λ1 = this.lon.toRadians();

    var sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1);
    var sinδ = Math.sin(δ), cosδ = Math.cos(δ);
    var sinθ = Math.sin(θ), cosθ = Math.cos(θ);

    var sinφ2 = sinφ1*cosδ + cosφ1*sinδ*cosθ;
    var φ2 = Math.asin(sinφ2);
    var y = sinθ * sinδ * cosφ1;
    var x = cosδ - sinφ1 * sinφ2;
    var λ2 = λ1 + Math.atan2(y, x);

    return new LatLon(φ2.toDegrees(), (λ2.toDegrees()+540)%360-180); // normalise to −180..+180°
};


/**
 * Returns the point of intersection of two paths defined by point and bearing.
 *
 * @param   {LatLon} p1 - First point.
 * @param   {number} brng1 - Initial bearing from first point.
 * @param   {LatLon} p2 - Second point.
 * @param   {number} brng2 - Initial bearing from second point.
 * @returns {LatLon|null} Destination point (null if no unique intersection defined).
 *
 * @example
 *     var p1 = LatLon(51.8853, 0.2545), brng1 = 108.547;
 *     var p2 = LatLon(49.0034, 2.5735), brng2 =  32.435;
 *     var pInt = LatLon.intersection(p1, brng1, p2, brng2); // 50.9078°N, 004.5084°E
 */
LatLon.intersection = function(p1, brng1, p2, brng2) {
    if (!(p1 instanceof LatLon)) throw new TypeError('p1 is not LatLon object');
    if (!(p2 instanceof LatLon)) throw new TypeError('p2 is not LatLon object');

    // see http://williams.best.vwh.net/avform.htm#Intersection

    var φ1 = p1.lat.toRadians(), λ1 = p1.lon.toRadians();
    var φ2 = p2.lat.toRadians(), λ2 = p2.lon.toRadians();
    var θ13 = Number(brng1).toRadians(), θ23 = Number(brng2).toRadians();
    var Δφ = φ2-φ1, Δλ = λ2-λ1;

    var δ12 = 2*Math.asin( Math.sqrt( Math.sin(Δφ/2)*Math.sin(Δφ/2)
        + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)*Math.sin(Δλ/2) ) );
    if (δ12 == 0) return null;

    // initial/final bearings between points
    var θa = Math.acos( ( Math.sin(φ2) - Math.sin(φ1)*Math.cos(δ12) ) / ( Math.sin(δ12)*Math.cos(φ1) ) );
    if (isNaN(θa)) θa = 0; // protect against rounding
    var θb = Math.acos( ( Math.sin(φ1) - Math.sin(φ2)*Math.cos(δ12) ) / ( Math.sin(δ12)*Math.cos(φ2) ) );

    var θ12 = Math.sin(λ2-λ1)>0 ? θa : 2*Math.PI-θa;
    var θ21 = Math.sin(λ2-λ1)>0 ? 2*Math.PI-θb : θb;

    var α1 = (θ13 - θ12 + Math.PI) % (2*Math.PI) - Math.PI; // angle 2-1-3
    var α2 = (θ21 - θ23 + Math.PI) % (2*Math.PI) - Math.PI; // angle 1-2-3

    if (Math.sin(α1)==0 && Math.sin(α2)==0) return null; // infinite intersections
    if (Math.sin(α1)*Math.sin(α2) < 0) return null;      // ambiguous intersection

    //α1 = Math.abs(α1);
    //α2 = Math.abs(α2);
    // ... Ed Williams takes abs of α1/α2, but seems to break calculation?

    var α3 = Math.acos( -Math.cos(α1)*Math.cos(α2) + Math.sin(α1)*Math.sin(α2)*Math.cos(δ12) );
    var δ13 = Math.atan2( Math.sin(δ12)*Math.sin(α1)*Math.sin(α2), Math.cos(α2)+Math.cos(α1)*Math.cos(α3) );
    var φ3 = Math.asin( Math.sin(φ1)*Math.cos(δ13) + Math.cos(φ1)*Math.sin(δ13)*Math.cos(θ13) );
    var Δλ13 = Math.atan2( Math.sin(θ13)*Math.sin(δ13)*Math.cos(φ1), Math.cos(δ13)-Math.sin(φ1)*Math.sin(φ3) );
    var λ3 = λ1 + Δλ13;

    return new LatLon(φ3.toDegrees(), (λ3.toDegrees()+540)%360-180); // normalise to −180..+180°
};


/**
 * Returns (signed) distance from ‘this’ point to great circle defined by start-point and end-point.
 *
 * @param   {LatLon} pathStart - Start point of great circle path.
 * @param   {LatLon} pathEnd - End point of great circle path.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number} Distance to great circle (-ve if to left, +ve if to right of path).
 *
 * @example
 *   var pCurrent = new LatLon(53.2611, -0.7972);
 *   var p1 = new LatLon(53.3206, -1.7297);
 *   var p2 = new LatLon(53.1887,  0.1334);
 *   var d = pCurrent.crossTrackDistanceTo(p1, p2);  // -307.5 m
 */
LatLon.prototype.crossTrackDistanceTo = function(pathStart, pathEnd, radius) {
    if (!(pathStart instanceof LatLon)) throw new TypeError('pathStart is not LatLon object');
    if (!(pathEnd instanceof LatLon)) throw new TypeError('pathEnd is not LatLon object');
    radius = (radius === undefined) ? 6371e3 : Number(radius);

    var δ13 = pathStart.distanceTo(this, radius)/radius;
    var θ13 = pathStart.bearingTo(this).toRadians();
    var θ12 = pathStart.bearingTo(pathEnd).toRadians();

    var dxt = Math.asin( Math.sin(δ13) * Math.sin(θ13-θ12) ) * radius;

    return dxt;
};


/**
 * Returns maximum latitude reached when travelling on a great circle on given bearing from this
 * point ('Clairaut's formula'). Negate the result for the minimum latitude (in the Southern
 * hemisphere).
 *
 * The maximum latitude is independent of longitude; it will be the same for all points on a given
 * latitude.
 *
 * @param {number} bearing - Initial bearing.
 * @param {number} latitude - Starting latitude.
 */
LatLon.prototype.maxLatitude = function(bearing) {
    var θ = Number(bearing).toRadians();

    var φ = this.lat.toRadians();

    var φMax = Math.acos(Math.abs(Math.sin(θ)*Math.cos(φ)));

    return φMax.toDegrees();
};


/**
 * Returns the pair of meridians at which a great circle defined by two points crosses the given
 * latitude. If the great circle doesn't reach the given latitude, null is returned.
 *
 * @param {LatLon} point1 - First point defining great circle.
 * @param {LatLon} point2 - Second point defining great circle.
 * @param {number} latitude - Latitude crossings are to be determined for.
 * @returns {Object|null} Object containing { lon1, lon2 } or null if given latitude not reached.
 */
LatLon.crossingParallels = function(point1, point2, latitude) {
    var φ = Number(latitude).toRadians();

    var φ1 = point1.lat.toRadians();
    var λ1 = point1.lon.toRadians();
    var φ2 = point2.lat.toRadians();
    var λ2 = point2.lon.toRadians();

    var Δλ = λ2 - λ1;

    var x = Math.sin(φ1) * Math.cos(φ2) * Math.cos(φ) * Math.sin(Δλ);
    var y = Math.sin(φ1) * Math.cos(φ2) * Math.cos(φ) * Math.cos(Δλ) - Math.cos(φ1) * Math.sin(φ2) * Math.cos(φ);
    var z = Math.cos(φ1) * Math.cos(φ2) * Math.sin(φ) * Math.sin(Δλ);

    if (z*z > x*x + y*y) return null; // great circle doesn't reach latitude

    var λm = Math.atan2(-y, x);                  // longitude at max latitude
    var Δλi = Math.acos(z / Math.sqrt(x*x+y*y)); // Δλ from λm to intersection points

    var λi1 = λ1 + λm - Δλi;
    var λi2 = λ1 + λm + Δλi;

    return { lon1: (λi1.toDegrees()+540)%360-180, lon2: (λi2.toDegrees()+540)%360-180 }; // normalise to −180..+180°
};


/* Rhumb - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/**
 * Returns the distance travelling from ‘this’ point to destination point along a rhumb line.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number} Distance in km between this point and destination point (same units as radius).
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338);
 *     var p2 = new LatLon(50.964, 1.853);
 *     var d = p1.distanceTo(p2); // 40.31 km
 */
LatLon.prototype.rhumbDistanceTo = function(point, radius) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
    radius = (radius === undefined) ? 6371e3 : Number(radius);

    // see http://williams.best.vwh.net/avform.htm#Rhumb

    var R = radius;
    var φ1 = this.lat.toRadians(), φ2 = point.lat.toRadians();
    var Δφ = φ2 - φ1;
    var Δλ = Math.abs(point.lon-this.lon).toRadians();
    // if dLon over 180° take shorter rhumb line across the anti-meridian:
    if (Math.abs(Δλ) > Math.PI) Δλ = Δλ>0 ? -(2*Math.PI-Δλ) : (2*Math.PI+Δλ);

    // on Mercator projection, longitude distances shrink by latitude; q is the 'stretch factor'
    // q becomes ill-conditioned along E-W line (0/0); use empirical tolerance to avoid it
    var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));
    var q = Math.abs(Δψ) > 10e-12 ? Δφ/Δψ : Math.cos(φ1);

    // distance is pythagoras on 'stretched' Mercator projection
    var δ = Math.sqrt(Δφ*Δφ + q*q*Δλ*Δλ); // angular distance in radians
    var dist = δ * R;

    return dist;
};


/**
 * Returns the bearing from ‘this’ point to destination point along a rhumb line.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Bearing in degrees from north.
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338);
 *     var p2 = new LatLon(50.964, 1.853);
 *     var d = p1.rhumbBearingTo(p2); // 116.7 m
 */
LatLon.prototype.rhumbBearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    var φ1 = this.lat.toRadians(), φ2 = point.lat.toRadians();
    var Δλ = (point.lon-this.lon).toRadians();
    // if dLon over 180° take shorter rhumb line across the anti-meridian:
    if (Math.abs(Δλ) > Math.PI) Δλ = Δλ>0 ? -(2*Math.PI-Δλ) : (2*Math.PI+Δλ);

    var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));

    var θ = Math.atan2(Δλ, Δψ);

    return (θ.toDegrees()+360) % 360;
};


/**
 * Returns the destination point having travelled along a rhumb line from ‘this’ point the given
 * distance on the  given bearing.
 *
 * @param   {number} distance - Distance travelled, in same units as earth radius (default: metres).
 * @param   {number} bearing - Bearing in degrees from north.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {LatLon} Destination point.
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338);
 *     var p2 = p1.rhumbDestinationPoint(40300, 116.7); // 50.9642°N, 001.8530°E
 */
LatLon.prototype.rhumbDestinationPoint = function(distance, bearing, radius) {
    radius = (radius === undefined) ? 6371e3 : Number(radius);

    var δ = Number(distance) / radius; // angular distance in radians
    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var θ = Number(bearing).toRadians();

    var Δφ = δ * Math.cos(θ);
    var φ2 = φ1 + Δφ;

    // check for some daft bugger going past the pole, normalise latitude if so
    if (Math.abs(φ2) > Math.PI/2) φ2 = φ2>0 ? Math.PI-φ2 : -Math.PI-φ2;

    var Δψ = Math.log(Math.tan(φ2/2+Math.PI/4)/Math.tan(φ1/2+Math.PI/4));
    var q = Math.abs(Δψ) > 10e-12 ? Δφ / Δψ : Math.cos(φ1); // E-W course becomes ill-conditioned with 0/0

    var Δλ = δ*Math.sin(θ)/q;
    var λ2 = λ1 + Δλ;

    return new LatLon(φ2.toDegrees(), (λ2.toDegrees()+540) % 360 - 180); // normalise to −180..+180°
};


/**
 * Returns the loxodromic midpoint (along a rhumb line) between ‘this’ point and second point.
 *
 * @param   {LatLon} point - Latitude/longitude of second point.
 * @returns {LatLon} Midpoint between this point and second point.
 *
 * @example
 *     var p1 = new LatLon(51.127, 1.338);
 *     var p2 = new LatLon(50.964, 1.853);
 *     var pMid = p1.rhumbMidpointTo(p2); // 51.0455°N, 001.5957°E
 */
LatLon.prototype.rhumbMidpointTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    // http://mathforum.org/kb/message.jspa?messageID=148837

    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var φ2 = point.lat.toRadians(), λ2 = point.lon.toRadians();

    if (Math.abs(λ2-λ1) > Math.PI) λ1 += 2*Math.PI; // crossing anti-meridian

    var φ3 = (φ1+φ2)/2;
    var f1 = Math.tan(Math.PI/4 + φ1/2);
    var f2 = Math.tan(Math.PI/4 + φ2/2);
    var f3 = Math.tan(Math.PI/4 + φ3/2);
    var λ3 = ( (λ2-λ1)*Math.log(f3) + λ1*Math.log(f2) - λ2*Math.log(f1) ) / Math.log(f2/f1);

    if (!isFinite(λ3)) λ3 = (λ1+λ2)/2; // parallel of latitude

    var p = LatLon(φ3.toDegrees(), (λ3.toDegrees()+540)%360-180); // normalise to −180..+180°

    return p;
};


/* Area - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */


/**
 * Calculates the area of a spherical polygon where the sides of the polygon are great circle
 * arcs joining the vertices.
 *
 * @param   {LatLon[]} polygon - Array of points defining vertices of the polygon
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number} The area of the polygon, in the same units as radius.
 *
 * @example
 *   var polygon = [new LatLon(0,0), new LatLon(1,0), new LatLon(0,1)];
 *   var area = LatLon.areaOf(polygon); // 6.18e9 m²
 */
LatLon.areaOf = function(polygon, radius) {
    // uses method due to Karney: osgeo-org.1560.x6.nabble.com/Area-of-a-spherical-polygon-td3841625.html;
    // for each edge of the polygon, tan(E/2) = tan(Δλ/2)·(tan(φ1/2) + tan(φ2/2)) / (1 + tan(φ1/2)·tan(φ2/2))
    // where E is the spherical excess of the trapezium obtained by extending the edge to the equator

    var R = (radius === undefined) ? 6371e3 : Number(radius);

    // close polygon so that last point equals first point
    var closed = polygon[0].equals(polygon[polygon.length-1]);
    if (!closed) polygon.push(polygon[0]);

    var nVertices = polygon.length - 1;

    var S = 0; // spherical excess in steradians
    for (var v=0; v<nVertices; v++) {
        var φ1 = polygon[v].lat.toRadians();
        var φ2 = polygon[v+1].lat.toRadians();
        var Δλ = (polygon[v+1].lon - polygon[v].lon).toRadians();
        var E = 2 * Math.atan2(Math.tan(Δλ/2) * (Math.tan(φ1/2)+Math.tan(φ2/2)), 1 + Math.tan(φ1/2)*Math.tan(φ2/2));
        S += E;
    }

    if (isPoleEnclosedBy(polygon)) S = Math.abs(S) - 2*Math.PI;

    var A = Math.abs(S * R*R); // area in units of R

    if (!closed) polygon.pop(); // restore polygon to pristine condition

    return A;

    // returns whether polygon encloses pole: sum of course deltas around pole is 0° rather than
    // normal ±360°: blog.element84.com/determining-if-a-spherical-polygon-contains-a-pole.html
    function isPoleEnclosedBy(polygon) {
        // TODO: any better test than this?
        var ΣΔ = 0;
        var prevBrng = polygon[0].bearingTo(polygon[1]);
        for (var v=0; v<polygon.length-1; v++) {
            var initBrng = polygon[v].bearingTo(polygon[v+1]);
            var finalBrng = polygon[v].finalBearingTo(polygon[v+1]);
            ΣΔ += (initBrng - prevBrng + 540) % 360 - 180;
            ΣΔ += (finalBrng - initBrng + 540) % 360 - 180;
            prevBrng = finalBrng;
        }
        var initBrng = polygon[0].bearingTo(polygon[1]);
        ΣΔ += (initBrng - prevBrng + 540) % 360 - 180;
        var enclosed = Math.abs(ΣΔ) < 90; // 0°-ish
        return enclosed;
    }
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * Checks if another point is equal to ‘this’ point.
 *
 * @param   {LatLon} point - Point to be compared against this point.
 * @returns {bool}   True if points are identical.
 *
 * @example
 *   var p1 = new LatLon(52.205, 0.119);
 *   var p2 = new LatLon(52.205, 0.119);
 *   var equal = p1.equals(p2); // true
 */
LatLon.prototype.equals = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    if (this.lat != point.lat) return false;
    if (this.lon != point.lon) return false;

    return true;
};


/**
 * Returns a string representation of ‘this’ point, formatted as degrees, degrees+minutes, or
 * degrees+minutes+seconds.
 *
 * @param   {string} [format=dms] - Format point as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use - default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Comma-separated latitude/longitude.
 */
LatLon.prototype.toString = function(format, dp) {
    return Dms.toLat(this.lat, format, dp) + ', ' + Dms.toLon(this.lon, format, dp);
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Vector-based spherical geodetic (latitude/longitude) functions    (c) Chris Veness 2011-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-vectors.html                                            */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-latlon-nvector-spherical.html               */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * Tools for working with points and paths on (a spherical model of) the earth’s surface using a
 * vector-based approach using ‘n-vectors’ (rather than the more common spherical trigonometry;
 * a vector-based approach makes many calculations much simpler, and easier to follow, compared
 * with trigonometric equivalents).
 *
 * Note on a spherical model earth, an n-vector is equivalent to a normalised version of an (ECEF)
 * cartesian coordinate.
 *
 * @module   latlon-vectors
 * @requires vector3d
 * @requires dms
 */


/**
 * Creates a LatLon point on spherical model earth.
 *
 * @constructor
 * @param {number} lat - Latitude in degrees.
 * @param {number} lon - Longitude in degrees.
 *
 * @example
 *   var p1 = new LatLon(52.205, 0.119);
 */
function LatLon(lat, lon) {
    // allow instantiation without 'new'
    if (!(this instanceof LatLon)) return new LatLon(lat, lon);

    this.lat = Number(lat);
    this.lon = Number(lon);
}


/**
 * Converts ‘this’ lat/lon point to Vector3d n-vector (normal to earth's surface).
 *
 * @returns {Vector3d} Normalised n-vector representing lat/lon point.
 *
 * @example
 *   var p = new LatLon(45, 45);
 *   var v = p.toVector(); // [0.5000,0.5000,0.7071]
 */
LatLon.prototype.toVector = function() {
    var φ = this.lat.toRadians();
    var λ = this.lon.toRadians();

    // right-handed vector: x -> 0°E,0°N; y -> 90°E,0°N, z -> 90°N
    var x = Math.cos(φ) * Math.cos(λ);
    var y = Math.cos(φ) * Math.sin(λ);
    var z = Math.sin(φ);

    return new Vector3d(x, y, z);
};


/**
 * Converts ‘this’ (geocentric) cartesian vector to (spherical) latitude/longitude point.
 *
 * @returns  {LatLon} Latitude/longitude point vector points to.
 *
 * @example
 *   var v = new Vector3d(0.500, 0.500, 0.707);
 *   var p = v.toLatLonS(); // 45.0°N, 45.0°E
 */
Vector3d.prototype.toLatLonS = function() {
    var φ = Math.atan2(this.z, Math.sqrt(this.x*this.x + this.y*this.y));
    var λ = Math.atan2(this.y, this.x);

    return new LatLon(φ.toDegrees(), λ.toDegrees());
};


/**
 * N-vector normal to great circle obtained by heading on given bearing from ‘this’ point.
 *
 * Direction of vector is such that initial bearing vector b = c × p.
 *
 * @param   {number}   bearing - Compass bearing in degrees.
 * @returns {Vector3d} Normalised vector representing great circle.
 *
 * @example
 *   var p1 = new LatLon(53.3206, -1.7297);
 *   var gc = p1.greatCircle(96.0); // [-0.794,0.129,0.594]
 */
LatLon.prototype.greatCircle = function(bearing) {
    var φ = this.lat.toRadians();
    var λ = this.lon.toRadians();
    var θ = Number(bearing).toRadians();

    var x =  Math.sin(λ) * Math.cos(θ) - Math.sin(φ) * Math.cos(λ) * Math.sin(θ);
    var y = -Math.cos(λ) * Math.cos(θ) - Math.sin(φ) * Math.sin(λ) * Math.sin(θ);
    var z =  Math.cos(φ) * Math.sin(θ);

    return new Vector3d(x, y, z);
};


/**
 * N-vector normal to great circle obtained by heading on given bearing from point given by ‘this’
 * n-vector.
 *
 * Direction of vector is such that initial bearing vector b = c × p.
 *
 * @param   {number}   bearing - Compass bearing in degrees.
 * @returns {Vector3d} Normalised vector representing great circle.
 *
 * @example
 *   var n1 = new LatLon(53.3206, -1.7297).toNvector();
 *   var gc = n1.greatCircle(96.0); // [-0.794,0.129,0.594]
 */
Vector3d.prototype.greatCircle = function(bearing) {
    var θ = Number(bearing).toRadians();

    var N = new Vector3d(0, 0, 1);
    var e = N.cross(this); // easting
    var n = this.cross(e); // northing
    var eʹ = e.times(Math.cos(θ)/e.length());
    var nʹ = n.times(Math.sin(θ)/n.length());
    var c = nʹ.minus(eʹ);

    return c;
};


/**
 * Returns the distance from ‘this’ point to the specified point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number} Distance between this point and destination point, in same units as radius.
 *
 * @example
 *   var p1 = new LatLon(52.205, 0.119);
 *   var p2 = new LatLon(48.857, 2.351);
 *   var d = p1.distanceTo(p2); // 404.3 km
 */
LatLon.prototype.distanceTo = function(point, radius) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');
    radius = (radius === undefined) ? 6371e3 : Number(radius);

    var p1 = this.toVector();
    var p2 = point.toVector();

    var δ = p1.angleTo(p2);
    var d = δ * radius;

    return d;
};


/**
 * Returns the (initial) bearing from ‘this’ point to the specified point, in compass degrees.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number} Initial bearing in degrees from North (0°..360°).
 *
 * @example
 *   var p1 = new LatLon(52.205, 0.119);
 *   var p2 = new LatLon(48.857, 2.351);
 *   var b1 = p1.bearingTo(p2); // 156.2°
 */
LatLon.prototype.bearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    var p1 = this.toVector();
    var p2 = point.toVector();

    var northPole = new Vector3d(0, 0, 1);

    var c1 = p1.cross(p2);        // great circle through p1 & p2
    var c2 = p1.cross(northPole); // great circle through p1 & north pole

    // bearing is (signed) angle between c1 & c2
    var bearing = c1.angleTo(c2, p1).toDegrees();

    return (bearing+360) % 360; // normalise to 0..360
};


/**
 * Returns the midpoint between ‘this’ point and specified point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {LatLon} Midpoint between this point and destination point.
 *
 * @example
 *   var p1 = new LatLon(52.205, 0.119);
 *   var p2 = new LatLon(48.857, 2.351);
 *   var pMid = p1.midpointTo(p2); // 50.5363°N, 001.2746°E
 */
LatLon.prototype.midpointTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    var p1 = this.toVector();
    var p2 = point.toVector();

    var mid = p1.plus(p2).unit();

    return mid.toLatLonS();
};


/**
 * Returns the destination point from ‘this’ point having travelled the given distance on the
 * given initial bearing (bearing will normally vary before destination is reached).
 *
 * @param   {number} distance - Distance travelled, in same units as earth radius (default: metres).
 * @param   {number} bearing - Initial bearing in degrees from north.
 * @param   {number} [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {LatLon} Destination point.
 *
 * @example
 *   var p1 = new LatLon(51.4778, -0.0015);
 *   var p2 = p1.destinationPoint(7794, 300.7); // 51.5135°N, 000.0983°W
 */
LatLon.prototype.destinationPoint = function(distance, bearing, radius) {
    radius = (radius === undefined) ? 6371e3 : Number(radius);

    var n1 = this.toVector();
    var δ = Number(distance) / radius; // angular distance in radians
    var θ = Number(bearing).toRadians();

    var N = new Vector3d(0, 0, 1); // north pole

    var de = N.cross(n1).unit();   // east direction vector @ n1
    var dn = n1.cross(de);         // north direction vector @ n1

    var deSinθ = de.times(Math.sin(θ));
    var dnCosθ = dn.times(Math.cos(θ));

    var d = dnCosθ.plus(deSinθ);   // direction vector @ n1 (≡ C×n1; C = great circle)

    var x = n1.times(Math.cos(δ)); // component of n2 parallel to n1
    var y = d.times(Math.sin(δ));  // component of n2 perpendicular to n1

    var n2 = x.plus(y);

    return n2.toLatLonS();
};


/**
 * Returns the point of intersection of two paths each defined by point pairs or start point and bearing.
 *
 * @param   {LatLon}        path1start - Start point of first path.
 * @param   {LatLon|number} path1brngEnd - End point of first path or initial bearing from first start point.
 * @param   {LatLon}        path2start - Start point of second path.
 * @param   {LatLon|number} path2brngEnd - End point of second path or initial bearing from second start point.
 * @returns {LatLon}        Destination point (null if no unique intersection defined)
 *
 * @example
 *   var p1 = LatLon(51.8853, 0.2545), brng1 = 108.55;
 *   var p2 = LatLon(49.0034, 2.5735), brng2 =  32.44;
 *   var pInt = LatLon.intersection(p1, brng1, p2, brng2); // 50.9076°N, 004.5086°E
 */
LatLon.intersection = function(path1start, path1brngEnd, path2start, path2brngEnd) {
    if (!(path1start instanceof LatLon)) throw new TypeError('path1start is not LatLon object');
    if (!(path2start instanceof LatLon)) throw new TypeError('path2start is not LatLon object');
    if (!(path1brngEnd instanceof LatLon) && isNaN(path1brngEnd)) throw new TypeError('path1brngEnd is not LatLon object or bearing');
    if (!(path2brngEnd instanceof LatLon) && isNaN(path2brngEnd)) throw new TypeError('path2brngEnd is not LatLon object or bearing');

    // if c1 & c2 are great circles through start and end points (or defined by start point + bearing),
    // then candidate intersections are simply c1 × c2 & c2 × c1; most of the work is deciding correct
    // intersection point to select! if bearing is given, that determines which intersection, if both
    // paths are defined by start/end points, take closer intersection

    var p1 = path1start.toVector();
    var p2 = path2start.toVector();

    var c1, c2, path1def, path2def;
    // c1 & c2 are vectors defining great circles through start & end points; p × c gives initial bearing vector

    if (path1brngEnd instanceof LatLon) { // path 1 defined by endpoint
        c1 = p1.cross(path1brngEnd.toVector());
        path1def = 'endpoint';
    } else {                              // path 1 defined by initial bearing
        c1 = path1start.greatCircle(Number(path1brngEnd));
        path1def = 'bearing';
    }
    if (path2brngEnd instanceof LatLon) { // path 2 defined by endpoint
        c2 = p2.cross(path2brngEnd.toVector());
        path2def = 'endpoint';
    } else {                              // path 2 defined by initial bearing
        c2 = path2start.greatCircle(Number(path2brngEnd));
        path2def = 'bearing';
    }

    // there are two (antipodal) candidate intersection points; we have to choose which to return
    var i1 = c1.cross(c2);
    var i2 = c2.cross(c1);

    // am I making heavy weather of this? is there a simpler way to do it?

    // selection of intersection point depends on how paths are defined (bearings or endpoints)
    var intersection=null, dir1=null, dir2=null;
    switch (path1def+'+'+path2def) {
        case 'bearing+bearing':
            // if c×p⋅i1 is +ve, the initial bearing is towards i1, otherwise towards antipodal i2
            dir1 = Math.sign(c1.cross(p1).dot(i1)); // c1×p1⋅i1 +ve means p1 bearing points to i1
            dir2 = Math.sign(c2.cross(p2).dot(i1)); // c2×p2⋅i1 +ve means p2 bearing points to i1

            switch (dir1+dir2) {
                case  2: // dir1, dir2 both +ve, 1 & 2 both pointing to i1
                    intersection = i1;
                    break;
                case -2: // dir1, dir2 both -ve, 1 & 2 both pointing to i2
                    intersection = i2;
                    break;
                case  0: // dir1, dir2 opposite; intersection is at further-away intersection point
                    // take opposite intersection from mid-point of p1 & p2 [is this always true?]
                    intersection = p1.plus(p2).dot(i1) > 0 ? i2 : i1;
                    break;
            }
            break;
        case 'bearing+endpoint': // use bearing c1 × p1
            dir1 = Math.sign(c1.cross(p1).dot(i1)); // c1×p1⋅i1 +ve means p1 bearing points to i1
            intersection = dir1>0 ? i1 : i2;
            break;
        case 'endpoint+bearing': // use bearing c2 × p2
            dir2 = Math.sign(c2.cross(p2).dot(i1)); // c2×p2⋅i1 +ve means p2 bearing points to i1
            intersection = dir2>0 ? i1 : i2;
            break;
        case 'endpoint+endpoint': // select nearest intersection to mid-point of all points
            var mid = p1.plus(p2).plus(path1brngEnd.toVector()).plus(path2brngEnd.toVector());
            intersection = mid.dot(i1)>0 ? i1 : i2;
            break;
    }

    return intersection.toLatLonS();
};


/**
 * Returns (signed) distance from ‘this’ point to great circle defined by start-point and end-point/bearing.
 *
 * @param   {LatLon}        pathStart - Start point of great circle path.
 * @param   {LatLon|number} pathBrngEnd - End point of great circle path or initial bearing from great circle start point.
 * @param   {number}        [radius=6371e3] - (Mean) radius of earth (defaults to radius in metres).
 * @returns {number}        Distance to great circle (-ve if to left, +ve if to right of path).
 *
 * @example
 *   var pCurrent = new LatLon(53.2611, -0.7972);
 *
 *   var p1 = new LatLon(53.3206, -1.7297), brng = 96.0;
 *   var d = pCurrent.crossTrackDistanceTo(p1, brng);// -305.7 m
 *
 *   var p1 = new LatLon(53.3206, -1.7297), p2 = new LatLon(53.1887, 0.1334);
 *   var d = pCurrent.crossTrackDistanceTo(p1, p2);  // -307.5 m
 */
LatLon.prototype.crossTrackDistanceTo = function(pathStart, pathBrngEnd, radius) {
    if (!(pathStart instanceof LatLon)) throw new TypeError('pathStart is not LatLon object');
    var R = (radius === undefined) ? 6371e3 : Number(radius);

    var p = this.toVector();

    var gc = pathBrngEnd instanceof LatLon                   // (note JavaScript is not good at method overloading)
        ? pathStart.toVector().cross(pathBrngEnd.toVector()) // great circle defined by two points
        : pathStart.greatCircle(Number(pathBrngEnd));        // great circle defined by point + bearing

    var α = gc.angleTo(p) - Math.PI/2; // angle between point & great-circle

    var d = α * R;

    return d;
};


/**
 * Returns closest point on great circle segment between point1 & point2 to ‘this’ point.
 *
 * If this point is ‘within’ the extent of the segment, the point is on the segment between point1 &
 * point2; otherwise, it is the closer of the endpoints defining the segment.
 *
 * @param   {LatLon} point1 - Start point of great circle segment.
 * @param   {LatLon} point2 - End point of great circle segment.
 * @returns {number} point on segment.
 *
 * @example
 *   var p1 = new LatLon(51.0, 1.0), p2 = new LatLon(51.0, 2.0);
 *
 *   var p0 = new LatLon(51.0, 1.9);
 *   var p = p0.nearestPointOnSegment(p1, p2); // 51.0004°N, 001.9000°E
 *   var d = p.distanceTo(p);                  // 42.71 m
 *
 *   var p0 = new LatLon(51.0, 2.1);
 *   var p = p0.nearestPointOnSegment(p1, p2); // 51.0000°N, 002.0000°E
 */
LatLon.prototype.nearestPointOnSegment = function(point1, point2) {
    var p = null;

    if (this.isBetween(point1, point2)) {
        // closer to segment than to its endpoints, find closest point on segment
        var n0 = this.toVector(), n1 = point1.toVector(), n2 = point2.toVector();
        var c1 = n1.cross(n2); // n1×n2 = vector representing great circle through p1, p2
        var c2 = n0.cross(c1); // n0×c1 = vector representing great circle through p0 normal to c1
        var n = c1.cross(c2);  // c2×c1 = nearest point on c1 to n0
        p = n.toLatLonS();
    } else {
        // beyond segment extent, take closer endpoint
        var d1 = this.distanceTo(point1);
        var d2 = this.distanceTo(point2);
        p = d1<d2 ? point1 : point2;
    }

    return p;
};


/**
 * Returns whether this point is between point 1 & point 2.
 *
 * If this point is not on the great circle defined by point1 & point 2, returns whether this point
 * is within area bound by perpendiculars to the great circle at each point.
 *
 * @param   {LatLon} point1 - First point defining segment.
 * @param   {LatLon} point2 - Second point defining segment.
 * @returns {boolean} Whether this point is within extent of segment.
 */
LatLon.prototype.isBetween = function(point1, point2) {
    var n0 = this.toVector(), n1 = point1.toVector(), n2 = point2.toVector(); // n-vectors

    // get vectors representing p0->p1, p0->p2, p1->p2, p2->p1
    var δ10 = n0.minus(n1), δ12 = n2.minus(n1);
    var δ20 = n0.minus(n2), δ21 = n1.minus(n2);

    // dot product δ10⋅δ12 tells us if p0 is on p2 side of p1, similarly for δ20⋅δ21
    var extent1 = δ10.dot(δ12);
    var extent2 = δ20.dot(δ21);

    var isBetween = extent1>=0 && extent2>=0;

    return isBetween;
};


/**
 * Tests whether ‘this’ point is enclosed by the polygon defined by a set of points.
 *
 * @param   {LatLon[]} polygon - Ordered array of points defining vertices of polygon.
 * @returns {bool}     Whether this point is enclosed by polygon.
 *
 * @example
 *   var bounds = [ new LatLon(45,1), new LatLon(45,2), new LatLon(46,2), new LatLon(46,1) ];
 *   var p = new LatLon(45.1, 1.1);
 *   var inside = p.enclosedBy(bounds); // true
 */
LatLon.prototype.enclosedBy = function(polygon) {
    // this method uses angle summation test; on a plane, angles for an enclosed point will sum
    // to 360°, angles for an exterior point will sum to 0°. On a sphere, enclosed point angles
    // will sum to less than 360° (due to spherical excess), exterior point angles will be small
    // but non-zero. TODO: are any winding number optimisations applicable to spherical surface?

    // close the polygon so that the last point equals the first point
    var closed = polygon[0].equals(polygon[polygon.length-1]);
    if (!closed) polygon.push(polygon[0]);

    var nVertices = polygon.length - 1;

    var p = this.toVector();

    // get vectors from p to each vertex
    var vectorToVertex = [];
    for (var v=0; v<nVertices; v++) vectorToVertex[v] = p.minus(polygon[v].toVector());
    vectorToVertex.push(vectorToVertex[0]);

    // sum subtended angles of each edge (using vector p to determine sign)
    var Σθ = 0;
    for (var v=0; v<nVertices; v++) {
        Σθ += vectorToVertex[v].angleTo(vectorToVertex[v+1], p);
    }

    var enclosed = Math.abs(Σθ) > Math.PI;

    if (!closed) polygon.pop(); // restore polygon to pristine condition

    return enclosed;
};


/**
 * Returns point representing geographic mean of supplied points.
 *
 * @param   {LatLon[]} points - Array of points to be averaged.
 * @returns {LatLon}   Point at the geographic mean of the supplied points.
 * @todo Not yet tested.
 */
LatLon.meanOf = function(points) {
    var m = new Vector3d(0, 0, 0);

    // add all vectors
    for (var p=0; p<points.length; p++) {
        m = m.plus(points[p].toVector());
    }

    // m is now geographic mean
    return m.unit().toLatLonS();
};


/**
 * Checks if another point is equal to ‘this’ point.
 *
 * @param   {LatLon} point - Point to be compared against this point.
 * @returns {bool}    True if points are identical.
 *
 * @example
 *   var p1 = new LatLon(52.205, 0.119);
 *   var p2 = new LatLon(52.205, 0.119);
 *   var equal = p1.equals(p2); // true
 */
LatLon.prototype.equals = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    if (this.lat != point.lat) return false;
    if (this.lon != point.lon) return false;

    return true;
};


/**
 * Returns a string representation of ‘this’ point.
 *
 * @param   {string} [format=dms] - Format point as 'd', 'dm', 'dms'.
 * @param   {number} [dp=0|2|4] - Number of decimal places to use: default 0 for dms, 2 for dm, 4 for d.
 * @returns {string} Comma-separated formatted latitude/longitude.
 */
LatLon.prototype.toString = function(format, dp) {
    return Dms.toLat(this.lat, format, dp) + ', ' + Dms.toLon(this.lon, format, dp);
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

/** Polyfill Math.sign for old browsers / IE */
if (Math.sign === undefined) {
    Math.sign = function(x) {
        x = +x; // convert to a number
        if (x === 0 || isNaN(x)) return x;
        return x > 0 ? 1 : -1;
    };
}
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Vincenty Direct and Inverse Solution of Geodesics on the Ellipsoid (c) Chris Veness 2002-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-vincenty.html                                           */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-latlon-vincenty.html                        */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/**
 * Direct and inverse solutions of geodesics on the ellipsoid using Vincenty formulae.
 *
 * From: T Vincenty, "Direct and Inverse Solutions of Geodesics on the Ellipsoid with application of
 *       nested equations", Survey Review, vol XXIII no 176, 1975.
 *       www.ngs.noaa.gov/PUBS_LIB/inverse.pdf.
 *
 * @module  latlon-vincenty
 * @extends latlon-ellipsoidal
 */
/** @class LatLon */


/**
 * Returns the distance between ‘this’ point and destination point along a geodesic, using Vincenty
 * inverse solution.
 *
 * Note: the datum used is of ‘this’ point; distance is on the surface of the ellipsoid (height is
 * ignored).
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns (Number} Distance in metres between points or NaN if failed to converge.
 *
 * @example
 *   var p1 = new LatLon(50.06632, -5.71475);
 *   var p2 = new LatLon(58.64402, -3.07009);
 *   var d = p1.distanceTo(p2); // 969,954.166 m
 */
LatLon.prototype.distanceTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    try {
        return this.inverse(point).distance;
    } catch (e) {
        return NaN; // failed to converge
    }
};


/**
 * Returns the initial bearing (forward azimuth) to travel along a geodesic from ‘this’ point to the
 * specified point, using Vincenty inverse solution.
 *
 * Note: the datum used is of ‘this’ point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number}  initial Bearing in degrees from north (0°..360°) or NaN if failed to converge.
 *
 * @example
 *   var p1 = new LatLon(50.06632, -5.71475);
 *   var p2 = new LatLon(58.64402, -3.07009);
 *   var b1 = p1.initialBearingTo(p2); // 9.1419°
 */
LatLon.prototype.initialBearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    try {
        return this.inverse(point).initialBearing;
    } catch (e) {
        return NaN; // failed to converge
    }
};


/**
 * Returns the final bearing (reverse azimuth) having travelled along a geodesic from ‘this’ point
 * to the specified point, using Vincenty inverse solution.
 *
 * Note: the datum used is of ‘this’ point.
 *
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {number}  Initial bearing in degrees from north (0°..360°) or NaN if failed to converge.
 *
 * @example
 *   var p1 = new LatLon(50.06632, -5.71475);
 *   var p2 = new LatLon(58.64402, -3.07009);
 *   var b2 = p1.finalBearingTo(p2); // 11.2972°
 */
LatLon.prototype.finalBearingTo = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    try {
        return this.inverse(point).finalBearing;
    } catch (e) {
        return NaN; // failed to converge
    }
};


/**
 * Returns the destination point having travelled the given distance along a geodesic given by
 * initial bearing from ‘this’ point, using Vincenty direct solution.
 *
 * Note: the datum used is of ‘this’ point; distance is on the surface of the ellipsoid (height is
 * ignored).
 *
 * @param   {number} distance - Distance travelled along the geodesic in metres.
 * @param   {number} initialBearing - Initial bearing in degrees from north.
 * @returns {LatLon} Destination point.
 *
 * @example
 *   var p1 = new LatLon(-37.95103, 144.42487);
 *   var p2 = p1.destinationPoint(54972.271, 306.86816); // 37.6528°S, 143.9265°E
 */
LatLon.prototype.destinationPoint = function(distance, initialBearing) {
    return this.direct(Number(distance), Number(initialBearing)).point;
};


/**
 * Returns the final bearing (reverse azimuth) having travelled along a geodesic given by initial
 * bearing for a given distance from ‘this’ point, using Vincenty direct solution.
 *
 * Note: the datum used is of ‘this’ point; distance is on the surface of the ellipsoid (height is
 * ignored).
 *
 * @param   {number} distance - Distance travelled along the geodesic in metres.
 * @param   {LatLon} initialBearing - Initial bearing in degrees from north.
 * @returns {number} Final bearing in degrees from north (0°..360°).
 *
 * @example
 *   var p1 = new LatLon(-37.95103, 144.42487);
 *   var b2 = p1.finalBearingOn(306.86816, 54972.271); // 307.1736°
 */
LatLon.prototype.finalBearingOn = function(distance, initialBearing) {
    return this.direct(Number(distance), Number(initialBearing)).finalBearing;
};


/**
 * Vincenty direct calculation.
 *
 * @private
 * @param   {number} distance - Distance along bearing in metres.
 * @param   {number} initialBearing - Initial bearing in degrees from north.
 * @returns (Object} Object including point (destination point), finalBearing.
 * @throws  {Error}  If formula failed to converge.
 */
LatLon.prototype.direct = function(distance, initialBearing) {
    var φ1 = this.lat.toRadians(), λ1 = this.lon.toRadians();
    var α1 = initialBearing.toRadians();
    var s = distance;

    var a = this.datum.ellipsoid.a, b = this.datum.ellipsoid.b, f = this.datum.ellipsoid.f;

    var sinα1 = Math.sin(α1);
    var cosα1 = Math.cos(α1);

    var tanU1 = (1-f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1 * cosU1;
    var σ1 = Math.atan2(tanU1, cosα1);
    var sinα = cosU1 * sinα1;
    var cosSqα = 1 - sinα*sinα;
    var uSq = cosSqα * (a*a - b*b) / (b*b);
    var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
    var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));

    var cos2σM, sinσ, cosσ, Δσ;

    var σ = s / (b*A), σʹ, iterations = 0;
    do {
        cos2σM = Math.cos(2*σ1 + σ);
        sinσ = Math.sin(σ);
        cosσ = Math.cos(σ);
        Δσ = B*sinσ*(cos2σM+B/4*(cosσ*(-1+2*cos2σM*cos2σM)-
            B/6*cos2σM*(-3+4*sinσ*sinσ)*(-3+4*cos2σM*cos2σM)));
        σʹ = σ;
        σ = s / (b*A) + Δσ;
    } while (Math.abs(σ-σʹ) > 1e-12 && ++iterations<200);
    if (iterations>=200) throw new Error('Formula failed to converge'); // not possible?

    var x = sinU1*sinσ - cosU1*cosσ*cosα1;
    var φ2 = Math.atan2(sinU1*cosσ + cosU1*sinσ*cosα1, (1-f)*Math.sqrt(sinα*sinα + x*x));
    var λ = Math.atan2(sinσ*sinα1, cosU1*cosσ - sinU1*sinσ*cosα1);
    var C = f/16*cosSqα*(4+f*(4-3*cosSqα));
    var L = λ - (1-C) * f * sinα *
        (σ + C*sinσ*(cos2σM+C*cosσ*(-1+2*cos2σM*cos2σM)));
    var λ2 = (λ1+L+3*Math.PI)%(2*Math.PI) - Math.PI;  // normalise to -180..+180

    var α2 = Math.atan2(sinα, -x);
    α2 = (α2 + 2*Math.PI) % (2*Math.PI); // normalise to 0..360

    return {
        point:        new LatLon(φ2.toDegrees(), λ2.toDegrees(), this.datum),
        finalBearing: α2.toDegrees(),
    };
};


/**
 * Vincenty inverse calculation.
 *
 * @private
 * @param   {LatLon} point - Latitude/longitude of destination point.
 * @returns {Object} Object including distance, initialBearing, finalBearing.
 * @throws  {Error}  If formula failed to converge.
 */
LatLon.prototype.inverse = function(point) {
    var p1 = this, p2 = point;
    var φ1 = p1.lat.toRadians(), λ1 = p1.lon.toRadians();
    var φ2 = p2.lat.toRadians(), λ2 = p2.lon.toRadians();

    var a = this.datum.ellipsoid.a, b = this.datum.ellipsoid.b, f = this.datum.ellipsoid.f;

    var L = λ2 - λ1;
    var tanU1 = (1-f) * Math.tan(φ1), cosU1 = 1 / Math.sqrt((1 + tanU1*tanU1)), sinU1 = tanU1 * cosU1;
    var tanU2 = (1-f) * Math.tan(φ2), cosU2 = 1 / Math.sqrt((1 + tanU2*tanU2)), sinU2 = tanU2 * cosU2;

    var sinλ, cosλ, sinSqσ, sinσ, cosσ, σ, sinα, cosSqα, cos2σM, C;

    var λ = L, λʹ, iterations = 0;
    do {
        sinλ = Math.sin(λ);
        cosλ = Math.cos(λ);
        sinSqσ = (cosU2*sinλ) * (cosU2*sinλ) + (cosU1*sinU2-sinU1*cosU2*cosλ) * (cosU1*sinU2-sinU1*cosU2*cosλ);
        if (sinSqσ == 0) return 0;  // co-incident points
        sinσ = Math.sqrt(sinSqσ);
        cosσ = sinU1*sinU2 + cosU1*cosU2*cosλ;
        σ = Math.atan2(sinσ, cosσ);
        sinα = cosU1 * cosU2 * sinλ / sinσ;
        cosSqα = 1 - sinα*sinα;
        cos2σM = (cosSqα != 0) ? (cosσ - 2*sinU1*sinU2/cosSqα) : 0; // equatorial line: cosSqα=0 (§6)
        C = f/16*cosSqα*(4+f*(4-3*cosSqα));
        λʹ = λ;
        λ = L + (1-C) * f * sinα * (σ + C*sinσ*(cos2σM+C*cosσ*(-1+2*cos2σM*cos2σM)));
    } while (Math.abs(λ-λʹ) > 1e-12 && ++iterations<200);
    if (iterations>=200) throw new Error('Formula failed to converge');

    var uSq = cosSqα * (a*a - b*b) / (b*b);
    var A = 1 + uSq/16384*(4096+uSq*(-768+uSq*(320-175*uSq)));
    var B = uSq/1024 * (256+uSq*(-128+uSq*(74-47*uSq)));
    var Δσ = B*sinσ*(cos2σM+B/4*(cosσ*(-1+2*cos2σM*cos2σM)-
        B/6*cos2σM*(-3+4*sinσ*sinσ)*(-3+4*cos2σM*cos2σM)));

    var s = b*A*(σ-Δσ);

    var α1 = Math.atan2(cosU2*sinλ,  cosU1*sinU2-sinU1*cosU2*cosλ);
    var α2 = Math.atan2(cosU1*sinλ, -sinU1*cosU2+cosU1*sinU2*cosλ);

    α1 = (α1 + 2*Math.PI) % (2*Math.PI); // normalise to 0..360
    α2 = (α2 + 2*Math.PI) % (2*Math.PI); // normalise to 0..360

    s = Number(s.toFixed(3)); // round to 1mm precision
    return { distance: s, initialBearing: α1.toDegrees(), finalBearing: α2.toDegrees() };
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Extend Number object with method to convert numeric degrees to radians */
if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

/** Extend Number object with method to convert radians to numeric (signed) degrees */
if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  MGRS / UTM Conversion Functions                                   (c) Chris Veness 2014-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-utm-mgrs.html                                           */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-mgrs.html                                   */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * Convert between Universal Transverse Mercator (UTM) coordinates and Military Grid Reference
 * System (MGRS/NATO) grid references.
 *
 * @module   mgrs
 * @requires utm
 * @requires latlon-ellipsoidal
 */

/* qv www.fgdc.gov/standards/projects/FGDC-standards-projects/usng/fgdc_std_011_2001_usng.pdf p10 */


/*
 * Latitude bands C..X 8° each, covering 80°S to 84°N
 */
Mgrs.latBands = 'CDEFGHJKLMNPQRSTUVWXX'; // X is repeated for 80-84°N


/*
 * 100km grid square column (‘e’) letters repeat every third zone
 */
Mgrs.e100kLetters = [ 'ABCDEFGH', 'JKLMNPQR', 'STUVWXYZ' ];


/*
 * 100km grid square row (‘n’) letters repeat every other zone
 */
Mgrs.n100kLetters = [ 'ABCDEFGHJKLMNPQRSTUV', 'FGHJKLMNPQRSTUVABCDE' ];


/**
 * Creates an Mgrs grid reference object.
 *
 * @constructor
 * @param  {number} zone - 6° longitudinal zone (1..60 covering 180°W..180°E).
 * @param  {string} band - 8° latitudinal band (C..X covering 80°S..84°N).
 * @param  {string} e100k - First letter (E) of 100km grid square.
 * @param  {string} n100k - Second letter (N) of 100km grid square.
 * @param  {number} easting - Easting in metres within 100km grid square.
 * @param  {number} northing - Northing in metres within 100km grid square.
 * @param  {LatLon.datum} [datum=WGS84] - Datum UTM coordinate is based on.
 * @throws {Error}  Invalid MGRS grid reference.
 *
 * @example
 *   var mgrsRef = new Mgrs(31, 'U', 'D', 'Q', 48251, 11932); // 31U DQ 48251 11932
 */
function Mgrs(zone, band, e100k, n100k, easting, northing, datum) {
    // allow instantiation without 'new'
    if (!(this instanceof Mgrs)) return new Mgrs(zone, band, e100k, n100k, easting, northing, datum);

    if (datum === undefined) datum = LatLon.datum.WGS84; // default if not supplied

    if (!(1<=zone && zone<=60)) throw new Error('Invalid MGRS grid reference (zone ‘'+zone+'’)');
    if (band.length != 1) throw new Error('Invalid MGRS grid reference (band ‘'+band+'’)');
    if (Mgrs.latBands.indexOf(band) == -1) throw new Error('Invalid MGRS grid reference (band ‘'+band+'’)');
    if (e100k.length!=1) throw new Error('Invalid MGRS grid reference (e100k ‘'+e100k+'’)');
    if (n100k.length!=1) throw new Error('Invalid MGRS grid reference (n100k ‘'+n100k+'’)');

    this.zone = Number(zone);
    this.band = band;
    this.e100k = e100k;
    this.n100k = n100k;
    this.easting = Number(easting);
    this.northing = Number(northing);
    this.datum = datum;
}


/**
 * Converts UTM coordinate to MGRS reference.
 *
 * @returns {Mgrs}
 * @throws  {Error} Invalid UTM coordinate.
 *
 * @example
 *   var utmCoord = new Utm(31, 'N', 448251, 5411932);
 *   var mgrsRef = utmCoord.toMgrs(); // 31U DQ 48251 11932
 */
Utm.prototype.toMgrs = function() {
    if (isNaN(this.zone + this.easting + this.northing)) throw new Error('Invalid UTM coordinate ‘'+this.toString()+'’');

    // MGRS zone is same as UTM zone
    var zone = this.zone;

    // convert UTM to lat/long to get latitude to determine band
    var latlong = this.toLatLonE();
    // grid zones are 8° tall, 0°N is 10th band
    var band = Mgrs.latBands.charAt(Math.floor(latlong.lat/8+10)); // latitude band

    // columns in zone 1 are A-H, zone 2 J-R, zone 3 S-Z, then repeating every 3rd zone
    var col = Math.floor(this.easting / 100e3);
    var e100k = Mgrs.e100kLetters[(zone-1)%3].charAt(col-1); // col-1 since 1*100e3 -> A (index 0), 2*100e3 -> B (index 1), etc.

    // rows in even zones are A-V, in odd zones are F-E
    var row = Math.floor(this.northing / 100e3) % 20;
    var n100k = Mgrs.n100kLetters[(zone-1)%2].charAt(row);

    // truncate easting/northing to within 100km grid square
    var easting = this.easting % 100e3;
    var northing = this.northing % 100e3;

    // round to nm precision
    easting = Number(easting.toFixed(6));
    northing = Number(northing.toFixed(6));

    return new Mgrs(zone, band, e100k, n100k, easting, northing);
};


/**
 * Converts MGRS grid reference to UTM coordinate.
 *
 * @returns {Utm}
 *
 * @example
 *   var utmCoord = Mgrs.parse('31U DQ 448251 11932').toUtm(); // 31 N 448251 5411932
 */
Mgrs.prototype.toUtm = function() {
    var zone = this.zone;
    var band = this.band;
    var e100k = this.e100k;
    var n100k = this.n100k;
    var easting = this.easting;
    var northing = this.northing;

    var hemisphere = band>='N' ? 'N' : 'S';

    // get easting specified by e100k
    var col = Mgrs.e100kLetters[(zone-1)%3].indexOf(e100k) + 1; // index+1 since A (index 0) -> 1*100e3, B (index 1) -> 2*100e3, etc.
    var e100kNum = col * 100e3; // e100k in metres

    // get northing specified by n100k
    var row = Mgrs.n100kLetters[(zone-1)%2].indexOf(n100k);
    var n100kNum = row * 100e3; // n100k in metres

    // get latitude of (bottom of) band
    var latBand = (Mgrs.latBands.indexOf(band)-10)*8;

    // northing of bottom of band, extended to include entirety of bottommost 100km square
    // (100km square boundaries are aligned with 100km UTM northing intervals)
    var nBand = Math.floor(new LatLon(latBand, 0).toUtm().northing/100e3)*100e3;
    // 100km grid square row letters repeat every 2,000km north; add enough 2,000km blocks to get
    // into required band
    var n2M = 0; // northing of 2,000km block
    while (n2M + n100kNum + northing < nBand) n2M += 2000e3;

    return new Utm(zone, hemisphere, e100kNum+easting, n2M+n100kNum+northing, this.datum);
};


/**
 * Parses string representation of MGRS grid reference.
 *
 * An MGRS grid reference comprises (space-separated)
 *  - grid zone designator (GZD)
 *  - 100km grid square letter-pair
 *  - easting
 *  - northing.
 *
 * @param   {string} mgrsGridRef - String representation of MGRS grid reference.
 * @returns {Mgrs}   Mgrs grid reference object.
 * @throws  {Error}  Invalid MGRS grid reference.
 *
 * @example
 *   var mgrsRef = Mgrs.parse('31U DQ 48251 11932');
 *   var mgrsRef = Mgrs.parse('31UDQ4825111932');
 *   //  mgrsRef: { zone:31, band:'U', e100k:'D', n100k:'Q', easting:48251, northing:11932 }
 */
Mgrs.parse = function(mgrsGridRef) {
    mgrsGridRef = mgrsGridRef.trim();

    // check for military-style grid reference with no separators
    if (!mgrsGridRef.match(/\s/)) {
        var en = mgrsGridRef.slice(5); // get easting/northing following zone/band/100ksq
        en = en.slice(0, en.length/2)+' '+en.slice(-en.length/2); // separate easting/northing
        mgrsGridRef = mgrsGridRef.slice(0, 3)+' '+mgrsGridRef.slice(3, 5)+' '+en; // insert spaces
    }

    // match separate elements (separated by whitespace)
    mgrsGridRef = mgrsGridRef.match(/\S+/g);

    if (mgrsGridRef==null || mgrsGridRef.length!=4) throw new Error('Invalid MGRS grid reference ‘'+mgrsGridRef+'’');

    // split gzd into zone/band
    var gzd = mgrsGridRef[0];
    var zone = gzd.slice(0, 2);
    var band = gzd.slice(2, 3);

    // split 100km letter-pair into e/n
    var en100k = mgrsGridRef[1];
    var e100k = en100k.slice(0, 1);
    var n100k = en100k.slice(1, 2);

    var e = mgrsGridRef[2], n = mgrsGridRef[3];

    // standardise to 10-digit refs - ie metres) (but only if < 10-digit refs, to allow decimals)
    e = e.length>=5 ?  e : (e+'00000').slice(0, 5);
    n = n.length>=5 ?  n : (n+'00000').slice(0, 5);

    return new Mgrs(zone, band, e100k, n100k, e, n);
};


/**
 * Returns a string representation of an MGRS grid reference.
 *
 * To distinguish from civilian UTM coordinate representations, no space is included within the
 * zone/band grid zone designator.
 *
 * Components are separated by spaces: for a military-style unseparated string, use
 * Mgrs.toString().replace(/ /g, '');
 *
 * Note that MGRS grid references get truncated, not rounded (unlike UTM coordinates).
 *
 * @param   {number} [digits=10] - Precision of returned grid reference (eg 4 = km, 10 = m).
 * @returns {string} This grid reference in standard format.
 * @throws  {Error}  Invalid precision.
 *
 * @example
 *   var mgrsStr = new Mgrs(31, 'U', 'D', 'Q', 48251, 11932).toString(); // '31U DQ 48251 11932'
 */
Mgrs.prototype.toString = function(digits) {
    digits = (digits === undefined) ? 10 : Number(digits);
    if ([ 2,4,6,8,10 ].indexOf(digits) == -1) throw new Error('Invalid precision ‘'+digits+'’');

    var zone = ('00'+this.zone).slice(-2); // ensure leading zero
    var band = this.band;

    var e100k = this.e100k;
    var n100k = this.n100k;

    // truncate to required precision
    var eRounded = Math.floor(this.easting/Math.pow(10, 5-digits/2));
    var nRounded = Math.floor(this.northing/Math.pow(10, 5-digits/2));

    // ensure leading zeros
    var easting = ('00000'+eRounded).slice(-digits/2);
    var northing = ('00000'+nRounded).slice(-digits/2);

    return zone+band + ' ' + e100k+n100k + ' '  + easting + ' ' + northing;
};


/* npm main module */
/* Commented out for use in browser
'use strict';
exports.LatLonSpherical   = require('./latlon-spherical.js');
exports.LatLonEllipsoidal = require('./latlon-ellipsoidal.js');
// merge vincenty methods into LatLonEllipsoidal
var V = require('./latlon-vincenty.js');
for (var prop in V) exports.LatLonEllipsoidal[prop] = V[prop];
exports.LatLonVectors     = require('./latlon-vectors.js');
exports.Vector3d          = require('./vector3d.js');
exports.Utm               = require('./utm.js');
exports.Mgrs              = require('./mgrs.js');
exports.OsGridRef         = require('./osgridref.js');
exports.Dms               = require('./dms.js');
*//* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Ordnance Survey Grid Reference functions                           (c) Chris Veness 2005-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-gridref.html                                            */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-osgridref.html                              */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * Convert OS grid references to/from OSGB latitude/longitude points.
 *
 * Formulation implemented here due to Thomas, Redfearn, etc is as published by OS, but is inferior
 * to Krüger as used by e.g. Karney 2011.
 *
 * www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf.
 *
 * @module   osgridref
 * @requires latlon-ellipsoidal
 */
/*
 * Converted 2015 to work with WGS84 by default, OSGB36 as option;
 * www.ordnancesurvey.co.uk/blog/2014/12/confirmation-on-changes-to-latitude-and-longitude
 */


/**
 * Creates an OsGridRef object.
 *
 * @constructor
 * @param {number} easting - Easting in metres from OS false origin.
 * @param {number} northing - Northing in metres from OS false origin.
 *
 * @example
 *   var grid = new OsGridRef(651409, 313177);
 */
function OsGridRef(easting, northing) {
    // allow instantiation without 'new'
    if (!(this instanceof OsGridRef)) return new OsGridRef(easting, northing);

    this.easting = Number(easting);
    this.northing = Number(northing);
}


/**
 * Converts latitude/longitude to Ordnance Survey grid reference easting/northing coordinate.
 *
 * Note formulation implemented here due to Thomas, Redfearn, etc is as published by OS, but is
 * inferior to Krüger as used by e.g. Karney 2011.
 *
 * @param   {LatLon}    point - latitude/longitude.
 * @returns {OsGridRef} OS Grid Reference easting/northing.
 *
 * @example
 *   var p = new LatLon(52.65798, 1.71605);
 *   var grid = OsGridRef.latLonToOsGrid(p); // grid.toString(): TG 51409 13177
 *   // for conversion of (historical) OSGB36 latitude/longitude point:
 *   var p = new LatLon(52.65757, 1.71791, LatLon.datum.OSGB36);
 */
OsGridRef.latLonToOsGrid = function(point) {
    if (!(point instanceof LatLon)) throw new TypeError('point is not LatLon object');

    // if necessary convert to OSGB36 first
    if (point.datum != LatLon.datum.OSGB36) point = point.convertDatum(LatLon.datum.OSGB36);

    var φ = point.lat.toRadians();
    var λ = point.lon.toRadians();

    var a = 6377563.396, b = 6356256.909;              // Airy 1830 major & minor semi-axes
    var F0 = 0.9996012717;                             // NatGrid scale factor on central meridian
    var φ0 = (49).toRadians(), λ0 = (-2).toRadians();  // NatGrid true origin is 49°N,2°W
    var N0 = -100000, E0 = 400000;                     // northing & easting of true origin, metres
    var e2 = 1 - (b*b)/(a*a);                          // eccentricity squared
    var n = (a-b)/(a+b), n2 = n*n, n3 = n*n*n;         // n, n², n³

    var cosφ = Math.cos(φ), sinφ = Math.sin(φ);
    var ν = a*F0/Math.sqrt(1-e2*sinφ*sinφ);            // nu = transverse radius of curvature
    var ρ = a*F0*(1-e2)/Math.pow(1-e2*sinφ*sinφ, 1.5); // rho = meridional radius of curvature
    var η2 = ν/ρ-1;                                    // eta = ?

    var Ma = (1 + n + (5/4)*n2 + (5/4)*n3) * (φ-φ0);
    var Mb = (3*n + 3*n*n + (21/8)*n3) * Math.sin(φ-φ0) * Math.cos(φ+φ0);
    var Mc = ((15/8)*n2 + (15/8)*n3) * Math.sin(2*(φ-φ0)) * Math.cos(2*(φ+φ0));
    var Md = (35/24)*n3 * Math.sin(3*(φ-φ0)) * Math.cos(3*(φ+φ0));
    var M = b * F0 * (Ma - Mb + Mc - Md);              // meridional arc

    var cos3φ = cosφ*cosφ*cosφ;
    var cos5φ = cos3φ*cosφ*cosφ;
    var tan2φ = Math.tan(φ)*Math.tan(φ);
    var tan4φ = tan2φ*tan2φ;

    var I = M + N0;
    var II = (ν/2)*sinφ*cosφ;
    var III = (ν/24)*sinφ*cos3φ*(5-tan2φ+9*η2);
    var IIIA = (ν/720)*sinφ*cos5φ*(61-58*tan2φ+tan4φ);
    var IV = ν*cosφ;
    var V = (ν/6)*cos3φ*(ν/ρ-tan2φ);
    var VI = (ν/120) * cos5φ * (5 - 18*tan2φ + tan4φ + 14*η2 - 58*tan2φ*η2);

    var Δλ = λ-λ0;
    var Δλ2 = Δλ*Δλ, Δλ3 = Δλ2*Δλ, Δλ4 = Δλ3*Δλ, Δλ5 = Δλ4*Δλ, Δλ6 = Δλ5*Δλ;

    var N = I + II*Δλ2 + III*Δλ4 + IIIA*Δλ6;
    var E = E0 + IV*Δλ + V*Δλ3 + VI*Δλ5;

    N = Number(N.toFixed(3)); // round to mm precision
    E = Number(E.toFixed(3));

    return new OsGridRef(E, N); // gets truncated to SW corner of 1m grid square
};


/**
 * Converts Ordnance Survey grid reference easting/northing coordinate to latitude/longitude
 * (SW corner of grid square).
 *
 * Note formulation implemented here due to Thomas, Redfearn, etc is as published by OS, but is
 * inferior to Krüger as used by e.g. Karney 2011.
 *
 * @param   {OsGridRef}    gridref - Grid ref E/N to be converted to lat/long (SW corner of grid square).
 * @param   {LatLon.datum} [datum=WGS84] - Datum to convert grid reference into.
 * @returns {LatLon}       Latitude/longitude of supplied grid reference.
 *
 * @example
 *   var gridref = new OsGridRef(651409.903, 313177.270);
 *   var pWgs84 = OsGridRef.osGridToLatLon(gridref);                     // 52°39′28.723″N, 001°42′57.787″E
 *   // to obtain (historical) OSGB36 latitude/longitude point:
 *   var pOsgb = OsGridRef.osGridToLatLon(gridref, LatLon.datum.OSGB36); // 52°39′27.253″N, 001°43′04.518″E
 */
OsGridRef.osGridToLatLon = function(gridref, datum) {
    if (!(gridref instanceof OsGridRef)) throw new TypeError('gridref is not OsGridRef object');
    if (datum === undefined) datum = LatLon.datum.WGS84;

    var E = gridref.easting;
    var N = gridref.northing;

    var a = 6377563.396, b = 6356256.909;              // Airy 1830 major & minor semi-axes
    var F0 = 0.9996012717;                             // NatGrid scale factor on central meridian
    var φ0 = (49).toRadians(), λ0 = (-2).toRadians();  // NatGrid true origin is 49°N,2°W
    var N0 = -100000, E0 = 400000;                     // northing & easting of true origin, metres
    var e2 = 1 - (b*b)/(a*a);                          // eccentricity squared
    var n = (a-b)/(a+b), n2 = n*n, n3 = n*n*n;         // n, n², n³

    var φ=φ0, M=0;
    do {
        φ = (N-N0-M)/(a*F0) + φ;

        var Ma = (1 + n + (5/4)*n2 + (5/4)*n3) * (φ-φ0);
        var Mb = (3*n + 3*n*n + (21/8)*n3) * Math.sin(φ-φ0) * Math.cos(φ+φ0);
        var Mc = ((15/8)*n2 + (15/8)*n3) * Math.sin(2*(φ-φ0)) * Math.cos(2*(φ+φ0));
        var Md = (35/24)*n3 * Math.sin(3*(φ-φ0)) * Math.cos(3*(φ+φ0));
        M = b * F0 * (Ma - Mb + Mc - Md);              // meridional arc

    } while (N-N0-M >= 0.00001);  // ie until < 0.01mm

    var cosφ = Math.cos(φ), sinφ = Math.sin(φ);
    var ν = a*F0/Math.sqrt(1-e2*sinφ*sinφ);            // nu = transverse radius of curvature
    var ρ = a*F0*(1-e2)/Math.pow(1-e2*sinφ*sinφ, 1.5); // rho = meridional radius of curvature
    var η2 = ν/ρ-1;                                    // eta = ?

    var tanφ = Math.tan(φ);
    var tan2φ = tanφ*tanφ, tan4φ = tan2φ*tan2φ, tan6φ = tan4φ*tan2φ;
    var secφ = 1/cosφ;
    var ν3 = ν*ν*ν, ν5 = ν3*ν*ν, ν7 = ν5*ν*ν;
    var VII = tanφ/(2*ρ*ν);
    var VIII = tanφ/(24*ρ*ν3)*(5+3*tan2φ+η2-9*tan2φ*η2);
    var IX = tanφ/(720*ρ*ν5)*(61+90*tan2φ+45*tan4φ);
    var X = secφ/ν;
    var XI = secφ/(6*ν3)*(ν/ρ+2*tan2φ);
    var XII = secφ/(120*ν5)*(5+28*tan2φ+24*tan4φ);
    var XIIA = secφ/(5040*ν7)*(61+662*tan2φ+1320*tan4φ+720*tan6φ);

    var dE = (E-E0), dE2 = dE*dE, dE3 = dE2*dE, dE4 = dE2*dE2, dE5 = dE3*dE2, dE6 = dE4*dE2, dE7 = dE5*dE2;
    φ = φ - VII*dE2 + VIII*dE4 - IX*dE6;
    var λ = λ0 + X*dE - XI*dE3 + XII*dE5 - XIIA*dE7;

    var point =  new LatLon(φ.toDegrees(), λ.toDegrees(), LatLon.datum.OSGB36);
    if (datum != LatLon.datum.OSGB36) point = point.convertDatum(datum);

    return point;
};


/**
 * Parses grid reference to OsGridRef object.
 *
 * Accepts standard grid references (eg 'SU 387 148'), with or without whitespace separators, from
 * two-digit references up to 10-digit references (1m × 1m square), or fully numeric comma-separated
 * references in metres (eg '438700,114800').
 *
 * @param   {string}    gridref - Standard format OS grid reference.
 * @returns {OsGridRef} Numeric version of grid reference in metres from false origin (SW corner of
 *   supplied grid square).
 * @throws Error on Invalid grid reference.
 *
 * @example
 *   var grid = OsGridRef.parse('TG 51409 13177'); // grid: { easting: 651409, northing: 313177 }
 */
OsGridRef.parse = function(gridref) {
    gridref = String(gridref).trim();

    // check for fully numeric comma-separated gridref format
    var match = gridref.match(/^(\d+),\s*(\d+)$/);
    if (match) return new OsGridRef(match[1], match[2]);

    // validate format
    match = gridref.match(/^[A-Z]{2}\s*[0-9]+\s*[0-9]+$/i);
    if (!match) throw new Error('Invalid grid reference');

    // get numeric values of letter references, mapping A->0, B->1, C->2, etc:
    var l1 = gridref.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    var l2 = gridref.toUpperCase().charCodeAt(1) - 'A'.charCodeAt(0);
    // shuffle down letters after 'I' since 'I' is not used in grid:
    if (l1 > 7) l1--;
    if (l2 > 7) l2--;

    // convert grid letters into 100km-square indexes from false origin (grid square SV):
    var e100km = ((l1-2)%5)*5 + (l2%5);
    var n100km = (19-Math.floor(l1/5)*5) - Math.floor(l2/5);

    // skip grid letters to get numeric (easting/northing) part of ref
    var en = gridref.slice(2).trim().split(/\s+/);
    // if e/n not whitespace separated, split half way
    if (en.length == 1) en = [ en[0].slice(0, en[0].length/2), en[0].slice(en[0].length/2) ];

    // validation
    if (e100km<0 || e100km>6 || n100km<0 || n100km>12) throw new Error('Invalid grid reference');
    if (en.length != 2) throw new Error('Invalid grid reference');
    if (en[0].length != en[1].length) throw new Error('Invalid grid reference');

    // standardise to 10-digit refs (metres)
    en[0] = (en[0]+'00000').slice(0, 5);
    en[1] = (en[1]+'00000').slice(0, 5);

    var e = e100km + en[0];
    var n = n100km + en[1];

    return new OsGridRef(e, n);
};


/**
 * Converts ‘this’ numeric grid reference to standard OS grid reference.
 *
 * @param   {number} [digits=10] - Precision of returned grid reference (10 digits = metres);
 *   digits=0 will return grid reference in numeric format.
 * @returns {string} This grid reference in standard format.
 *
 * @example
 *   var ref = new OsGridRef(651409, 313177).toString(); // TG 51409 13177
 */
OsGridRef.prototype.toString = function(digits) {
    digits = (digits === undefined) ? 10 : Number(digits);
    if (isNaN(digits) || digits%2!=0 || digits>16) throw new RangeError('Invalid precision ‘'+digits+'’');

    var e = this.easting;
    var n = this.northing;
    if (isNaN(e) || isNaN(n)) throw new Error('Invalid grid reference');

    // use digits = 0 to return numeric format (in metres, allowing for decimals & for northing > 1e6)
    if (digits == 0) {
        var eInt = Math.floor(e), eDec = e - eInt;
        var nInt = Math.floor(n), nDec = n - nInt;
        var ePad = ('000000'+eInt).slice(-6) + (eDec>0 ? eDec.toFixed(3).slice(1) : '');
        var nPad = (nInt<1e6 ? ('000000'+nInt).slice(-6) : nInt) + (nDec>0 ? nDec.toFixed(3).slice(1) : '');
        return ePad + ',' + nPad;
    }

    // get the 100km-grid indices
    var e100k = Math.floor(e/100000), n100k = Math.floor(n/100000);

    if (e100k<0 || e100k>6 || n100k<0 || n100k>12) return '';

    // translate those into numeric equivalents of the grid letters
    var l1 = (19-n100k) - (19-n100k)%5 + Math.floor((e100k+10)/5);
    var l2 = (19-n100k)*5%25 + e100k%5;

    // compensate for skipped 'I' and build grid letter-pairs
    if (l1 > 7) l1++;
    if (l2 > 7) l2++;
    var letterPair = String.fromCharCode(l1+'A'.charCodeAt(0), l2+'A'.charCodeAt(0));

    // strip 100km-grid indices from easting & northing, and reduce precision
    e = Math.floor((e%100000)/Math.pow(10, 5-digits/2));
    n = Math.floor((n%100000)/Math.pow(10, 5-digits/2));

    // pad eastings & northings with leading zeros (just in case, allow up to 16-digit (mm) refs)
    e = ('00000000'+e).slice(-digits/2);
    n = ('00000000'+n).slice(-digits/2);

    return letterPair + ' ' + e + ' ' + n;
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Polyfill String.trim for old browsers
 *  (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (String.prototype.trim === undefined) {
    String.prototype.trim = function() {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* UTM / WGS-84 Conversion Functions                                  (c) Chris Veness 2014-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/latlong-utm-mgrs.html                                           */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-utm.html                                    */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * Convert between Universal Transverse Mercator coordinates and WGS 84 latitude/longitude points.
 *
 * Method based on Karney 2011 ‘Transverse Mercator with an accuracy of a few nanometers’,
 * building on Krüger 1912 ‘Konforme Abbildung des Erdellipsoids in der Ebene’.
 *
 * @module   utm
 * @requires latlon-ellipsoidal
 */


/**
 * Creates a Utm coordinate object.
 *
 * @constructor
 * @param  {number} zone - UTM 6° longitudinal zone (1..60 covering 180°W..180°E).
 * @param  {string} hemisphere - N for northern hemisphere, S for southern hemisphere.
 * @param  {number} easting - Easting in metres from false easting (-500km from central meridian).
 * @param  {number} northing - Northing in metres from equator (N) or from false northing -10,000km (S).
 * @param  {LatLon.datum} [datum=WGS84] - Datum UTM coordinate is based on.
 * @param  {number} [convergence] - Meridian convergence (bearing of grid north clockwise from true
 *                  north), in degrees
 * @param  {number} [scale] - Grid scale factor
 * @throws {Error}  Invalid UTM coordinate
 *
 * @example
 *   var utmCoord = new Utm(31, 'N', 448251, 5411932);
 */
function Utm(zone, hemisphere, easting, northing, datum, convergence, scale) {
    if (!(this instanceof Utm)) { // allow instantiation without 'new'
        return new Utm(zone, hemisphere, easting, northing, datum, convergence, scale);
    }

    if (datum === undefined) datum = LatLon.datum.WGS84; // default if not supplied
    if (convergence === undefined) convergence = null;   // default if not supplied
    if (scale === undefined) scale = null;               // default if not supplied

    if (!(1<=zone && zone<=60)) throw new Error('Invalid UTM zone '+zone);
    if (!hemisphere.match(/[NS]/i)) throw new Error('Invalid UTM hemisphere '+hemisphere);
    // range-check easting/northing (with 40km overlap between zones) - is this worthwhile?
    //if (!(120e3<=easting && easting<=880e3)) throw new Error('Invalid UTM easting '+ easting);
    //if (!(0<=northing && northing<=10000e3)) throw new Error('Invalid UTM northing '+ northing);

    this.zone = Number(zone);
    this.hemisphere = hemisphere.toUpperCase();
    this.easting = Number(easting);
    this.northing = Number(northing);
    this.datum = datum;
    this.convergence = convergence===null ? null : Number(convergence);
    this.scale = scale===null ? null : Number(scale);
}


/**
 * Converts latitude/longitude to UTM coordinate.
 *
 * Implements Karney’s method, using Krüger series to order n^6, giving results accurate to 5nm for
 * distances up to 3900km from the central meridian.
 *
 * @returns {Utm}   UTM coordinate.
 * @throws  {Error} If point not valid, if point outside latitude range.
 *
 * @example
 *   var latlong = new LatLon(48.8582, 2.2945);
 *   var utmCoord = latlong.toUtm(); // utmCoord.toString(): '31 N 448252 5411933'
 */
LatLon.prototype.toUtm = function() {
    if (isNaN(this.lat) || isNaN(this.lon)) throw new Error('Invalid point');
    if (!(-80<=this.lat && this.lat<=84)) throw new Error('Outside UTM limits');

    var falseEasting = 500e3, falseNorthing = 10000e3;

    var zone = Math.floor((this.lon+180)/6) + 1; // longitudinal zone
    var λ0 = ((zone-1)*6 - 180 + 3).toRadians(); // longitude of central meridian

    // ---- handle Norway/Svalbard exceptions
    // grid zones are 8° tall; 0°N is offset 10 into latitude bands array
    var mgrsLatBands = 'CDEFGHJKLMNPQRSTUVWXX'; // X is repeated for 80-84°N
    var latBand = mgrsLatBands.charAt(Math.floor(this.lat/8+10));
    // adjust zone & central meridian for Norway
    if (zone==31 && latBand=='V' && this.lon>= 3) { zone++; λ0 += (6).toRadians(); }
    // adjust zone & central meridian for Svalbard
    if (zone==32 && latBand=='X' && this.lon<  9) { zone--; λ0 -= (6).toRadians(); }
    if (zone==32 && latBand=='X' && this.lon>= 9) { zone++; λ0 += (6).toRadians(); }
    if (zone==34 && latBand=='X' && this.lon< 21) { zone--; λ0 -= (6).toRadians(); }
    if (zone==34 && latBand=='X' && this.lon>=21) { zone++; λ0 += (6).toRadians(); }
    if (zone==36 && latBand=='X' && this.lon< 33) { zone--; λ0 -= (6).toRadians(); }
    if (zone==36 && latBand=='X' && this.lon>=33) { zone++; λ0 += (6).toRadians(); }

    var φ = this.lat.toRadians();      // latitude ± from equator
    var λ = this.lon.toRadians() - λ0; // longitude ± from central meridian

    var a = this.datum.ellipsoid.a, f = this.datum.ellipsoid.f;
    // WGS 84: a = 6378137, b = 6356752.314245, f = 1/298.257223563;

    var k0 = 0.9996; // UTM scale on the central meridian

    // ---- easting, northing: Karney 2011 Eq 7-14, 29, 35:

    var e = Math.sqrt(f*(2-f)); // eccentricity
    var n = f / (2 - f);        // 3rd flattening
    var n2 = n*n, n3 = n*n2, n4 = n*n3, n5 = n*n4, n6 = n*n5; // TODO: compare Horner-form accuracy?

    var cosλ = Math.cos(λ), sinλ = Math.sin(λ), tanλ = Math.tan(λ);

    var τ = Math.tan(φ); // τ ≡ tanφ, τʹ ≡ tanφʹ; prime (ʹ) indicates angles on the conformal sphere
    var σ = Math.sinh(e*Math.atanh(e*τ/Math.sqrt(1+τ*τ)));

    var τʹ = τ*Math.sqrt(1+σ*σ) - σ*Math.sqrt(1+τ*τ);

    var ξʹ = Math.atan2(τʹ, cosλ);
    var ηʹ = Math.asinh(sinλ / Math.sqrt(τʹ*τʹ + cosλ*cosλ));

    var A = a/(1+n) * (1 + 1/4*n2 + 1/64*n4 + 1/256*n6); // 2πA is the circumference of a meridian

    var α = [ null, // note α is one-based array (6th order Krüger expressions)
        1/2*n - 2/3*n2 + 5/16*n3 +   41/180*n4 -     127/288*n5 +      7891/37800*n6,
              13/48*n2 -  3/5*n3 + 557/1440*n4 +     281/630*n5 - 1983433/1935360*n6,
                       61/240*n3 -  103/140*n4 + 15061/26880*n5 +   167603/181440*n6,
                               49561/161280*n4 -     179/168*n5 + 6601661/7257600*n6,
                                                 34729/80640*n5 - 3418889/1995840*n6,
                                                              212378941/319334400*n6 ];

    var ξ = ξʹ;
    for (var j=1; j<=6; j++) ξ += α[j] * Math.sin(2*j*ξʹ) * Math.cosh(2*j*ηʹ);

    var η = ηʹ;
    for (var j=1; j<=6; j++) η += α[j] * Math.cos(2*j*ξʹ) * Math.sinh(2*j*ηʹ);

    var x = k0 * A * η;
    var y = k0 * A * ξ;

    // ---- convergence: Karney 2011 Eq 23, 24

    var pʹ = 1;
    for (var j=1; j<=6; j++) pʹ += 2*j*α[j] * Math.cos(2*j*ξʹ) * Math.cosh(2*j*ηʹ);
    var qʹ = 0;
    for (var j=1; j<=6; j++) qʹ += 2*j*α[j] * Math.sin(2*j*ξʹ) * Math.sinh(2*j*ηʹ);

    var γʹ = Math.atan(τʹ / Math.sqrt(1+τʹ*τʹ)*tanλ);
    var γʺ = Math.atan2(qʹ, pʹ);

    var γ = γʹ + γʺ;

    // ---- scale: Karney 2011 Eq 25

    var sinφ = Math.sin(φ);
    var kʹ = Math.sqrt(1 - e*e*sinφ*sinφ) * Math.sqrt(1 + τ*τ) / Math.sqrt(τʹ*τʹ + cosλ*cosλ);
    var kʺ = A / a * Math.sqrt(pʹ*pʹ + qʹ*qʹ);

    var k = k0 * kʹ * kʺ;

    // ------------

    // shift x/y to false origins
    x = x + falseEasting;             // make x relative to false easting
    if (y < 0) y = y + falseNorthing; // make y in southern hemisphere relative to false northing

    // round to reasonable precision
    x = Number(x.toFixed(6)); // nm precision
    y = Number(y.toFixed(6)); // nm precision
    var convergence = Number(γ.toDegrees().toFixed(9));
    var scale = Number(k.toFixed(12));

    var h = this.lat>=0 ? 'N' : 'S'; // hemisphere

    return new Utm(zone, h, x, y, this.datum, convergence, scale);
};


/**
 * Converts UTM zone/easting/northing coordinate to latitude/longitude
 *
 * @param   {Utm}    utmCoord - UTM coordinate to be converted to latitude/longitude.
 * @returns {LatLon} Latitude/longitude of supplied grid reference.
 *
 * @example
 *   var grid = new Utm(31, 'N', 448251.795, 5411932.678);
 *   var latlong = grid.toLatLonE(); // latlong.toString(): 48°51′29.52″N, 002°17′40.20″E
 */
Utm.prototype.toLatLonE = function() {
    var z = this.zone;
    var h = this.hemisphere;
    var x = this.easting;
    var y = this.northing;

    if (isNaN(z) || isNaN(x) || isNaN(y)) throw new Error('Invalid coordinate');

    var falseEasting = 500e3, falseNorthing = 10000e3;

    var a = this.datum.ellipsoid.a, f = this.datum.ellipsoid.f;
    // WGS 84:  a = 6378137, b = 6356752.314245, f = 1/298.257223563;

    var k0 = 0.9996; // UTM scale on the central meridian

    x = x - falseEasting;               // make x ± relative to central meridian
    y = h=='S' ? y - falseNorthing : y; // make y ± relative to equator

    // ---- from Karney 2011 Eq 15-22, 36:

    var e = Math.sqrt(f*(2-f)); // eccentricity
    var n = f / (2 - f);        // 3rd flattening
    var n2 = n*n, n3 = n*n2, n4 = n*n3, n5 = n*n4, n6 = n*n5;

    var A = a/(1+n) * (1 + 1/4*n2 + 1/64*n4 + 1/256*n6); // 2πA is the circumference of a meridian

    var η = x / (k0*A);
    var ξ = y / (k0*A);

    var β = [ null, // note β is one-based array (6th order Krüger expressions)
        1/2*n - 2/3*n2 + 37/96*n3 -    1/360*n4 -   81/512*n5 +    96199/604800*n6,
               1/48*n2 +  1/15*n3 - 437/1440*n4 +   46/105*n5 - 1118711/3870720*n6,
                        17/480*n3 -   37/840*n4 - 209/4480*n5 +      5569/90720*n6,
                                 4397/161280*n4 -   11/504*n5 -  830251/7257600*n6,
                                               4583/161280*n5 -  108847/3991680*n6,
                                                             20648693/638668800*n6 ];

    var ξʹ = ξ;
    for (var j=1; j<=6; j++) ξʹ -= β[j] * Math.sin(2*j*ξ) * Math.cosh(2*j*η);

    var ηʹ = η;
    for (var j=1; j<=6; j++) ηʹ -= β[j] * Math.cos(2*j*ξ) * Math.sinh(2*j*η);

    var sinhηʹ = Math.sinh(ηʹ);
    var sinξʹ = Math.sin(ξʹ), cosξʹ = Math.cos(ξʹ);

    var τʹ = sinξʹ / Math.sqrt(sinhηʹ*sinhηʹ + cosξʹ*cosξʹ);

    var τi = τʹ;
    do {
        var σi = Math.sinh(e*Math.atanh(e*τi/Math.sqrt(1+τi*τi)));
        var τiʹ = τi * Math.sqrt(1+σi*σi) - σi * Math.sqrt(1+τi*τi);
        var δτi = (τʹ - τiʹ)/Math.sqrt(1+τiʹ*τiʹ)
            * (1 + (1-e*e)*τi*τi) / ((1-e*e)*Math.sqrt(1+τi*τi));
        τi += δτi;
    } while (Math.abs(δτi) > 1e-12); // using IEEE 754 δτi -> 0 after 2-3 iterations
    // note relatively large convergence test as δτi toggles on ±1.12e-16 for eg 31 N 400000 5000000
    var τ = τi;

    var φ = Math.atan(τ);

    var λ = Math.atan2(sinhηʹ, cosξʹ);

    // ---- convergence: Karney 2011 Eq 26, 27

    var p = 1;
    for (var j=1; j<=6; j++) p -= 2*j*β[j] * Math.cos(2*j*ξ) * Math.cosh(2*j*η);
    var q = 0;
    for (var j=1; j<=6; j++) q += 2*j*β[j] * Math.sin(2*j*ξ) * Math.sinh(2*j*η);

    var γʹ = Math.atan(Math.tan(ξʹ) * Math.tanh(ηʹ));
    var γʺ = Math.atan2(q, p);

    var γ = γʹ + γʺ;

    // ---- scale: Karney 2011 Eq 28

    var sinφ = Math.sin(φ);
    var kʹ = Math.sqrt(1 - e*e*sinφ*sinφ) * Math.sqrt(1 + τ*τ) * Math.sqrt(sinhηʹ*sinhηʹ + cosξʹ*cosξʹ);
    var kʺ = A / a / Math.sqrt(p*p + q*q);

    var k = k0 * kʹ * kʺ;

    // ------------

    var λ0 = ((z-1)*6 - 180 + 3).toRadians(); // longitude of central meridian
    λ += λ0; // move λ from zonal to global coordinates

    // round to reasonable precision
    var lat = Number(φ.toDegrees().toFixed(11)); // nm precision (1nm = 10^-11°)
    var lon = Number(λ.toDegrees().toFixed(11)); // (strictly lat rounding should be φ⋅cosφ!)
    var convergence = Number(γ.toDegrees().toFixed(9));
    var scale = Number(k.toFixed(12));

    var latLong = new LatLon(lat, lon, this.datum);
    // ... and add the convergence and scale into the LatLon object ... wonderful JavaScript!
    latLong.convergence = convergence;
    latLong.scale = scale;

    return latLong;
};


/**
 * Parses string representation of UTM coordinate.
 *
 * A UTM coordinate comprises (space-separated)
 *  - zone
 *  - hemisphere
 *  - easting
 *  - northing.
 *
 * @param   {string} utmCoord - UTM coordinate (WGS 84).
 * @param   {Datum}  [datum=WGS84] - Datum coordinate is defined in (default WGS 84).
 * @returns {Utm}
 * @throws  {Error}  Invalid UTM coordinate.
 *
 * @example
 *   var utmCoord = Utm.parse('31 N 448251 5411932');
 *   // utmCoord: {zone: 31, hemisphere: 'N', easting: 448251, northing: 5411932 }
 */
Utm.parse = function(utmCoord, datum) {
    if (datum === undefined) datum = LatLon.datum.WGS84; // default if not supplied

    // match separate elements (separated by whitespace)
    utmCoord = utmCoord.trim().match(/\S+/g);

    if (utmCoord==null || utmCoord.length!=4) throw new Error('Invalid UTM coordinate ‘'+utmCoord+'’');

    var zone = utmCoord[0], hemisphere = utmCoord[1], easting = utmCoord[2], northing = utmCoord[3];

    return new Utm(zone, hemisphere, easting, northing, datum);
};


/**
 * Returns a string representation of a UTM coordinate.
 *
 * To distinguish from MGRS grid zone designators, a space is left between the zone and the
 * hemisphere.
 *
 * Note that UTM coordinates get rounded, not truncated (unlike MGRS grid references).
 *
 * @param   {number} [digits=0] - Number of digits to appear after the decimal point (3 ≡ mm).
 * @returns {string} A string representation of the coordinate.
 *
 * @example
 *   var utm = Utm.parse('31 N 448251 5411932').toString(4);  // 31 N 448251.0000 5411932.0000
 */
Utm.prototype.toString = function(digits) {
    digits = Number(digits||0); // default 0 if not supplied

    var z = this.zone<10 ? '0'+this.zone : this.zone; // leading zero
    var h = this.hemisphere;
    var e = this.easting;
    var n = this.northing;
    if (isNaN(z) || !h.match(/[NS]/) || isNaN(e) || isNaN(n)) return '';

    return z+' '+h+' '+e.toFixed(digits)+' '+n.toFixed(digits);
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/** Polyfill Math.sinh for old browsers / IE */
if (Math.sinh === undefined) {
    Math.sinh = function(x) {
        return (Math.exp(x) - Math.exp(-x)) / 2;
    };
}

/** Polyfill Math.cosh for old browsers / IE */
if (Math.cosh === undefined) {
    Math.cosh = function(x) {
        return (Math.exp(x) + Math.exp(-x)) / 2;
    };
}

/** Polyfill Math.tanh for old browsers / IE */
if (Math.tanh === undefined) {
    Math.tanh = function(x) {
        return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
    };
}

/** Polyfill Math.asinh for old browsers / IE */
if (Math.asinh === undefined) {
    Math.asinh = function(x) {
        return Math.log(x + Math.sqrt(1 + x*x));
    };
}

/** Polyfill Math.atanh for old browsers / IE */
if (Math.atanh === undefined) {
    Math.atanh = function(x) {
        return Math.log((1+x) / (1-x)) / 2;
    };
}

/** Polyfill String.trim for old browsers
 *  (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (String.prototype.trim === undefined) {
    String.prototype.trim = function() {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/* Vector handling functions                                          (c) Chris Veness 2011-2016  */
/*                                                                                   MIT Licence  */
/* www.movable-type.co.uk/scripts/geodesy/docs/module-vector3d.html                               */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/**
 * Library of 3-d vector manipulation routines.
 *
 * In a geodesy context, these vectors may be used to represent:
 *  - n-vector representing a normal to point on Earth's surface
 *  - earth-centered, earth fixed vector (≡ Gade’s ‘p-vector’)
 *  - great circle normal to vector (on spherical earth model)
 *  - motion vector on Earth's surface
 *  - etc
 *
 * Functions return vectors as return results, so that operations can be chained.
 * @example var v = v1.cross(v2).dot(v3) // ≡ v1×v2⋅v3
 *
 * @module vector3d
 */


/**
 * Creates a 3-d vector.
 *
 * The vector may be normalised, or use x/y/z values for eg height relative to the sphere or
 * ellipsoid, distance from earth centre, etc.
 *
 * @constructor
 * @param {number} x - X component of vector.
 * @param {number} y - Y component of vector.
 * @param {number} z - Z component of vector.
 */
function Vector3d(x, y, z) {
    // allow instantiation without 'new'
    if (!(this instanceof Vector3d)) return new Vector3d(x, y, z);

    this.x = Number(x);
    this.y = Number(y);
    this.z = Number(z);
}


/**
 * Adds supplied vector to ‘this’ vector.
 *
 * @param   {Vector3d} v - Vector to be added to this vector.
 * @returns {Vector3d} Vector representing sum of this and v.
 */
Vector3d.prototype.plus = function(v) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');

    return new Vector3d(this.x + v.x, this.y + v.y, this.z + v.z);
};


/**
 * Subtracts supplied vector from ‘this’ vector.
 *
 * @param   {Vector3d} v - Vector to be subtracted from this vector.
 * @returns {Vector3d} Vector representing difference between this and v.
 */
Vector3d.prototype.minus = function(v) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');

    return new Vector3d(this.x - v.x, this.y - v.y, this.z - v.z);
};


/**
 * Multiplies ‘this’ vector by a scalar value.
 *
 * @param   {number}   x - Factor to multiply this vector by.
 * @returns {Vector3d} Vector scaled by x.
 */
Vector3d.prototype.times = function(x) {
    x = Number(x);

    return new Vector3d(this.x * x, this.y * x, this.z * x);
};


/**
 * Divides ‘this’ vector by a scalar value.
 *
 * @param   {number}   x - Factor to divide this vector by.
 * @returns {Vector3d} Vector divided by x.
 */
Vector3d.prototype.dividedBy = function(x) {
    x = Number(x);

    return new Vector3d(this.x / x, this.y / x, this.z / x);
};


/**
 * Multiplies ‘this’ vector by the supplied vector using dot (scalar) product.
 *
 * @param   {Vector3d} v - Vector to be dotted with this vector.
 * @returns {number} Dot product of ‘this’ and v.
 */
Vector3d.prototype.dot = function(v) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');

    return this.x*v.x + this.y*v.y + this.z*v.z;
};


/**
 * Multiplies ‘this’ vector by the supplied vector using cross (vector) product.
 *
 * @param   {Vector3d} v - Vector to be crossed with this vector.
 * @returns {Vector3d} Cross product of ‘this’ and v.
 */
Vector3d.prototype.cross = function(v) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');

    var x = this.y*v.z - this.z*v.y;
    var y = this.z*v.x - this.x*v.z;
    var z = this.x*v.y - this.y*v.x;

    return new Vector3d(x, y, z);
};


/**
 * Negates a vector to point in the opposite direction
 *
 * @returns {Vector3d} Negated vector.
 */
Vector3d.prototype.negate = function() {
    return new Vector3d(-this.x, -this.y, -this.z);
};


/**
 * Length (magnitude or norm) of ‘this’ vector
 *
 * @returns {number} Magnitude of this vector.
 */
Vector3d.prototype.length = function() {
    return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
};


/**
 * Normalizes a vector to its unit vector
 * – if the vector is already unit or is zero magnitude, this is a no-op.
 *
 * @returns {Vector3d} Normalised version of this vector.
 */
Vector3d.prototype.unit = function() {
    var norm = this.length();
    if (norm == 1) return this;
    if (norm == 0) return this;

    var x = this.x/norm;
    var y = this.y/norm;
    var z = this.z/norm;

    return new Vector3d(x, y, z);
};


/**
 * Calculates the angle between ‘this’ vector and supplied vector.
 *
 * @param   {Vector3d} v
 * @param   {Vector3d} [vSign] - If supplied (and out of plane of this and v), angle is signed +ve if
 *     this->v is clockwise looking along vSign, -ve in opposite direction (otherwise unsigned angle).
 * @returns {number} Angle (in radians) between this vector and supplied vector.
 */
Vector3d.prototype.angleTo = function(v, vSign) {
    if (!(v instanceof Vector3d)) throw new TypeError('v is not Vector3d object');

    var sinθ = this.cross(v).length();
    var cosθ = this.dot(v);

    if (vSign !== undefined) {
        if (!(vSign instanceof Vector3d)) throw new TypeError('vSign is not Vector3d object');
        // use vSign as reference to get sign of sinθ
        sinθ = this.cross(v).dot(vSign)<0 ? -sinθ : sinθ;
    }

    return Math.atan2(sinθ, cosθ);
};


/**
 * Rotates ‘this’ point around an axis by a specified angle.
 *
 * @param   {Vector3d} axis - The axis being rotated around.
 * @param   {number}   theta - The angle of rotation (in radians).
 * @returns {Vector3d} The rotated point.
 */
Vector3d.prototype.rotateAround = function(axis, theta) {
    if (!(axis instanceof Vector3d)) throw new TypeError('axis is not Vector3d object');

    // en.wikipedia.org/wiki/Rotation_matrix#Rotation_matrix_from_axis_and_angle
    // en.wikipedia.org/wiki/Quaternions_and_spatial_rotation#Quaternion-derived_rotation_matrix
    var p1 = this.unit();
    var p = [ p1.x, p1.y, p1.z ]; // the point being rotated
    var a = axis.unit();          // the axis being rotated around
    var s = Math.sin(theta);
    var c = Math.cos(theta);
    // quaternion-derived rotation matrix
    var q = [
        [ a.x*a.x*(1-c) + c,     a.x*a.y*(1-c) - a.z*s, a.x*a.z*(1-c) + a.y*s ],
        [ a.y*a.x*(1-c) + a.z*s, a.y*a.y*(1-c) + c,     a.y*a.z*(1-c) - a.x*s ],
        [ a.z*a.x*(1-c) - a.y*s, a.z*a.y*(1-c) + a.x*s, a.z*a.z*(1-c) + c     ],
    ];
    // multiply q × p
    var qp = [ 0, 0, 0 ];
    for (var i=0; i<3; i++) {
        for (var j=0; j<3; j++) {
            qp[i] += q[i][j] * p[j];
        }
    }
    var p2 = new Vector3d(qp[0], qp[1], qp[2]);
    return p2;
    // qv en.wikipedia.org/wiki/Rodrigues'_rotation_formula...
};


/**
 * String representation of vector.
 *
 * @param   {number} [precision=3] - Number of decimal places to be used.
 * @returns {string} Vector represented as [x,y,z].
 */
Vector3d.prototype.toString = function(precision) {
    var p = (precision === undefined) ? 3 : Number(precision);

    var str = '[' + this.x.toFixed(p) + ',' + this.y.toFixed(p) + ',' + this.z.toFixed(p) + ']';

    return str;
};
/**
 * Section 5.3.6.5. Acknowledge the receiptof a start/resume, stop/freeze, or RemoveEntityPDU. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 15;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 55;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Used in UA PDU
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


dis.AcousticBeamData = function()
{
   /** beam data length */
   this.beamDataLength = 0;

   /** beamIDNumber */
   this.beamIDNumber = 0;

   /** padding */
   this.pad2 = 0;

   /** fundamental data parameters */
   this.fundamentalDataParameters = new dis.AcousticBeamFundamentalParameter(); 

  dis.AcousticBeamData.prototype.initFromBinary = function(inputStream)
  {
       this.beamDataLength = inputStream.readUShort();
       this.beamIDNumber = inputStream.readUByte();
       this.pad2 = inputStream.readUShort();
       this.fundamentalDataParameters.initFromBinary(inputStream);
  };

  dis.AcousticBeamData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.beamDataLength);
       outputStream.writeUByte(this.beamIDNumber);
       outputStream.writeUShort(this.pad2);
       this.fundamentalDataParameters.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.AcousticBeamData = dis.AcousticBeamData;

// End of AcousticBeamData class

/**
 * Used in UaPdu
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


dis.AcousticBeamFundamentalParameter = function()
{
   /** parameter index */
   this.activeEmissionParameterIndex = 0;

   /** scan pattern */
   this.scanPattern = 0;

   /** beam center azimuth */
   this.beamCenterAzimuth = 0;

   /** azimuthal beamwidth */
   this.azimuthalBeamwidth = 0;

   /** beam center */
   this.beamCenterDE = 0;

   /** DE beamwidth (vertical beamwidth) */
   this.deBeamwidth = 0;

  dis.AcousticBeamFundamentalParameter.prototype.initFromBinary = function(inputStream)
  {
       this.activeEmissionParameterIndex = inputStream.readUShort();
       this.scanPattern = inputStream.readUShort();
       this.beamCenterAzimuth = inputStream.readFloat32();
       this.azimuthalBeamwidth = inputStream.readFloat32();
       this.beamCenterDE = inputStream.readFloat32();
       this.deBeamwidth = inputStream.readFloat32();
  };

  dis.AcousticBeamFundamentalParameter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.activeEmissionParameterIndex);
       outputStream.writeUShort(this.scanPattern);
       outputStream.writeFloat32(this.beamCenterAzimuth);
       outputStream.writeFloat32(this.azimuthalBeamwidth);
       outputStream.writeFloat32(this.beamCenterDE);
       outputStream.writeFloat32(this.deBeamwidth);
  };
}; // end of class

 // node.js module support
exports.AcousticBeamFundamentalParameter = dis.AcousticBeamFundamentalParameter;

// End of AcousticBeamFundamentalParameter class

/**
 * Section 5.2.35. information about a specific UA emmtter
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
   this.acousticName = 0;

   /** The function of the acoustic system */
   this.function = 0;

   /** The UA emitter identification number relative to a specific system */
   this.acousticIdNumber = 0;

  dis.AcousticEmitter.prototype.initFromBinary = function(inputStream)
  {
       this.acousticName = inputStream.readUShort();
       this.function = inputStream.readUByte();
       this.acousticIdNumber = inputStream.readUByte();
  };

  dis.AcousticEmitter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.acousticName);
       outputStream.writeUByte(this.function);
       outputStream.writeUByte(this.acousticIdNumber);
  };
}; // end of class

 // node.js module support
exports.AcousticEmitter = dis.AcousticEmitter;

// End of AcousticEmitter class

/**
 * 5.3.35: Information about a particular UA emitter shall be represented using an Acoustic Emitter System record. This record shall consist of three fields: Acoustic Name, Function, and Acoustic ID Number
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


dis.AcousticEmitterSystem = function()
{
   /** This field shall specify the system for a particular UA emitter. */
   this.acousticName = 0;

   /** This field shall describe the function of the acoustic system.  */
   this.acousticFunction = 0;

   /** This field shall specify the UA emitter identification number relative to a specific system. This field shall be represented by an 8-bit unsigned integer. This field allows the differentiation of multiple systems on an entity, even if in some instances two or more of the systems may be identical UA emitter types. Numbering of systems shall begin with the value 1.  */
   this.acousticID = 0;

  dis.AcousticEmitterSystem.prototype.initFromBinary = function(inputStream)
  {
       this.acousticName = inputStream.readUShort();
       this.acousticFunction = inputStream.readUByte();
       this.acousticID = inputStream.readUByte();
  };

  dis.AcousticEmitterSystem.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.acousticName);
       outputStream.writeUByte(this.acousticFunction);
       outputStream.writeUByte(this.acousticID);
  };
}; // end of class

 // node.js module support
exports.AcousticEmitterSystem = dis.AcousticEmitterSystem;

// End of AcousticEmitterSystem class

/**
 * Used in the UA pdu; ties together an emmitter and a location. This requires manual cleanup; the beam data should not be attached to each emitter system.
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


dis.AcousticEmitterSystemData = function()
{
   /** Length of emitter system data */
   this.emitterSystemDataLength = 0;

   /** Number of beams */
   this.numberOfBeams = 0;

   /** padding */
   this.pad2 = 0;

   /** This field shall specify the system for a particular UA emitter. */
   this.acousticEmitterSystem = new dis.AcousticEmitterSystem(); 

   /** Represents the location wrt the entity */
   this.emitterLocation = new dis.Vector3Float(); 

   /** For each beam in numberOfBeams, an emitter system. This is not right--the beam records need to be at the end of the PDU, rather than attached to each system. */
    this.beamRecords = new Array();
 
  dis.AcousticEmitterSystemData.prototype.initFromBinary = function(inputStream)
  {
       this.emitterSystemDataLength = inputStream.readUByte();
       this.numberOfBeams = inputStream.readUByte();
       this.pad2 = inputStream.readUShort();
       this.acousticEmitterSystem.initFromBinary(inputStream);
       this.emitterLocation.initFromBinary(inputStream);
       for(var idx = 0; idx < this.numberOfBeams; idx++)
       {
           var anX = new dis.AcousticBeamData();
           anX.initFromBinary(inputStream);
           this.beamRecords.push(anX);
       }

  };

  dis.AcousticEmitterSystemData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.emitterSystemDataLength);
       outputStream.writeUByte(this.numberOfBeams);
       outputStream.writeUShort(this.pad2);
       this.acousticEmitterSystem.encodeToBinary(outputStream);
       this.emitterLocation.encodeToBinary(outputStream);
       for(var idx = 0; idx < this.beamRecords.length; idx++)
       {
           beamRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.AcousticEmitterSystemData = dis.AcousticEmitterSystemData;

// End of AcousticEmitterSystemData class

/**
 * Section 5.3.6.6. Request from simulation manager to an entity. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 16;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** Request ID that is unique */
   this.requestID = 0;

   /** identifies the action being requested */
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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 56;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.3.6.7. response to an action request PDU. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 17;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 57;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.2.36. Each agregate in a given simulation app is given an aggregate identifier number unique for all other aggregates in that app and in that exercise. The id is valid for the duration of the the exercise.
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


dis.AggregateID = function()
{
   /** The site ID */
   this.site = 0;

   /** The application ID */
   this.application = 0;

   /** the aggregate ID */
   this.aggregateID = 0;

  dis.AggregateID.prototype.initFromBinary = function(inputStream)
  {
       this.site = inputStream.readUShort();
       this.application = inputStream.readUShort();
       this.aggregateID = inputStream.readUShort();
  };

  dis.AggregateID.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.site);
       outputStream.writeUShort(this.application);
       outputStream.writeUShort(this.aggregateID);
  };
}; // end of class

 // node.js module support
exports.AggregateID = dis.AggregateID;

// End of AggregateID class

/**
 * Section 5.2.37. Specifies the character set used inthe first byte, followed by up to 31 characters of text data.
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
          this.characters[ idx ] = inputStream.readByte();
       }
  };

  dis.AggregateMarking.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.characterSet);
       for(var idx = 0; idx < 31; idx++)
       {
          outputStream.writeByte(this.characters[ idx ] );
       }
  };
}; // end of class

 // node.js module support
exports.AggregateMarking = dis.AggregateMarking;

// End of AggregateMarking class

/**
 * Section 5.3.9.1 informationa bout aggregating entities anc communicating information about the aggregated entities.        requires manual intervention to fix the padding between entityID lists and silent aggregate sysem lists--this padding        is dependent on how many entityIDs there are, and needs to be on a 32 bit word boundary. UNFINISHED
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


dis.AggregateStatePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 33;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 7;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of aggregated entities */
   this.aggregateID = new dis.EntityID(); 

   /** force ID */
   this.forceID = 0;

   /** state of aggregate */
   this.aggregateState = 0;

   /** entity type of the aggregated entities */
   this.aggregateType = new dis.EntityType(); 

   /** formation of aggregated entities */
   this.formation = 0;

   /** marking for aggregate; first char is charset type, rest is char data */
   this.aggregateMarking = new dis.AggregateMarking(); 

   /** dimensions of bounding box for the aggregated entities, origin at the center of mass */
   this.dimensions = new dis.Vector3Float(); 

   /** orientation of the bounding box */
   this.orientation = new dis.Orientation(); 

   /** center of mass of the aggregation */
   this.centerOfMass = new dis.Vector3Double(); 

   /** velocity of aggregation */
   this.velocity = new dis.Vector3Float(); 

   /** number of aggregates */
   this.numberOfDisAggregates = 0;

   /** number of entities */
   this.numberOfDisEntities = 0;

   /** number of silent aggregate types */
   this.numberOfSilentAggregateTypes = 0;

   /** number of silent entity types */
   this.numberOfSilentEntityTypes = 0;

   /** aggregates  list */
    this.aggregateIDList = new Array();
 
   /** entity ID list */
    this.entityIDList = new Array();
 
   /** ^^^padding to put the start of the next list on a 32 bit boundary. This needs to be fixed */
   this.pad2 = 0;

   /** silent entity types */
    this.silentAggregateSystemList = new Array();
 
   /** silent entity types */
    this.silentEntitySystemList = new Array();
 
   /** number of variable datum records */
   this.numberOfVariableDatumRecords = 0;

   /** variableDatums */
    this.variableDatumList = new Array();
 
  dis.AggregateStatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.aggregateID.initFromBinary(inputStream);
       this.forceID = inputStream.readUByte();
       this.aggregateState = inputStream.readUByte();
       this.aggregateType.initFromBinary(inputStream);
       this.formation = inputStream.readUInt();
       this.aggregateMarking.initFromBinary(inputStream);
       this.dimensions.initFromBinary(inputStream);
       this.orientation.initFromBinary(inputStream);
       this.centerOfMass.initFromBinary(inputStream);
       this.velocity.initFromBinary(inputStream);
       this.numberOfDisAggregates = inputStream.readUShort();
       this.numberOfDisEntities = inputStream.readUShort();
       this.numberOfSilentAggregateTypes = inputStream.readUShort();
       this.numberOfSilentEntityTypes = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfDisAggregates; idx++)
       {
           var anX = new dis.AggregateID();
           anX.initFromBinary(inputStream);
           this.aggregateIDList.push(anX);
       }

       for(var idx = 0; idx < this.numberOfDisEntities; idx++)
       {
           var anX = new dis.EntityID();
           anX.initFromBinary(inputStream);
           this.entityIDList.push(anX);
       }

       this.pad2 = inputStream.readUByte();
       for(var idx = 0; idx < this.numberOfSilentAggregateTypes; idx++)
       {
           var anX = new dis.EntityType();
           anX.initFromBinary(inputStream);
           this.silentAggregateSystemList.push(anX);
       }

       for(var idx = 0; idx < this.numberOfSilentEntityTypes; idx++)
       {
           var anX = new dis.EntityType();
           anX.initFromBinary(inputStream);
           this.silentEntitySystemList.push(anX);
       }

       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumList.push(anX);
       }

  };

  dis.AggregateStatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.aggregateID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.forceID);
       outputStream.writeUByte(this.aggregateState);
       this.aggregateType.encodeToBinary(outputStream);
       outputStream.writeUInt(this.formation);
       this.aggregateMarking.encodeToBinary(outputStream);
       this.dimensions.encodeToBinary(outputStream);
       this.orientation.encodeToBinary(outputStream);
       this.centerOfMass.encodeToBinary(outputStream);
       this.velocity.encodeToBinary(outputStream);
       outputStream.writeUShort(this.numberOfDisAggregates);
       outputStream.writeUShort(this.numberOfDisEntities);
       outputStream.writeUShort(this.numberOfSilentAggregateTypes);
       outputStream.writeUShort(this.numberOfSilentEntityTypes);
       for(var idx = 0; idx < this.aggregateIDList.length; idx++)
       {
           aggregateIDList[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.entityIDList.length; idx++)
       {
           entityIDList[idx].encodeToBinary(outputStream);
       }

       outputStream.writeUByte(this.pad2);
       for(var idx = 0; idx < this.silentAggregateSystemList.length; idx++)
       {
           silentAggregateSystemList[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.silentEntitySystemList.length; idx++)
       {
           silentEntitySystemList[idx].encodeToBinary(outputStream);
       }

       outputStream.writeUInt(this.numberOfVariableDatumRecords);
       for(var idx = 0; idx < this.variableDatumList.length; idx++)
       {
           variableDatumList[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.AggregateStatePdu = dis.AggregateStatePdu;

// End of AggregateStatePdu class

/**
 * Section 5.2.38. Identifies the type of aggregate including kind of entity, domain (surface, subsurface, air, etc) country, category, etc.
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
   /** Kind of entity */
   this.aggregateKind = 0;

   /** Domain of entity (air, surface, subsurface, space, etc) */
   this.domain = 0;

   /** country to which the design of the entity is attributed */
   this.country = 0;

   /** category of entity */
   this.category = 0;

   /** subcategory of entity */
   this.subcategory = 0;

   /** specific info based on subcategory field, sql has a reserved word for specific */
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
 * 5.2.2: angular velocity measured in radians per second out each of the entity's own coordinate axes.
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
 * 5.2.3: location of the radiating portion of the antenna, specified in world coordinates and entity coordinates.
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
 * Used in UA PDU
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


dis.ApaData = function()
{
   /** Index of APA parameter */
   this.parameterIndex = 0;

   /** Index of APA parameter */
   this.parameterValue = 0;

  dis.ApaData.prototype.initFromBinary = function(inputStream)
  {
       this.parameterIndex = inputStream.readUShort();
       this.parameterValue = inputStream.readShort();
  };

  dis.ApaData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.parameterIndex);
       outputStream.writeShort(this.parameterValue);
  };
}; // end of class

 // node.js module support
exports.ApaData = dis.ApaData;

// End of ApaData class

/**
 * Section 5.3.11.5: Information about the addition/modification of an oobject that is geometrically      achored to the terrain with a set of three or more points that come to a closure. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 45;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 9;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
   this.objectAppearance = new dis.SixByteChunk(); 

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.objectID.initFromBinary(inputStream);
       this.referencedObjectID.initFromBinary(inputStream);
       this.updateNumber = inputStream.readUShort();
       this.forceID = inputStream.readUByte();
       this.modifications = inputStream.readUByte();
       this.objectType.initFromBinary(inputStream);
       this.objectAppearance.initFromBinary(inputStream);
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.objectID.encodeToBinary(outputStream);
       this.referencedObjectID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.updateNumber);
       outputStream.writeUByte(this.forceID);
       outputStream.writeUByte(this.modifications);
       this.objectType.encodeToBinary(outputStream);
       this.objectAppearance.encodeToBinary(outputStream);
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
 * Section 5.2.5. Articulation parameters for  movable parts and attached parts of an entity. Specifes wether or not a change has occured,  the part identifcation of the articulated part to which it is attached, and the type and value of each parameter.
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


dis.ArticulationParameter = function()
{
   this.parameterTypeDesignator = 0;

   this.changeIndicator = 0;

   this.partAttachedTo = 0;

   this.parameterType = 0;

   this.parameterValue = 0;

  dis.ArticulationParameter.prototype.initFromBinary = function(inputStream)
  {
       this.parameterTypeDesignator = inputStream.readUByte();
       this.changeIndicator = inputStream.readUByte();
       this.partAttachedTo = inputStream.readUShort();
       this.parameterType = inputStream.readInt();
       this.parameterValue = inputStream.readFloat64();
  };

  dis.ArticulationParameter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.parameterTypeDesignator);
       outputStream.writeUByte(this.changeIndicator);
       outputStream.writeUShort(this.partAttachedTo);
       outputStream.writeInt(this.parameterType);
       outputStream.writeFloat64(this.parameterValue);
  };
}; // end of class

 // node.js module support
exports.ArticulationParameter = dis.ArticulationParameter;

// End of ArticulationParameter class

/**
 * Section 5.2.4.2. Used when the antenna pattern type field has a value of 1. Specifies           the direction, patter, and polarization of radiation from an antenna.
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
   /** The rotation that transformst he reference coordinate sytem     into the beam coordinate system. Either world coordinates or entity coordinates may be used as the     reference coordinate system, as specified by teh reference system field of the antenna pattern record. */
   this.beamDirection = new dis.Orientation(); 

   this.azimuthBeamwidth = 0;

   this.elevationBeamwidth = 0;

   this.referenceSystem = 0;

   this.padding1 = 0;

   this.padding2 = 0;

   /** Magnigute of the z-component in beam coordinates at some arbitrary      single point in the mainbeam      and in the far field of the antenna. */
   this.ez = 0;

   /** Magnigute of the x-component in beam coordinates at some arbitrary      single point in the mainbeam      and in the far field of the antenna. */
   this.ex = 0;

   /** THe phase angle between Ez and Ex in radians. */
   this.phase = 0;

  dis.BeamAntennaPattern.prototype.initFromBinary = function(inputStream)
  {
       this.beamDirection.initFromBinary(inputStream);
       this.azimuthBeamwidth = inputStream.readFloat32();
       this.elevationBeamwidth = inputStream.readFloat32();
       this.referenceSystem = inputStream.readFloat32();
       this.padding1 = inputStream.readShort();
       this.padding2 = inputStream.readByte();
       this.ez = inputStream.readFloat32();
       this.ex = inputStream.readFloat32();
       this.phase = inputStream.readFloat32();
  };

  dis.BeamAntennaPattern.prototype.encodeToBinary = function(outputStream)
  {
       this.beamDirection.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.azimuthBeamwidth);
       outputStream.writeFloat32(this.elevationBeamwidth);
       outputStream.writeFloat32(this.referenceSystem);
       outputStream.writeShort(this.padding1);
       outputStream.writeByte(this.padding2);
       outputStream.writeFloat32(this.ez);
       outputStream.writeFloat32(this.ex);
       outputStream.writeFloat32(this.phase);
  };
}; // end of class

 // node.js module support
exports.BeamAntennaPattern = dis.BeamAntennaPattern;

// End of BeamAntennaPattern class

/**
 * Section 5.2.39. Specification of the data necessary to  describe the scan volume of an emitter.
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
   /** Specifies the beam azimuth an elevation centers and corresponding half-angles     to describe the scan volume */
   this.beamAzimuthCenter = 0;

   /** Specifies the beam azimuth sweep to determine scan volume */
   this.beamAzimuthSweep = 0;

   /** Specifies the beam elevation center to determine scan volume */
   this.beamElevationCenter = 0;

   /** Specifies the beam elevation sweep to determine scan volume */
   this.beamElevationSweep = 0;

   /** allows receiver to synchronize its regenerated scan pattern to     that of the emmitter. Specifies the percentage of time a scan is through its pattern from its origion. */
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
 * Section 5.2.7. Specifies the type of muntion fired, the type of warhead, the         type of fuse, the number of rounds fired, and the rate at which the roudns are fired in         rounds per minute.
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


dis.BurstDescriptor = function()
{
   /** What munition was used in the burst */
   this.munition = new dis.EntityType(); 

   /** type of warhead */
   this.warhead = 0;

   /** type of fuse used */
   this.fuse = 0;

   /** how many of the munition were fired */
   this.quantity = 0;

   /** rate at which the munition was fired */
   this.rate = 0;

  dis.BurstDescriptor.prototype.initFromBinary = function(inputStream)
  {
       this.munition.initFromBinary(inputStream);
       this.warhead = inputStream.readUShort();
       this.fuse = inputStream.readUShort();
       this.quantity = inputStream.readUShort();
       this.rate = inputStream.readUShort();
  };

  dis.BurstDescriptor.prototype.encodeToBinary = function(outputStream)
  {
       this.munition.encodeToBinary(outputStream);
       outputStream.writeUShort(this.warhead);
       outputStream.writeUShort(this.fuse);
       outputStream.writeUShort(this.quantity);
       outputStream.writeUShort(this.rate);
  };
}; // end of class

 // node.js module support
exports.BurstDescriptor = dis.BurstDescriptor;

// End of BurstDescriptor class

/**
 * Section 5.2.8. Time measurements that exceed one hour. Hours is the number of           hours since January 1, 1970, UTC
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
       this.hour = inputStream.readInt();
       this.timePastHour = inputStream.readUInt();
  };

  dis.ClockTime.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeInt(this.hour);
       outputStream.writeUInt(this.timePastHour);
  };
}; // end of class

 // node.js module support
exports.ClockTime = dis.ClockTime;

// End of ClockTime class

/**
 * 5.3.3.3. Information about elastic collisions in a DIS exercise shall be communicated using a Collision-Elastic PDU. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 66;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 1;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that issued the collision PDU */
   this.issuingEntityID = new dis.EntityID(); 

   /** ID of entity that has collided with the issuing entity ID */
   this.collidingEntityID = new dis.EntityID(); 

   /** ID of event */
   this.collisionEventID = new dis.EventID(); 

   /** some padding */
   this.pad = 0;

   /** velocity at collision */
   this.contactVelocity = new dis.Vector3Float(); 

   /** mass of issuing entity */
   this.mass = 0;

   /** Location with respect to entity the issuing entity collided with */
   this.location = new dis.Vector3Float(); 

   /** tensor values */
   this.collisionResultXX = 0;

   /** tensor values */
   this.collisionResultXY = 0;

   /** tensor values */
   this.collisionResultXZ = 0;

   /** tensor values */
   this.collisionResultYY = 0;

   /** tensor values */
   this.collisionResultYZ = 0;

   /** tensor values */
   this.collisionResultZZ = 0;

   /** This record shall represent the normal vector to the surface at the point of collision detection. The surface normal shall be represented in world coordinates. */
   this.unitSurfaceNormal = new dis.Vector3Float(); 

   /** This field shall represent the degree to which energy is conserved in a collision */
   this.coefficientOfRestitution = 0;

  dis.CollisionElasticPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.issuingEntityID.initFromBinary(inputStream);
       this.collidingEntityID.initFromBinary(inputStream);
       this.collisionEventID.initFromBinary(inputStream);
       this.pad = inputStream.readShort();
       this.contactVelocity.initFromBinary(inputStream);
       this.mass = inputStream.readFloat32();
       this.location.initFromBinary(inputStream);
       this.collisionResultXX = inputStream.readFloat32();
       this.collisionResultXY = inputStream.readFloat32();
       this.collisionResultXZ = inputStream.readFloat32();
       this.collisionResultYY = inputStream.readFloat32();
       this.collisionResultYZ = inputStream.readFloat32();
       this.collisionResultZZ = inputStream.readFloat32();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.issuingEntityID.encodeToBinary(outputStream);
       this.collidingEntityID.encodeToBinary(outputStream);
       this.collisionEventID.encodeToBinary(outputStream);
       outputStream.writeShort(this.pad);
       this.contactVelocity.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.mass);
       this.location.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.collisionResultXX);
       outputStream.writeFloat32(this.collisionResultXY);
       outputStream.writeFloat32(this.collisionResultXZ);
       outputStream.writeFloat32(this.collisionResultYY);
       outputStream.writeFloat32(this.collisionResultYZ);
       outputStream.writeFloat32(this.collisionResultZZ);
       this.unitSurfaceNormal.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.coefficientOfRestitution);
  };
}; // end of class

 // node.js module support
exports.CollisionElasticPdu = dis.CollisionElasticPdu;

// End of CollisionElasticPdu class

/**
 * Section 5.3.3.2. Information about a collision. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 4;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 1;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that issued the collision PDU */
   this.issuingEntityID = new dis.EntityID(); 

   /** ID of entity that has collided with the issuing entity ID */
   this.collidingEntityID = new dis.EntityID(); 

   /** ID of event */
   this.eventID = new dis.EventID(); 

   /** ID of event */
   this.collisionType = 0;

   /** some padding */
   this.pad = 0;

   /** velocity at collision */
   this.velocity = new dis.Vector3Float(); 

   /** mass of issuing entity */
   this.mass = 0;

   /** Location with respect to entity the issuing entity collided with */
   this.location = new dis.Vector3Float(); 

  dis.CollisionPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.3.6.12. Arbitrary messages can be entered into the data stream via use of this PDU. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 22;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 62;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.3.6.1. Create a new entity. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 11;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** Identifier for the request */
   this.requestID = 0;

  dis.CreateEntityPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
  };

  dis.CreateEntityPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 51;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.3.6.10. Information issued in response to a data query pdu or a set data pdu is communicated using a data pdu. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 20;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.3.6.8. Request for data from an entity. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 18;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
       this.timeInterval = inputStream.readUInt();
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.UnsignedIntegerWrapper();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.UnsignedIntegerWrapper();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 58;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 60;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * represents values used in dead reckoning algorithms
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


dis.DeadReckoningParameter = function()
{
   /** enumeration of what dead reckoning algorighm to use */
   this.deadReckoningAlgorithm = 0;

   /** other parameters to use in the dead reckoning algorithm */
   this.otherParameters = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /** Linear acceleration of the entity */
   this.entityLinearAcceleration = new dis.Vector3Float(); 

   /** angular velocity of the entity */
   this.entityAngularVelocity = new dis.Vector3Float(); 

  dis.DeadReckoningParameter.prototype.initFromBinary = function(inputStream)
  {
       this.deadReckoningAlgorithm = inputStream.readUByte();
       for(var idx = 0; idx < 15; idx++)
       {
          this.otherParameters[ idx ] = inputStream.readByte();
       }
       this.entityLinearAcceleration.initFromBinary(inputStream);
       this.entityAngularVelocity.initFromBinary(inputStream);
  };

  dis.DeadReckoningParameter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.deadReckoningAlgorithm);
       for(var idx = 0; idx < 15; idx++)
       {
          outputStream.writeByte(this.otherParameters[ idx ] );
       }
       this.entityLinearAcceleration.encodeToBinary(outputStream);
       this.entityAngularVelocity.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.DeadReckoningParameter = dis.DeadReckoningParameter;

// End of DeadReckoningParameter class

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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 24;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 6;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.3.4.2. Information about stuff exploding. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 3;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 2;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that shot */
   this.firingEntityID = new dis.EntityID(); 

   /** ID of the entity that is being shot at */
   this.targetEntityID = new dis.EntityID(); 

   /** ID of muntion that was fired */
   this.munitionID = new dis.EntityID(); 

   /** ID firing event */
   this.eventID = new dis.EventID(); 

   /** ID firing event */
   this.velocity = new dis.Vector3Float(); 

   /** where the detonation is, in world coordinates */
   this.locationInWorldCoordinates = new dis.Vector3Double(); 

   /** Describes munition used */
   this.burstDescriptor = new dis.BurstDescriptor(); 

   /** location of the detonation or impact in the target entity's coordinate system. This information should be used for damage assessment. */
   this.locationInEntityCoordinates = new dis.Vector3Float(); 

   /** result of the explosion */
   this.detonationResult = 0;

   /** How many articulation parameters we have */
   this.numberOfArticulationParameters = 0;

   /** padding */
   this.pad = 0;

    this.articulationParameters = new Array();
 
  dis.DetonationPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.firingEntityID.initFromBinary(inputStream);
       this.targetEntityID.initFromBinary(inputStream);
       this.munitionID.initFromBinary(inputStream);
       this.eventID.initFromBinary(inputStream);
       this.velocity.initFromBinary(inputStream);
       this.locationInWorldCoordinates.initFromBinary(inputStream);
       this.burstDescriptor.initFromBinary(inputStream);
       this.locationInEntityCoordinates.initFromBinary(inputStream);
       this.detonationResult = inputStream.readUByte();
       this.numberOfArticulationParameters = inputStream.readUByte();
       this.pad = inputStream.readShort();
       for(var idx = 0; idx < this.numberOfArticulationParameters; idx++)
       {
           var anX = new dis.ArticulationParameter();
           anX.initFromBinary(inputStream);
           this.articulationParameters.push(anX);
       }

  };

  dis.DetonationPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.firingEntityID.encodeToBinary(outputStream);
       this.targetEntityID.encodeToBinary(outputStream);
       this.munitionID.encodeToBinary(outputStream);
       this.eventID.encodeToBinary(outputStream);
       this.velocity.encodeToBinary(outputStream);
       this.locationInWorldCoordinates.encodeToBinary(outputStream);
       this.burstDescriptor.encodeToBinary(outputStream);
       this.locationInEntityCoordinates.encodeToBinary(outputStream);
       outputStream.writeUByte(this.detonationResult);
       outputStream.writeUByte(this.numberOfArticulationParameters);
       outputStream.writeShort(this.pad);
       for(var idx = 0; idx < this.articulationParameters.length; idx++)
       {
           articulationParameters[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.DetonationPdu = dis.DetonationPdu;

// End of DetonationPdu class

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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 6;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

  dis.DistributedEmissionsFamilyPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
  };

  dis.DistributedEmissionsFamilyPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
  };
}; // end of class

 // node.js module support
exports.DistributedEmissionsFamilyPdu = dis.DistributedEmissionsFamilyPdu;

// End of DistributedEmissionsFamilyPdu class

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
 * Description of one electronic emission beam
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


dis.ElectronicEmissionBeamData = function()
{
   /** This field shall specify the length of this beams data in 32 bit words */
   this.beamDataLength = 0;

   /** This field shall specify a unique emitter database number assigned to differentiate between otherwise similar or identical emitter beams within an emitter system. */
   this.beamIDNumber = 0;

   /** This field shall specify a Beam Parameter Index number that shall be used by receiving entities in conjunction with the Emitter Name field to provide a pointer to the stored database parameters required to regenerate the beam.  */
   this.beamParameterIndex = 0;

   /** Fundamental parameter data such as frequency range, beam sweep, etc. */
   this.fundamentalParameterData = new dis.FundamentalParameterData(); 

   /** beam function of a particular beam */
   this.beamFunction = 0;

   /** Number of track/jam targets */
   this.numberOfTrackJamTargets = 0;

   /** wheher or not the receiving simulation apps can assume all the targets in the scan pattern are being tracked/jammed */
   this.highDensityTrackJam = 0;

   /** padding */
   this.pad4 = 0;

   /** identify jamming techniques used */
   this.jammingModeSequence = 0;

   /** variable length variablelist of track/jam targets */
    this.trackJamTargets = new Array();
 
  dis.ElectronicEmissionBeamData.prototype.initFromBinary = function(inputStream)
  {
       this.beamDataLength = inputStream.readUByte();
       this.beamIDNumber = inputStream.readUByte();
       this.beamParameterIndex = inputStream.readUShort();
       this.fundamentalParameterData.initFromBinary(inputStream);
       this.beamFunction = inputStream.readUByte();
       this.numberOfTrackJamTargets = inputStream.readUByte();
       this.highDensityTrackJam = inputStream.readUByte();
       this.pad4 = inputStream.readUByte();
       this.jammingModeSequence = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfTrackJamTargets; idx++)
       {
           var anX = new dis.TrackJamTarget();
           anX.initFromBinary(inputStream);
           this.trackJamTargets.push(anX);
       }

  };

  dis.ElectronicEmissionBeamData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.beamDataLength);
       outputStream.writeUByte(this.beamIDNumber);
       outputStream.writeUShort(this.beamParameterIndex);
       this.fundamentalParameterData.encodeToBinary(outputStream);
       outputStream.writeUByte(this.beamFunction);
       outputStream.writeUByte(this.numberOfTrackJamTargets);
       outputStream.writeUByte(this.highDensityTrackJam);
       outputStream.writeUByte(this.pad4);
       outputStream.writeUInt(this.jammingModeSequence);
       for(var idx = 0; idx < this.trackJamTargets.length; idx++)
       {
           trackJamTargets[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ElectronicEmissionBeamData = dis.ElectronicEmissionBeamData;

// End of ElectronicEmissionBeamData class

/**
 * Data about one electronic system
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


dis.ElectronicEmissionSystemData = function()
{
   /** This field shall specify the length of this emitter system�s data (including beam data and its track/jam information) in 32-bit words. The length shall include the System Data Length field.  */
   this.systemDataLength = 0;

   /** This field shall specify the number of beams being described in the current PDU for the system being described.  */
   this.numberOfBeams = 0;

   /** padding. */
   this.emissionsPadding2 = 0;

   /** This field shall specify information about a particular emitter system */
   this.emitterSystem = new dis.EmitterSystem(); 

   /** Location with respect to the entity */
   this.location = new dis.Vector3Float(); 

   /** variable length variablelist of beam data records */
    this.beamDataRecords = new Array();
 
  dis.ElectronicEmissionSystemData.prototype.initFromBinary = function(inputStream)
  {
       this.systemDataLength = inputStream.readUByte();
       this.numberOfBeams = inputStream.readUByte();
       this.emissionsPadding2 = inputStream.readUShort();
       this.emitterSystem.initFromBinary(inputStream);
       this.location.initFromBinary(inputStream);
       for(var idx = 0; idx < this.numberOfBeams; idx++)
       {
           var anX = new dis.ElectronicEmissionBeamData();
           anX.initFromBinary(inputStream);
           this.beamDataRecords.push(anX);
       }

  };

  dis.ElectronicEmissionSystemData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.systemDataLength);
       outputStream.writeUByte(this.numberOfBeams);
       outputStream.writeUShort(this.emissionsPadding2);
       this.emitterSystem.encodeToBinary(outputStream);
       this.location.encodeToBinary(outputStream);
       for(var idx = 0; idx < this.beamDataRecords.length; idx++)
       {
           beamDataRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ElectronicEmissionSystemData = dis.ElectronicEmissionSystemData;

// End of ElectronicEmissionSystemData class

/**
 * Section 5.3.7.1. Information about active electronic warfare (EW) emissions and active EW countermeasures shall be communicated using an Electromagnetic Emission PDU. COMPLETE (I think)
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 23;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 6;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity emitting */
   this.emittingEntityID = new dis.EntityID(); 

   /** ID of event */
   this.eventID = new dis.EventID(); 

   /** This field shall be used to indicate if the data in the PDU represents a state update or just data that has changed since issuance of the last Electromagnetic Emission PDU [relative to the identified entity and emission system(s)]. */
   this.stateUpdateIndicator = 0;

   /** This field shall specify the number of emission systems being described in the current PDU. */
   this.numberOfSystems = 0;

   /** padding */
   this.paddingForEmissionsPdu = 0;

   /** Electronic emmissions systems */
    this.systems = new Array();
 
  dis.ElectronicEmissionsPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.emittingEntityID.initFromBinary(inputStream);
       this.eventID.initFromBinary(inputStream);
       this.stateUpdateIndicator = inputStream.readUByte();
       this.numberOfSystems = inputStream.readUByte();
       this.paddingForEmissionsPdu = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfSystems; idx++)
       {
           var anX = new dis.ElectronicEmissionSystemData();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.emittingEntityID.encodeToBinary(outputStream);
       this.eventID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.stateUpdateIndicator);
       outputStream.writeUByte(this.numberOfSystems);
       outputStream.writeUShort(this.paddingForEmissionsPdu);
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
 * Section 5.2.11. This field shall specify information about a particular emitter system
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
   this.function = 0;

   /** emitter ID, 8 bit enumeration */
   this.emitterIdNumber = 0;

  dis.EmitterSystem.prototype.initFromBinary = function(inputStream)
  {
       this.emitterName = inputStream.readUShort();
       this.function = inputStream.readUByte();
       this.emitterIdNumber = inputStream.readUByte();
  };

  dis.EmitterSystem.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.emitterName);
       outputStream.writeUByte(this.function);
       outputStream.writeUByte(this.emitterIdNumber);
  };
}; // end of class

 // node.js module support
exports.EmitterSystem = dis.EmitterSystem;

// End of EmitterSystem class

/**
 * Each entity in a given DIS simulation application shall be given an entity identifier number unique to all  other entities in that application. This identifier number is valid for the duration of the exercise; however,  entity identifier numbers may be reused when all possible numbers have been exhausted. No entity shall  have an entity identifier number of NO_ENTITY, ALL_ENTITIES, or RQST_ASSIGN_ID. The entity iden-  tifier number need not be registered or retained for future exercises. The entity identifier number shall be  specified by a 16-bit unsigned integer.  An entity identifier number equal to zero with valid site and application identification shall address a  simulation application. An entity identifier number equal to ALL_ENTITIES shall mean all entities within  the specified site and application. An entity identifier number equal to RQST_ASSIGN_ID allows the  receiver of the create entity to define the entity identifier number of the new entity.
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
   /** The site ID */
   this.site = 0;

   /** The application ID */
   this.application = 0;

   /** the entity ID */
   this.entity = 0;

  dis.EntityID.prototype.initFromBinary = function(inputStream)
  {
       this.site = inputStream.readUShort();
       this.application = inputStream.readUShort();
       this.entity = inputStream.readUShort();
  };

  dis.EntityID.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.site);
       outputStream.writeUShort(this.application);
       outputStream.writeUShort(this.entity);
  };
}; // end of class

 // node.js module support
exports.EntityID = dis.EntityID;

// End of EntityID class

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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 1;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

  dis.EntityInformationFamilyPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
  };

  dis.EntityInformationFamilyPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
  };
}; // end of class

 // node.js module support
exports.EntityInformationFamilyPdu = dis.EntityInformationFamilyPdu;

// End of EntityInformationFamilyPdu class

/**
 * Section 5.3.9. Common superclass for EntityManagment PDUs, including aggregate state, isGroupOf, TransferControLRequest, and isPartOf
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 7;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

  dis.EntityManagementFamilyPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
  };

  dis.EntityManagementFamilyPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
  };
}; // end of class

 // node.js module support
exports.EntityManagementFamilyPdu = dis.EntityManagementFamilyPdu;

// End of EntityManagementFamilyPdu class

/**
 * Section 5.3.3.1. Represents the postion and state of one entity in the world. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 1;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 1;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Unique ID for an entity that is tied to this state information */
   this.entityID = new dis.EntityID(); 

   /** What force this entity is affiliated with, eg red, blue, neutral, etc */
   this.forceId = 0;

   /** How many articulation parameters are in the variable length list */
   this.numberOfArticulationParameters = 0;

   /** Describes the type of entity in the world */
   this.entityType = new dis.EntityType(); 

   this.alternativeEntityType = new dis.EntityType(); 

   /** Describes the speed of the entity in the world */
   this.entityLinearVelocity = new dis.Vector3Float(); 

   /** describes the location of the entity in the world */
   this.entityLocation = new dis.Vector3Double(); 

   /** describes the orientation of the entity, in euler angles */
   this.entityOrientation = new dis.Orientation(); 

   /** a series of bit flags that are used to help draw the entity, such as smoking, on fire, etc. */
   this.entityAppearance = 0;

   /** parameters used for dead reckoning */
   this.deadReckoningParameters = new dis.DeadReckoningParameter(); 

   /** characters that can be used for debugging, or to draw unique strings on the side of entities in the world */
   this.marking = new dis.Marking(); 

   /** a series of bit flags */
   this.capabilities = 0;

   /** variable length list of articulation parameters */
    this.articulationParameters = new Array();
 
  dis.EntityStatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.entityID.initFromBinary(inputStream);
       this.forceId = inputStream.readUByte();
       this.numberOfArticulationParameters = inputStream.readByte();
       this.entityType.initFromBinary(inputStream);
       this.alternativeEntityType.initFromBinary(inputStream);
       this.entityLinearVelocity.initFromBinary(inputStream);
       this.entityLocation.initFromBinary(inputStream);
       this.entityOrientation.initFromBinary(inputStream);
       this.entityAppearance = inputStream.readInt();
       this.deadReckoningParameters.initFromBinary(inputStream);
       this.marking.initFromBinary(inputStream);
       this.capabilities = inputStream.readInt();
       for(var idx = 0; idx < this.numberOfArticulationParameters; idx++)
       {
           var anX = new dis.ArticulationParameter();
           anX.initFromBinary(inputStream);
           this.articulationParameters.push(anX);
       }

  };

  dis.EntityStatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.entityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.forceId);
       outputStream.writeByte(this.numberOfArticulationParameters);
       this.entityType.encodeToBinary(outputStream);
       this.alternativeEntityType.encodeToBinary(outputStream);
       this.entityLinearVelocity.encodeToBinary(outputStream);
       this.entityLocation.encodeToBinary(outputStream);
       this.entityOrientation.encodeToBinary(outputStream);
       outputStream.writeInt(this.entityAppearance);
       this.deadReckoningParameters.encodeToBinary(outputStream);
       this.marking.encodeToBinary(outputStream);
       outputStream.writeInt(this.capabilities);
       for(var idx = 0; idx < this.articulationParameters.length; idx++)
       {
           articulationParameters[idx].encodeToBinary(outputStream);
       }

  };

/** 0 uniform color, 1 camouflage */
dis.EntityStatePdu.prototype.getEntityAppearance_paintScheme = function()
{
   var val = this.entityAppearance & 0x1;
   return val >> 0;
};


/** 0 uniform color, 1 camouflage */
dis.EntityStatePdu.prototype.setEntityAppearance_paintScheme= function(val)
{
  this.entityAppearance &= ~0x1; // Zero existing bits
  val = val << 0;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no mobility kill, 1 mobility kill */
dis.EntityStatePdu.prototype.getEntityAppearance_mobility = function()
{
   var val = this.entityAppearance & 0x2;
   return val >> 1;
};


/** 0 no mobility kill, 1 mobility kill */
dis.EntityStatePdu.prototype.setEntityAppearance_mobility= function(val)
{
  this.entityAppearance &= ~0x2; // Zero existing bits
  val = val << 1;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no firepower iill, 1 firepower kill */
dis.EntityStatePdu.prototype.getEntityAppearance_firepower = function()
{
   var val = this.entityAppearance & 0x4;
   return val >> 2;
};


/** 0 no firepower iill, 1 firepower kill */
dis.EntityStatePdu.prototype.setEntityAppearance_firepower= function(val)
{
  this.entityAppearance &= ~0x4; // Zero existing bits
  val = val << 2;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no damage, 1 slight damage, 2 moderate, 3 destroyed */
dis.EntityStatePdu.prototype.getEntityAppearance_damage = function()
{
   var val = this.entityAppearance & 0x18;
   return val >> 3;
};


/** 0 no damage, 1 slight damage, 2 moderate, 3 destroyed */
dis.EntityStatePdu.prototype.setEntityAppearance_damage= function(val)
{
  this.entityAppearance &= ~0x18; // Zero existing bits
  val = val << 3;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume */
dis.EntityStatePdu.prototype.getEntityAppearance_smoke = function()
{
   var val = this.entityAppearance & 0x60;
   return val >> 5;
};


/** 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume */
dis.EntityStatePdu.prototype.setEntityAppearance_smoke= function(val)
{
  this.entityAppearance &= ~0x60; // Zero existing bits
  val = val << 5;
  this.entityAppearance = this.entityAppearance | val; 
};


/** dust cloud, 0 none 1 small 2 medium 3 large */
dis.EntityStatePdu.prototype.getEntityAppearance_trailingEffects = function()
{
   var val = this.entityAppearance & 0x180;
   return val >> 7;
};


/** dust cloud, 0 none 1 small 2 medium 3 large */
dis.EntityStatePdu.prototype.setEntityAppearance_trailingEffects= function(val)
{
  this.entityAppearance &= ~0x180; // Zero existing bits
  val = val << 7;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible */
dis.EntityStatePdu.prototype.getEntityAppearance_hatch = function()
{
   var val = this.entityAppearance & 0xe00;
   return val >> 9;
};


/** 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible */
dis.EntityStatePdu.prototype.setEntityAppearance_hatch= function(val)
{
  this.entityAppearance &= ~0xe00; // Zero existing bits
  val = val << 9;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.EntityStatePdu.prototype.getEntityAppearance_headlights = function()
{
   var val = this.entityAppearance & 0x1000;
   return val >> 12;
};


/** 0 off 1 on */
dis.EntityStatePdu.prototype.setEntityAppearance_headlights= function(val)
{
  this.entityAppearance &= ~0x1000; // Zero existing bits
  val = val << 12;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.EntityStatePdu.prototype.getEntityAppearance_tailLights = function()
{
   var val = this.entityAppearance & 0x2000;
   return val >> 13;
};


/** 0 off 1 on */
dis.EntityStatePdu.prototype.setEntityAppearance_tailLights= function(val)
{
  this.entityAppearance &= ~0x2000; // Zero existing bits
  val = val << 13;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.EntityStatePdu.prototype.getEntityAppearance_brakeLights = function()
{
   var val = this.entityAppearance & 0x4000;
   return val >> 14;
};


/** 0 off 1 on */
dis.EntityStatePdu.prototype.setEntityAppearance_brakeLights= function(val)
{
  this.entityAppearance &= ~0x4000; // Zero existing bits
  val = val << 14;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.EntityStatePdu.prototype.getEntityAppearance_flaming = function()
{
   var val = this.entityAppearance & 0x8000;
   return val >> 15;
};


/** 0 off 1 on */
dis.EntityStatePdu.prototype.setEntityAppearance_flaming= function(val)
{
  this.entityAppearance &= ~0x8000; // Zero existing bits
  val = val << 15;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 not raised 1 raised */
dis.EntityStatePdu.prototype.getEntityAppearance_launcher = function()
{
   var val = this.entityAppearance & 0x10000;
   return val >> 16;
};


/** 0 not raised 1 raised */
dis.EntityStatePdu.prototype.setEntityAppearance_launcher= function(val)
{
  this.entityAppearance &= ~0x10000; // Zero existing bits
  val = val << 16;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 desert 1 winter 2 forest 3 unused */
dis.EntityStatePdu.prototype.getEntityAppearance_camouflageType = function()
{
   var val = this.entityAppearance & 0x60000;
   return val >> 17;
};


/** 0 desert 1 winter 2 forest 3 unused */
dis.EntityStatePdu.prototype.setEntityAppearance_camouflageType= function(val)
{
  this.entityAppearance &= ~0x60000; // Zero existing bits
  val = val << 17;
  this.entityAppearance = this.entityAppearance | val; 
};

}; // end of class

 // node.js module support
exports.EntityStatePdu = dis.EntityStatePdu;

// End of EntityStatePdu class

/**
 * 5.3.3.4. Nonstatic information about a particular entity may be communicated by issuing an Entity State Update PDU. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 67;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 1;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** This field shall identify the entity issuing the PDU */
   this.entityID = new dis.EntityID(); 

   /** Padding */
   this.padding1 = 0;

   /** How many articulation parameters are in the variable length list */
   this.numberOfArticulationParameters = 0;

   /** Describes the speed of the entity in the world */
   this.entityLinearVelocity = new dis.Vector3Float(); 

   /** describes the location of the entity in the world */
   this.entityLocation = new dis.Vector3Double(); 

   /** describes the orientation of the entity, in euler angles */
   this.entityOrientation = new dis.Orientation(); 

   /** a series of bit flags that are used to help draw the entity, such as smoking, on fire, etc. */
   this.entityAppearance = 0;

    this.articulationParameters = new Array();
 
  dis.EntityStateUpdatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.entityID.initFromBinary(inputStream);
       this.padding1 = inputStream.readByte();
       this.numberOfArticulationParameters = inputStream.readUByte();
       this.entityLinearVelocity.initFromBinary(inputStream);
       this.entityLocation.initFromBinary(inputStream);
       this.entityOrientation.initFromBinary(inputStream);
       this.entityAppearance = inputStream.readInt();
       for(var idx = 0; idx < this.numberOfArticulationParameters; idx++)
       {
           var anX = new dis.ArticulationParameter();
           anX.initFromBinary(inputStream);
           this.articulationParameters.push(anX);
       }

  };

  dis.EntityStateUpdatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.entityID.encodeToBinary(outputStream);
       outputStream.writeByte(this.padding1);
       outputStream.writeUByte(this.numberOfArticulationParameters);
       this.entityLinearVelocity.encodeToBinary(outputStream);
       this.entityLocation.encodeToBinary(outputStream);
       this.entityOrientation.encodeToBinary(outputStream);
       outputStream.writeInt(this.entityAppearance);
       for(var idx = 0; idx < this.articulationParameters.length; idx++)
       {
           articulationParameters[idx].encodeToBinary(outputStream);
       }

  };

/** 0 uniform color, 1 camouflage */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_paintScheme = function()
{
   var val = this.entityAppearance & 0x1;
   return val >> 0;
};


/** 0 uniform color, 1 camouflage */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_paintScheme= function(val)
{
  this.entityAppearance &= ~0x1; // Zero existing bits
  val = val << 0;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no mobility kill, 1 mobility kill */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_mobility = function()
{
   var val = this.entityAppearance & 0x2;
   return val >> 1;
};


/** 0 no mobility kill, 1 mobility kill */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_mobility= function(val)
{
  this.entityAppearance &= ~0x2; // Zero existing bits
  val = val << 1;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no firepower iill, 1 firepower kill */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_firepower = function()
{
   var val = this.entityAppearance & 0x4;
   return val >> 2;
};


/** 0 no firepower iill, 1 firepower kill */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_firepower= function(val)
{
  this.entityAppearance &= ~0x4; // Zero existing bits
  val = val << 2;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no damage, 1 slight damage, 2 moderate, 3 destroyed */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_damage = function()
{
   var val = this.entityAppearance & 0x18;
   return val >> 3;
};


/** 0 no damage, 1 slight damage, 2 moderate, 3 destroyed */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_damage= function(val)
{
  this.entityAppearance &= ~0x18; // Zero existing bits
  val = val << 3;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_smoke = function()
{
   var val = this.entityAppearance & 0x60;
   return val >> 5;
};


/** 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_smoke= function(val)
{
  this.entityAppearance &= ~0x60; // Zero existing bits
  val = val << 5;
  this.entityAppearance = this.entityAppearance | val; 
};


/** dust cloud, 0 none 1 small 2 medium 3 large */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_trailingEffects = function()
{
   var val = this.entityAppearance & 0x180;
   return val >> 7;
};


/** dust cloud, 0 none 1 small 2 medium 3 large */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_trailingEffects= function(val)
{
  this.entityAppearance &= ~0x180; // Zero existing bits
  val = val << 7;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_hatch = function()
{
   var val = this.entityAppearance & 0xe00;
   return val >> 9;
};


/** 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_hatch= function(val)
{
  this.entityAppearance &= ~0xe00; // Zero existing bits
  val = val << 9;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_headlights = function()
{
   var val = this.entityAppearance & 0x1000;
   return val >> 12;
};


/** 0 off 1 on */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_headlights= function(val)
{
  this.entityAppearance &= ~0x1000; // Zero existing bits
  val = val << 12;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_tailLights = function()
{
   var val = this.entityAppearance & 0x2000;
   return val >> 13;
};


/** 0 off 1 on */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_tailLights= function(val)
{
  this.entityAppearance &= ~0x2000; // Zero existing bits
  val = val << 13;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_brakeLights = function()
{
   var val = this.entityAppearance & 0x4000;
   return val >> 14;
};


/** 0 off 1 on */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_brakeLights= function(val)
{
  this.entityAppearance &= ~0x4000; // Zero existing bits
  val = val << 14;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_flaming = function()
{
   var val = this.entityAppearance & 0x8000;
   return val >> 15;
};


/** 0 off 1 on */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_flaming= function(val)
{
  this.entityAppearance &= ~0x8000; // Zero existing bits
  val = val << 15;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 not raised 1 raised */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_launcher = function()
{
   var val = this.entityAppearance & 0x10000;
   return val >> 16;
};


/** 0 not raised 1 raised */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_launcher= function(val)
{
  this.entityAppearance &= ~0x10000; // Zero existing bits
  val = val << 16;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 desert 1 winter 2 forest 3 unused */
dis.EntityStateUpdatePdu.prototype.getEntityAppearance_camouflageType = function()
{
   var val = this.entityAppearance & 0x60000;
   return val >> 17;
};


/** 0 desert 1 winter 2 forest 3 unused */
dis.EntityStateUpdatePdu.prototype.setEntityAppearance_camouflageType= function(val)
{
  this.entityAppearance &= ~0x60000; // Zero existing bits
  val = val << 17;
  this.entityAppearance = this.entityAppearance | val; 
};

}; // end of class

 // node.js module support
exports.EntityStateUpdatePdu = dis.EntityStateUpdatePdu;

// End of EntityStateUpdatePdu class

/**
 * Section 5.2.16. Identifies the type of entity, including kind of entity, domain (surface, subsurface, air, etc) country, category, etc.
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

   /** specific info based on subcategory field. Renamed from specific because that is a reserved word in SQL */
   this.spec = 0;

   this.extra = 0;

  dis.EntityType.prototype.initFromBinary = function(inputStream)
  {
       this.entityKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.country = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.spec = inputStream.readUByte();
       this.extra = inputStream.readUByte();
  };

  dis.EntityType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.entityKind);
       outputStream.writeUByte(this.domain);
       outputStream.writeUShort(this.country);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
       outputStream.writeUByte(this.spec);
       outputStream.writeUByte(this.extra);
  };
}; // end of class

 // node.js module support
exports.EntityType = dis.EntityType;

// End of EntityType class

/**
 * Section 5.2.40. Information about a geometry, a state associated with a geometry, a bounding volume, or an associated entity ID. NOTE: this class requires hand coding.
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
   /** Record type */
   this.environmentType = 0;

   /** length, in bits */
   this.length = 0;

   /** Identify the sequentially numbered record index */
   this.recordIndex = 0;

   /** padding */
   this.padding1 = 0;

   /** Geometry or state record */
   this.geometry = 0;

   /** padding to bring the total size up to a 64 bit boundry */
   this.padding2 = 0;

  dis.Environment.prototype.initFromBinary = function(inputStream)
  {
       this.environmentType = inputStream.readUInt();
       this.length = inputStream.readUByte();
       this.recordIndex = inputStream.readUByte();
       this.padding1 = inputStream.readUByte();
       this.geometry = inputStream.readUByte();
       this.padding2 = inputStream.readUByte();
  };

  dis.Environment.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.environmentType);
       outputStream.writeUByte(this.length);
       outputStream.writeUByte(this.recordIndex);
       outputStream.writeUByte(this.padding1);
       outputStream.writeUByte(this.geometry);
       outputStream.writeUByte(this.padding2);
  };
}; // end of class

 // node.js module support
exports.Environment = dis.Environment;

// End of Environment class

/**
 * Section 5.3.11.1: Information about environmental effects and processes. This requires manual cleanup. the environmental        record is variable, as is the padding. UNFINISHED
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


dis.EnvironmentalProcessPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 41;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 9;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Environmental process ID */
   this.environementalProcessID = new dis.EntityID(); 

   /** Environment type */
   this.environmentType = new dis.EntityType(); 

   /** model type */
   this.modelType = 0;

   /** Environment status */
   this.environmentStatus = 0;

   /** number of environment records  */
   this.numberOfEnvironmentRecords = 0;

   /** PDU sequence number for the environmentla process if pdu sequencing required */
   this.sequenceNumber = 0;

   /** environemt records */
    this.environmentRecords = new Array();
 
  dis.EnvironmentalProcessPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.environementalProcessID.initFromBinary(inputStream);
       this.environmentType.initFromBinary(inputStream);
       this.modelType = inputStream.readUByte();
       this.environmentStatus = inputStream.readUByte();
       this.numberOfEnvironmentRecords = inputStream.readUByte();
       this.sequenceNumber = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfEnvironmentRecords; idx++)
       {
           var anX = new dis.Environment();
           anX.initFromBinary(inputStream);
           this.environmentRecords.push(anX);
       }

  };

  dis.EnvironmentalProcessPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.environementalProcessID.encodeToBinary(outputStream);
       this.environmentType.encodeToBinary(outputStream);
       outputStream.writeUByte(this.modelType);
       outputStream.writeUByte(this.environmentStatus);
       outputStream.writeUByte(this.numberOfEnvironmentRecords);
       outputStream.writeUShort(this.sequenceNumber);
       for(var idx = 0; idx < this.environmentRecords.length; idx++)
       {
           environmentRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.EnvironmentalProcessPdu = dis.EnvironmentalProcessPdu;

// End of EnvironmentalProcessPdu class

/**
 * Section 5.2.18. Identifies a unique event in a simulation via the combination of three values
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


dis.EventID = function()
{
   /** The site ID */
   this.site = 0;

   /** The application ID */
   this.application = 0;

   /** the number of the event */
   this.eventNumber = 0;

  dis.EventID.prototype.initFromBinary = function(inputStream)
  {
       this.site = inputStream.readUShort();
       this.application = inputStream.readUShort();
       this.eventNumber = inputStream.readUShort();
  };

  dis.EventID.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.site);
       outputStream.writeUShort(this.application);
       outputStream.writeUShort(this.eventNumber);
  };
}; // end of class

 // node.js module support
exports.EventID = dis.EventID;

// End of EventID class

/**
 * Section 5.3.6.11. Reports occurance of a significant event to the simulation manager. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 21;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 61;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.3.3.1. Represents the postion and state of one entity in the world. This is identical in function to entity state pdu, but generates less garbage to collect in the Java world. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 1;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 1;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** The site ID */
   this.site = 0;

   /** The application ID */
   this.application = 0;

   /** the entity ID */
   this.entity = 0;

   /** what force this entity is affiliated with, eg red, blue, neutral, etc */
   this.forceId = 0;

   /** How many articulation parameters are in the variable length list */
   this.numberOfArticulationParameters = 0;

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

   /** specific info based on subcategory field. Name changed from specific because that is a reserved word in SQL. */
   this.specif = 0;

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

   /** variable length list of articulation parameters */
    this.articulationParameters = new Array();
 
  dis.FastEntityStatePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.site = inputStream.readUShort();
       this.application = inputStream.readUShort();
       this.entity = inputStream.readUShort();
       this.forceId = inputStream.readUByte();
       this.numberOfArticulationParameters = inputStream.readByte();
       this.entityKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.country = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.specif = inputStream.readUByte();
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
       for(var idx = 0; idx < this.numberOfArticulationParameters; idx++)
       {
           var anX = new dis.ArticulationParameter();
           anX.initFromBinary(inputStream);
           this.articulationParameters.push(anX);
       }

  };

  dis.FastEntityStatePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       outputStream.writeUShort(this.site);
       outputStream.writeUShort(this.application);
       outputStream.writeUShort(this.entity);
       outputStream.writeUByte(this.forceId);
       outputStream.writeByte(this.numberOfArticulationParameters);
       outputStream.writeUByte(this.entityKind);
       outputStream.writeUByte(this.domain);
       outputStream.writeUShort(this.country);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
       outputStream.writeUByte(this.specif);
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
       for(var idx = 0; idx < this.articulationParameters.length; idx++)
       {
           articulationParameters[idx].encodeToBinary(outputStream);
       }

  };

/** 0 uniform color, 1 camouflage */
dis.FastEntityStatePdu.prototype.getEntityAppearance_paintScheme = function()
{
   var val = this.entityAppearance & 0x1;
   return val >> 0;
};


/** 0 uniform color, 1 camouflage */
dis.FastEntityStatePdu.prototype.setEntityAppearance_paintScheme= function(val)
{
  this.entityAppearance &= ~0x1; // Zero existing bits
  val = val << 0;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no mobility kill, 1 mobility kill */
dis.FastEntityStatePdu.prototype.getEntityAppearance_mobility = function()
{
   var val = this.entityAppearance & 0x2;
   return val >> 1;
};


/** 0 no mobility kill, 1 mobility kill */
dis.FastEntityStatePdu.prototype.setEntityAppearance_mobility= function(val)
{
  this.entityAppearance &= ~0x2; // Zero existing bits
  val = val << 1;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no firepower iill, 1 firepower kill */
dis.FastEntityStatePdu.prototype.getEntityAppearance_firepower = function()
{
   var val = this.entityAppearance & 0x4;
   return val >> 2;
};


/** 0 no firepower iill, 1 firepower kill */
dis.FastEntityStatePdu.prototype.setEntityAppearance_firepower= function(val)
{
  this.entityAppearance &= ~0x4; // Zero existing bits
  val = val << 2;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no damage, 1 slight damage, 2 moderate, 3 destroyed */
dis.FastEntityStatePdu.prototype.getEntityAppearance_damage = function()
{
   var val = this.entityAppearance & 0x18;
   return val >> 3;
};


/** 0 no damage, 1 slight damage, 2 moderate, 3 destroyed */
dis.FastEntityStatePdu.prototype.setEntityAppearance_damage= function(val)
{
  this.entityAppearance &= ~0x18; // Zero existing bits
  val = val << 3;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume */
dis.FastEntityStatePdu.prototype.getEntityAppearance_smoke = function()
{
   var val = this.entityAppearance & 0x60;
   return val >> 5;
};


/** 0 no smoke, 1 smoke plume, 2 engine smoke, 3 engine smoke and plume */
dis.FastEntityStatePdu.prototype.setEntityAppearance_smoke= function(val)
{
  this.entityAppearance &= ~0x60; // Zero existing bits
  val = val << 5;
  this.entityAppearance = this.entityAppearance | val; 
};


/** dust cloud, 0 none 1 small 2 medium 3 large */
dis.FastEntityStatePdu.prototype.getEntityAppearance_trailingEffects = function()
{
   var val = this.entityAppearance & 0x180;
   return val >> 7;
};


/** dust cloud, 0 none 1 small 2 medium 3 large */
dis.FastEntityStatePdu.prototype.setEntityAppearance_trailingEffects= function(val)
{
  this.entityAppearance &= ~0x180; // Zero existing bits
  val = val << 7;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible */
dis.FastEntityStatePdu.prototype.getEntityAppearance_hatch = function()
{
   var val = this.entityAppearance & 0xe00;
   return val >> 9;
};


/** 0 NA 1 closed popped 3 popped and person visible  4 open 5 open and person visible */
dis.FastEntityStatePdu.prototype.setEntityAppearance_hatch= function(val)
{
  this.entityAppearance &= ~0xe00; // Zero existing bits
  val = val << 9;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.FastEntityStatePdu.prototype.getEntityAppearance_headlights = function()
{
   var val = this.entityAppearance & 0x1000;
   return val >> 12;
};


/** 0 off 1 on */
dis.FastEntityStatePdu.prototype.setEntityAppearance_headlights= function(val)
{
  this.entityAppearance &= ~0x1000; // Zero existing bits
  val = val << 12;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.FastEntityStatePdu.prototype.getEntityAppearance_tailLights = function()
{
   var val = this.entityAppearance & 0x2000;
   return val >> 13;
};


/** 0 off 1 on */
dis.FastEntityStatePdu.prototype.setEntityAppearance_tailLights= function(val)
{
  this.entityAppearance &= ~0x2000; // Zero existing bits
  val = val << 13;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.FastEntityStatePdu.prototype.getEntityAppearance_brakeLights = function()
{
   var val = this.entityAppearance & 0x4000;
   return val >> 14;
};


/** 0 off 1 on */
dis.FastEntityStatePdu.prototype.setEntityAppearance_brakeLights= function(val)
{
  this.entityAppearance &= ~0x4000; // Zero existing bits
  val = val << 14;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 off 1 on */
dis.FastEntityStatePdu.prototype.getEntityAppearance_flaming = function()
{
   var val = this.entityAppearance & 0x8000;
   return val >> 15;
};


/** 0 off 1 on */
dis.FastEntityStatePdu.prototype.setEntityAppearance_flaming= function(val)
{
  this.entityAppearance &= ~0x8000; // Zero existing bits
  val = val << 15;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 not raised 1 raised */
dis.FastEntityStatePdu.prototype.getEntityAppearance_launcher = function()
{
   var val = this.entityAppearance & 0x10000;
   return val >> 16;
};


/** 0 not raised 1 raised */
dis.FastEntityStatePdu.prototype.setEntityAppearance_launcher= function(val)
{
  this.entityAppearance &= ~0x10000; // Zero existing bits
  val = val << 16;
  this.entityAppearance = this.entityAppearance | val; 
};


/** 0 desert 1 winter 2 forest 3 unused */
dis.FastEntityStatePdu.prototype.getEntityAppearance_camouflageType = function()
{
   var val = this.entityAppearance & 0x60000;
   return val >> 17;
};


/** 0 desert 1 winter 2 forest 3 unused */
dis.FastEntityStatePdu.prototype.setEntityAppearance_camouflageType= function(val)
{
  this.entityAppearance &= ~0x60000; // Zero existing bits
  val = val << 17;
  this.entityAppearance = this.entityAppearance | val; 
};

}; // end of class

 // node.js module support
exports.FastEntityStatePdu = dis.FastEntityStatePdu;

// End of FastEntityStatePdu class

/**
 * Sectioin 5.3.4.1. Information about someone firing something. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 2;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 2;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that shot */
   this.firingEntityID = new dis.EntityID(); 

   /** ID of the entity that is being shot at */
   this.targetEntityID = new dis.EntityID(); 

   /** ID of the munition that is being shot */
   this.munitionID = new dis.EntityID(); 

   /** ID of event */
   this.eventID = new dis.EventID(); 

   this.fireMissionIndex = 0;

   /** location of the firing event */
   this.locationInWorldCoordinates = new dis.Vector3Double(); 

   /** Describes munitions used in the firing event */
   this.burstDescriptor = new dis.BurstDescriptor(); 

   /** Velocity of the ammunition */
   this.velocity = new dis.Vector3Float(); 

   /** range to the target. Note the word range is a SQL reserved word. */
   this.rangeToTarget = 0;

  dis.FirePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.firingEntityID.initFromBinary(inputStream);
       this.targetEntityID.initFromBinary(inputStream);
       this.munitionID.initFromBinary(inputStream);
       this.eventID.initFromBinary(inputStream);
       this.fireMissionIndex = inputStream.readInt();
       this.locationInWorldCoordinates.initFromBinary(inputStream);
       this.burstDescriptor.initFromBinary(inputStream);
       this.velocity.initFromBinary(inputStream);
       this.rangeToTarget = inputStream.readFloat32();
  };

  dis.FirePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.firingEntityID.encodeToBinary(outputStream);
       this.targetEntityID.encodeToBinary(outputStream);
       this.munitionID.encodeToBinary(outputStream);
       this.eventID.encodeToBinary(outputStream);
       outputStream.writeInt(this.fireMissionIndex);
       this.locationInWorldCoordinates.encodeToBinary(outputStream);
       this.burstDescriptor.encodeToBinary(outputStream);
       this.velocity.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.rangeToTarget);
  };
}; // end of class

 // node.js module support
exports.FirePdu = dis.FirePdu;

// End of FirePdu class

/**
 * Section 5.2.18. Fixed Datum Record
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
   /** ID of the fixed datum */
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
 * Section 5.2.22. Contains electromagnetic emmision regineratin parameters that are        variable throughout a scenario dependent on the actions of the participants in the simulation. Also provides basic parametric data that may be used to support low-fidelity simulations.
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


dis.FundamentalParameterData = function()
{
   /** center frequency of the emission in hertz. */
   this.frequency = 0;

   /** Bandwidth of the frequencies corresponding to the fequency field. */
   this.frequencyRange = 0;

   /** Effective radiated power for the emission in DdBm. For a      radar noise jammer, indicates the peak of the transmitted power. */
   this.effectiveRadiatedPower = 0;

   /** Average repetition frequency of the emission in hertz. */
   this.pulseRepetitionFrequency = 0;

   /** Average pulse width  of the emission in microseconds. */
   this.pulseWidth = 0;

   /** Specifies the beam azimuth an elevation centers and corresponding half-angles     to describe the scan volume */
   this.beamAzimuthCenter = 0;

   /** Specifies the beam azimuth sweep to determine scan volume */
   this.beamAzimuthSweep = 0;

   /** Specifies the beam elevation center to determine scan volume */
   this.beamElevationCenter = 0;

   /** Specifies the beam elevation sweep to determine scan volume */
   this.beamElevationSweep = 0;

   /** allows receiver to synchronize its regenerated scan pattern to     that of the emmitter. Specifies the percentage of time a scan is through its pattern from its origion. */
   this.beamSweepSync = 0;

  dis.FundamentalParameterData.prototype.initFromBinary = function(inputStream)
  {
       this.frequency = inputStream.readFloat32();
       this.frequencyRange = inputStream.readFloat32();
       this.effectiveRadiatedPower = inputStream.readFloat32();
       this.pulseRepetitionFrequency = inputStream.readFloat32();
       this.pulseWidth = inputStream.readFloat32();
       this.beamAzimuthCenter = inputStream.readFloat32();
       this.beamAzimuthSweep = inputStream.readFloat32();
       this.beamElevationCenter = inputStream.readFloat32();
       this.beamElevationSweep = inputStream.readFloat32();
       this.beamSweepSync = inputStream.readFloat32();
  };

  dis.FundamentalParameterData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.frequency);
       outputStream.writeFloat32(this.frequencyRange);
       outputStream.writeFloat32(this.effectiveRadiatedPower);
       outputStream.writeFloat32(this.pulseRepetitionFrequency);
       outputStream.writeFloat32(this.pulseWidth);
       outputStream.writeFloat32(this.beamAzimuthCenter);
       outputStream.writeFloat32(this.beamAzimuthSweep);
       outputStream.writeFloat32(this.beamElevationCenter);
       outputStream.writeFloat32(this.beamElevationSweep);
       outputStream.writeFloat32(this.beamSweepSync);
  };
}; // end of class

 // node.js module support
exports.FundamentalParameterData = dis.FundamentalParameterData;

// End of FundamentalParameterData class

/**
 * 5.2.45. Fundamental IFF atc data
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


dis.FundamentalParameterDataIff = function()
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

   /** padding */
   this.pad2 = 0;

   /** padding */
   this.pad3 = 0;

  dis.FundamentalParameterDataIff.prototype.initFromBinary = function(inputStream)
  {
       this.erp = inputStream.readFloat32();
       this.frequency = inputStream.readFloat32();
       this.pgrf = inputStream.readFloat32();
       this.pulseWidth = inputStream.readFloat32();
       this.burstLength = inputStream.readUInt();
       this.applicableModes = inputStream.readUByte();
       this.pad2 = inputStream.readUShort();
       this.pad3 = inputStream.readUByte();
  };

  dis.FundamentalParameterDataIff.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.erp);
       outputStream.writeFloat32(this.frequency);
       outputStream.writeFloat32(this.pgrf);
       outputStream.writeFloat32(this.pulseWidth);
       outputStream.writeUInt(this.burstLength);
       outputStream.writeUByte(this.applicableModes);
       outputStream.writeUShort(this.pad2);
       outputStream.writeUByte(this.pad3);
  };
}; // end of class

 // node.js module support
exports.FundamentalParameterDataIff = dis.FundamentalParameterDataIff;

// End of FundamentalParameterDataIff class

/**
 * 5.2.44: Grid data record, a common abstract superclass for several subtypes 
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


dis.GridAxisRecord = function()
{
   /** type of environmental sample */
   this.sampleType = 0;

   /** value that describes data representation */
   this.dataRepresentation = 0;

  dis.GridAxisRecord.prototype.initFromBinary = function(inputStream)
  {
       this.sampleType = inputStream.readUShort();
       this.dataRepresentation = inputStream.readUShort();
  };

  dis.GridAxisRecord.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.sampleType);
       outputStream.writeUShort(this.dataRepresentation);
  };
}; // end of class

 // node.js module support
exports.GridAxisRecord = dis.GridAxisRecord;

// End of GridAxisRecord class

/**
 * 5.2.44: Grid data record, representation 0
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


dis.GridAxisRecordRepresentation0 = function()
{
   /** type of environmental sample */
   this.sampleType = 0;

   /** value that describes data representation */
   this.dataRepresentation = 0;

   /** number of bytes of environmental state data */
   this.numberOfBytes = 0;

   /** variable length variablelist of data parameters ^^^this is wrong--need padding as well */
    this.dataValues = new Array();
 
  dis.GridAxisRecordRepresentation0.prototype.initFromBinary = function(inputStream)
  {
       this.sampleType = inputStream.readUShort();
       this.dataRepresentation = inputStream.readUShort();
       this.numberOfBytes = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfBytes; idx++)
       {
           var anX = new dis.OneByteChunk();
           anX.initFromBinary(inputStream);
           this.dataValues.push(anX);
       }

  };

  dis.GridAxisRecordRepresentation0.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.sampleType);
       outputStream.writeUShort(this.dataRepresentation);
       outputStream.writeUShort(this.numberOfBytes);
       for(var idx = 0; idx < this.dataValues.length; idx++)
       {
           dataValues[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.GridAxisRecordRepresentation0 = dis.GridAxisRecordRepresentation0;

// End of GridAxisRecordRepresentation0 class

/**
 * 5.2.44: Grid data record, representation 1
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


dis.GridAxisRecordRepresentation1 = function()
{
   /** type of environmental sample */
   this.sampleType = 0;

   /** value that describes data representation */
   this.dataRepresentation = 0;

   /** constant scale factor */
   this.fieldScale = 0;

   /** constant offset used to scale grid data */
   this.fieldOffset = 0;

   /** Number of data values */
   this.numberOfValues = 0;

   /** variable length list of data parameters ^^^this is wrong--need padding as well */
    this.dataValues = new Array();
 
  dis.GridAxisRecordRepresentation1.prototype.initFromBinary = function(inputStream)
  {
       this.sampleType = inputStream.readUShort();
       this.dataRepresentation = inputStream.readUShort();
       this.fieldScale = inputStream.readFloat32();
       this.fieldOffset = inputStream.readFloat32();
       this.numberOfValues = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfValues; idx++)
       {
           var anX = new dis.TwoByteChunk();
           anX.initFromBinary(inputStream);
           this.dataValues.push(anX);
       }

  };

  dis.GridAxisRecordRepresentation1.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.sampleType);
       outputStream.writeUShort(this.dataRepresentation);
       outputStream.writeFloat32(this.fieldScale);
       outputStream.writeFloat32(this.fieldOffset);
       outputStream.writeUShort(this.numberOfValues);
       for(var idx = 0; idx < this.dataValues.length; idx++)
       {
           dataValues[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.GridAxisRecordRepresentation1 = dis.GridAxisRecordRepresentation1;

// End of GridAxisRecordRepresentation1 class

/**
 * 5.2.44: Grid data record, representation 1
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


dis.GridAxisRecordRepresentation2 = function()
{
   /** type of environmental sample */
   this.sampleType = 0;

   /** value that describes data representation */
   this.dataRepresentation = 0;

   /** number of values */
   this.numberOfValues = 0;

   /** variable length list of data parameters ^^^this is wrong--need padding as well */
    this.dataValues = new Array();
 
  dis.GridAxisRecordRepresentation2.prototype.initFromBinary = function(inputStream)
  {
       this.sampleType = inputStream.readUShort();
       this.dataRepresentation = inputStream.readUShort();
       this.numberOfValues = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfValues; idx++)
       {
           var anX = new dis.FourByteChunk();
           anX.initFromBinary(inputStream);
           this.dataValues.push(anX);
       }

  };

  dis.GridAxisRecordRepresentation2.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.sampleType);
       outputStream.writeUShort(this.dataRepresentation);
       outputStream.writeUShort(this.numberOfValues);
       for(var idx = 0; idx < this.dataValues.length; idx++)
       {
           dataValues[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.GridAxisRecordRepresentation2 = dis.GridAxisRecordRepresentation2;

// End of GridAxisRecordRepresentation2 class

/**
 * Section 5.3.11.2: Information about globat, spatially varying enviornmental effects. This requires manual cleanup; the grid axis        records are variable sized. UNFINISHED
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


dis.GriddedDataPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 42;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 9;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** environmental simulation application ID */
   this.environmentalSimulationApplicationID = new dis.EntityID(); 

   /** unique identifier for each piece of enviornmental data */
   this.fieldNumber = 0;

   /** sequence number for the total set of PDUS used to transmit the data */
   this.pduNumber = 0;

   /** Total number of PDUS used to transmit the data */
   this.pduTotal = 0;

   /** coordinate system of the grid */
   this.coordinateSystem = 0;

   /** number of grid axes for the environmental data */
   this.numberOfGridAxes = 0;

   /** are domain grid axes identidal to those of the priveious domain update? */
   this.constantGrid = 0;

   /** type of environment */
   this.environmentType = new dis.EntityType(); 

   /** orientation of the data grid */
   this.orientation = new dis.Orientation(); 

   /** valid time of the enviormental data sample, 64 bit unsigned int */
   this.sampleTime = 0;

   /** total number of all data values for all pdus for an environmental sample */
   this.totalValues = 0;

   /** total number of data values at each grid point. */
   this.vectorDimension = 0;

   /** padding */
   this.padding1 = 0;

   /** padding */
   this.padding2 = 0;

   /** Grid data ^^^This is wrong */
    this.gridDataList = new Array();
 
  dis.GriddedDataPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.environmentalSimulationApplicationID.initFromBinary(inputStream);
       this.fieldNumber = inputStream.readUShort();
       this.pduNumber = inputStream.readUShort();
       this.pduTotal = inputStream.readUShort();
       this.coordinateSystem = inputStream.readUShort();
       this.numberOfGridAxes = inputStream.readUByte();
       this.constantGrid = inputStream.readUByte();
       this.environmentType.initFromBinary(inputStream);
       this.orientation.initFromBinary(inputStream);
       this.sampleTime = inputStream.readLong();
       this.totalValues = inputStream.readUInt();
       this.vectorDimension = inputStream.readUByte();
       this.padding1 = inputStream.readUShort();
       this.padding2 = inputStream.readUByte();
       for(var idx = 0; idx < this.numberOfGridAxes; idx++)
       {
           var anX = new dis.GridAxisRecord();
           anX.initFromBinary(inputStream);
           this.gridDataList.push(anX);
       }

  };

  dis.GriddedDataPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.environmentalSimulationApplicationID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.fieldNumber);
       outputStream.writeUShort(this.pduNumber);
       outputStream.writeUShort(this.pduTotal);
       outputStream.writeUShort(this.coordinateSystem);
       outputStream.writeUByte(this.numberOfGridAxes);
       outputStream.writeUByte(this.constantGrid);
       this.environmentType.encodeToBinary(outputStream);
       this.orientation.encodeToBinary(outputStream);
       outputStream.writeLong(this.sampleTime);
       outputStream.writeUInt(this.totalValues);
       outputStream.writeUByte(this.vectorDimension);
       outputStream.writeUShort(this.padding1);
       outputStream.writeUByte(this.padding2);
       for(var idx = 0; idx < this.gridDataList.length; idx++)
       {
           gridDataList[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.GriddedDataPdu = dis.GriddedDataPdu;

// End of GriddedDataPdu class

/**
 * 5.3.7.4.1: Navigational and IFF PDU. COMPLETE
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


dis.IffAtcNavAidsLayer1Pdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 28;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 6;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that is the source of the emissions */
   this.emittingEntityId = new dis.EntityID(); 

   /** Number generated by the issuing simulation to associate realted events. */
   this.eventID = new dis.EventID(); 

   /** Location wrt entity. There is some ambugiuity in the standard here, but this is the order it is listed in the table. */
   this.location = new dis.Vector3Float(); 

   /** System ID information */
   this.systemID = new dis.SystemID(); 

   /** padding */
   this.pad2 = 0;

   /** fundamental parameters */
   this.fundamentalParameters = new dis.IffFundamentalData(); 

  dis.IffAtcNavAidsLayer1Pdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.emittingEntityId.initFromBinary(inputStream);
       this.eventID.initFromBinary(inputStream);
       this.location.initFromBinary(inputStream);
       this.systemID.initFromBinary(inputStream);
       this.pad2 = inputStream.readUShort();
       this.fundamentalParameters.initFromBinary(inputStream);
  };

  dis.IffAtcNavAidsLayer1Pdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.emittingEntityId.encodeToBinary(outputStream);
       this.eventID.encodeToBinary(outputStream);
       this.location.encodeToBinary(outputStream);
       this.systemID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.pad2);
       this.fundamentalParameters.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.IffAtcNavAidsLayer1Pdu = dis.IffAtcNavAidsLayer1Pdu;

// End of IffAtcNavAidsLayer1Pdu class

/**
 * Section 5.3.7.4.2 When present, layer 2 should follow layer 1 and have the following fields. This requires manual cleanup.        the beamData attribute semantics are used in multiple ways. UNFINSISHED
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


dis.IffAtcNavAidsLayer2Pdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 28;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 6;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that is the source of the emissions */
   this.emittingEntityId = new dis.EntityID(); 

   /** Number generated by the issuing simulation to associate realted events. */
   this.eventID = new dis.EventID(); 

   /** Location wrt entity. There is some ambugiuity in the standard here, but this is the order it is listed in the table. */
   this.location = new dis.Vector3Float(); 

   /** System ID information */
   this.systemID = new dis.SystemID(); 

   /** padding */
   this.pad2 = 0;

   /** fundamental parameters */
   this.fundamentalParameters = new dis.IffFundamentalData(); 

   /** layer header */
   this.layerHeader = new dis.LayerHeader(); 

   /** beam data */
   this.beamData = new dis.BeamData(); 

   /** Secondary operational data, 5.2.57 */
   this.secondaryOperationalData = new dis.BeamData(); 

   /** variable length list of fundamental parameters. ^^^This is wrong */
    this.fundamentalIffParameters = new Array();
 
  dis.IffAtcNavAidsLayer2Pdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.emittingEntityId.initFromBinary(inputStream);
       this.eventID.initFromBinary(inputStream);
       this.location.initFromBinary(inputStream);
       this.systemID.initFromBinary(inputStream);
       this.pad2 = inputStream.readUShort();
       this.fundamentalParameters.initFromBinary(inputStream);
       this.layerHeader.initFromBinary(inputStream);
       this.beamData.initFromBinary(inputStream);
       this.secondaryOperationalData.initFromBinary(inputStream);
       for(var idx = 0; idx < this.pad2; idx++)
       {
           var anX = new dis.FundamentalParameterDataIff();
           anX.initFromBinary(inputStream);
           this.fundamentalIffParameters.push(anX);
       }

  };

  dis.IffAtcNavAidsLayer2Pdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.emittingEntityId.encodeToBinary(outputStream);
       this.eventID.encodeToBinary(outputStream);
       this.location.encodeToBinary(outputStream);
       this.systemID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.pad2);
       this.fundamentalParameters.encodeToBinary(outputStream);
       this.layerHeader.encodeToBinary(outputStream);
       this.beamData.encodeToBinary(outputStream);
       this.secondaryOperationalData.encodeToBinary(outputStream);
       for(var idx = 0; idx < this.fundamentalIffParameters.length; idx++)
       {
           fundamentalIffParameters[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.IffAtcNavAidsLayer2Pdu = dis.IffAtcNavAidsLayer2Pdu;

// End of IffAtcNavAidsLayer2Pdu class

/**
 * 5.2.42. Basic operational data ofr IFF ATC NAVAIDS
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


dis.IffFundamentalData = function()
{
   /** system status */
   this.systemStatus = 0;

   /** Alternate parameter 4 */
   this.alternateParameter4 = 0;

   /** eight boolean fields */
   this.informationLayers = 0;

   /** enumeration */
   this.modifier = 0;

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

  dis.IffFundamentalData.prototype.initFromBinary = function(inputStream)
  {
       this.systemStatus = inputStream.readUByte();
       this.alternateParameter4 = inputStream.readUByte();
       this.informationLayers = inputStream.readUByte();
       this.modifier = inputStream.readUByte();
       this.parameter1 = inputStream.readUShort();
       this.parameter2 = inputStream.readUShort();
       this.parameter3 = inputStream.readUShort();
       this.parameter4 = inputStream.readUShort();
       this.parameter5 = inputStream.readUShort();
       this.parameter6 = inputStream.readUShort();
  };

  dis.IffFundamentalData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.systemStatus);
       outputStream.writeUByte(this.alternateParameter4);
       outputStream.writeUByte(this.informationLayers);
       outputStream.writeUByte(this.modifier);
       outputStream.writeUShort(this.parameter1);
       outputStream.writeUShort(this.parameter2);
       outputStream.writeUShort(this.parameter3);
       outputStream.writeUShort(this.parameter4);
       outputStream.writeUShort(this.parameter5);
       outputStream.writeUShort(this.parameter6);
  };
}; // end of class

 // node.js module support
exports.IffFundamentalData = dis.IffFundamentalData;

// End of IffFundamentalData class

/**
 * 5.2.46.  Intercom communcations parameters
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

   /** length of record-specifid field, in octets */
   this.recordLength = 0;

   /** variable length variablelist of data parameters  */
    this.parameterValues = new Array();
 
  dis.IntercomCommunicationsParameters.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUShort();
       this.recordLength = inputStream.readUShort();
       for(var idx = 0; idx < this.recordLength; idx++)
       {
           var anX = new dis.OneByteChunk();
           anX.initFromBinary(inputStream);
           this.parameterValues.push(anX);
       }

  };

  dis.IntercomCommunicationsParameters.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.recordType);
       outputStream.writeUShort(this.recordLength);
       for(var idx = 0; idx < this.parameterValues.length; idx++)
       {
           parameterValues[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.IntercomCommunicationsParameters = dis.IntercomCommunicationsParameters;

// End of IntercomCommunicationsParameters class

/**
 * Section 5.3.8.5. Detailed inofrmation about the state of an intercom device and the actions it is requestion         of another intercom device, or the response to a requested action. Required manual intervention to fix the intercom parameters,        which can be of varialbe length. UNFINSISHED
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 32;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 4;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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

   /** Must be  */
    this.intercomParameters = new Array();
 
  dis.IntercomControlPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.3.8.4. Actual transmission of intercome voice data. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 31;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 4;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entitythat is the source of the communication */
   this.entityId = new dis.EntityID(); 

   /** particular radio within an entity */
   this.communicationsDeviceID = 0;

   /** encoding scheme */
   this.encodingScheme = 0;

   /** tactical data link type */
   this.tdlType = 0;

   /** sample rate */
   this.sampleRate = 0;

   /** data length, in bits */
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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.entityId.initFromBinary(inputStream);
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.entityId.encodeToBinary(outputStream);
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
 * Section 5.3.9.2 Information about a particular group of entities grouped together for the purposes of netowrk bandwidth         reduction or aggregation. Needs manual cleanup. The GED size requires a database lookup. UNFINISHED
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


dis.IsGroupOfPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 34;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 7;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of aggregated entities */
   this.groupEntityID = new dis.EntityID(); 

   /** type of entities constituting the group */
   this.groupedEntityCategory = 0;

   /** Number of individual entities constituting the group */
   this.numberOfGroupedEntities = 0;

   /** padding */
   this.pad2 = 0;

   /** latitude */
   this.latitude = 0;

   /** longitude */
   this.longitude = 0;

   /** GED records about each individual entity in the group. ^^^this is wrong--need a database lookup to find the actual size of the list elements */
    this.groupedEntityDescriptions = new Array();
 
  dis.IsGroupOfPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.groupEntityID.initFromBinary(inputStream);
       this.groupedEntityCategory = inputStream.readUByte();
       this.numberOfGroupedEntities = inputStream.readUByte();
       this.pad2 = inputStream.readUInt();
       this.latitude = inputStream.readFloat64();
       this.longitude = inputStream.readFloat64();
       for(var idx = 0; idx < this.numberOfGroupedEntities; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.groupedEntityDescriptions.push(anX);
       }

  };

  dis.IsGroupOfPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.groupEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.groupedEntityCategory);
       outputStream.writeUByte(this.numberOfGroupedEntities);
       outputStream.writeUInt(this.pad2);
       outputStream.writeFloat64(this.latitude);
       outputStream.writeFloat64(this.longitude);
       for(var idx = 0; idx < this.groupedEntityDescriptions.length; idx++)
       {
           groupedEntityDescriptions[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.IsGroupOfPdu = dis.IsGroupOfPdu;

// End of IsGroupOfPdu class

/**
 * Section 5.3.9.4 The joining of two or more simulation entities is communicated by this PDU. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 36;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 7;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
   this.namedLocationID = new dis.NamedLocation(); 

   /** entity type */
   this.partEntityType = new dis.EntityType(); 

  dis.IsPartOfPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * 5.2.47.  Layer header.
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
   /** Layer number */
   this.layerNumber = 0;

   /** Layer speccific information enumeration */
   this.layerSpecificInformaiton = 0;

   /** information length */
   this.length = 0;

  dis.LayerHeader.prototype.initFromBinary = function(inputStream)
  {
       this.layerNumber = inputStream.readUByte();
       this.layerSpecificInformaiton = inputStream.readUByte();
       this.length = inputStream.readUShort();
  };

  dis.LayerHeader.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.layerNumber);
       outputStream.writeUByte(this.layerSpecificInformaiton);
       outputStream.writeUShort(this.length);
  };
}; // end of class

 // node.js module support
exports.LayerHeader = dis.LayerHeader;

// End of LayerHeader class

/**
 * Section 5.3.11.4: Information abut the addition or modification of a synthecic enviroment object that      is anchored to the terrain with a single point and has size or orientation. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 44;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 9;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * 5.2.48: Linear segment parameters
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
   /** number of segments */
   this.segmentNumber = 0;

   /** segment appearance */
   this.segmentAppearance = new dis.SixByteChunk(); 

   /** location */
   this.location = new dis.Vector3Double(); 

   /** orientation */
   this.orientation = new dis.Orientation(); 

   /** segmentLength */
   this.segmentLength = 0;

   /** segmentWidth */
   this.segmentWidth = 0;

   /** segmentHeight */
   this.segmentHeight = 0;

   /** segment Depth */
   this.segmentDepth = 0;

   /** segment Depth */
   this.pad1 = 0;

  dis.LinearSegmentParameter.prototype.initFromBinary = function(inputStream)
  {
       this.segmentNumber = inputStream.readUByte();
       this.segmentAppearance.initFromBinary(inputStream);
       this.location.initFromBinary(inputStream);
       this.orientation.initFromBinary(inputStream);
       this.segmentLength = inputStream.readUShort();
       this.segmentWidth = inputStream.readUShort();
       this.segmentHeight = inputStream.readUShort();
       this.segmentDepth = inputStream.readUShort();
       this.pad1 = inputStream.readUInt();
  };

  dis.LinearSegmentParameter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.segmentNumber);
       this.segmentAppearance.encodeToBinary(outputStream);
       this.location.encodeToBinary(outputStream);
       this.orientation.encodeToBinary(outputStream);
       outputStream.writeUShort(this.segmentLength);
       outputStream.writeUShort(this.segmentWidth);
       outputStream.writeUShort(this.segmentHeight);
       outputStream.writeUShort(this.segmentDepth);
       outputStream.writeUInt(this.pad1);
  };
}; // end of class

 // node.js module support
exports.LinearSegmentParameter = dis.LinearSegmentParameter;

// End of LinearSegmentParameter class

/**
 * Section 5.3.5. Abstract superclass for logistics PDUs. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 3;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

  dis.LogisticsFamilyPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
  };

  dis.LogisticsFamilyPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
  };
}; // end of class

 // node.js module support
exports.LogisticsFamilyPdu = dis.LogisticsFamilyPdu;

// End of LogisticsFamilyPdu class

/**
 * Section 5.2.15. Specifies the character set used inthe first byte, followed by 11 characters of text data.
 * The generated Marking class should be augmented with a patch that adds getMarking() and
 * setMarking() methods that convert between arrays and strings, and clamp the length
 * of the string to 11 characters.
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


dis.Marking = function()
{
   /** The character set */
   this.characterSet = 0;

   /** The characters */
   this.characters = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

  dis.Marking.prototype.initFromBinary = function(inputStream)
  {
       this.characterSet = inputStream.readUByte();
       for(var idx = 0; idx < 11; idx++)
       {
          this.characters[ idx ] = inputStream.readByte();
       }
  };

  dis.Marking.prototype.encodeToBinary = function(outputStream)
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
  dis.Marking.prototype.getMarking = function()
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
  dis.Marking.prototype.setMarking = function(newMarking)
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
exports.Marking = dis.Marking;

// End of Marking class

/**
 * Section 5.3.10.3 Information about individual mines within a minefield. This is very, very wrong. UNFINISHED
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


dis.MinefieldDataPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 39;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 8;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Minefield ID */
   this.minefieldID = new dis.EntityID(); 

   /** ID of entity making request */
   this.requestingEntityID = new dis.EntityID(); 

   /** Minefield sequence number */
   this.minefieldSequenceNumbeer = 0;

   /** request ID */
   this.requestID = 0;

   /** pdu sequence number */
   this.pduSequenceNumber = 0;

   /** number of pdus in response */
   this.numberOfPdus = 0;

   /** how many mines are in this PDU */
   this.numberOfMinesInThisPdu = 0;

   /** how many sensor type are in this PDU */
   this.numberOfSensorTypes = 0;

   /** padding */
   this.pad2 = 0;

   /** 32 boolean fields */
   this.dataFilter = 0;

   /** Mine type */
   this.mineType = new dis.EntityType(); 

   /** Sensor types, each 16 bits long */
    this.sensorTypes = new Array();
 
   /** Padding to get things 32-bit aligned. ^^^this is wrong--dyanmically sized padding needed */
   this.pad3 = 0;

   /** Mine locations */
    this.mineLocation = new Array();
 
  dis.MinefieldDataPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.minefieldID.initFromBinary(inputStream);
       this.requestingEntityID.initFromBinary(inputStream);
       this.minefieldSequenceNumbeer = inputStream.readUShort();
       this.requestID = inputStream.readUByte();
       this.pduSequenceNumber = inputStream.readUByte();
       this.numberOfPdus = inputStream.readUByte();
       this.numberOfMinesInThisPdu = inputStream.readUByte();
       this.numberOfSensorTypes = inputStream.readUByte();
       this.pad2 = inputStream.readUByte();
       this.dataFilter = inputStream.readUInt();
       this.mineType.initFromBinary(inputStream);
       for(var idx = 0; idx < this.numberOfSensorTypes; idx++)
       {
           var anX = new dis.TwoByteChunk();
           anX.initFromBinary(inputStream);
           this.sensorTypes.push(anX);
       }

       this.pad3 = inputStream.readUByte();
       for(var idx = 0; idx < this.numberOfMinesInThisPdu; idx++)
       {
           var anX = new dis.Vector3Float();
           anX.initFromBinary(inputStream);
           this.mineLocation.push(anX);
       }

  };

  dis.MinefieldDataPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.minefieldID.encodeToBinary(outputStream);
       this.requestingEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.minefieldSequenceNumbeer);
       outputStream.writeUByte(this.requestID);
       outputStream.writeUByte(this.pduSequenceNumber);
       outputStream.writeUByte(this.numberOfPdus);
       outputStream.writeUByte(this.numberOfMinesInThisPdu);
       outputStream.writeUByte(this.numberOfSensorTypes);
       outputStream.writeUByte(this.pad2);
       outputStream.writeUInt(this.dataFilter);
       this.mineType.encodeToBinary(outputStream);
       for(var idx = 0; idx < this.sensorTypes.length; idx++)
       {
           sensorTypes[idx].encodeToBinary(outputStream);
       }

       outputStream.writeUByte(this.pad3);
       for(var idx = 0; idx < this.mineLocation.length; idx++)
       {
           mineLocation[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.MinefieldDataPdu = dis.MinefieldDataPdu;

// End of MinefieldDataPdu class

/**
 * Section 5.3.10.1 Abstract superclass for PDUs relating to minefields
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 8;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

  dis.MinefieldFamilyPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
  };

  dis.MinefieldFamilyPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
  };
}; // end of class

 // node.js module support
exports.MinefieldFamilyPdu = dis.MinefieldFamilyPdu;

// End of MinefieldFamilyPdu class

/**
 * Section 5.3.10.2 Query a minefield for information about individual mines. Requires manual clean up to get the padding right. UNFINISHED
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


dis.MinefieldQueryPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 38;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 8;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Minefield ID */
   this.minefieldID = new dis.EntityID(); 

   /** EID of entity making the request */
   this.requestingEntityID = new dis.EntityID(); 

   /** request ID */
   this.requestID = 0;

   /** Number of perimeter points for the minefield */
   this.numberOfPerimeterPoints = 0;

   /** Padding */
   this.pad2 = 0;

   /** Number of sensor types */
   this.numberOfSensorTypes = 0;

   /** data filter, 32 boolean fields */
   this.dataFilter = 0;

   /** Entity type of mine being requested */
   this.requestedMineType = new dis.EntityType(); 

   /** perimeter points of request */
    this.requestedPerimeterPoints = new Array();
 
   /** Sensor types, each 16 bits long */
    this.sensorTypes = new Array();
 
  dis.MinefieldQueryPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.minefieldID.initFromBinary(inputStream);
       this.requestingEntityID.initFromBinary(inputStream);
       this.requestID = inputStream.readUByte();
       this.numberOfPerimeterPoints = inputStream.readUByte();
       this.pad2 = inputStream.readUByte();
       this.numberOfSensorTypes = inputStream.readUByte();
       this.dataFilter = inputStream.readUInt();
       this.requestedMineType.initFromBinary(inputStream);
       for(var idx = 0; idx < this.numberOfPerimeterPoints; idx++)
       {
           var anX = new dis.Point();
           anX.initFromBinary(inputStream);
           this.requestedPerimeterPoints.push(anX);
       }

       for(var idx = 0; idx < this.numberOfSensorTypes; idx++)
       {
           var anX = new dis.TwoByteChunk();
           anX.initFromBinary(inputStream);
           this.sensorTypes.push(anX);
       }

  };

  dis.MinefieldQueryPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.minefieldID.encodeToBinary(outputStream);
       this.requestingEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.requestID);
       outputStream.writeUByte(this.numberOfPerimeterPoints);
       outputStream.writeUByte(this.pad2);
       outputStream.writeUByte(this.numberOfSensorTypes);
       outputStream.writeUInt(this.dataFilter);
       this.requestedMineType.encodeToBinary(outputStream);
       for(var idx = 0; idx < this.requestedPerimeterPoints.length; idx++)
       {
           requestedPerimeterPoints[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.sensorTypes.length; idx++)
       {
           sensorTypes[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.MinefieldQueryPdu = dis.MinefieldQueryPdu;

// End of MinefieldQueryPdu class

/**
 * Section 5.3.10.4 proivde the means to request a retransmit of a minefield data pdu. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 40;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 8;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.3.10.1 Abstract superclass for PDUs relating to minefields. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 37;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 8;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Minefield ID */
   this.minefieldID = new dis.EntityID(); 

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

   /** location of minefield in world coords */
   this.minefieldLocation = new dis.Vector3Double(); 

   /** orientation of minefield */
   this.minefieldOrientation = new dis.Orientation(); 

   /** appearance bitflags */
   this.appearance = 0;

   /** protocolMode */
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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
           var anX = new dis.Point();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Radio modulation
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
   /** spread spectrum, 16 bit boolean array */
   this.spreadSpectrum = 0;

   /** major */
   this.major = 0;

   /** detail */
   this.detail = 0;

   /** system */
   this.system = 0;

  dis.ModulationType.prototype.initFromBinary = function(inputStream)
  {
       this.spreadSpectrum = inputStream.readUShort();
       this.major = inputStream.readUShort();
       this.detail = inputStream.readUShort();
       this.system = inputStream.readUShort();
  };

  dis.ModulationType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.spreadSpectrum);
       outputStream.writeUShort(this.major);
       outputStream.writeUShort(this.detail);
       outputStream.writeUShort(this.system);
  };
}; // end of class

 // node.js module support
exports.ModulationType = dis.ModulationType;

// End of ModulationType class

/**
 * discrete ostional relationsihip 
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


dis.NamedLocation = function()
{
   /** station name enumeration */
   this.stationName = 0;

   /** station number */
   this.stationNumber = 0;

  dis.NamedLocation.prototype.initFromBinary = function(inputStream)
  {
       this.stationName = inputStream.readUShort();
       this.stationNumber = inputStream.readUShort();
  };

  dis.NamedLocation.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.stationName);
       outputStream.writeUShort(this.stationNumber);
  };
}; // end of class

 // node.js module support
exports.NamedLocation = dis.NamedLocation;

// End of NamedLocation class

/**
 * Identifies type of object. This is a shorter version of EntityType that omits the specific and extra fields.
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

  dis.ObjectType.prototype.initFromBinary = function(inputStream)
  {
       this.entityKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.country = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
  };

  dis.ObjectType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.entityKind);
       outputStream.writeUByte(this.domain);
       outputStream.writeUShort(this.country);
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
 * Section 5.2.17. Three floating point values representing an orientation, psi, theta, and phi, aka the euler angles, in radians
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


dis.Orientation = function()
{
   this.psi = 0;

   this.theta = 0;

   this.phi = 0;

  dis.Orientation.prototype.initFromBinary = function(inputStream)
  {
       this.psi = inputStream.readFloat32();
       this.theta = inputStream.readFloat32();
       this.phi = inputStream.readFloat32();
  };

  dis.Orientation.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.psi);
       outputStream.writeFloat32(this.theta);
       outputStream.writeFloat32(this.phi);
  };
}; // end of class

 // node.js module support
exports.Orientation = dis.Orientation;

// End of Orientation class

/**
 * The superclass for all PDUs. This incorporates the PduHeader record, section 5.2.29.
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 0;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

  dis.Pdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
  };

  dis.Pdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
  };
}; // end of class

 // node.js module support
exports.Pdu = dis.Pdu;

// End of Pdu class

/**
 * A container that holds PDUs
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

   /** List of PDUs */
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
 * Non-DIS class, used to describe streams of PDUs when logging to SQL databases
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
   /** short description of this PDU stream */
   this.shortDescription = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /** Longish description of this PDU stream */
   this.longDescription = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /** Name of person performing recording */
   this.personRecording = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /** Email of person performing recording */
   this.authorEmail = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /** Start time of recording, in Unix time */
   this.startTime = 0;

   /** stop time of recording, in Unix time */
   this.stopTime = 0;

   /** how many PDUs in this stream */
   this.pduCount = 0;

   /** variable length list of PDUs */
    this.pdusInStream = new Array();
 
  dis.PduStream.prototype.initFromBinary = function(inputStream)
  {
       for(var idx = 0; idx < 256; idx++)
       {
          this.shortDescription[ idx ] = inputStream.readByte();
       }
       for(var idx = 0; idx < 512; idx++)
       {
          this.longDescription[ idx ] = inputStream.readByte();
       }
       for(var idx = 0; idx < 128; idx++)
       {
          this.personRecording[ idx ] = inputStream.readByte();
       }
       for(var idx = 0; idx < 128; idx++)
       {
          this.authorEmail[ idx ] = inputStream.readByte();
       }
       this.startTime = inputStream.readLong();
       this.stopTime = inputStream.readLong();
       this.pduCount = inputStream.readUInt();
       for(var idx = 0; idx < this.pduCount; idx++)
       {
           var anX = new dis.Pdu();
           anX.initFromBinary(inputStream);
           this.pdusInStream.push(anX);
       }

  };

  dis.PduStream.prototype.encodeToBinary = function(outputStream)
  {
       for(var idx = 0; idx < 256; idx++)
       {
          outputStream.writeByte(this.shortDescription[ idx ] );
       }
       for(var idx = 0; idx < 512; idx++)
       {
          outputStream.writeByte(this.longDescription[ idx ] );
       }
       for(var idx = 0; idx < 128; idx++)
       {
          outputStream.writeByte(this.personRecording[ idx ] );
       }
       for(var idx = 0; idx < 128; idx++)
       {
          outputStream.writeByte(this.authorEmail[ idx ] );
       }
       outputStream.writeLong(this.startTime);
       outputStream.writeLong(this.stopTime);
       outputStream.writeUInt(this.pduCount);
       for(var idx = 0; idx < this.pdusInStream.length; idx++)
       {
           pdusInStream[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.PduStream = dis.PduStream;

// End of PduStream class

/**
 * x,y point
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


dis.Point = function()
{
   /** x */
   this.x = 0;

   /** y */
   this.y = 0;

  dis.Point.prototype.initFromBinary = function(inputStream)
  {
       this.x = inputStream.readFloat32();
       this.y = inputStream.readFloat32();
  };

  dis.Point.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.x);
       outputStream.writeFloat32(this.y);
  };
}; // end of class

 // node.js module support
exports.Point = dis.Point;

// End of Point class

/**
 * Section 5.3.11.3: Inormation abut the addition or modification of a synthecic enviroment object that is anchored      to the terrain with a single point. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 43;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 9;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
   this.objectOrientation = new dis.Orientation(); 

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Data about a propulsion system
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
 * Section 5.3.8. Abstract superclass for radio communications PDUs.
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 4;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

  dis.RadioCommunicationsFamilyPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
  };

  dis.RadioCommunicationsFamilyPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
  };
}; // end of class

 // node.js module support
exports.RadioCommunicationsFamilyPdu = dis.RadioCommunicationsFamilyPdu;

// End of RadioCommunicationsFamilyPdu class

/**
 * Section 5.2.25. Identifies the type of radio
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


dis.RadioEntityType = function()
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
   this.nomenclatureVersion = 0;

   this.nomenclature = 0;

  dis.RadioEntityType.prototype.initFromBinary = function(inputStream)
  {
       this.entityKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.country = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.nomenclatureVersion = inputStream.readUByte();
       this.nomenclature = inputStream.readUShort();
  };

  dis.RadioEntityType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.entityKind);
       outputStream.writeUByte(this.domain);
       outputStream.writeUShort(this.country);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.nomenclatureVersion);
       outputStream.writeUShort(this.nomenclature);
  };
}; // end of class

 // node.js module support
exports.RadioEntityType = dis.RadioEntityType;

// End of RadioEntityType class

/**
 * Section 5.3.8.3. Communication of a receiver state. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 27;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 4;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that is the source of the communication, ie contains the radio */
   this.entityId = new dis.EntityID(); 

   /** particular radio within an entity */
   this.radioId = 0;

   /** encoding scheme used, and enumeration */
   this.receiverState = 0;

   /** padding */
   this.padding1 = 0;

   /** received power */
   this.receivedPower = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.entityId.initFromBinary(inputStream);
       this.radioId = inputStream.readUShort();
       this.receiverState = inputStream.readUShort();
       this.padding1 = inputStream.readUShort();
       this.receivedPower = inputStream.readFloat32();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.entityId.encodeToBinary(outputStream);
       outputStream.writeUShort(this.radioId);
       outputStream.writeUShort(this.receiverState);
       outputStream.writeUShort(this.padding1);
       outputStream.writeFloat32(this.receivedPower);
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 65;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Record sets, used in transfer control request PDU
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


dis.RecordSet = function()
{
   /** record ID */
   this.recordID = 0;

   /** record set serial number */
   this.recordSetSerialNumber = 0;

   /** record length */
   this.recordLength = 0;

   /** record count */
   this.recordCount = 0;

   /** ^^^This is wrong--variable sized data records */
   this.recordValues = 0;

   /** ^^^This is wrong--variable sized padding */
   this.pad4 = 0;

  dis.RecordSet.prototype.initFromBinary = function(inputStream)
  {
       this.recordID = inputStream.readUInt();
       this.recordSetSerialNumber = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.recordCount = inputStream.readUShort();
       this.recordValues = inputStream.readUShort();
       this.pad4 = inputStream.readUByte();
  };

  dis.RecordSet.prototype.encodeToBinary = function(outputStream)
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
exports.RecordSet = dis.RecordSet;

// End of RecordSet class

/**
 * 5.2.56. Purpose for joinging two entities
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
   /** Nature of join */
   this.nature = 0;

   /** position of join */
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
 * Section 5.3.6.2. Remove an entity. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 12;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** Identifier for the request */
   this.requestID = 0;

  dis.RemoveEntityPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
  };

  dis.RemoveEntityPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 52;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.2.5.5. Repair is complete. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 9;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 3;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is receiving service */
   this.receivingEntityID = new dis.EntityID(); 

   /** Entity that is supplying */
   this.repairingEntityID = new dis.EntityID(); 

   /** Enumeration for type of repair */
   this.repair = 0;

   /** padding, number prevents conflict with superclass ivar name */
   this.padding2 = 0;

  dis.RepairCompletePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.receivingEntityID.initFromBinary(inputStream);
       this.repairingEntityID.initFromBinary(inputStream);
       this.repair = inputStream.readUShort();
       this.padding2 = inputStream.readShort();
  };

  dis.RepairCompletePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.repairingEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.repair);
       outputStream.writeShort(this.padding2);
  };
}; // end of class

 // node.js module support
exports.RepairCompletePdu = dis.RepairCompletePdu;

// End of RepairCompletePdu class

/**
 * Section 5.2.5.6. Sent after repair complete PDU. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 10;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 3;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is receiving service */
   this.receivingEntityID = new dis.EntityID(); 

   /** Entity that is supplying */
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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.2.5.4. Cancel of resupply by either the receiving or supplying entity. COMPLETE
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


dis.ResupplyCancelPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 8;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 3;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is receiving service */
   this.receivingEntityID = new dis.EntityID(); 

   /** Entity that is supplying */
   this.supplyingEntityID = new dis.EntityID(); 

  dis.ResupplyCancelPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.receivingEntityID.initFromBinary(inputStream);
       this.supplyingEntityID.initFromBinary(inputStream);
  };

  dis.ResupplyCancelPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.supplyingEntityID.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.ResupplyCancelPdu = dis.ResupplyCancelPdu;

// End of ResupplyCancelPdu class

/**
 * Section 5.3.5.2. Information about a request for supplies. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 6;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 3;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is receiving service */
   this.receivingEntityID = new dis.EntityID(); 

   /** Entity that is supplying */
   this.supplyingEntityID = new dis.EntityID(); 

   /** how many supplies are being offered */
   this.numberOfSupplyTypes = 0;

   /** padding */
   this.padding1 = 0;

   /** padding */
   this.padding2 = 0;

    this.supplies = new Array();
 
  dis.ResupplyOfferPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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

  dis.ResupplyOfferPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
exports.ResupplyOfferPdu = dis.ResupplyOfferPdu;

// End of ResupplyOfferPdu class

/**
 * Section 5.3.5.3. Receipt of supplies is communiated. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 7;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 3;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is receiving service */
   this.receivingEntityID = new dis.EntityID(); 

   /** Entity that is supplying */
   this.supplyingEntityID = new dis.EntityID(); 

   /** how many supplies are being offered */
   this.numberOfSupplyTypes = 0;

   /** padding */
   this.padding1 = 0;

   /** padding */
   this.padding2 = 0;

    this.supplies = new Array();
 
  dis.ResupplyReceivedPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.3.7.5. SEES PDU, supplemental emissions entity state information. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 30;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 6;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
           var anX = new dis.VectoringNozzleSystemData();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.3.5.1. Information about a request for supplies. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 5;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 3;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is requesting service */
   this.requestingEntityID = new dis.EntityID(); 

   /** Entity that is providing the service */
   this.servicingEntityID = new dis.EntityID(); 

   /** type of service requested */
   this.serviceTypeRequested = 0;

   /** How many requested */
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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.3.6.9. Change state information with the data contained in this. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 19;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
       this.padding1 = inputStream.readUInt();
       this.numberOfFixedDatumRecords = inputStream.readUInt();
       this.numberOfVariableDatumRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatumRecords; idx++)
       {
           var anX = new dis.UnsignedIntegerWrapper();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis.UnsignedIntegerWrapper();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 59;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.3.12.14: Initializing or changing internal parameter info. Needs manual intervention     to fix padding in recrod set PDUs. UNFINISHED
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


dis.SetRecordReliablePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 64;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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

   /** Number of record sets in list */
   this.numberOfRecordSets = 0;

   /** record sets */
    this.recordSets = new Array();
 
  dis.SetRecordReliablePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
       this.requiredReliabilityService = inputStream.readUByte();
       this.pad1 = inputStream.readUShort();
       this.pad2 = inputStream.readUByte();
       this.numberOfRecordSets = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfRecordSets; idx++)
       {
           var anX = new dis.RecordSet();
           anX.initFromBinary(inputStream);
           this.recordSets.push(anX);
       }

  };

  dis.SetRecordReliablePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.requestID);
       outputStream.writeUByte(this.requiredReliabilityService);
       outputStream.writeUShort(this.pad1);
       outputStream.writeUByte(this.pad2);
       outputStream.writeUInt(this.numberOfRecordSets);
       for(var idx = 0; idx < this.recordSets.length; idx++)
       {
           recordSets[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.SetRecordReliablePdu = dis.SetRecordReliablePdu;

// End of SetRecordReliablePdu class

/**
 * Shaft RPMs, used in underwater acoustic clacluations.
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


dis.ShaftRPMs = function()
{
   /** Current shaft RPMs */
   this.currentShaftRPMs = 0;

   /** ordered shaft rpms */
   this.orderedShaftRPMs = 0;

   /** rate of change of shaft RPMs */
   this.shaftRPMRateOfChange = 0;

  dis.ShaftRPMs.prototype.initFromBinary = function(inputStream)
  {
       this.currentShaftRPMs = inputStream.readShort();
       this.orderedShaftRPMs = inputStream.readShort();
       this.shaftRPMRateOfChange = inputStream.readFloat32();
  };

  dis.ShaftRPMs.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeShort(this.currentShaftRPMs);
       outputStream.writeShort(this.orderedShaftRPMs);
       outputStream.writeFloat32(this.shaftRPMRateOfChange);
  };
}; // end of class

 // node.js module support
exports.ShaftRPMs = dis.ShaftRPMs;

// End of ShaftRPMs class

/**
 * Section 5.3.8.2. Detailed information about a radio transmitter. This PDU requires manually written code to complete. The encodingScheme field can be used in multiple ways, which requires hand-written code to finish. UNFINISHED
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 26;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 4;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that is the source of the communication, ie contains the radio */
   this.entityId = new dis.EntityID(); 

   /** particular radio within an entity */
   this.radioId = 0;

   /** encoding scheme used, and enumeration */
   this.encodingScheme = 0;

   /** tdl type */
   this.tdlType = 0;

   /** sample rate */
   this.sampleRate = 0;

   /** length of data, in bits */
   this.dataLength = 0;

   /** number of samples. If the PDU contains encoded audio, this should be zero. */
   this.samples = 0;

   /** list of eight bit values. Must be padded to fall on a 32 bit boundary. */
    this.data = new Array();
 
  dis.SignalPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.entityId.initFromBinary(inputStream);
       this.radioId = inputStream.readUShort();
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

  dis.SignalPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.entityId.encodeToBinary(outputStream);
       outputStream.writeUShort(this.radioId);
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
exports.SignalPdu = dis.SignalPdu;

// End of SignalPdu class

/**
 * Section 5.2.14.1. A Simulation Address  record shall consist of the Site Identification number and the Application Identification number.
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
   /** The site ID */
   this.site = 0;

   /** The application ID */
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
 * Section 5.3.6. Abstract superclass for PDUs relating to the simulation itself. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.SimulationManagementFamilyPdu = dis.SimulationManagementFamilyPdu;

// End of SimulationManagementFamilyPdu class

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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.SimulationManagementWithReliabilityFamilyPdu = dis.SimulationManagementWithReliabilityFamilyPdu;

// End of SimulationManagementWithReliabilityFamilyPdu class

/**
 * 48 bit piece of data
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


dis.SixByteChunk = function()
{
   /** six bytes of arbitrary data */
   this.otherParameters = new Array(0, 0, 0, 0, 0, 0);

  dis.SixByteChunk.prototype.initFromBinary = function(inputStream)
  {
       for(var idx = 0; idx < 6; idx++)
       {
          this.otherParameters[ idx ] = inputStream.readByte();
       }
  };

  dis.SixByteChunk.prototype.encodeToBinary = function(outputStream)
  {
       for(var idx = 0; idx < 6; idx++)
       {
          outputStream.writeByte(this.otherParameters[ idx ] );
       }
  };
}; // end of class

 // node.js module support
exports.SixByteChunk = dis.SixByteChunk;

// End of SixByteChunk class

/**
 * Section 5.2.4.3. Used when the antenna pattern type in the transmitter pdu is of value 2.         Specified the direction and radiation pattern from a radio transmitter's antenna.        NOTE: this class must be hand-coded to clean up some implementation details.
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


dis.SphericalHarmonicAntennaPattern = function()
{
   this.harmonicOrder = 0;

  dis.SphericalHarmonicAntennaPattern.prototype.initFromBinary = function(inputStream)
  {
       this.harmonicOrder = inputStream.readByte();
  };

  dis.SphericalHarmonicAntennaPattern.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeByte(this.harmonicOrder);
  };
}; // end of class

 // node.js module support
exports.SphericalHarmonicAntennaPattern = dis.SphericalHarmonicAntennaPattern;

// End of SphericalHarmonicAntennaPattern class

/**
 * Section 5.2.6.3. Start or resume an exercise. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 13;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** UTC time at which the simulation shall start or resume */
   this.realWorldTime = new dis.ClockTime(); 

   /** Simulation clock time at which the simulation shall start or resume */
   this.simulationTime = new dis.ClockTime(); 

   /** Identifier for the request */
   this.requestID = 0;

  dis.StartResumePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 53;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.2.3.4. Stop or freeze an exercise. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 14;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 5;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is sending message */
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** UTC time at which the simulation shall stop or freeze */
   this.realWorldTime = new dis.ClockTime(); 

   /** Reason the simulation was stopped or frozen */
   this.reason = 0;

   /** Internal behavior of the simulation and its appearance while frozento the other participants */
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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.originatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.originatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 54;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 10;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Section 5.2.30. A supply, and the amount of that supply. Similar to an entity kind but with the addition of a quantity.
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

   /** quantity to be supplied */
   this.quantity = 0;

  dis.SupplyQuantity.prototype.initFromBinary = function(inputStream)
  {
       this.supplyType.initFromBinary(inputStream);
       this.quantity = inputStream.readUByte();
  };

  dis.SupplyQuantity.prototype.encodeToBinary = function(outputStream)
  {
       this.supplyType.encodeToBinary(outputStream);
       outputStream.writeUByte(this.quantity);
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 9;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

  dis.SyntheticEnvironmentFamilyPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
  };

  dis.SyntheticEnvironmentFamilyPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
  };
}; // end of class

 // node.js module support
exports.SyntheticEnvironmentFamilyPdu = dis.SyntheticEnvironmentFamilyPdu;

// End of SyntheticEnvironmentFamilyPdu class

/**
 * 5.2.58. Used in IFF ATC PDU
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


dis.SystemID = function()
{
   /** System Type */
   this.systemType = 0;

   /** System name, an enumeration */
   this.systemName = 0;

   /** System mode */
   this.systemMode = 0;

   /** Change Options */
   this.changeOptions = 0;

  dis.SystemID.prototype.initFromBinary = function(inputStream)
  {
       this.systemType = inputStream.readUShort();
       this.systemName = inputStream.readUShort();
       this.systemMode = inputStream.readUByte();
       this.changeOptions = inputStream.readUByte();
  };

  dis.SystemID.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.systemType);
       outputStream.writeUShort(this.systemName);
       outputStream.writeUByte(this.systemMode);
       outputStream.writeUByte(this.changeOptions);
  };
}; // end of class

 // node.js module support
exports.SystemID = dis.SystemID;

// End of SystemID class

/**
 * One track/jam target
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


dis.TrackJamTarget = function()
{
   /** track/jam target */
   this.trackJam = new dis.EntityID(); 

   /** Emitter ID */
   this.emitterID = 0;

   /** beam ID */
   this.beamID = 0;

  dis.TrackJamTarget.prototype.initFromBinary = function(inputStream)
  {
       this.trackJam.initFromBinary(inputStream);
       this.emitterID = inputStream.readUByte();
       this.beamID = inputStream.readUByte();
  };

  dis.TrackJamTarget.prototype.encodeToBinary = function(outputStream)
  {
       this.trackJam.encodeToBinary(outputStream);
       outputStream.writeUByte(this.emitterID);
       outputStream.writeUByte(this.beamID);
  };
}; // end of class

 // node.js module support
exports.TrackJamTarget = dis.TrackJamTarget;

// End of TrackJamTarget class

/**
 * Section 5.3.9.3 Information initiating the dyanic allocation and control of simulation entities         between two simulation applications. Requires manual cleanup. The padding between record sets is variable. UNFINISHED
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


dis.TransferControlRequestPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 35;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 7;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of entity originating request */
   this.orginatingEntityID = new dis.EntityID(); 

   /** ID of entity receiving request */
   this.recevingEntityID = new dis.EntityID(); 

   /** ID ofrequest */
   this.requestID = 0;

   /** required level of reliabliity service. */
   this.requiredReliabilityService = 0;

   /** type of transfer desired */
   this.tranferType = 0;

   /** The entity for which control is being requested to transfer */
   this.transferEntityID = new dis.EntityID(); 

   /** number of record sets to transfer */
   this.numberOfRecordSets = 0;

   /** ^^^This is wrong--the RecordSet class needs more work */
    this.recordSets = new Array();
 
  dis.TransferControlRequestPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.orginatingEntityID.initFromBinary(inputStream);
       this.recevingEntityID.initFromBinary(inputStream);
       this.requestID = inputStream.readUInt();
       this.requiredReliabilityService = inputStream.readUByte();
       this.tranferType = inputStream.readUByte();
       this.transferEntityID.initFromBinary(inputStream);
       this.numberOfRecordSets = inputStream.readUByte();
       for(var idx = 0; idx < this.numberOfRecordSets; idx++)
       {
           var anX = new dis.RecordSet();
           anX.initFromBinary(inputStream);
           this.recordSets.push(anX);
       }

  };

  dis.TransferControlRequestPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.orginatingEntityID.encodeToBinary(outputStream);
       this.recevingEntityID.encodeToBinary(outputStream);
       outputStream.writeUInt(this.requestID);
       outputStream.writeUByte(this.requiredReliabilityService);
       outputStream.writeUByte(this.tranferType);
       this.transferEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.numberOfRecordSets);
       for(var idx = 0; idx < this.recordSets.length; idx++)
       {
           recordSets[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.TransferControlRequestPdu = dis.TransferControlRequestPdu;

// End of TransferControlRequestPdu class

/**
 * Section 5.3.8.1. Detailed information about a radio transmitter. This PDU requires manually         written code to complete, since the modulation parameters are of variable length. UNFINISHED
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 25;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 4;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that is the source of the communication, ie contains the radio */
   this.entityId = new dis.EntityID(); 

   /** particular radio within an entity */
   this.radioId = 0;

   /** linear accelleration of entity */
   this.radioEntityType = new dis.RadioEntityType(); 

   /** transmit state */
   this.transmitState = 0;

   /** input source */
   this.inputSource = 0;

   /** padding */
   this.padding1 = 0;

   /** Location of antenna */
   this.antennaLocation = new dis.Vector3Double(); 

   /** relative location of antenna, in entity coordinates */
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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.entityId.initFromBinary(inputStream);
       this.radioId = inputStream.readUShort();
       this.radioEntityType.initFromBinary(inputStream);
       this.transmitState = inputStream.readUByte();
       this.inputSource = inputStream.readUByte();
       this.padding1 = inputStream.readUShort();
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
           var anX = new dis.ModulationType();
           anX.initFromBinary(inputStream);
           this.modulationParametersList.push(anX);
       }

       for(var idx = 0; idx < this.antennaPatternCount; idx++)
       {
           var anX = new dis.BeamAntennaPattern();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.entityId.encodeToBinary(outputStream);
       outputStream.writeUShort(this.radioId);
       this.radioEntityType.encodeToBinary(outputStream);
       outputStream.writeUByte(this.transmitState);
       outputStream.writeUByte(this.inputSource);
       outputStream.writeUShort(this.padding1);
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
 * Section 5.3.7.3. Information about underwater acoustic emmissions. This requires manual cleanup.  The beam data records should ALL be a the finish, rather than attached to each emitter system. UNFINISHED
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 29;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 6;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that is the source of the emission */
   this.emittingEntityID = new dis.EntityID(); 

   /** ID of event */
   this.eventID = new dis.EventID(); 

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

   /** shaft RPM values */
    this.shaftRPMs = new Array();
 
   /** apaData */
    this.apaData = new Array();
 
    this.emitterSystems = new Array();
 
  dis.UaPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
           var anX = new dis.ShaftRPMs();
           anX.initFromBinary(inputStream);
           this.shaftRPMs.push(anX);
       }

       for(var idx = 0; idx < this.numberOfAPAs; idx++)
       {
           var anX = new dis.ApaData();
           anX.initFromBinary(inputStream);
           this.apaData.push(anX);
       }

       for(var idx = 0; idx < this.numberOfUAEmitterSystems; idx++)
       {
           var anX = new dis.AcousticEmitterSystemData();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
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
 * Wrapper for an unsigned 32 bit integer
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


dis.UnsignedIntegerWrapper = function()
{
   /** name can't be too accurate or the generated source code will have reserved word problems */
   this.wrapper = 0;

  dis.UnsignedIntegerWrapper.prototype.initFromBinary = function(inputStream)
  {
       this.wrapper = inputStream.readUInt();
  };

  dis.UnsignedIntegerWrapper.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.wrapper);
  };
}; // end of class

 // node.js module support
exports.UnsignedIntegerWrapper = dis.UnsignedIntegerWrapper;

// End of UnsignedIntegerWrapper class

/**
 * Section 5.2.32. Variable Datum Record
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
   /** ID of the variable datum */
   this.variableDatumID = 0;

   /** length of the variable datums, in bits. Note that this is not programmatically tied to the size of the variableData. The variable data field may be 64 bits long but only 16 bits of it could actually be used. */
   this.variableDatumLength = 0;

   /** data can be any length, but must increase in 8 byte quanta. This requires some postprocessing patches. Note that setting the data allocates a new internal array to account for the possibly increased size. The default initial size is 64 bits. */
    this.variableData = new Array();
 
  dis.VariableDatum.prototype.initFromBinary = function(inputStream)
  {
       this.variableDatumID = inputStream.readUInt();
       this.variableDatumLength = inputStream.readUInt();
       for(var idx = 0; idx < this.variableDatumLength; idx++)
       {
           var anX = new dis.OneByteChunk();
           anX.initFromBinary(inputStream);
           this.variableData.push(anX);
       }

  };

  dis.VariableDatum.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.variableDatumID);
       outputStream.writeUInt(this.variableDatumLength);
       for(var idx = 0; idx < this.variableData.length; idx++)
       {
           variableData[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.VariableDatum = dis.VariableDatum;

// End of VariableDatum class

/**
 * Section 5.3.34. Three double precision floating point values, x, y, and z
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

   /** Y value */
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
 * Section 5.2.33. Three floating point values, x, y, and z
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
 * Data about a vectoring nozzle system
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


dis.VectoringNozzleSystemData = function()
{
   /** horizontal deflection angle */
   this.horizontalDeflectionAngle = 0;

   /** vertical deflection angle */
   this.verticalDeflectionAngle = 0;

  dis.VectoringNozzleSystemData.prototype.initFromBinary = function(inputStream)
  {
       this.horizontalDeflectionAngle = inputStream.readFloat32();
       this.verticalDeflectionAngle = inputStream.readFloat32();
  };

  dis.VectoringNozzleSystemData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.horizontalDeflectionAngle);
       outputStream.writeFloat32(this.verticalDeflectionAngle);
  };
}; // end of class

 // node.js module support
exports.VectoringNozzleSystemData = dis.VectoringNozzleSystemData;

// End of VectoringNozzleSystemData class

/**
 * Section 5.3.4. abstract superclass for fire and detonation pdus that have shared information. COMPLETE
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
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 2;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

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
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
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
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.firingEntityID.encodeToBinary(outputStream);
       this.targetEntityID.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.WarfareFamilyPdu = dis.WarfareFamilyPdu;

// End of WarfareFamilyPdu class


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
 * Section 7.5.6. Acknowledge the receipt of a start/resume, stop/freeze, or RemoveEntityPDU. COMPLETE
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.AcknowledgePdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis7.EntityID(); 

   /** Identifier for originating entity(or simulation) */
   this.originatingID = new dis7.EntityID(); 

   /** Identifier for the receiving entity(or simulation) */
   this.receivingID = new dis7.EntityID(); 

   /** type of message being acknowledged */
   this.acknowledgeFlag = 0;

   /** Whether or not the receiving entity was able to comply with the request */
   this.responseFlag = 0;

   /** Request ID that is unique */
   this.requestID = 0;

  dis7.AcknowledgePdu.prototype.initFromBinary = function(inputStream)
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

  dis7.AcknowledgePdu.prototype.encodeToBinary = function(outputStream)
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
exports.AcknowledgePdu = dis7.AcknowledgePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.AcknowledgeReliablePdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis7.EntityID(); 

   /** ack flags */
   this.acknowledgeFlag = 0;

   /** response flags */
   this.responseFlag = 0;

   /** Request ID */
   this.requestID = 0;

  dis7.AcknowledgeReliablePdu.prototype.initFromBinary = function(inputStream)
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

  dis7.AcknowledgeReliablePdu.prototype.encodeToBinary = function(outputStream)
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
exports.AcknowledgeReliablePdu = dis7.AcknowledgeReliablePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.AcousticEmitter = function()
{
   /** the system for a particular UA emitter, and an enumeration */
   this.acousticSystemName = 0;

   /** The function of the acoustic system */
   this.acousticFunction = 0;

   /** The UA emitter identification number relative to a specific system */
   this.acousticIDNumber = 0;

  dis7.AcousticEmitter.prototype.initFromBinary = function(inputStream)
  {
       this.acousticSystemName = inputStream.readUShort();
       this.acousticFunction = inputStream.readUByte();
       this.acousticIDNumber = inputStream.readUByte();
  };

  dis7.AcousticEmitter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.acousticSystemName);
       outputStream.writeUByte(this.acousticFunction);
       outputStream.writeUByte(this.acousticIDNumber);
  };
}; // end of class

 // node.js module support
exports.AcousticEmitter = dis7.AcousticEmitter;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ActionRequestPdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis7.EntityID(); 

   /** Identifier for originating entity(or simulation) */
   this.originatingID = new dis7.EntityID(); 

   /** Identifier for the receiving entity(or simulation) */
   this.receivingID = new dis7.EntityID(); 

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
 
  dis7.ActionRequestPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis7.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatums.push(anX);
       }

  };

  dis7.ActionRequestPdu.prototype.encodeToBinary = function(outputStream)
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
exports.ActionRequestPdu = dis7.ActionRequestPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ActionRequestReliablePdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis7.EntityID(); 

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
 
  dis7.ActionRequestReliablePdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatumRecords.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis7.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumRecords.push(anX);
       }

  };

  dis7.ActionRequestReliablePdu.prototype.encodeToBinary = function(outputStream)
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
exports.ActionRequestReliablePdu = dis7.ActionRequestReliablePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ActionResponsePdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis7.EntityID(); 

   /** Identifier for originating entity(or simulation) */
   this.originatingID = new dis7.EntityID(); 

   /** Identifier for the receiving entity(or simulation) */
   this.receivingID = new dis7.EntityID(); 

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
 
  dis7.ActionResponsePdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis7.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatums.push(anX);
       }

  };

  dis7.ActionResponsePdu.prototype.encodeToBinary = function(outputStream)
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
exports.ActionResponsePdu = dis7.ActionResponsePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ActionResponseReliablePdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis7.EntityID(); 

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
 
  dis7.ActionResponseReliablePdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatumRecords.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis7.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumRecords.push(anX);
       }

  };

  dis7.ActionResponseReliablePdu.prototype.encodeToBinary = function(outputStream)
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
exports.ActionResponseReliablePdu = dis7.ActionResponseReliablePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.AggregateIdentifier = function()
{
   /** Simulation address, ie site and application, the first two fields of the entity ID */
   this.simulationAddress = new dis7.SimulationAddress(); 

   /** the aggregate ID, an object identifier */
   this.aggregateID = 0;

  dis7.AggregateIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.aggregateID = inputStream.readUShort();
  };

  dis7.AggregateIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.aggregateID);
  };
}; // end of class

 // node.js module support
exports.AggregateIdentifier = dis7.AggregateIdentifier;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.AggregateMarking = function()
{
   /** The character set */
   this.characterSet = 0;

   /** The characters */
   this.characters = 0;

  dis7.AggregateMarking.prototype.initFromBinary = function(inputStream)
  {
       this.characterSet = inputStream.readUByte();
       this.characters = inputStream.readUByte();
  };

  dis7.AggregateMarking.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.characterSet);
       outputStream.writeUByte(this.characters);
  };
}; // end of class

 // node.js module support
exports.AggregateMarking = dis7.AggregateMarking;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.AggregateType = function()
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

   /** extra information needed to describe the aggregate */
   this.extra = 0;

  dis7.AggregateType.prototype.initFromBinary = function(inputStream)
  {
       this.aggregateKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.country = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.specificInfo = inputStream.readUByte();
       this.extra = inputStream.readUByte();
  };

  dis7.AggregateType.prototype.encodeToBinary = function(outputStream)
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
exports.AggregateType = dis7.AggregateType;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.AngleDeception = function()
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

  dis7.AngleDeception.prototype.initFromBinary = function(inputStream)
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

  dis7.AngleDeception.prototype.encodeToBinary = function(outputStream)
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
exports.AngleDeception = dis7.AngleDeception;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.AngularVelocityVector = function()
{
   /** velocity about the x axis */
   this.x = 0;

   /** velocity about the y axis */
   this.y = 0;

   /** velocity about the zaxis */
   this.z = 0;

  dis7.AngularVelocityVector.prototype.initFromBinary = function(inputStream)
  {
       this.x = inputStream.readFloat32();
       this.y = inputStream.readFloat32();
       this.z = inputStream.readFloat32();
  };

  dis7.AngularVelocityVector.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.x);
       outputStream.writeFloat32(this.y);
       outputStream.writeFloat32(this.z);
  };
}; // end of class

 // node.js module support
exports.AngularVelocityVector = dis7.AngularVelocityVector;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.AntennaLocation = function()
{
   /** Location of the radiating portion of the antenna in world    coordinates */
   this.antennaLocation = new dis7.Vector3Double(); 

   /** Location of the radiating portion of the antenna     in entity coordinates */
   this.relativeAntennaLocation = new dis7.Vector3Float(); 

  dis7.AntennaLocation.prototype.initFromBinary = function(inputStream)
  {
       this.antennaLocation.initFromBinary(inputStream);
       this.relativeAntennaLocation.initFromBinary(inputStream);
  };

  dis7.AntennaLocation.prototype.encodeToBinary = function(outputStream)
  {
       this.antennaLocation.encodeToBinary(outputStream);
       this.relativeAntennaLocation.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.AntennaLocation = dis7.AntennaLocation;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ArealObjectStatePdu = function()
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
   this.objectID = new dis7.EntityID(); 

   /** Object with which this point object is associated */
   this.referencedObjectID = new dis7.EntityID(); 

   /** unique update number of each state transition of an object */
   this.updateNumber = 0;

   /** force ID */
   this.forceID = 0;

   /** modifications enumeration */
   this.modifications = 0;

   /** Object type */
   this.objectType = new dis7.EntityType(); 

   /** Object appearance */
   this.specificObjectAppearance = 0;

   /** Object appearance */
   this.generalObjectAppearance = 0;

   /** Number of points */
   this.numberOfPoints = 0;

   /** requesterID */
   this.requesterID = new dis7.SimulationAddress(); 

   /** receiver ID */
   this.receivingID = new dis7.SimulationAddress(); 

   /** location of object */
    this.objectLocation = new Array();
 
  dis7.ArealObjectStatePdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.Vector3Double();
           anX.initFromBinary(inputStream);
           this.objectLocation.push(anX);
       }

  };

  dis7.ArealObjectStatePdu.prototype.encodeToBinary = function(outputStream)
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
exports.ArealObjectStatePdu = dis7.ArealObjectStatePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ArticulatedParts = function()
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

  dis7.ArticulatedParts.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUByte();
       this.changeIndicator = inputStream.readUByte();
       this.partAttachedTo = inputStream.readUShort();
       this.parameterType = inputStream.readUInt();
       this.parameterValue = inputStream.readLong();
  };

  dis7.ArticulatedParts.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.recordType);
       outputStream.writeUByte(this.changeIndicator);
       outputStream.writeUShort(this.partAttachedTo);
       outputStream.writeUInt(this.parameterType);
       outputStream.writeLong(this.parameterValue);
  };
}; // end of class

 // node.js module support
exports.ArticulatedParts = dis7.ArticulatedParts;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.Association = function()
{
   this.associationType = 0;

   this.padding4 = 0;

   /** identity of associated entity. If none, NO_SPECIFIC_ENTITY */
   this.associatedEntityID = new dis7.EntityID(); 

   /** location, in world coordinates */
   this.associatedLocation = new dis7.Vector3Double(); 

  dis7.Association.prototype.initFromBinary = function(inputStream)
  {
       this.associationType = inputStream.readUByte();
       this.padding4 = inputStream.readUByte();
       this.associatedEntityID.initFromBinary(inputStream);
       this.associatedLocation.initFromBinary(inputStream);
  };

  dis7.Association.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.associationType);
       outputStream.writeUByte(this.padding4);
       this.associatedEntityID.encodeToBinary(outputStream);
       this.associatedLocation.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.Association = dis7.Association;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.AttachedParts = function()
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

  dis7.AttachedParts.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUByte();
       this.detachedIndicator = inputStream.readUByte();
       this.partAttachedTo = inputStream.readUShort();
       this.parameterType = inputStream.readUInt();
       this.parameterValue = inputStream.readLong();
  };

  dis7.AttachedParts.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.recordType);
       outputStream.writeUByte(this.detachedIndicator);
       outputStream.writeUShort(this.partAttachedTo);
       outputStream.writeUInt(this.parameterType);
       outputStream.writeLong(this.parameterValue);
  };
}; // end of class

 // node.js module support
exports.AttachedParts = dis7.AttachedParts;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.Attribute = function()
{
   this.recordType = 0;

   this.recordLength = 0;

   this.recordSpecificFields = 0;

  dis7.Attribute.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.recordSpecificFields = inputStream.readLong();
  };

  dis7.Attribute.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeLong(this.recordSpecificFields);
  };
}; // end of class

 // node.js module support
exports.Attribute = dis7.Attribute;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.AttributePdu = function()
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
   this.originatingSimulationAddress = new dis7.SimulationAddress(); 

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

  dis7.AttributePdu.prototype.initFromBinary = function(inputStream)
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

  dis7.AttributePdu.prototype.encodeToBinary = function(outputStream)
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
exports.AttributePdu = dis7.AttributePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.BeamAntennaPattern = function()
{
   /** The rotation that transforms the reference coordinate sytem into the beam coordinate system. Either world coordinates or entity coordinates may be used as the reference coordinate system, as specified by the reference system field of the antenna pattern record. */
   this.beamDirection = new dis7.EulerAngles(); 

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

  dis7.BeamAntennaPattern.prototype.initFromBinary = function(inputStream)
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

  dis7.BeamAntennaPattern.prototype.encodeToBinary = function(outputStream)
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
exports.BeamAntennaPattern = dis7.BeamAntennaPattern;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.BeamData = function()
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

  dis7.BeamData.prototype.initFromBinary = function(inputStream)
  {
       this.beamAzimuthCenter = inputStream.readFloat32();
       this.beamAzimuthSweep = inputStream.readFloat32();
       this.beamElevationCenter = inputStream.readFloat32();
       this.beamElevationSweep = inputStream.readFloat32();
       this.beamSweepSync = inputStream.readFloat32();
  };

  dis7.BeamData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.beamAzimuthCenter);
       outputStream.writeFloat32(this.beamAzimuthSweep);
       outputStream.writeFloat32(this.beamElevationCenter);
       outputStream.writeFloat32(this.beamElevationSweep);
       outputStream.writeFloat32(this.beamSweepSync);
  };
}; // end of class

 // node.js module support
exports.BeamData = dis7.BeamData;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.BeamStatus = function()
{
   /** First bit zero means beam is active, first bit = 1 means deactivated. The rest is padding. */
   this.beamState = 0;

  dis7.BeamStatus.prototype.initFromBinary = function(inputStream)
  {
       this.beamState = inputStream.readUByte();
  };

  dis7.BeamStatus.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.beamState);
  };

/** 0 active, 1 deactivated */
dis7.BeamStatus.prototype.getBeamState_beamState = function()
{
   var val = this.beamState & 0x1;
   return val >> 0;
};


/** 0 active, 1 deactivated */
dis7.BeamStatus.prototype.setBeamState_beamState= function(val)
{
  this.beamState &= ~0x1; // Zero existing bits
  val = val << 0;
  this.beamState = this.beamState | val; 
};


/** padding */
dis7.BeamStatus.prototype.getBeamState_padding = function()
{
   var val = this.beamState & 0xFE;
   return val >> 1;
};


/** padding */
dis7.BeamStatus.prototype.setBeamState_padding= function(val)
{
  this.beamState &= ~0xFE; // Zero existing bits
  val = val << 1;
  this.beamState = this.beamState | val; 
};

}; // end of class

 // node.js module support
exports.BeamStatus = dis7.BeamStatus;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.BlankingSector = function()
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

  dis7.BlankingSector.prototype.initFromBinary = function(inputStream)
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

  dis7.BlankingSector.prototype.encodeToBinary = function(outputStream)
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
exports.BlankingSector = dis7.BlankingSector;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ChangeOptions = function()
{
  dis7.ChangeOptions.prototype.initFromBinary = function(inputStream)
  {
  };

  dis7.ChangeOptions.prototype.encodeToBinary = function(outputStream)
  {
  };
}; // end of class

 // node.js module support
exports.ChangeOptions = dis7.ChangeOptions;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ClockTime = function()
{
   /** Hours since midnight, 1970, UTC */
   this.hour = 0;

   /** Time past the hour, in timestamp form */
   this.timePastHour = new dis7.Timestamp(); 

  dis7.ClockTime.prototype.initFromBinary = function(inputStream)
  {
       this.hour = inputStream.readUInt();
       this.timePastHour.initFromBinary(inputStream);
  };

  dis7.ClockTime.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.hour);
       this.timePastHour.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.ClockTime = dis7.ClockTime;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.CollisionElasticPdu = function()
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
   this.issuingEntityID = new dis7.EntityID(); 

   /** This field shall identify the entity that has collided with the issuing entity. This field shall be a valid identifier of an entity or server capable of responding to the receipt of this Collision-Elastic PDU. This field shall be represented by an Entity Identifier record (see 6.2.28). */
   this.collidingEntityID = new dis7.EntityID(); 

   /** This field shall contain an identification generated by the issuing simulation application to associate related collision events. This field shall be represented by an Event Identifier record (see 6.2.34). */
   this.collisionEventID = new dis7.EventIdentifier(); 

   /** some padding */
   this.pad = 0;

   /** This field shall contain the velocity at the time the collision is detected at the point the collision is detected. The velocity shall be represented in world coordinates. This field shall be represented by the Linear Velocity Vector record [see 6.2.95 item c)] */
   this.contactVelocity = new dis7.Vector3Float(); 

   /** This field shall contain the mass of the issuing entity and shall be represented by a 32-bit floating point number representing kilograms */
   this.mass = 0;

   /** This field shall specify the location of the collision with respect to the entity with which the issuing entity collided. This field shall be represented by an Entity Coordinate Vector record [see 6.2.95 item a)]. */
   this.locationOfImpact = new dis7.Vector3Float(); 

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
   this.unitSurfaceNormal = new dis7.Vector3Float(); 

   /** This field shall represent the degree to which energy is conserved in a collision and shall be represented by a 32-bit floating point number. In addition, it represents a free parameter by which simulation application developers may “tune” their collision interactions. */
   this.coefficientOfRestitution = 0;

  dis7.CollisionElasticPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.CollisionElasticPdu.prototype.encodeToBinary = function(outputStream)
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
exports.CollisionElasticPdu = dis7.CollisionElasticPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.CollisionPdu = function()
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
   this.issuingEntityID = new dis7.EntityID(); 

   /** This field shall identify the entity that has collided with the issuing entity (see 5.3.3.4). This field shall be represented by an Entity Identifier record (see 6.2.28). */
   this.collidingEntityID = new dis7.EntityID(); 

   /** This field shall contain an identification generated by the issuing simulation application to associate related collision events. This field shall be represented by an Event Identifier record (see 6.2.34). */
   this.eventID = new dis7.EventIdentifier(); 

   /** This field shall identify the type of collision. The Collision Type field shall be represented by an 8-bit record of enumerations */
   this.collisionType = 0;

   /** some padding */
   this.pad = 0;

   /** This field shall contain the velocity (at the time the collision is detected) of the issuing entity. The velocity shall be represented in world coordinates. This field shall be represented by the Linear Velocity Vector record [see 6.2.95 item c)]. */
   this.velocity = new dis7.Vector3Float(); 

   /** This field shall contain the mass of the issuing entity, and shall be represented by a 32-bit floating point number representing kilograms. */
   this.mass = 0;

   /** This field shall specify the location of the collision with respect to the entity with which the issuing entity collided. The Location field shall be represented by an Entity Coordinate Vector record [see 6.2.95 item a)]. */
   this.location = new dis7.Vector3Float(); 

  dis7.CollisionPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.CollisionPdu.prototype.encodeToBinary = function(outputStream)
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
exports.CollisionPdu = dis7.CollisionPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.CommentPdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis7.EntityID(); 

   /** Number of fixed datum records */
   this.numberOfFixedDatumRecords = 0;

   /** Number of variable datum records */
   this.numberOfVariableDatumRecords = 0;

   /** variable length list of fixed datums */
    this.fixedDatums = new Array();
 
   /** variable length list of variable length datums */
    this.variableDatums = new Array();
 
  dis7.CommentPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis7.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatums.push(anX);
       }

  };

  dis7.CommentPdu.prototype.encodeToBinary = function(outputStream)
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
exports.CommentPdu = dis7.CommentPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.CommentReliablePdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis7.EntityID(); 

   /** Fixed datum record count */
   this.numberOfFixedDatumRecords = 0;

   /** variable datum record count */
   this.numberOfVariableDatumRecords = 0;

   /** Fixed datum records */
    this.fixedDatumRecords = new Array();
 
   /** Variable datum records */
    this.variableDatumRecords = new Array();
 
  dis7.CommentReliablePdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatumRecords.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis7.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumRecords.push(anX);
       }

  };

  dis7.CommentReliablePdu.prototype.encodeToBinary = function(outputStream)
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
exports.CommentReliablePdu = dis7.CommentReliablePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.CommunicationsNodeID = function()
{
   this.entityID = new dis7.EntityID(); 

   this.elementID = 0;

  dis7.CommunicationsNodeID.prototype.initFromBinary = function(inputStream)
  {
       this.entityID.initFromBinary(inputStream);
       this.elementID = inputStream.readUShort();
  };

  dis7.CommunicationsNodeID.prototype.encodeToBinary = function(outputStream)
  {
       this.entityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.elementID);
  };
}; // end of class

 // node.js module support
exports.CommunicationsNodeID = dis7.CommunicationsNodeID;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.CreateEntityPdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis7.EntityID(); 

   /** Identifier for the request */
   this.originatingID = new dis7.EntityID(); 

   /** Identifier for the request */
   this.receivingID = new dis7.EntityID(); 

   /** Identifier for the request.  See 6.2.75 */
   this.requestID = 0;

  dis7.CreateEntityPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.CreateEntityPdu.prototype.encodeToBinary = function(outputStream)
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
exports.CreateEntityPdu = dis7.CreateEntityPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.CreateEntityReliablePdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis7.EntityID(); 

   /** level of reliability service used for this transaction */
   this.requiredReliabilityService = 0;

   /** padding */
   this.pad1 = 0;

   /** padding */
   this.pad2 = 0;

   /** Request ID */
   this.requestID = 0;

  dis7.CreateEntityReliablePdu.prototype.initFromBinary = function(inputStream)
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

  dis7.CreateEntityReliablePdu.prototype.encodeToBinary = function(outputStream)
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
exports.CreateEntityReliablePdu = dis7.CreateEntityReliablePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.DataFilterRecord = function()
{
   /** Bitflags field */
   this.bitFlags = 0;

  dis7.DataFilterRecord.prototype.initFromBinary = function(inputStream)
  {
       this.bitFlags = inputStream.readUInt();
  };

  dis7.DataFilterRecord.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.bitFlags);
  };

/** boolean */
dis7.DataFilterRecord.prototype.getBitFlags_groundBurialDepthOffset = function()
{
   var val = this.bitFlags & 0x1;
   return val >> 0;
};


/** boolean */
dis7.DataFilterRecord.prototype.setBitFlags_groundBurialDepthOffset= function(val)
{
  this.bitFlags &= ~0x1; // Zero existing bits
  val = val << 0;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis7.DataFilterRecord.prototype.getBitFlags_waterBurialDepthOffset = function()
{
   var val = this.bitFlags & 0x2;
   return val >> 1;
};


/** boolean */
dis7.DataFilterRecord.prototype.setBitFlags_waterBurialDepthOffset= function(val)
{
  this.bitFlags &= ~0x2; // Zero existing bits
  val = val << 1;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis7.DataFilterRecord.prototype.getBitFlags_snowBurialDepthOffset = function()
{
   var val = this.bitFlags & 0x4;
   return val >> 2;
};


/** boolean */
dis7.DataFilterRecord.prototype.setBitFlags_snowBurialDepthOffset= function(val)
{
  this.bitFlags &= ~0x4; // Zero existing bits
  val = val << 2;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis7.DataFilterRecord.prototype.getBitFlags_mineOrientation = function()
{
   var val = this.bitFlags & 0x8;
   return val >> 3;
};


/** boolean */
dis7.DataFilterRecord.prototype.setBitFlags_mineOrientation= function(val)
{
  this.bitFlags &= ~0x8; // Zero existing bits
  val = val << 3;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis7.DataFilterRecord.prototype.getBitFlags_thermalContrast = function()
{
   var val = this.bitFlags & 0x10;
   return val >> 4;
};


/** boolean */
dis7.DataFilterRecord.prototype.setBitFlags_thermalContrast= function(val)
{
  this.bitFlags &= ~0x10; // Zero existing bits
  val = val << 4;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis7.DataFilterRecord.prototype.getBitFlags_reflectance = function()
{
   var val = this.bitFlags & 0x20;
   return val >> 5;
};


/** boolean */
dis7.DataFilterRecord.prototype.setBitFlags_reflectance= function(val)
{
  this.bitFlags &= ~0x20; // Zero existing bits
  val = val << 5;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis7.DataFilterRecord.prototype.getBitFlags_mineEmplacementTime = function()
{
   var val = this.bitFlags & 0x40;
   return val >> 6;
};


/** boolean */
dis7.DataFilterRecord.prototype.setBitFlags_mineEmplacementTime= function(val)
{
  this.bitFlags &= ~0x40; // Zero existing bits
  val = val << 6;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis7.DataFilterRecord.prototype.getBitFlags_tripDetonationWire = function()
{
   var val = this.bitFlags & 0x80;
   return val >> 7;
};


/** boolean */
dis7.DataFilterRecord.prototype.setBitFlags_tripDetonationWire= function(val)
{
  this.bitFlags &= ~0x80; // Zero existing bits
  val = val << 7;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis7.DataFilterRecord.prototype.getBitFlags_fusing = function()
{
   var val = this.bitFlags & 0x100;
   return val >> 8;
};


/** boolean */
dis7.DataFilterRecord.prototype.setBitFlags_fusing= function(val)
{
  this.bitFlags &= ~0x100; // Zero existing bits
  val = val << 8;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis7.DataFilterRecord.prototype.getBitFlags_scalarDetectionCoefficient = function()
{
   var val = this.bitFlags & 0x200;
   return val >> 9;
};


/** boolean */
dis7.DataFilterRecord.prototype.setBitFlags_scalarDetectionCoefficient= function(val)
{
  this.bitFlags &= ~0x200; // Zero existing bits
  val = val << 9;
  this.bitFlags = this.bitFlags | val; 
};


/** boolean */
dis7.DataFilterRecord.prototype.getBitFlags_paintScheme = function()
{
   var val = this.bitFlags & 0x400;
   return val >> 10;
};


/** boolean */
dis7.DataFilterRecord.prototype.setBitFlags_paintScheme= function(val)
{
  this.bitFlags &= ~0x400; // Zero existing bits
  val = val << 10;
  this.bitFlags = this.bitFlags | val; 
};


/** padding */
dis7.DataFilterRecord.prototype.getBitFlags_padding = function()
{
   var val = this.bitFlags & 0xff800;
   return val >> 11;
};


/** padding */
dis7.DataFilterRecord.prototype.setBitFlags_padding= function(val)
{
  this.bitFlags &= ~0xff800; // Zero existing bits
  val = val << 11;
  this.bitFlags = this.bitFlags | val; 
};

}; // end of class

 // node.js module support
exports.DataFilterRecord = dis7.DataFilterRecord;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.DataPdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis7.EntityID(); 

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
 
  dis7.DataPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis7.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatums.push(anX);
       }

  };

  dis7.DataPdu.prototype.encodeToBinary = function(outputStream)
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
exports.DataPdu = dis7.DataPdu;

// End of DataPdu class

/**
 * List of fixed and variable datum ID records. Section 6.2.17 
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.DataQueryDatumSpecification = function()
{
   /** Number of fixed datum IDs */
   this.numberOfFixedDatums = 0;

   /** Number of variable datum IDs */
   this.numberOfVariableDatums = 0;

   /** variable length list fixed datum IDs */
   this.fixedDatumIDList = new dis7.UnsignedDISInteger(); 

   /** variable length list variable datum IDs */
   this.variableDatumIDList = new dis7.UnsignedDISInteger(); 

  dis7.DataQueryDatumSpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfFixedDatums = inputStream.readUInt();
       this.numberOfVariableDatums = inputStream.readUInt();
       this.fixedDatumIDList.initFromBinary(inputStream);
       this.variableDatumIDList.initFromBinary(inputStream);
  };

  dis7.DataQueryDatumSpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.numberOfFixedDatums);
       outputStream.writeUInt(this.numberOfVariableDatums);
       this.fixedDatumIDList.encodeToBinary(outputStream);
       this.variableDatumIDList.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.DataQueryDatumSpecification = dis7.DataQueryDatumSpecification;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.DataQueryPdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis7.EntityID(); 

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
 
  dis7.DataQueryPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis7.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatums.push(anX);
       }

  };

  dis7.DataQueryPdu.prototype.encodeToBinary = function(outputStream)
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
exports.DataQueryPdu = dis7.DataQueryPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.DataQueryReliablePdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis7.EntityID(); 

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
 
  dis7.DataQueryReliablePdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatumRecords.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis7.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumRecords.push(anX);
       }

  };

  dis7.DataQueryReliablePdu.prototype.encodeToBinary = function(outputStream)
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
exports.DataQueryReliablePdu = dis7.DataQueryReliablePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.DataReliablePdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis7.EntityID(); 

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
 
  dis7.DataReliablePdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatumRecords.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis7.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumRecords.push(anX);
       }

  };

  dis7.DataReliablePdu.prototype.encodeToBinary = function(outputStream)
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
exports.DataReliablePdu = dis7.DataReliablePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.DatumSpecification = function()
{
   /** Number of fixed datums */
   this.numberOfFixedDatums = 0;

   /** Number of variable datums */
   this.numberOfVariableDatums = 0;

   /** variable length list fixed datums */
   this.fixedDatumList = new dis7.FixedDatum(); 

   /** variable length list variable datums. See 6.2.93 */
   this.variableDatumList = new dis7.VariableDatum(); 

  dis7.DatumSpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfFixedDatums = inputStream.readUInt();
       this.numberOfVariableDatums = inputStream.readUInt();
       this.fixedDatumList.initFromBinary(inputStream);
       this.variableDatumList.initFromBinary(inputStream);
  };

  dis7.DatumSpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.numberOfFixedDatums);
       outputStream.writeUInt(this.numberOfVariableDatums);
       this.fixedDatumList.encodeToBinary(outputStream);
       this.variableDatumList.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.DatumSpecification = dis7.DatumSpecification;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.DeadReckoningParameters = function()
{
   /** Algorithm to use in computing dead reckoning. See EBV doc. */
   this.deadReckoningAlgorithm = 0;

   /** Dead reckoning parameters. Contents depends on algorithm. */
   this.parameters = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /** Linear acceleration of the entity */
   this.entityLinearAcceleration = new dis7.Vector3Float(); 

   /** Angular velocity of the entity */
   this.entityAngularVelocity = new dis7.Vector3Float(); 

  dis7.DeadReckoningParameters.prototype.initFromBinary = function(inputStream)
  {
       this.deadReckoningAlgorithm = inputStream.readUByte();
       for(var idx = 0; idx < 15; idx++)
       {
          this.parameters[ idx ] = inputStream.readUByte();
       }
       this.entityLinearAcceleration.initFromBinary(inputStream);
       this.entityAngularVelocity.initFromBinary(inputStream);
  };

  dis7.DeadReckoningParameters.prototype.encodeToBinary = function(outputStream)
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
exports.DeadReckoningParameters = dis7.DeadReckoningParameters;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.DesignatorPdu = function()
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
   this.designatingEntityID = new dis7.EntityID(); 

   /** This field shall specify a unique emitter database number assigned to  differentiate between otherwise similar or identical emitter beams within an emitter system. */
   this.codeName = 0;

   /** ID of the entity being designated */
   this.designatedEntityID = new dis7.EntityID(); 

   /** This field shall identify the designator code being used by the designating entity  */
   this.designatorCode = 0;

   /** This field shall identify the designator output power in watts */
   this.designatorPower = 0;

   /** This field shall identify the designator wavelength in units of microns */
   this.designatorWavelength = 0;

   /** designtor spot wrt the designated entity */
   this.designatorSpotWrtDesignated = new dis7.Vector3Float(); 

   /** designtor spot wrt the designated entity */
   this.designatorSpotLocation = new dis7.Vector3Double(); 

   /** Dead reckoning algorithm */
   this.deadReckoningAlgorithm = 0;

   /** padding */
   this.padding1 = 0;

   /** padding */
   this.padding2 = 0;

   /** linear accelleration of entity */
   this.entityLinearAcceleration = new dis7.Vector3Float(); 

  dis7.DesignatorPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.DesignatorPdu.prototype.encodeToBinary = function(outputStream)
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
exports.DesignatorPdu = dis7.DesignatorPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.DetonationPdu = function()
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
   this.firingEntityID = new dis7.EntityID(); 

   /** ID of the entity that is being shot at */
   this.targetEntityID = new dis7.EntityID(); 

   /** ID of the expendable entity, Section 7.3.3  */
   this.explodingEntityID = new dis7.EntityID(); 

   /** ID of event, Section 7.3.3 */
   this.eventID = new dis7.EventIdentifier(); 

   /** velocity of the munition immediately before detonation/impact, Section 7.3.3  */
   this.velocity = new dis7.Vector3Float(); 

   /** location of the munition detonation, the expendable detonation, Section 7.3.3  */
   this.locationInWorldCoordinates = new dis7.Vector3Double(); 

   /** Describes the detonation represented, Section 7.3.3  */
   this.descriptor = new dis7.MunitionDescriptor(); 

   /** Velocity of the ammunition, Section 7.3.3  */
   this.locationOfEntityCoordinates = new dis7.Vector3Float(); 

   /** result of the detonation, Section 7.3.3  */
   this.detonationResult = 0;

   /** How many articulation parameters we have, Section 7.3.3  */
   this.numberOfVariableParameters = 0;

   /** padding */
   this.pad = 0;

   /** specify the parameter values for each Variable Parameter record, Section 7.3.3  */
    this.variableParameters = new Array();
 
  dis7.DetonationPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.VariableParameter();
           anX.initFromBinary(inputStream);
           this.variableParameters.push(anX);
       }

  };

  dis7.DetonationPdu.prototype.encodeToBinary = function(outputStream)
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
exports.DetonationPdu = dis7.DetonationPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.DirectedEnergyAreaAimpoint = function()
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
   this.beamAntennaParameterList = new dis7.BeamAntennaPattern(); 

   /** list of DE target deposition records. See 6.2.21.4 */
   this.directedEnergyTargetEnergyDepositionRecordList = new dis7.DirectedEnergyTargetEnergyDeposition(); 

  dis7.DirectedEnergyAreaAimpoint.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.padding = inputStream.readUShort();
       this.beamAntennaPatternRecordCount = inputStream.readUShort();
       this.directedEnergyTargetEnergyDepositionRecordCount = inputStream.readUShort();
       this.beamAntennaParameterList.initFromBinary(inputStream);
       this.directedEnergyTargetEnergyDepositionRecordList.initFromBinary(inputStream);
  };

  dis7.DirectedEnergyAreaAimpoint.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUShort(this.padding);
       outputStream.writeUShort(this.beamAntennaPatternRecordCount);
       outputStream.writeUShort(this.directedEnergyTargetEnergyDepositionRecordCount);
       this.beamAntennaParameterList.encodeToBinary(outputStream);
       this.directedEnergyTargetEnergyDepositionRecordList.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.DirectedEnergyAreaAimpoint = dis7.DirectedEnergyAreaAimpoint;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.DirectedEnergyDamage = function()
{
   /** DE Record Type. */
   this.recordType = 4500;

   /** DE Record Length (bytes). */
   this.recordLength = 40;

   /** padding. */
   this.padding = 0;

   /** location of damage, relative to center of entity */
   this.damageLocation = new dis7.Vector3Float(); 

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
   this.fireEventID = new dis7.EventIdentifier(); 

   /** padding */
   this.padding2 = 0;

  dis7.DirectedEnergyDamage.prototype.initFromBinary = function(inputStream)
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

  dis7.DirectedEnergyDamage.prototype.encodeToBinary = function(outputStream)
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
exports.DirectedEnergyDamage = dis7.DirectedEnergyDamage;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.DirectedEnergyFirePdu = function()
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
   this.firingEntityID = new dis7.EntityID(); 

   /** ID of the entity that is being shot at */
   this.targetEntityID = new dis7.EntityID(); 

   /** Field shall identify the munition type enumeration for the DE weapon beam, Section 7.3.4  */
   this.munitionType = new dis7.EntityType(); 

   /** Field shall indicate the simulation time at start of the shot, Section 7.3.4  */
   this.shotStartTime = new dis7.ClockTime(); 

   /** Field shall indicate the current cumulative duration of the shot, Section 7.3.4  */
   this.commulativeShotTime = 0;

   /** Field shall identify the location of the DE weapon aperture/emitter, Section 7.3.4  */
   this.ApertureEmitterLocation = new dis7.Vector3Float(); 

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
 
  dis7.DirectedEnergyFirePdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.StandardVariableSpecification();
           anX.initFromBinary(inputStream);
           this.dERecords.push(anX);
       }

  };

  dis7.DirectedEnergyFirePdu.prototype.encodeToBinary = function(outputStream)
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
exports.DirectedEnergyFirePdu = dis7.DirectedEnergyFirePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.DirectedEnergyPrecisionAimpoint = function()
{
   /** Type of Record */
   this.recordType = 4000;

   /** Length of Record */
   this.recordLength = 88;

   /** Padding */
   this.padding = 0;

   /** Position of Target Spot in World Coordinates. */
   this.targetSpotLocation = new dis7.Vector3Double(); 

   /** Position (meters) of Target Spot relative to Entity Position. */
   this.targetSpotEntityLocation = new dis7.Vector3Float(); 

   /** Velocity (meters/sec) of Target Spot. */
   this.targetSpotVelocity = new dis7.Vector3Float(); 

   /** Acceleration (meters/sec/sec) of Target Spot. */
   this.targetSpotAcceleration = new dis7.Vector3Float(); 

   /** Unique ID of the target entity. */
   this.targetEntityID = new dis7.EntityID(); 

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

  dis7.DirectedEnergyPrecisionAimpoint.prototype.initFromBinary = function(inputStream)
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

  dis7.DirectedEnergyPrecisionAimpoint.prototype.encodeToBinary = function(outputStream)
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
exports.DirectedEnergyPrecisionAimpoint = dis7.DirectedEnergyPrecisionAimpoint;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.DirectedEnergyTargetEnergyDeposition = function()
{
   /** Unique ID of the target entity. */
   this.targetEntityID = new dis7.EntityID(); 

   /** padding */
   this.padding = 0;

   /** Peak irrandiance */
   this.peakIrradiance = 0;

  dis7.DirectedEnergyTargetEnergyDeposition.prototype.initFromBinary = function(inputStream)
  {
       this.targetEntityID.initFromBinary(inputStream);
       this.padding = inputStream.readUShort();
       this.peakIrradiance = inputStream.readFloat32();
  };

  dis7.DirectedEnergyTargetEnergyDeposition.prototype.encodeToBinary = function(outputStream)
  {
       this.targetEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding);
       outputStream.writeFloat32(this.peakIrradiance);
  };
}; // end of class

 // node.js module support
exports.DirectedEnergyTargetEnergyDeposition = dis7.DirectedEnergyTargetEnergyDeposition;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.DistributedEmissionsFamilyPdu = function()
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

  dis7.DistributedEmissionsFamilyPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.DistributedEmissionsFamilyPdu.prototype.encodeToBinary = function(outputStream)
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
exports.DistributedEmissionsFamilyPdu = dis7.DistributedEmissionsFamilyPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EEFundamentalParameterData = function()
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

  dis7.EEFundamentalParameterData.prototype.initFromBinary = function(inputStream)
  {
       this.frequency = inputStream.readFloat32();
       this.frequencyRange = inputStream.readFloat32();
       this.effectiveRadiatedPower = inputStream.readFloat32();
       this.pulseRepetitionFrequency = inputStream.readFloat32();
       this.pulseWidth = inputStream.readFloat32();
  };

  dis7.EEFundamentalParameterData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.frequency);
       outputStream.writeFloat32(this.frequencyRange);
       outputStream.writeFloat32(this.effectiveRadiatedPower);
       outputStream.writeFloat32(this.pulseRepetitionFrequency);
       outputStream.writeFloat32(this.pulseWidth);
  };
}; // end of class

 // node.js module support
exports.EEFundamentalParameterData = dis7.EEFundamentalParameterData;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EightByteChunk = function()
{
   /** Eight bytes of arbitrary data */
   this.otherParameters = new Array(0, 0, 0, 0, 0, 0, 0, 0);

  dis7.EightByteChunk.prototype.initFromBinary = function(inputStream)
  {
       for(var idx = 0; idx < 8; idx++)
       {
          this.otherParameters[ idx ] = inputStream.readByte();
       }
  };

  dis7.EightByteChunk.prototype.encodeToBinary = function(outputStream)
  {
       for(var idx = 0; idx < 8; idx++)
       {
          outputStream.writeByte(this.otherParameters[ idx ] );
       }
  };
}; // end of class

 // node.js module support
exports.EightByteChunk = dis7.EightByteChunk;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ElectronicEmissionsPdu = function()
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
   this.emittingEntityID = new dis7.EntityID(); 

   /** ID of event */
   this.eventID = new dis7.EventIdentifier(); 

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
   this.emitterSystem = new dis7.EmitterSystem(); 

   /** the location of the antenna beam source with respect to the emitting entity's coordinate system. This location shall be the origin of the emitter coordinate system that shall have the same orientation as the entity coordinate system. This field shall be represented by an Entity Coordinate Vector record see 6.2.95  */
   this.location = new dis7.Vector3Float(); 

   /** Electronic emmissions systems THIS IS WRONG. It has the WRONG class type and will cause problems in any marshalling. */
    this.systems = new Array();
 
  dis7.ElectronicEmissionsPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.Vector3Float();
           anX.initFromBinary(inputStream);
           this.systems.push(anX);
       }

  };

  dis7.ElectronicEmissionsPdu.prototype.encodeToBinary = function(outputStream)
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
exports.ElectronicEmissionsPdu = dis7.ElectronicEmissionsPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EmitterSystem = function()
{
   /** Name of the emitter, 16 bit enumeration */
   this.emitterName = 0;

   /** function of the emitter, 8 bit enumeration */
   this.emitterFunction = 0;

   /** emitter ID, 8 bit enumeration */
   this.emitterIDNumber = 0;

  dis7.EmitterSystem.prototype.initFromBinary = function(inputStream)
  {
       this.emitterName = inputStream.readUShort();
       this.emitterFunction = inputStream.readUByte();
       this.emitterIDNumber = inputStream.readUByte();
  };

  dis7.EmitterSystem.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.emitterName);
       outputStream.writeUByte(this.emitterFunction);
       outputStream.writeUByte(this.emitterIDNumber);
  };
}; // end of class

 // node.js module support
exports.EmitterSystem = dis7.EmitterSystem;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EngineFuel = function()
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

  dis7.EngineFuel.prototype.initFromBinary = function(inputStream)
  {
       this.fuelQuantity = inputStream.readUInt();
       this.fuelMeasurementUnits = inputStream.readUByte();
       this.fuelType = inputStream.readUByte();
       this.fuelLocation = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis7.EngineFuel.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.fuelQuantity);
       outputStream.writeUByte(this.fuelMeasurementUnits);
       outputStream.writeUByte(this.fuelType);
       outputStream.writeUByte(this.fuelLocation);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.EngineFuel = dis7.EngineFuel;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EngineFuelReload = function()
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

  dis7.EngineFuelReload.prototype.initFromBinary = function(inputStream)
  {
       this.standardQuantity = inputStream.readUInt();
       this.maximumQuantity = inputStream.readUInt();
       this.standardQuantityReloadTime = inputStream.readUInt();
       this.maximumQuantityReloadTime = inputStream.readUInt();
       this.fuelMeasurmentUnits = inputStream.readUByte();
       this.fuelLocation = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis7.EngineFuelReload.prototype.encodeToBinary = function(outputStream)
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
exports.EngineFuelReload = dis7.EngineFuelReload;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EntityAssociation = function()
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
   this.entityID = new dis7.EntityID(); 

   /** Station location on one's own entity. EBV doc. */
   this.ownStationLocation = 0;

   /** Type of physical connection. EBV doc */
   this.physicalConnectionType = 0;

   /** Type of member the entity is within th egroup */
   this.groupMemberType = 0;

   /** Group if any to which the entity belongs */
   this.groupNumber = 0;

  dis7.EntityAssociation.prototype.initFromBinary = function(inputStream)
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

  dis7.EntityAssociation.prototype.encodeToBinary = function(outputStream)
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
exports.EntityAssociation = dis7.EntityAssociation;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EntityDamageStatusPdu = function()
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
   this.firingEntityID = new dis7.EntityID(); 

   /** ID of the entity that is being shot at */
   this.targetEntityID = new dis7.EntityID(); 

   /** Field shall identify the damaged entity (see 6.2.28), Section 7.3.4 COMPLETE */
   this.damagedEntityID = new dis7.EntityID(); 

   /** Padding. */
   this.padding1 = 0;

   /** Padding. */
   this.padding2 = 0;

   /** field shall specify the number of Damage Description records, Section 7.3.5 */
   this.numberOfDamageDescription = 0;

   /** Fields shall contain one or more Damage Description records (see 6.2.17) and may contain other Standard Variable records, Section 7.3.5 */
    this.damageDescriptionRecords = new Array();
 
  dis7.EntityDamageStatusPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.DirectedEnergyDamage();
           anX.initFromBinary(inputStream);
           this.damageDescriptionRecords.push(anX);
       }

  };

  dis7.EntityDamageStatusPdu.prototype.encodeToBinary = function(outputStream)
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
exports.EntityDamageStatusPdu = dis7.EntityDamageStatusPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EntityID = function()
{
   /** Site ID */
   this.siteID = 0;

   /** application number ID */
   this.applicationID = 0;

   /** Entity number ID */
   this.entityID = 0;

  dis7.EntityID.prototype.initFromBinary = function(inputStream)
  {
       this.siteID = inputStream.readUShort();
       this.applicationID = inputStream.readUShort();
       this.entityID = inputStream.readUShort();
  };

  dis7.EntityID.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.siteID);
       outputStream.writeUShort(this.applicationID);
       outputStream.writeUShort(this.entityID);
  };
}; // end of class

 // node.js module support
exports.EntityID = dis7.EntityID;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EntityIdentifier = function()
{
   /** Site and application IDs */
   this.simulationAddress = new dis7.SimulationAddress(); 

   /** Entity number */
   this.entityNumber = 0;

  dis7.EntityIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.entityNumber = inputStream.readUShort();
  };

  dis7.EntityIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.entityNumber);
  };
}; // end of class

 // node.js module support
exports.EntityIdentifier = dis7.EntityIdentifier;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EntityInformationFamilyPdu = function()
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

  dis7.EntityInformationFamilyPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.EntityInformationFamilyPdu.prototype.encodeToBinary = function(outputStream)
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
exports.EntityInformationFamilyPdu = dis7.EntityInformationFamilyPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EntityManagementFamilyPdu = function()
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

  dis7.EntityManagementFamilyPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.EntityManagementFamilyPdu.prototype.encodeToBinary = function(outputStream)
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
exports.EntityManagementFamilyPdu = dis7.EntityManagementFamilyPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EntityMarking = function()
{
   /** The character set */
   this.characterSet = 0;

   /** The characters */
   this.characters = 0;

  dis7.EntityMarking.prototype.initFromBinary = function(inputStream)
  {
       this.characterSet = inputStream.readUByte();
       this.characters = inputStream.readByte();
  };

  dis7.EntityMarking.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.characterSet);
       outputStream.writeByte(this.characters);
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
exports.EntityMarking = dis7.EntityMarking;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EntityStatePdu = function()
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
   this.entityID = new dis7.EntityID(); 

   /** What force this entity is affiliated with, eg red, blue, neutral, etc */
   this.forceId = 0;

   /** How many variable parameters are in the variable length list. In earlier versions of DIS these were known as articulation parameters */
   this.numberOfVariableParameters = 0;

   /** Describes the type of entity in the world */
   this.entityType = new dis7.EntityType(); 

   this.alternativeEntityType = new dis7.EntityType(); 

   /** Describes the speed of the entity in the world */
   this.entityLinearVelocity = new dis7.Vector3Float(); 

   /** describes the location of the entity in the world */
   this.entityLocation = new dis7.Vector3Double(); 

   /** describes the orientation of the entity, in euler angles */
   this.entityOrientation = new dis7.EulerAngles(); 

   /** a series of bit flags that are used to help draw the entity, such as smoking, on fire, etc. */
   this.entityAppearance = 0;

   /** parameters used for dead reckoning */
   this.deadReckoningParameters = new dis7.DeadReckoningParameters(); 

   /** characters that can be used for debugging, or to draw unique strings on the side of entities in the world */
   this.marking = new dis7.EntityMarking(); 

   /** a series of bit flags */
   this.capabilities = 0;

   /** variable length list of variable parameters. In earlier DIS versions this was articulation parameters. */
    this.variableParameters = new Array();
 
  dis7.EntityStatePdu.prototype.initFromBinary = function(inputStream)
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
       this.forceId = inputStream.readUByte();
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
           var anX = new dis7.VariableParameter();
           anX.initFromBinary(inputStream);
           this.variableParameters.push(anX);
       }

  };

  dis7.EntityStatePdu.prototype.encodeToBinary = function(outputStream)
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
       outputStream.writeUByte(this.forceId);
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
}; // end of class

 // node.js module support
exports.EntityStatePdu = dis7.EntityStatePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EntityStateUpdatePdu = function()
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
   this.entityID = new dis7.EntityID(); 

   /** Padding */
   this.padding1 = 0;

   /** This field shall specify the number of variable parameters present. This field shall be represented by an 8-bit unsigned integer (see Annex I). */
   this.numberOfVariableParameters = 0;

   /** This field shall specify an entity’s linear velocity. The coordinate system for an entity’s linear velocity depends on the dead reckoning algorithm used. This field shall be represented by a Linear Velocity Vector record [see 6.2.95 item c)]). */
   this.entityLinearVelocity = new dis7.Vector3Float(); 

   /** This field shall specify an entity’s physical location in the simulated world and shall be represented by a World Coordinates record (see 6.2.97). */
   this.entityLocation = new dis7.Vector3Double(); 

   /** This field shall specify an entity’s orientation and shall be represented by an Euler Angles record (see 6.2.33). */
   this.entityOrientation = new dis7.EulerAngles(); 

   /** This field shall specify the dynamic changes to the entity’s appearance attributes. This field shall be represented by an Entity Appearance record (see 6.2.26). */
   this.entityAppearance = 0;

   /** This field shall specify the parameter values for each Variable Parameter record that is included (see 6.2.93 and Annex I). */
    this.variableParameters = new Array();
 
  dis7.EntityStateUpdatePdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.VariableParameter();
           anX.initFromBinary(inputStream);
           this.variableParameters.push(anX);
       }

  };

  dis7.EntityStateUpdatePdu.prototype.encodeToBinary = function(outputStream)
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
exports.EntityStateUpdatePdu = dis7.EntityStateUpdatePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EntityType = function()
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

  dis7.EntityType.prototype.initFromBinary = function(inputStream)
  {
       this.entityKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.country = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.specific = inputStream.readUByte();
       this.extra = inputStream.readUByte();
  };

  dis7.EntityType.prototype.encodeToBinary = function(outputStream)
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
exports.EntityType = dis7.EntityType;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EntityTypeVP = function()
{
   /** the identification of the Variable Parameter record. Enumeration from EBV */
   this.recordType = 3;

   /** Indicates if this VP has changed since last issuance */
   this.changeIndicator = 0;

   /**  */
   this.entityType = new dis7.EntityType(); 

   /** padding */
   this.padding = 0;

   /** padding */
   this.padding1 = 0;

  dis7.EntityTypeVP.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUByte();
       this.changeIndicator = inputStream.readUByte();
       this.entityType.initFromBinary(inputStream);
       this.padding = inputStream.readUShort();
       this.padding1 = inputStream.readUInt();
  };

  dis7.EntityTypeVP.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.recordType);
       outputStream.writeUByte(this.changeIndicator);
       this.entityType.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding);
       outputStream.writeUInt(this.padding1);
  };
}; // end of class

 // node.js module support
exports.EntityTypeVP = dis7.EntityTypeVP;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.Environment = function()
{
   /** type */
   this.environmentType = 0;

   /** length, in bits, of the record */
   this.length = 0;

   /** identifies the sequntially numbered record index */
   this.index = 0;

   /** padding */
   this.padding = 0;

  dis7.Environment.prototype.initFromBinary = function(inputStream)
  {
       this.environmentType = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.index = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis7.Environment.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.environmentType);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.index);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.Environment = dis7.Environment;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EnvironmentGeneral = function()
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

  dis7.EnvironmentGeneral.prototype.initFromBinary = function(inputStream)
  {
       this.environmentType = inputStream.readUInt();
       this.length = inputStream.readUByte();
       this.index = inputStream.readUByte();
       this.padding1 = inputStream.readUByte();
       this.geometry = inputStream.readUByte();
       this.padding2 = inputStream.readUByte();
  };

  dis7.EnvironmentGeneral.prototype.encodeToBinary = function(outputStream)
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
exports.EnvironmentGeneral = dis7.EnvironmentGeneral;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EnvironmentType = function()
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

  dis7.EnvironmentType.prototype.initFromBinary = function(inputStream)
  {
       this.entityKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.entityClass = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.specific = inputStream.readUByte();
       this.extra = inputStream.readUByte();
  };

  dis7.EnvironmentType.prototype.encodeToBinary = function(outputStream)
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
exports.EnvironmentType = dis7.EnvironmentType;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EulerAngles = function()
{
   this.psi = 0;

   this.theta = 0;

   this.phi = 0;

  dis7.EulerAngles.prototype.initFromBinary = function(inputStream)
  {
       this.psi = inputStream.readFloat32();
       this.theta = inputStream.readFloat32();
       this.phi = inputStream.readFloat32();
  };

  dis7.EulerAngles.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.psi);
       outputStream.writeFloat32(this.theta);
       outputStream.writeFloat32(this.phi);
  };
}; // end of class

 // node.js module support
exports.EulerAngles = dis7.EulerAngles;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EventIdentifier = function()
{
   /** Site and application IDs */
   this.simulationAddress = new dis7.SimulationAddress(); 

   this.eventNumber = 0;

  dis7.EventIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.eventNumber = inputStream.readUShort();
  };

  dis7.EventIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.eventNumber);
  };
}; // end of class

 // node.js module support
exports.EventIdentifier = dis7.EventIdentifier;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EventIdentifierLiveEntity = function()
{
   this.siteNumber = 0;

   this.applicationNumber = 0;

   this.eventNumber = 0;

  dis7.EventIdentifierLiveEntity.prototype.initFromBinary = function(inputStream)
  {
       this.siteNumber = inputStream.readUByte();
       this.applicationNumber = inputStream.readUByte();
       this.eventNumber = inputStream.readUShort();
  };

  dis7.EventIdentifierLiveEntity.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.siteNumber);
       outputStream.writeUByte(this.applicationNumber);
       outputStream.writeUShort(this.eventNumber);
  };
}; // end of class

 // node.js module support
exports.EventIdentifierLiveEntity = dis7.EventIdentifierLiveEntity;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EventReportPdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis7.EntityID(); 

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
 
  dis7.EventReportPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis7.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatums.push(anX);
       }

  };

  dis7.EventReportPdu.prototype.encodeToBinary = function(outputStream)
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
exports.EventReportPdu = dis7.EventReportPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.EventReportReliablePdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis7.EntityID(); 

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
 
  dis7.EventReportReliablePdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatumRecords.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis7.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumRecords.push(anX);
       }

  };

  dis7.EventReportReliablePdu.prototype.encodeToBinary = function(outputStream)
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
exports.EventReportReliablePdu = dis7.EventReportReliablePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.Expendable = function()
{
   /** Type of expendable */
   this.expendable = new dis7.EntityType(); 

   this.station = 0;

   this.quantity = 0;

   this.expendableStatus = 0;

   this.padding = 0;

  dis7.Expendable.prototype.initFromBinary = function(inputStream)
  {
       this.expendable.initFromBinary(inputStream);
       this.station = inputStream.readUInt();
       this.quantity = inputStream.readUShort();
       this.expendableStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis7.Expendable.prototype.encodeToBinary = function(outputStream)
  {
       this.expendable.encodeToBinary(outputStream);
       outputStream.writeUInt(this.station);
       outputStream.writeUShort(this.quantity);
       outputStream.writeUByte(this.expendableStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.Expendable = dis7.Expendable;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ExpendableDescriptor = function()
{
   /** Type of the object that exploded */
   this.expendableType = new dis7.EntityType(); 

   /** Padding */
   this.padding = 0;

  dis7.ExpendableDescriptor.prototype.initFromBinary = function(inputStream)
  {
       this.expendableType.initFromBinary(inputStream);
       this.padding = inputStream.readLong();
  };

  dis7.ExpendableDescriptor.prototype.encodeToBinary = function(outputStream)
  {
       this.expendableType.encodeToBinary(outputStream);
       outputStream.writeLong(this.padding);
  };
}; // end of class

 // node.js module support
exports.ExpendableDescriptor = dis7.ExpendableDescriptor;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ExpendableReload = function()
{
   /** Type of expendable */
   this.expendable = new dis7.EntityType(); 

   this.station = 0;

   this.standardQuantity = 0;

   this.maximumQuantity = 0;

   this.standardQuantityReloadTime = 0;

   this.maximumQuantityReloadTime = 0;

  dis7.ExpendableReload.prototype.initFromBinary = function(inputStream)
  {
       this.expendable.initFromBinary(inputStream);
       this.station = inputStream.readUInt();
       this.standardQuantity = inputStream.readUShort();
       this.maximumQuantity = inputStream.readUShort();
       this.standardQuantityReloadTime = inputStream.readUInt();
       this.maximumQuantityReloadTime = inputStream.readUInt();
  };

  dis7.ExpendableReload.prototype.encodeToBinary = function(outputStream)
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
exports.ExpendableReload = dis7.ExpendableReload;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ExplosionDescriptor = function()
{
   /** Type of the object that exploded. See 6.2.30 */
   this.explodingObject = new dis7.EntityType(); 

   /** Material that exploded. Can be grain dust, tnt, gasoline, etc. Enumeration */
   this.explosiveMaterial = 0;

   /** padding */
   this.padding = 0;

   /** Force of explosion, in equivalent KG of TNT */
   this.explosiveForce = 0;

  dis7.ExplosionDescriptor.prototype.initFromBinary = function(inputStream)
  {
       this.explodingObject.initFromBinary(inputStream);
       this.explosiveMaterial = inputStream.readUShort();
       this.padding = inputStream.readUShort();
       this.explosiveForce = inputStream.readFloat32();
  };

  dis7.ExplosionDescriptor.prototype.encodeToBinary = function(outputStream)
  {
       this.explodingObject.encodeToBinary(outputStream);
       outputStream.writeUShort(this.explosiveMaterial);
       outputStream.writeUShort(this.padding);
       outputStream.writeFloat32(this.explosiveForce);
  };
}; // end of class

 // node.js module support
exports.ExplosionDescriptor = dis7.ExplosionDescriptor;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.FalseTargetsAttribute = function()
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

  dis7.FalseTargetsAttribute.prototype.initFromBinary = function(inputStream)
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

  dis7.FalseTargetsAttribute.prototype.encodeToBinary = function(outputStream)
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
exports.FalseTargetsAttribute = dis7.FalseTargetsAttribute;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.FastEntityStatePdu = function()
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
   this.forceId = 0;

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
 
  dis7.FastEntityStatePdu.prototype.initFromBinary = function(inputStream)
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
       this.forceId = inputStream.readUByte();
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
           var anX = new dis7.VariableParameter();
           anX.initFromBinary(inputStream);
           this.variableParameters.push(anX);
       }

  };

  dis7.FastEntityStatePdu.prototype.encodeToBinary = function(outputStream)
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
       outputStream.writeUByte(this.forceId);
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
exports.FastEntityStatePdu = dis7.FastEntityStatePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.FirePdu = function()
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
   this.firingEntityID = new dis7.EntityID(); 

   /** ID of the entity that is being shot at */
   this.targetEntityID = new dis7.EntityID(); 

   /** This field shall specify the entity identification of the fired munition or expendable. This field shall be represented by an Entity Identifier record (see 6.2.28). */
   this.munitionExpendibleID = new dis7.EntityID(); 

   /** This field shall contain an identification generated by the firing entity to associate related firing and detonation events. This field shall be represented by an Event Identifier record (see 6.2.34). */
   this.eventID = new dis7.EventIdentifier(); 

   /** This field shall identify the fire mission (see 5.4.3.3). This field shall be representedby a 32-bit unsigned integer. */
   this.fireMissionIndex = 0;

   /** This field shall specify the location, in world coordinates, from which the munition was launched, and shall be represented by a World Coordinates record (see 6.2.97). */
   this.locationInWorldCoordinates = new dis7.Vector3Double(); 

   /** This field shall describe the firing or launch of a munition or expendable represented by one of the following types of Descriptor records: Munition Descriptor (6.2.20.2) or Expendable Descriptor (6.2.20.4). */
   this.descriptor = new dis7.MunitionDescriptor(); 

   /** This field shall specify the velocity of the fired munition at the point when the issuing simulation application intends the externally visible effects of the launch (e.g. exhaust plume or muzzle blast) to first become apparent. The velocity shall be represented in world coordinates. This field shall be represented by a Linear Velocity Vector record [see 6.2.95 item c)]. */
   this.velocity = new dis7.Vector3Float(); 

   /** This field shall specify the range that an entity’s fire control system has assumed in computing the fire control solution. This field shall be represented by a 32-bit floating point number in meters. For systems where range is unknown or unavailable, this field shall contain a value of zero. */
   this.range = 0;

  dis7.FirePdu.prototype.initFromBinary = function(inputStream)
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

  dis7.FirePdu.prototype.encodeToBinary = function(outputStream)
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
exports.FirePdu = dis7.FirePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.FixedDatum = function()
{
   /** ID of the fixed datum, an enumeration */
   this.fixedDatumID = 0;

   /** Value for the fixed datum */
   this.fixedDatumValue = 0;

  dis7.FixedDatum.prototype.initFromBinary = function(inputStream)
  {
       this.fixedDatumID = inputStream.readUInt();
       this.fixedDatumValue = inputStream.readUInt();
  };

  dis7.FixedDatum.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.fixedDatumID);
       outputStream.writeUInt(this.fixedDatumValue);
  };
}; // end of class

 // node.js module support
exports.FixedDatum = dis7.FixedDatum;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.FourByteChunk = function()
{
   /** four bytes of arbitrary data */
   this.otherParameters = new Array(0, 0, 0, 0);

  dis7.FourByteChunk.prototype.initFromBinary = function(inputStream)
  {
       for(var idx = 0; idx < 4; idx++)
       {
          this.otherParameters[ idx ] = inputStream.readByte();
       }
  };

  dis7.FourByteChunk.prototype.encodeToBinary = function(outputStream)
  {
       for(var idx = 0; idx < 4; idx++)
       {
          outputStream.writeByte(this.otherParameters[ idx ] );
       }
  };
}; // end of class

 // node.js module support
exports.FourByteChunk = dis7.FourByteChunk;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.FundamentalOperationalData = function()
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

  dis7.FundamentalOperationalData.prototype.initFromBinary = function(inputStream)
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

  dis7.FundamentalOperationalData.prototype.encodeToBinary = function(outputStream)
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
exports.FundamentalOperationalData = dis7.FundamentalOperationalData;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.GridAxis = function()
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

  dis7.GridAxis.prototype.initFromBinary = function(inputStream)
  {
       this.domainInitialXi = inputStream.readFloat64();
       this.domainFinalXi = inputStream.readFloat64();
       this.domainPointsXi = inputStream.readUShort();
       this.interleafFactor = inputStream.readUByte();
       this.axisType = inputStream.readUByte();
       this.numberOfPointsOnXiAxis = inputStream.readUShort();
       this.initialIndex = inputStream.readUShort();
  };

  dis7.GridAxis.prototype.encodeToBinary = function(outputStream)
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
exports.GridAxis = dis7.GridAxis;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.GridAxisDescriptorVariable = function()
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
 
  dis7.GridAxisDescriptorVariable.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.TwoByteChunk();
           anX.initFromBinary(inputStream);
           this.xiValues.push(anX);
       }

  };

  dis7.GridAxisDescriptorVariable.prototype.encodeToBinary = function(outputStream)
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
exports.GridAxisDescriptorVariable = dis7.GridAxisDescriptorVariable;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.GroupID = function()
{
   /** Simulation address (site and application number) */
   this.simulationAddress = new dis7.EntityType(); 

   /** group number */
   this.groupNumber = 0;

  dis7.GroupID.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.groupNumber = inputStream.readUShort();
  };

  dis7.GroupID.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.groupNumber);
  };
}; // end of class

 // node.js module support
exports.GroupID = dis7.GroupID;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.IFFData = function()
{
   /** enumeration for type of record */
   this.recordType = 0;

   /** length of record. Should be padded to 32 bit boundary. */
   this.recordLength = 0;

   /** IFF data. */
    this.iffData = new Array();
 
  dis7.IFFData.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       for(var idx = 0; idx < this.recordLength; idx++)
       {
           var anX = new dis7.OneByteChunk();
           anX.initFromBinary(inputStream);
           this.iffData.push(anX);
       }

  };

  dis7.IFFData.prototype.encodeToBinary = function(outputStream)
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
exports.IFFData = dis7.IFFData;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.IFFFundamentalParameterData = function()
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

  dis7.IFFFundamentalParameterData.prototype.initFromBinary = function(inputStream)
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

  dis7.IFFFundamentalParameterData.prototype.encodeToBinary = function(outputStream)
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
exports.IFFFundamentalParameterData = dis7.IFFFundamentalParameterData;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.IOCommunicationsNode = function()
{
   this.recordType = 5501;

   this.recordLength = 16;

   this.communcationsNodeType = 0;

   this.padding = 0;

   this.communicationsNodeID = new dis7.CommunicationsNodeID(); 

  dis7.IOCommunicationsNode.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.communcationsNodeType = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.communicationsNodeID.initFromBinary(inputStream);
  };

  dis7.IOCommunicationsNode.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUByte(this.communcationsNodeType);
       outputStream.writeUByte(this.padding);
       this.communicationsNodeID.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.IOCommunicationsNode = dis7.IOCommunicationsNode;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.IOEffect = function()
{
   this.recordType = 5500;

   this.recordLength = 16;

   this.ioStatus = 0;

   this.ioLinkType = 0;

   this.ioEffect = new dis7.EntityID(); 

   this.ioEffectDutyCycle = 0;

   this.ioEffectDuration = 0;

   this.ioProcess = 0;

   this.padding = 0;

  dis7.IOEffect.prototype.initFromBinary = function(inputStream)
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

  dis7.IOEffect.prototype.encodeToBinary = function(outputStream)
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
exports.IOEffect = dis7.IOEffect;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.IffDataSpecification = function()
{
   /** Number of iff records */
   this.numberOfIffDataRecords = 0;

   /** IFF data records */
    this.iffDataRecords = new Array();
 
  dis7.IffDataSpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfIffDataRecords = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfIffDataRecords; idx++)
       {
           var anX = new dis7.IFFData();
           anX.initFromBinary(inputStream);
           this.iffDataRecords.push(anX);
       }

  };

  dis7.IffDataSpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.numberOfIffDataRecords);
       for(var idx = 0; idx < this.iffDataRecords.length; idx++)
       {
           iffDataRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.IffDataSpecification = dis7.IffDataSpecification;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.IntercomCommunicationsParameters = function()
{
   /** Type of intercom parameters record */
   this.recordType = 0;

   /** length of record */
   this.recordLength = 0;

   /** This is a placeholder. */
   this.recordSpecificField = 0;

  dis7.IntercomCommunicationsParameters.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUShort();
       this.recordLength = inputStream.readUShort();
       this.recordSpecificField = inputStream.readUInt();
  };

  dis7.IntercomCommunicationsParameters.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUInt(this.recordSpecificField);
  };
}; // end of class

 // node.js module support
exports.IntercomCommunicationsParameters = dis7.IntercomCommunicationsParameters;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.IntercomControlPdu = function()
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
   this.sourceEntityID = new dis7.EntityID(); 

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
   this.masterEntityID = new dis7.EntityID(); 

   /** specific intercom device that has created this intercom channel */
   this.masterCommunicationsDeviceID = 0;

   /** number of intercom parameters */
   this.intercomParametersLength = 0;

   /** ^^^This is wrong the length of the data field is variable. Using a long for now. */
    this.intercomParameters = new Array();
 
  dis7.IntercomControlPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.IntercomCommunicationsParameters();
           anX.initFromBinary(inputStream);
           this.intercomParameters.push(anX);
       }

  };

  dis7.IntercomControlPdu.prototype.encodeToBinary = function(outputStream)
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
exports.IntercomControlPdu = dis7.IntercomControlPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.IntercomIdentifier = function()
{
   this.siteNumber = 0;

   this.applicationNumber = 0;

   this.referenceNumber = 0;

   this.intercomNumber = 0;

  dis7.IntercomIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.siteNumber = inputStream.readUShort();
       this.applicationNumber = inputStream.readUShort();
       this.referenceNumber = inputStream.readUShort();
       this.intercomNumber = inputStream.readUShort();
  };

  dis7.IntercomIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.siteNumber);
       outputStream.writeUShort(this.applicationNumber);
       outputStream.writeUShort(this.referenceNumber);
       outputStream.writeUShort(this.intercomNumber);
  };
}; // end of class

 // node.js module support
exports.IntercomIdentifier = dis7.IntercomIdentifier;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.IntercomSignalPdu = function()
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
   this.entityID = new dis7.EntityID(); 

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
 
  dis7.IntercomSignalPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.OneByteChunk();
           anX.initFromBinary(inputStream);
           this.data.push(anX);
       }

  };

  dis7.IntercomSignalPdu.prototype.encodeToBinary = function(outputStream)
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
exports.IntercomSignalPdu = dis7.IntercomSignalPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.IsPartOfPdu = function()
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
   this.orginatingEntityID = new dis7.EntityID(); 

   /** ID of entity receiving PDU */
   this.receivingEntityID = new dis7.EntityID(); 

   /** relationship of joined parts */
   this.relationship = new dis7.Relationship(); 

   /** location of part; centroid of part in host's coordinate system. x=range, y=bearing, z=0 */
   this.partLocation = new dis7.Vector3Float(); 

   /** named location */
   this.namedLocationID = new dis7.NamedLocationIdentification(); 

   /** entity type */
   this.partEntityType = new dis7.EntityType(); 

  dis7.IsPartOfPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.IsPartOfPdu.prototype.encodeToBinary = function(outputStream)
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
exports.IsPartOfPdu = dis7.IsPartOfPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.JammingTechnique = function()
{
   this.kind = 0;

   this.category = 0;

   this.subcategory = 0;

   this.specific = 0;

  dis7.JammingTechnique.prototype.initFromBinary = function(inputStream)
  {
       this.kind = inputStream.readUByte();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.specific = inputStream.readUByte();
  };

  dis7.JammingTechnique.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.kind);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
       outputStream.writeUByte(this.specific);
  };
}; // end of class

 // node.js module support
exports.JammingTechnique = dis7.JammingTechnique;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.LaunchedMunitionRecord = function()
{
   this.fireEventID = new dis7.EventIdentifier(); 

   this.padding = 0;

   this.firingEntityID = new dis7.EventIdentifier(); 

   this.padding2 = 0;

   this.targetEntityID = new dis7.EventIdentifier(); 

   this.padding3 = 0;

   this.targetLocation = new dis7.Vector3Double(); 

  dis7.LaunchedMunitionRecord.prototype.initFromBinary = function(inputStream)
  {
       this.fireEventID.initFromBinary(inputStream);
       this.padding = inputStream.readUShort();
       this.firingEntityID.initFromBinary(inputStream);
       this.padding2 = inputStream.readUShort();
       this.targetEntityID.initFromBinary(inputStream);
       this.padding3 = inputStream.readUShort();
       this.targetLocation.initFromBinary(inputStream);
  };

  dis7.LaunchedMunitionRecord.prototype.encodeToBinary = function(outputStream)
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
exports.LaunchedMunitionRecord = dis7.LaunchedMunitionRecord;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.LayerHeader = function()
{
   this.layerNumber = 0;

   /** field shall specify layer-specific information that varies by System Type (see 6.2.86) and Layer Number. */
   this.layerSpecificInformation = 0;

   /** This field shall specify the length in octets of the layer, including the Layer Header record */
   this.length = 0;

  dis7.LayerHeader.prototype.initFromBinary = function(inputStream)
  {
       this.layerNumber = inputStream.readUByte();
       this.layerSpecificInformation = inputStream.readUByte();
       this.length = inputStream.readUShort();
  };

  dis7.LayerHeader.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.layerNumber);
       outputStream.writeUByte(this.layerSpecificInformation);
       outputStream.writeUShort(this.length);
  };
}; // end of class

 // node.js module support
exports.LayerHeader = dis7.LayerHeader;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.LinearObjectStatePdu = function()
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
   this.objectID = new dis7.EntityID(); 

   /** Object with which this point object is associated */
   this.referencedObjectID = new dis7.EntityID(); 

   /** unique update number of each state transition of an object */
   this.updateNumber = 0;

   /** force ID */
   this.forceID = 0;

   /** number of linear segment parameters */
   this.numberOfSegments = 0;

   /** requesterID */
   this.requesterID = new dis7.SimulationAddress(); 

   /** receiver ID */
   this.receivingID = new dis7.SimulationAddress(); 

   /** Object type */
   this.objectType = new dis7.ObjectType(); 

   /** Linear segment parameters */
    this.linearSegmentParameters = new Array();
 
  dis7.LinearObjectStatePdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.LinearSegmentParameter();
           anX.initFromBinary(inputStream);
           this.linearSegmentParameters.push(anX);
       }

  };

  dis7.LinearObjectStatePdu.prototype.encodeToBinary = function(outputStream)
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
exports.LinearObjectStatePdu = dis7.LinearObjectStatePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.LinearSegmentParameter = function()
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
   this.segmentLocation = new dis7.Vector3Double(); 

   /** orientation of the linear segment about the segment location and shall be represented by a Euler Angles record  */
   this.segmentOrientation = new dis7.EulerAngles(); 

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

  dis7.LinearSegmentParameter.prototype.initFromBinary = function(inputStream)
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

  dis7.LinearSegmentParameter.prototype.encodeToBinary = function(outputStream)
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
exports.LinearSegmentParameter = dis7.LinearSegmentParameter;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.LiveEntityIdentifier = function()
{
   /** Live Simulation Address record (see 6.2.54)  */
   this.liveSimulationAddress = new dis7.LiveSimulationAddress(); 

   /** Live entity number  */
   this.entityNumber = 0;

  dis7.LiveEntityIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.liveSimulationAddress.initFromBinary(inputStream);
       this.entityNumber = inputStream.readUShort();
  };

  dis7.LiveEntityIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.liveSimulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.entityNumber);
  };
}; // end of class

 // node.js module support
exports.LiveEntityIdentifier = dis7.LiveEntityIdentifier;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.LiveEntityPdu = function()
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

  dis7.LiveEntityPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.LiveEntityPdu.prototype.encodeToBinary = function(outputStream)
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
exports.LiveEntityPdu = dis7.LiveEntityPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.LiveSimulationAddress = function()
{
   /** facility, installation, organizational unit or geographic location may have multiple sites associated with it. The Site Number is the first component of the Live Simulation Address, which defines a live simulation. */
   this.liveSiteNumber = 0;

   /** An application associated with a live site is termed a live application. Each live application participating in an event  */
   this.liveApplicationNumber = 0;

  dis7.LiveSimulationAddress.prototype.initFromBinary = function(inputStream)
  {
       this.liveSiteNumber = inputStream.readUByte();
       this.liveApplicationNumber = inputStream.readUByte();
  };

  dis7.LiveSimulationAddress.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.liveSiteNumber);
       outputStream.writeUByte(this.liveApplicationNumber);
  };
}; // end of class

 // node.js module support
exports.LiveSimulationAddress = dis7.LiveSimulationAddress;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.LogisticsFamilyPdu = function()
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

  dis7.LogisticsFamilyPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.LogisticsFamilyPdu.prototype.encodeToBinary = function(outputStream)
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
exports.LogisticsFamilyPdu = dis7.LogisticsFamilyPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.MineEntityIdentifier = function()
{
   /**  */
   this.simulationAddress = new dis7.SimulationAddress(); 

   /**  */
   this.mineEntityNumber = 0;

  dis7.MineEntityIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.mineEntityNumber = inputStream.readUShort();
  };

  dis7.MineEntityIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.mineEntityNumber);
  };
}; // end of class

 // node.js module support
exports.MineEntityIdentifier = dis7.MineEntityIdentifier;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.MinefieldFamilyPdu = function()
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

  dis7.MinefieldFamilyPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.MinefieldFamilyPdu.prototype.encodeToBinary = function(outputStream)
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
exports.MinefieldFamilyPdu = dis7.MinefieldFamilyPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.MinefieldIdentifier = function()
{
   /**  */
   this.simulationAddress = new dis7.SimulationAddress(); 

   /**  */
   this.minefieldNumber = 0;

  dis7.MinefieldIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.minefieldNumber = inputStream.readUShort();
  };

  dis7.MinefieldIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.minefieldNumber);
  };
}; // end of class

 // node.js module support
exports.MinefieldIdentifier = dis7.MinefieldIdentifier;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.MinefieldResponseNackPdu = function()
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
   this.minefieldID = new dis7.EntityID(); 

   /** entity ID making the request */
   this.requestingEntityID = new dis7.EntityID(); 

   /** request ID */
   this.requestID = 0;

   /** how many pdus were missing */
   this.numberOfMissingPdus = 0;

   /** PDU sequence numbers that were missing */
    this.missingPduSequenceNumbers = new Array();
 
  dis7.MinefieldResponseNackPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.EightByteChunk();
           anX.initFromBinary(inputStream);
           this.missingPduSequenceNumbers.push(anX);
       }

  };

  dis7.MinefieldResponseNackPdu.prototype.encodeToBinary = function(outputStream)
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
exports.MinefieldResponseNackPdu = dis7.MinefieldResponseNackPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.MinefieldSensorType = function()
{
   /** sensor type. bit fields 0-3 are the type category, 4-15 are teh subcategory */
   this.sensorType = 0;

  dis7.MinefieldSensorType.prototype.initFromBinary = function(inputStream)
  {
       this.sensorType = inputStream.readUShort();
  };

  dis7.MinefieldSensorType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.sensorType);
  };
}; // end of class

 // node.js module support
exports.MinefieldSensorType = dis7.MinefieldSensorType;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.MinefieldStatePdu = function()
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
   this.minefieldID = new dis7.MinefieldIdentifier(); 

   /** Minefield sequence */
   this.minefieldSequence = 0;

   /** force ID */
   this.forceID = 0;

   /** Number of permieter points */
   this.numberOfPerimeterPoints = 0;

   /** type of minefield */
   this.minefieldType = new dis7.EntityType(); 

   /** how many mine types */
   this.numberOfMineTypes = 0;

   /** location of center of minefield in world coords */
   this.minefieldLocation = new dis7.Vector3Double(); 

   /** orientation of minefield */
   this.minefieldOrientation = new dis7.EulerAngles(); 

   /** appearance bitflags */
   this.appearance = 0;

   /** protocolMode. First two bits are the protocol mode, 14 bits reserved. */
   this.protocolMode = 0;

   /** perimeter points for the minefield */
    this.perimeterPoints = new Array();
 
   /** Type of mines */
    this.mineType = new Array();
 
  dis7.MinefieldStatePdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.Vector2Float();
           anX.initFromBinary(inputStream);
           this.perimeterPoints.push(anX);
       }

       for(var idx = 0; idx < this.numberOfMineTypes; idx++)
       {
           var anX = new dis7.EntityType();
           anX.initFromBinary(inputStream);
           this.mineType.push(anX);
       }

  };

  dis7.MinefieldStatePdu.prototype.encodeToBinary = function(outputStream)
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
exports.MinefieldStatePdu = dis7.MinefieldStatePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ModulationParameters = function()
{
  dis7.ModulationParameters.prototype.initFromBinary = function(inputStream)
  {
  };

  dis7.ModulationParameters.prototype.encodeToBinary = function(outputStream)
  {
  };
}; // end of class

 // node.js module support
exports.ModulationParameters = dis7.ModulationParameters;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ModulationType = function()
{
   /** This field shall indicate the spread spectrum technique or combination of spread spectrum techniques in use. Bit field. 0=freq hopping, 1=psuedo noise, time hopping=2, reamining bits unused */
   this.spreadSpectrum = 0;

   /** the major classification of the modulation type.  */
   this.majorModulation = 0;

   /** provide certain detailed information depending upon the major modulation type */
   this.detail = 0;

   /** the radio system associated with this Transmitter PDU and shall be used as the basis to interpret other fields whose values depend on a specific radio system. */
   this.radioSystem = 0;

  dis7.ModulationType.prototype.initFromBinary = function(inputStream)
  {
       this.spreadSpectrum = inputStream.readUShort();
       this.majorModulation = inputStream.readUShort();
       this.detail = inputStream.readUShort();
       this.radioSystem = inputStream.readUShort();
  };

  dis7.ModulationType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.spreadSpectrum);
       outputStream.writeUShort(this.majorModulation);
       outputStream.writeUShort(this.detail);
       outputStream.writeUShort(this.radioSystem);
  };
}; // end of class

 // node.js module support
exports.ModulationType = dis7.ModulationType;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.Munition = function()
{
   /**  This field shall identify the entity type of the munition. See section 6.2.30. */
   this.munitionType = new dis7.EntityType(); 

   /** the station or launcher to which the munition is assigned. See Annex I */
   this.station = 0;

   /** the quantity remaining of this munition. */
   this.quantity = 0;

   /**  the status of the munition. It shall be represented by an 8-bit enumeration.  */
   this.munitionStatus = 0;

   /** padding  */
   this.padding = 0;

  dis7.Munition.prototype.initFromBinary = function(inputStream)
  {
       this.munitionType.initFromBinary(inputStream);
       this.station = inputStream.readUInt();
       this.quantity = inputStream.readUShort();
       this.munitionStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis7.Munition.prototype.encodeToBinary = function(outputStream)
  {
       this.munitionType.encodeToBinary(outputStream);
       outputStream.writeUInt(this.station);
       outputStream.writeUShort(this.quantity);
       outputStream.writeUByte(this.munitionStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.Munition = dis7.Munition;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.MunitionDescriptor = function()
{
   /** What munition was used in the burst */
   this.munitionType = new dis7.EntityType(); 

   /** type of warhead enumeration */
   this.warhead = 0;

   /** type of fuse used enumeration */
   this.fuse = 0;

   /** how many of the munition were fired */
   this.quantity = 0;

   /** rate at which the munition was fired */
   this.rate = 0;

  dis7.MunitionDescriptor.prototype.initFromBinary = function(inputStream)
  {
       this.munitionType.initFromBinary(inputStream);
       this.warhead = inputStream.readUShort();
       this.fuse = inputStream.readUShort();
       this.quantity = inputStream.readUShort();
       this.rate = inputStream.readUShort();
  };

  dis7.MunitionDescriptor.prototype.encodeToBinary = function(outputStream)
  {
       this.munitionType.encodeToBinary(outputStream);
       outputStream.writeUShort(this.warhead);
       outputStream.writeUShort(this.fuse);
       outputStream.writeUShort(this.quantity);
       outputStream.writeUShort(this.rate);
  };
}; // end of class

 // node.js module support
exports.MunitionDescriptor = dis7.MunitionDescriptor;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.MunitionReload = function()
{
   /**  This field shall identify the entity type of the munition. See section 6.2.30. */
   this.munitionType = new dis7.EntityType(); 

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

  dis7.MunitionReload.prototype.initFromBinary = function(inputStream)
  {
       this.munitionType.initFromBinary(inputStream);
       this.station = inputStream.readUInt();
       this.standardQuantity = inputStream.readUShort();
       this.maximumQuantity = inputStream.readUShort();
       this.standardQuantityReloadTime = inputStream.readUInt();
       this.maximumQuantityReloadTime = inputStream.readUInt();
  };

  dis7.MunitionReload.prototype.encodeToBinary = function(outputStream)
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
exports.MunitionReload = dis7.MunitionReload;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.NamedLocationIdentification = function()
{
   /** the station name within the host at which the part entity is located. If the part entity is On Station, this field shall specify the representation of the part’s location data fields. This field shall be specified by a 16-bit enumeration  */
   this.stationName = 0;

   /** the number of the particular wing station, cargo hold etc., at which the part is attached.  */
   this.stationNumber = 0;

  dis7.NamedLocationIdentification.prototype.initFromBinary = function(inputStream)
  {
       this.stationName = inputStream.readUShort();
       this.stationNumber = inputStream.readUShort();
  };

  dis7.NamedLocationIdentification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.stationName);
       outputStream.writeUShort(this.stationNumber);
  };
}; // end of class

 // node.js module support
exports.NamedLocationIdentification = dis7.NamedLocationIdentification;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ObjectIdentifier = function()
{
   /**  Simulation Address */
   this.simulationAddress = new dis7.SimulationAddress(); 

   /** object number */
   this.objectNumber = 0;

  dis7.ObjectIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.objectNumber = inputStream.readUShort();
  };

  dis7.ObjectIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.objectNumber);
  };
}; // end of class

 // node.js module support
exports.ObjectIdentifier = dis7.ObjectIdentifier;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ObjectType = function()
{
   /** Domain of entity (air, surface, subsurface, space, etc) */
   this.domain = 0;

   /** country to which the design of the entity is attributed */
   this.objectKind = 0;

   /** category of entity */
   this.category = 0;

   /** subcategory of entity */
   this.subcategory = 0;

  dis7.ObjectType.prototype.initFromBinary = function(inputStream)
  {
       this.domain = inputStream.readUByte();
       this.objectKind = inputStream.readUByte();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
  };

  dis7.ObjectType.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.domain);
       outputStream.writeUByte(this.objectKind);
       outputStream.writeUByte(this.category);
       outputStream.writeUByte(this.subcategory);
  };
}; // end of class

 // node.js module support
exports.ObjectType = dis7.ObjectType;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.OneByteChunk = function()
{
   /** one byte of arbitrary data */
   this.otherParameters = new Array(0);

  dis7.OneByteChunk.prototype.initFromBinary = function(inputStream)
  {
       for(var idx = 0; idx < 1; idx++)
       {
          this.otherParameters[ idx ] = inputStream.readByte();
       }
  };

  dis7.OneByteChunk.prototype.encodeToBinary = function(outputStream)
  {
       for(var idx = 0; idx < 1; idx++)
       {
          outputStream.writeByte(this.otherParameters[ idx ] );
       }
  };
}; // end of class

 // node.js module support
exports.OneByteChunk = dis7.OneByteChunk;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.OwnershipStatus = function()
{
   /** EntityID */
   this.entityId = new dis7.EntityID(); 

   /** The ownership and/or ownership conflict status of the entity represented by the Entity ID field. */
   this.ownershipStatus = 0;

   /** padding */
   this.padding = 0;

  dis7.OwnershipStatus.prototype.initFromBinary = function(inputStream)
  {
       this.entityId.initFromBinary(inputStream);
       this.ownershipStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis7.OwnershipStatus.prototype.encodeToBinary = function(outputStream)
  {
       this.entityId.encodeToBinary(outputStream);
       outputStream.writeUByte(this.ownershipStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.OwnershipStatus = dis7.OwnershipStatus;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.Pdu = function()
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

  dis7.Pdu.prototype.initFromBinary = function(inputStream)
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

  dis7.Pdu.prototype.encodeToBinary = function(outputStream)
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
exports.Pdu = dis7.Pdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.PduContainer = function()
{
   /** Number of PDUs in the container list */
   this.numberOfPdus = 0;

   /** List of PDUs */
    this.pdus = new Array();
 
  dis7.PduContainer.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfPdus = inputStream.readInt();
       for(var idx = 0; idx < this.numberOfPdus; idx++)
       {
           var anX = new dis7.Pdu();
           anX.initFromBinary(inputStream);
           this.pdus.push(anX);
       }

  };

  dis7.PduContainer.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeInt(this.numberOfPdus);
       for(var idx = 0; idx < this.pdus.length; idx++)
       {
           pdus[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.PduContainer = dis7.PduContainer;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.PduHeader = function()
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

  dis7.PduHeader.prototype.initFromBinary = function(inputStream)
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

  dis7.PduHeader.prototype.encodeToBinary = function(outputStream)
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
exports.PduHeader = dis7.PduHeader;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.PduStatus = function()
{
   /** Bit fields. The semantics of the bit fields depend on the PDU type */
   this.pduStatus = 0;

  dis7.PduStatus.prototype.initFromBinary = function(inputStream)
  {
       this.pduStatus = inputStream.readUByte();
  };

  dis7.PduStatus.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.pduStatus);
  };
}; // end of class

 // node.js module support
exports.PduStatus = dis7.PduStatus;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.PduStream = function()
{
   /** Longish description of this PDU stream */
   this.description = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /** short description of this PDU stream */
   this.name = new Array(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

   /** Start time of recording, in Unix time (seconds since epoch) */
   this.startTime = 0;

   /** stop time of recording, in Unix time (seconds since epoch) */
   this.stopTime = 0;

  dis7.PduStream.prototype.initFromBinary = function(inputStream)
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

  dis7.PduStream.prototype.encodeToBinary = function(outputStream)
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
exports.PduStream = dis7.PduStream;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.PduSuperclass = function()
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

  dis7.PduSuperclass.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
  };

  dis7.PduSuperclass.prototype.encodeToBinary = function(outputStream)
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
exports.PduSuperclass = dis7.PduSuperclass;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.PointObjectStatePdu = function()
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
   this.objectID = new dis7.EntityID(); 

   /** Object with which this point object is associated */
   this.referencedObjectID = new dis7.EntityID(); 

   /** unique update number of each state transition of an object */
   this.updateNumber = 0;

   /** force ID */
   this.forceID = 0;

   /** modifications */
   this.modifications = 0;

   /** Object type */
   this.objectType = new dis7.ObjectType(); 

   /** Object location */
   this.objectLocation = new dis7.Vector3Double(); 

   /** Object orientation */
   this.objectOrientation = new dis7.EulerAngles(); 

   /** Object apperance */
   this.objectAppearance = 0;

   /** requesterID */
   this.requesterID = new dis7.SimulationAddress(); 

   /** receiver ID */
   this.receivingID = new dis7.SimulationAddress(); 

   /** padding */
   this.pad2 = 0;

  dis7.PointObjectStatePdu.prototype.initFromBinary = function(inputStream)
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

  dis7.PointObjectStatePdu.prototype.encodeToBinary = function(outputStream)
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
exports.PointObjectStatePdu = dis7.PointObjectStatePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.PropulsionSystemData = function()
{
   /** powerSetting */
   this.powerSetting = 0;

   /** engine RPMs */
   this.engineRpm = 0;

  dis7.PropulsionSystemData.prototype.initFromBinary = function(inputStream)
  {
       this.powerSetting = inputStream.readFloat32();
       this.engineRpm = inputStream.readFloat32();
  };

  dis7.PropulsionSystemData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.powerSetting);
       outputStream.writeFloat32(this.engineRpm);
  };
}; // end of class

 // node.js module support
exports.PropulsionSystemData = dis7.PropulsionSystemData;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ProtocolMode = function()
{
   /** Bitfields, 14-15 contain an enum */
   this.protocolMode = 0;

  dis7.ProtocolMode.prototype.initFromBinary = function(inputStream)
  {
       this.protocolMode = inputStream.readUShort();
  };

  dis7.ProtocolMode.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.protocolMode);
  };
}; // end of class

 // node.js module support
exports.ProtocolMode = dis7.ProtocolMode;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.RadioCommunicationsFamilyPdu = function()
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

  dis7.RadioCommunicationsFamilyPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.RadioCommunicationsFamilyPdu.prototype.encodeToBinary = function(outputStream)
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
exports.RadioCommunicationsFamilyPdu = dis7.RadioCommunicationsFamilyPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.RadioIdentifier = function()
{
   /**  site */
   this.siteNumber = 0;

   /** application number */
   this.applicationNumber = 0;

   /**  reference number */
   this.referenceNumber = 0;

   /**  Radio number */
   this.radioNumber = 0;

  dis7.RadioIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.siteNumber = inputStream.readUShort();
       this.applicationNumber = inputStream.readUShort();
       this.referenceNumber = inputStream.readUShort();
       this.radioNumber = inputStream.readUShort();
  };

  dis7.RadioIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.siteNumber);
       outputStream.writeUShort(this.applicationNumber);
       outputStream.writeUShort(this.referenceNumber);
       outputStream.writeUShort(this.radioNumber);
  };
}; // end of class

 // node.js module support
exports.RadioIdentifier = dis7.RadioIdentifier;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.RadioType = function()
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

  dis7.RadioType.prototype.initFromBinary = function(inputStream)
  {
       this.entityKind = inputStream.readUByte();
       this.domain = inputStream.readUByte();
       this.country = inputStream.readUShort();
       this.category = inputStream.readUByte();
       this.subcategory = inputStream.readUByte();
       this.specific = inputStream.readUByte();
       this.extra = inputStream.readUByte();
  };

  dis7.RadioType.prototype.encodeToBinary = function(outputStream)
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
exports.RadioType = dis7.RadioType;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ReceiverPdu = function()
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
   this.transmitterEntityId = new dis7.EntityID(); 

   /** ID of transmitting radio */
   this.transmitterRadioId = 0;

  dis7.ReceiverPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.ReceiverPdu.prototype.encodeToBinary = function(outputStream)
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
exports.ReceiverPdu = dis7.ReceiverPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.RecordQueryReliablePdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis7.EntityID(); 

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
 
  dis7.RecordQueryReliablePdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.FourByteChunk();
           anX.initFromBinary(inputStream);
           this.recordIDs.push(anX);
       }

  };

  dis7.RecordQueryReliablePdu.prototype.encodeToBinary = function(outputStream)
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
exports.RecordQueryReliablePdu = dis7.RecordQueryReliablePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.RecordQuerySpecification = function()
{
   this.numberOfRecords = 0;

   /** variable length list of 32 bit records */
    this.records = new Array();
 
  dis7.RecordQuerySpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfRecords; idx++)
       {
           var anX = new dis7.FourByteChunk();
           anX.initFromBinary(inputStream);
           this.records.push(anX);
       }

  };

  dis7.RecordQuerySpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.numberOfRecords);
       for(var idx = 0; idx < this.records.length; idx++)
       {
           records[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.RecordQuerySpecification = dis7.RecordQuerySpecification;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.RecordSpecification = function()
{
   /** The number of record sets */
   this.numberOfRecordSets = 0;

   /** variable length list record specifications. */
    this.recordSets = new Array();
 
  dis7.RecordSpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfRecordSets = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfRecordSets; idx++)
       {
           var anX = new dis7.RecordSpecificationElement();
           anX.initFromBinary(inputStream);
           this.recordSets.push(anX);
       }

  };

  dis7.RecordSpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.numberOfRecordSets);
       for(var idx = 0; idx < this.recordSets.length; idx++)
       {
           recordSets[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.RecordSpecification = dis7.RecordSpecification;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.RecordSpecificationElement = function()
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

  dis7.RecordSpecificationElement.prototype.initFromBinary = function(inputStream)
  {
       this.recordID = inputStream.readUInt();
       this.recordSetSerialNumber = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.recordCount = inputStream.readUShort();
       this.recordValues = inputStream.readUShort();
       this.pad4 = inputStream.readUByte();
  };

  dis7.RecordSpecificationElement.prototype.encodeToBinary = function(outputStream)
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
exports.RecordSpecificationElement = dis7.RecordSpecificationElement;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.Relationship = function()
{
   /** the nature or purpose for joining of the part entity to the host entity and shall be represented by a 16-bit enumeration */
   this.nature = 0;

   /** the position of the part entity with respect to the host entity and shall be represented by a 16-bit enumeration */
   this.position = 0;

  dis7.Relationship.prototype.initFromBinary = function(inputStream)
  {
       this.nature = inputStream.readUShort();
       this.position = inputStream.readUShort();
  };

  dis7.Relationship.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.nature);
       outputStream.writeUShort(this.position);
  };
}; // end of class

 // node.js module support
exports.Relationship = dis7.Relationship;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.RemoveEntityPdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis7.EntityID(); 

   /** Identifier for originating entity(or simulation) */
   this.originatingID = new dis7.EntityID(); 

   /** Identifier for the receiving entity(or simulation) */
   this.receivingID = new dis7.EntityID(); 

   /** This field shall identify the specific and unique start/resume request being made by the SM */
   this.requestID = 0;

  dis7.RemoveEntityPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.RemoveEntityPdu.prototype.encodeToBinary = function(outputStream)
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
exports.RemoveEntityPdu = dis7.RemoveEntityPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.RemoveEntityReliablePdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis7.EntityID(); 

   /** level of reliability service used for this transaction */
   this.requiredReliabilityService = 0;

   /** padding */
   this.pad1 = 0;

   /** padding */
   this.pad2 = 0;

   /** Request ID */
   this.requestID = 0;

  dis7.RemoveEntityReliablePdu.prototype.initFromBinary = function(inputStream)
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

  dis7.RemoveEntityReliablePdu.prototype.encodeToBinary = function(outputStream)
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
exports.RemoveEntityReliablePdu = dis7.RemoveEntityReliablePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.RepairCompletePdu = function()
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
   this.receivingEntityID = new dis7.EntityID(); 

   /** Entity that is supplying.  See 6.2.28 */
   this.repairingEntityID = new dis7.EntityID(); 

   /** Enumeration for type of repair.  See 6.2.74 */
   this.repair = 0;

   /** padding, number prevents conflict with superclass ivar name */
   this.padding4 = 0;

  dis7.RepairCompletePdu.prototype.initFromBinary = function(inputStream)
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

  dis7.RepairCompletePdu.prototype.encodeToBinary = function(outputStream)
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
exports.RepairCompletePdu = dis7.RepairCompletePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.RepairResponsePdu = function()
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
   this.receivingEntityID = new dis7.EntityID(); 

   /** Entity that is repairing.  See 6.2.28 */
   this.repairingEntityID = new dis7.EntityID(); 

   /** Result of repair operation */
   this.repairResult = 0;

   /** padding */
   this.padding1 = 0;

   /** padding */
   this.padding2 = 0;

  dis7.RepairResponsePdu.prototype.initFromBinary = function(inputStream)
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

  dis7.RepairResponsePdu.prototype.encodeToBinary = function(outputStream)
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
exports.RepairResponsePdu = dis7.RepairResponsePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.RequestID = function()
{
   /** monotonically increasing number */
   this.requestID = 0;

  dis7.RequestID.prototype.initFromBinary = function(inputStream)
  {
       this.requestID = inputStream.readUInt();
  };

  dis7.RequestID.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.requestID);
  };
}; // end of class

 // node.js module support
exports.RequestID = dis7.RequestID;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ResupplyOfferPdu = function()
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
   this.receivingEntityID = new dis7.EntityID(); 

   /** Identifies the Entity and respective Entity ID Record that is supplying  (see 6.2.28), Section 7.4.3 */
   this.supplyingEntityID = new dis7.EntityID(); 

   /** How many supplies types are being offered, Section 7.4.3 */
   this.numberOfSupplyTypes = 0;

   /** padding */
   this.padding1 = 0;

   /** padding */
   this.padding2 = 0;

   /** A Reord that Specifies the type of supply and the amount of that supply for each of the supply types in numberOfSupplyTypes (see 6.2.85), Section 7.4.3 */
    this.supplies = new Array();
 
  dis7.ResupplyOfferPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.SupplyQuantity();
           anX.initFromBinary(inputStream);
           this.supplies.push(anX);
       }

  };

  dis7.ResupplyOfferPdu.prototype.encodeToBinary = function(outputStream)
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
exports.ResupplyOfferPdu = dis7.ResupplyOfferPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ResupplyReceivedPdu = function()
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
   this.receivingEntityID = new dis7.EntityID(); 

   /** Entity that is supplying.  Shall be represented by Entity Identifier record (see 6.2.28) */
   this.supplyingEntityID = new dis7.EntityID(); 

   /** How many supplies are taken by receiving entity */
   this.numberOfSupplyTypes = 0;

   /** padding */
   this.padding1 = 0;

   /** padding */
   this.padding2 = 0;

   /** Type and amount of supplies for each specified supply type.  See 6.2.85 for supply quantity record. */
    this.supplies = new Array();
 
  dis7.ResupplyReceivedPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.SupplyQuantity();
           anX.initFromBinary(inputStream);
           this.supplies.push(anX);
       }

  };

  dis7.ResupplyReceivedPdu.prototype.encodeToBinary = function(outputStream)
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
exports.ResupplyReceivedPdu = dis7.ResupplyReceivedPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.SecondaryOperationalData = function()
{
   /** additional operational characteristics of the IFF emitting system. Each 8-bit field will vary depending on the system type. */
   this.operationalData1 = 0;

   /** additional operational characteristics of the IFF emitting system. Each 8-bit field will vary depending on the system type. */
   this.operationalData2 = 0;

   /** the number of IFF Fundamental Parameter Data records that follow */
   this.numberOfIFFFundamentalParameterRecords = 0;

  dis7.SecondaryOperationalData.prototype.initFromBinary = function(inputStream)
  {
       this.operationalData1 = inputStream.readUByte();
       this.operationalData2 = inputStream.readUByte();
       this.numberOfIFFFundamentalParameterRecords = inputStream.readUShort();
  };

  dis7.SecondaryOperationalData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.operationalData1);
       outputStream.writeUByte(this.operationalData2);
       outputStream.writeUShort(this.numberOfIFFFundamentalParameterRecords);
  };
}; // end of class

 // node.js module support
exports.SecondaryOperationalData = dis7.SecondaryOperationalData;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.SeesPdu = function()
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
   this.orginatingEntityID = new dis7.EntityID(); 

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
 
  dis7.SeesPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.PropulsionSystemData();
           anX.initFromBinary(inputStream);
           this.propulsionSystemData.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVectoringNozzleSystems; idx++)
       {
           var anX = new dis7.VectoringNozzleSystem();
           anX.initFromBinary(inputStream);
           this.vectoringSystemData.push(anX);
       }

  };

  dis7.SeesPdu.prototype.encodeToBinary = function(outputStream)
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
exports.SeesPdu = dis7.SeesPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.Sensor = function()
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

  dis7.Sensor.prototype.initFromBinary = function(inputStream)
  {
       this.sensorTypeSource = inputStream.readUByte();
       this.sensorOnOffStatus = inputStream.readUByte();
       this.sensorType = inputStream.readUShort();
       this.station = inputStream.readUInt();
       this.quantity = inputStream.readUShort();
       this.padding = inputStream.readUShort();
  };

  dis7.Sensor.prototype.encodeToBinary = function(outputStream)
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
exports.Sensor = dis7.Sensor;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.SeparationVP = function()
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
   this.parentEntityID = new dis7.EntityID(); 

   /** padding */
   this.padding2 = 0;

   /** Station separated from */
   this.stationLocation = 0;

  dis7.SeparationVP.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUByte();
       this.reasonForSeparation = inputStream.readUByte();
       this.preEntityIndicator = inputStream.readUByte();
       this.padding1 = inputStream.readUByte();
       this.parentEntityID.initFromBinary(inputStream);
       this.padding2 = inputStream.readUShort();
       this.stationLocation = inputStream.readUInt();
  };

  dis7.SeparationVP.prototype.encodeToBinary = function(outputStream)
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
exports.SeparationVP = dis7.SeparationVP;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.ServiceRequestPdu = function()
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
   this.requestingEntityID = new dis7.EntityID(); 

   /** Entity that is providing the service (see 6.2.28), Section 7.4.2 */
   this.servicingEntityID = new dis7.EntityID(); 

   /** Type of service requested, Section 7.4.2 */
   this.serviceTypeRequested = 0;

   /** How many requested, Section 7.4.2 */
   this.numberOfSupplyTypes = 0;

   /** padding */
   this.serviceRequestPadding = 0;

   /** Field shall specify the type of supply and the amount of that supply for the number specified in the numberOfSupplyTypes (see 6.2.85), Section 7.4.2 */
    this.supplies = new Array();
 
  dis7.ServiceRequestPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.SupplyQuantity();
           anX.initFromBinary(inputStream);
           this.supplies.push(anX);
       }

  };

  dis7.ServiceRequestPdu.prototype.encodeToBinary = function(outputStream)
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
exports.ServiceRequestPdu = dis7.ServiceRequestPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.SetDataPdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis7.EntityID(); 

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
 
  dis7.SetDataPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatums.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis7.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatums.push(anX);
       }

  };

  dis7.SetDataPdu.prototype.encodeToBinary = function(outputStream)
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
exports.SetDataPdu = dis7.SetDataPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.SetDataReliablePdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis7.EntityID(); 

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
 
  dis7.SetDataReliablePdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatumRecords.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatumRecords; idx++)
       {
           var anX = new dis7.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumRecords.push(anX);
       }

  };

  dis7.SetDataReliablePdu.prototype.encodeToBinary = function(outputStream)
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
exports.SetDataReliablePdu = dis7.SetDataReliablePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.SignalPdu = function()
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
 
  dis7.SignalPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.OneByteChunk();
           anX.initFromBinary(inputStream);
           this.data.push(anX);
       }

  };

  dis7.SignalPdu.prototype.encodeToBinary = function(outputStream)
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
exports.SignalPdu = dis7.SignalPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.SilentEntitySystem = function()
{
   /** number of the type specified by the entity type field */
   this.numberOfEntities = 0;

   /** number of entity appearance records that follow */
   this.numberOfAppearanceRecords = 0;

   /** Entity type */
   this.entityType = new dis7.EntityType(); 

   /** Variable length list of appearance records */
    this.appearanceRecordList = new Array();
 
  dis7.SilentEntitySystem.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfEntities = inputStream.readUShort();
       this.numberOfAppearanceRecords = inputStream.readUShort();
       this.entityType.initFromBinary(inputStream);
       for(var idx = 0; idx < this.numberOfAppearanceRecords; idx++)
       {
           var anX = new dis7.FourByteChunk();
           anX.initFromBinary(inputStream);
           this.appearanceRecordList.push(anX);
       }

  };

  dis7.SilentEntitySystem.prototype.encodeToBinary = function(outputStream)
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
exports.SilentEntitySystem = dis7.SilentEntitySystem;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.SimulationAddress = function()
{
   /** A site is defined as a facility, installation, organizational unit or a geographic location that has one or more simulation applications capable of participating in a distributed event.  */
   this.site = 0;

   /** An application is defined as a software program that is used to generate and process distributed simulation data including live, virtual and constructive data. */
   this.application = 0;

  dis7.SimulationAddress.prototype.initFromBinary = function(inputStream)
  {
       this.site = inputStream.readUShort();
       this.application = inputStream.readUShort();
  };

  dis7.SimulationAddress.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.site);
       outputStream.writeUShort(this.application);
  };
}; // end of class

 // node.js module support
exports.SimulationAddress = dis7.SimulationAddress;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.SimulationIdentifier = function()
{
   /** Simulation address  */
   this.simulationAddress = new dis7.SimulationAddress(); 

   /** This field shall be set to zero as there is no reference number associated with a Simulation Identifier. */
   this.referenceNumber = 0;

  dis7.SimulationIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.referenceNumber = inputStream.readUShort();
  };

  dis7.SimulationIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.referenceNumber);
  };
}; // end of class

 // node.js module support
exports.SimulationIdentifier = dis7.SimulationIdentifier;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.SimulationManagementFamilyPdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis7.EntityID(); 

  dis7.SimulationManagementFamilyPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.SimulationManagementFamilyPdu.prototype.encodeToBinary = function(outputStream)
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
exports.SimulationManagementFamilyPdu = dis7.SimulationManagementFamilyPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.SimulationManagementPduHeader = function()
{
   /** Conventional PDU header */
   this.pduHeader = new dis7.PduHeader(); 

   /** IDs the simulation or entity, etiehr a simulation or an entity. Either 6.2.80 or 6.2.28 */
   this.originatingID = new dis7.SimulationIdentifier(); 

   /** simulation, all simulations, a special ID, or an entity. See 5.6.5 and 5.12.4 */
   this.receivingID = new dis7.SimulationIdentifier(); 

  dis7.SimulationManagementPduHeader.prototype.initFromBinary = function(inputStream)
  {
       this.pduHeader.initFromBinary(inputStream);
       this.originatingID.initFromBinary(inputStream);
       this.receivingID.initFromBinary(inputStream);
  };

  dis7.SimulationManagementPduHeader.prototype.encodeToBinary = function(outputStream)
  {
       this.pduHeader.encodeToBinary(outputStream);
       this.originatingID.encodeToBinary(outputStream);
       this.receivingID.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.SimulationManagementPduHeader = dis7.SimulationManagementPduHeader;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.SimulationManagementWithReliabilityFamilyPdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis7.EntityID(); 

  dis7.SimulationManagementWithReliabilityFamilyPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.SimulationManagementWithReliabilityFamilyPdu.prototype.encodeToBinary = function(outputStream)
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
exports.SimulationManagementWithReliabilityFamilyPdu = dis7.SimulationManagementWithReliabilityFamilyPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.StandardVariableSpecification = function()
{
   /** Number of static variable records */
   this.numberOfStandardVariableRecords = 0;

   /** variable length list of standard variables, The class type and length here are WRONG and will cause the incorrect serialization of any class in whihc it is embedded. */
    this.standardVariables = new Array();
 
  dis7.StandardVariableSpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfStandardVariableRecords = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfStandardVariableRecords; idx++)
       {
           var anX = new dis7.SimulationManagementPduHeader();
           anX.initFromBinary(inputStream);
           this.standardVariables.push(anX);
       }

  };

  dis7.StandardVariableSpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.numberOfStandardVariableRecords);
       for(var idx = 0; idx < this.standardVariables.length; idx++)
       {
           standardVariables[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.StandardVariableSpecification = dis7.StandardVariableSpecification;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.StartResumePdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis7.EntityID(); 

   /** Identifier for originating entity(or simulation) */
   this.originatingID = new dis7.EntityID(); 

   /** Identifier for the receiving entity(or simulation) */
   this.receivingID = new dis7.EntityID(); 

   /** This field shall specify the real-world time (UTC) at which the entity is to start/resume in the exercise. This information shall be used by the participating simulation applications to start/resume an exercise synchronously. This field shall be represented by a Clock Time record (see 6.2.16). */
   this.realWorldTime = new dis7.ClockTime(); 

   /** The reference time within a simulation exercise. This time is established ahead of time by simulation management and is common to all participants in a particular exercise. Simulation time may be either Absolute Time or Relative Time. This field shall be represented by a Clock Time record (see 6.2.16) */
   this.simulationTime = new dis7.ClockTime(); 

   /** Identifier for the specific and unique start/resume request */
   this.requestID = 0;

  dis7.StartResumePdu.prototype.initFromBinary = function(inputStream)
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

  dis7.StartResumePdu.prototype.encodeToBinary = function(outputStream)
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
exports.StartResumePdu = dis7.StartResumePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.StartResumeReliablePdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis7.EntityID(); 

   /** time in real world for this operation to happen */
   this.realWorldTime = new dis7.ClockTime(); 

   /** time in simulation for the simulation to resume */
   this.simulationTime = new dis7.ClockTime(); 

   /** level of reliability service used for this transaction */
   this.requiredReliabilityService = 0;

   /** padding */
   this.pad1 = 0;

   /** padding */
   this.pad2 = 0;

   /** Request ID */
   this.requestID = 0;

  dis7.StartResumeReliablePdu.prototype.initFromBinary = function(inputStream)
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

  dis7.StartResumeReliablePdu.prototype.encodeToBinary = function(outputStream)
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
exports.StartResumeReliablePdu = dis7.StartResumeReliablePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.StopFreezePdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis7.EntityID(); 

   /** Identifier for originating entity(or simulation) */
   this.originatingID = new dis7.EntityID(); 

   /** Identifier for the receiving entity(or simulation) */
   this.receivingID = new dis7.EntityID(); 

   /** real-world(UTC) time at which the entity shall stop or freeze in the exercise */
   this.realWorldTime = new dis7.ClockTime(); 

   /** Reason the simulation was stopped or frozen (see section 7 of SISO-REF-010) represented by an 8-bit enumeration */
   this.reason = 0;

   /** Internal behavior of the entity(or simulation) and its appearance while frozen to the other participants */
   this.frozenBehavior = 0;

   /** padding */
   this.padding1 = 0;

   /** Request ID that is unique */
   this.requestID = 0;

  dis7.StopFreezePdu.prototype.initFromBinary = function(inputStream)
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

  dis7.StopFreezePdu.prototype.encodeToBinary = function(outputStream)
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
exports.StopFreezePdu = dis7.StopFreezePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.StopFreezeReliablePdu = function()
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
   this.originatingEntityID = new dis7.EntityID(); 

   /** Object with which this point object is associated */
   this.receivingEntityID = new dis7.EntityID(); 

   /** time in real world for this operation to happen */
   this.realWorldTime = new dis7.ClockTime(); 

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

  dis7.StopFreezeReliablePdu.prototype.initFromBinary = function(inputStream)
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

  dis7.StopFreezeReliablePdu.prototype.encodeToBinary = function(outputStream)
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
exports.StopFreezeReliablePdu = dis7.StopFreezeReliablePdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.StorageFuel = function()
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

  dis7.StorageFuel.prototype.initFromBinary = function(inputStream)
  {
       this.fuelQuantity = inputStream.readUInt();
       this.fuelMeasurementUnits = inputStream.readUByte();
       this.fuelType = inputStream.readUByte();
       this.fuelLocation = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis7.StorageFuel.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.fuelQuantity);
       outputStream.writeUByte(this.fuelMeasurementUnits);
       outputStream.writeUByte(this.fuelType);
       outputStream.writeUByte(this.fuelLocation);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.StorageFuel = dis7.StorageFuel;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.StorageFuelReload = function()
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

  dis7.StorageFuelReload.prototype.initFromBinary = function(inputStream)
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

  dis7.StorageFuelReload.prototype.encodeToBinary = function(outputStream)
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
exports.StorageFuelReload = dis7.StorageFuelReload;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.SupplyQuantity = function()
{
   /** Type of supply */
   this.supplyType = new dis7.EntityType(); 

   /** the number of units of a supply type.  */
   this.quantity = 0;

  dis7.SupplyQuantity.prototype.initFromBinary = function(inputStream)
  {
       this.supplyType.initFromBinary(inputStream);
       this.quantity = inputStream.readFloat32();
  };

  dis7.SupplyQuantity.prototype.encodeToBinary = function(outputStream)
  {
       this.supplyType.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.quantity);
  };
}; // end of class

 // node.js module support
exports.SupplyQuantity = dis7.SupplyQuantity;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.SyntheticEnvironmentFamilyPdu = function()
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

  dis7.SyntheticEnvironmentFamilyPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.SyntheticEnvironmentFamilyPdu.prototype.encodeToBinary = function(outputStream)
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
exports.SyntheticEnvironmentFamilyPdu = dis7.SyntheticEnvironmentFamilyPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.SystemIdentifier = function()
{
   /** general type of emitting system, an enumeration */
   this.systemType = 0;

   /** named type of system, an enumeration */
   this.systemName = 0;

   /** mode of operation for the system, an enumeration */
   this.systemMode = 0;

   /** status of this PDU, see section 6.2.15 */
   this.changeOptions = new dis7.ChangeOptions(); 

  dis7.SystemIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.systemType = inputStream.readUShort();
       this.systemName = inputStream.readUShort();
       this.systemMode = inputStream.readUShort();
       this.changeOptions.initFromBinary(inputStream);
  };

  dis7.SystemIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.systemType);
       outputStream.writeUShort(this.systemName);
       outputStream.writeUShort(this.systemMode);
       this.changeOptions.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.SystemIdentifier = dis7.SystemIdentifier;

// End of SystemIdentifier class

/**
 * LSB is absolute or relative timestamp. Scale is 2^31 - 1 divided into one hour.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.Timestamp = function()
{
   /** timestamp */
   this.timestamp = 0;

  dis7.Timestamp.prototype.initFromBinary = function(inputStream)
  {
       this.timestamp = inputStream.readUInt();
  };

  dis7.Timestamp.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.timestamp);
  };

/** 0 relative timestamp, 1 host synchronized timestamp */
dis7.Timestamp.prototype.getTimestamp_timestampType = function()
{
   var val = this.timestamp & 0x1;
   return val >> 0;
};


/** 0 relative timestamp, 1 host synchronized timestamp */
dis7.Timestamp.prototype.setTimestamp_timestampType= function(val)
{
  this.timestamp &= ~0x1; // Zero existing bits
  val = val << 0;
  this.timestamp = this.timestamp | val; 
};


/** 2^31-1 per hour time units */
dis7.Timestamp.prototype.getTimestamp_timestampValue = function()
{
   var val = this.timestamp & 0xFE;
   return val >> 1;
};


/** 2^31-1 per hour time units */
dis7.Timestamp.prototype.setTimestamp_timestampValue= function(val)
{
  this.timestamp &= ~0xFE; // Zero existing bits
  val = val << 1;
  this.timestamp = this.timestamp | val; 
};

}; // end of class

 // node.js module support
exports.Timestamp = dis7.Timestamp;

// End of Timestamp class

/**
 * Total number of record sets contained in a logical set of one or more PDUs. Used to transfer ownership, etc Section 6.2.88
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.TotalRecordSets = function()
{
   /** Total number of record sets */
   this.totalRecordSets = 0;

   /** padding */
   this.padding = 0;

  dis7.TotalRecordSets.prototype.initFromBinary = function(inputStream)
  {
       this.totalRecordSets = inputStream.readUShort();
       this.padding = inputStream.readUShort();
  };

  dis7.TotalRecordSets.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.totalRecordSets);
       outputStream.writeUShort(this.padding);
  };
}; // end of class

 // node.js module support
exports.TotalRecordSets = dis7.TotalRecordSets;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.TrackJamData = function()
{
   /** the entity tracked or illumated, or an emitter beam targeted with jamming */
   this.entityID = new dis7.EntityID(); 

   /** Emitter system associated with the entity */
   this.emitterNumber = 0;

   /** Beam associated with the entity */
   this.beamNumber = 0;

  dis7.TrackJamData.prototype.initFromBinary = function(inputStream)
  {
       this.entityID.initFromBinary(inputStream);
       this.emitterNumber = inputStream.readUByte();
       this.beamNumber = inputStream.readUByte();
  };

  dis7.TrackJamData.prototype.encodeToBinary = function(outputStream)
  {
       this.entityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.emitterNumber);
       outputStream.writeUByte(this.beamNumber);
  };
}; // end of class

 // node.js module support
exports.TrackJamData = dis7.TrackJamData;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.TransmitterPdu = function()
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
   this.radioReferenceID = new dis7.EntityID(); 

   /** particular radio within an entity */
   this.radioNumber = 0;

   /** Type of radio */
   this.radioEntityType = new dis7.EntityType(); 

   /** transmit state */
   this.transmitState = 0;

   /** input source */
   this.inputSource = 0;

   /** count field */
   this.variableTransmitterParameterCount = 0;

   /** Location of antenna */
   this.antennaLocation = new dis7.Vector3Double(); 

   /** relative location of antenna */
   this.relativeAntennaLocation = new dis7.Vector3Float(); 

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
   this.modulationType = new dis7.ModulationType(); 

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
 
  dis7.TransmitterPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.Vector3Float();
           anX.initFromBinary(inputStream);
           this.modulationParametersList.push(anX);
       }

       for(var idx = 0; idx < this.antennaPatternCount; idx++)
       {
           var anX = new dis7.Vector3Float();
           anX.initFromBinary(inputStream);
           this.antennaPatternList.push(anX);
       }

  };

  dis7.TransmitterPdu.prototype.encodeToBinary = function(outputStream)
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
exports.TransmitterPdu = dis7.TransmitterPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.TwoByteChunk = function()
{
   /** two bytes of arbitrary data */
   this.otherParameters = new Array(0, 0);

  dis7.TwoByteChunk.prototype.initFromBinary = function(inputStream)
  {
       for(var idx = 0; idx < 2; idx++)
       {
          this.otherParameters[ idx ] = inputStream.readByte();
       }
  };

  dis7.TwoByteChunk.prototype.encodeToBinary = function(outputStream)
  {
       for(var idx = 0; idx < 2; idx++)
       {
          outputStream.writeByte(this.otherParameters[ idx ] );
       }
  };
}; // end of class

 // node.js module support
exports.TwoByteChunk = dis7.TwoByteChunk;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.UAFundamentalParameter = function()
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

  dis7.UAFundamentalParameter.prototype.initFromBinary = function(inputStream)
  {
       this.activeEmissionParameterIndex = inputStream.readUShort();
       this.scanPattern = inputStream.readUShort();
       this.beamCenterAzimuthHorizontal = inputStream.readFloat32();
       this.azimuthalBeamwidthHorizontal = inputStream.readFloat32();
       this.beamCenterDepressionElevation = inputStream.readFloat32();
       this.beamwidthDownElevation = inputStream.readFloat32();
  };

  dis7.UAFundamentalParameter.prototype.encodeToBinary = function(outputStream)
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
exports.UAFundamentalParameter = dis7.UAFundamentalParameter;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.UaPdu = function()
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
   this.emittingEntityID = new dis7.EntityID(); 

   /** ID of event */
   this.eventID = new dis7.EventIdentifier(); 

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
 
  dis7.UaPdu.prototype.initFromBinary = function(inputStream)
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
           var anX = new dis7.Vector3Float();
           anX.initFromBinary(inputStream);
           this.shaftRPMs.push(anX);
       }

       for(var idx = 0; idx < this.numberOfAPAs; idx++)
       {
           var anX = new dis7.Vector3Float();
           anX.initFromBinary(inputStream);
           this.apaData.push(anX);
       }

       for(var idx = 0; idx < this.numberOfUAEmitterSystems; idx++)
       {
           var anX = new dis7.Vector3Float();
           anX.initFromBinary(inputStream);
           this.emitterSystems.push(anX);
       }

  };

  dis7.UaPdu.prototype.encodeToBinary = function(outputStream)
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
exports.UaPdu = dis7.UaPdu;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.UnattachedIdentifier = function()
{
   /** See 6.2.79 */
   this.simulationAddress = new dis7.SimulationAddress(); 

   /** Reference number */
   this.referenceNumber = 0;

  dis7.UnattachedIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.referenceNumber = inputStream.readUShort();
  };

  dis7.UnattachedIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.referenceNumber);
  };
}; // end of class

 // node.js module support
exports.UnattachedIdentifier = dis7.UnattachedIdentifier;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.UnsignedDISInteger = function()
{
   /** unsigned integer */
   this.val = 0;

  dis7.UnsignedDISInteger.prototype.initFromBinary = function(inputStream)
  {
       this.val = inputStream.readUInt();
  };

  dis7.UnsignedDISInteger.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.val);
  };
}; // end of class

 // node.js module support
exports.UnsignedDISInteger = dis7.UnsignedDISInteger;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.VariableDatum = function()
{
   /** ID of variable datum to be transmitted. 32 bit enumeration defined in EBV */
   this.variableDatumID = 0;

   /** Length, IN BITS, of the variable datum. */
   this.variableDatumLength = 0;

   /** Variable length data class */
    this.variableDatumData = new Array();
 
  dis7.VariableDatum.prototype.initFromBinary = function(inputStream)
  {
       this.variableDatumID = inputStream.readUInt();
       this.variableDatumLength = inputStream.readUInt();
       for(var idx = 0; idx < this.variableDatumLength; idx++)
       {
           var anX = new dis7.OneByteChunk();
           anX.initFromBinary(inputStream);
           this.variableDatumData.push(anX);
       }

  };

  dis7.VariableDatum.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.variableDatumID);
       outputStream.writeUInt(this.variableDatumLength);
       for(var idx = 0; idx < this.variableDatumData.length; idx++)
       {
           variableDatumData[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.VariableDatum = dis7.VariableDatum;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.VariableParameter = function()
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

  dis7.VariableParameter.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUByte();
       this.variableParameterFields1 = inputStream.readFloat64();
       this.variableParameterFields2 = inputStream.readUInt();
       this.variableParameterFields3 = inputStream.readUShort();
       this.variableParameterFields4 = inputStream.readUByte();
  };

  dis7.VariableParameter.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.recordType);
       outputStream.writeFloat64(this.variableParameterFields1);
       outputStream.writeUInt(this.variableParameterFields2);
       outputStream.writeUShort(this.variableParameterFields3);
       outputStream.writeUByte(this.variableParameterFields4);
  };
}; // end of class

 // node.js module support
exports.VariableParameter = dis7.VariableParameter;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.VariableTransmitterParameters = function()
{
   /** Type of VTP. Enumeration from EBV */
   this.recordType = 0;

   /** Length, in bytes */
   this.recordLength = 4;

  dis7.VariableTransmitterParameters.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUInt();
  };

  dis7.VariableTransmitterParameters.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUInt(this.recordLength);
  };
}; // end of class

 // node.js module support
exports.VariableTransmitterParameters = dis7.VariableTransmitterParameters;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.Vector2Float = function()
{
   /** X value */
   this.x = 0;

   /** y Value */
   this.y = 0;

  dis7.Vector2Float.prototype.initFromBinary = function(inputStream)
  {
       this.x = inputStream.readFloat32();
       this.y = inputStream.readFloat32();
  };

  dis7.Vector2Float.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.x);
       outputStream.writeFloat32(this.y);
  };
}; // end of class

 // node.js module support
exports.Vector2Float = dis7.Vector2Float;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.Vector3Double = function()
{
   /** X value */
   this.x = 0;

   /** y Value */
   this.y = 0;

   /** Z value */
   this.z = 0;

  dis7.Vector3Double.prototype.initFromBinary = function(inputStream)
  {
       this.x = inputStream.readFloat64();
       this.y = inputStream.readFloat64();
       this.z = inputStream.readFloat64();
  };

  dis7.Vector3Double.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat64(this.x);
       outputStream.writeFloat64(this.y);
       outputStream.writeFloat64(this.z);
  };
}; // end of class

 // node.js module support
exports.Vector3Double = dis7.Vector3Double;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.Vector3Float = function()
{
   /** X value */
   this.x = 0;

   /** y Value */
   this.y = 0;

   /** Z value */
   this.z = 0;

  dis7.Vector3Float.prototype.initFromBinary = function(inputStream)
  {
       this.x = inputStream.readFloat32();
       this.y = inputStream.readFloat32();
       this.z = inputStream.readFloat32();
  };

  dis7.Vector3Float.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.x);
       outputStream.writeFloat32(this.y);
       outputStream.writeFloat32(this.z);
  };
}; // end of class

 // node.js module support
exports.Vector3Float = dis7.Vector3Float;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.VectoringNozzleSystem = function()
{
   /** In degrees */
   this.horizontalDeflectionAngle = 0;

   /** In degrees */
   this.verticalDeflectionAngle = 0;

  dis7.VectoringNozzleSystem.prototype.initFromBinary = function(inputStream)
  {
       this.horizontalDeflectionAngle = inputStream.readFloat32();
       this.verticalDeflectionAngle = inputStream.readFloat32();
  };

  dis7.VectoringNozzleSystem.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeFloat32(this.horizontalDeflectionAngle);
       outputStream.writeFloat32(this.verticalDeflectionAngle);
  };
}; // end of class

 // node.js module support
exports.VectoringNozzleSystem = dis7.VectoringNozzleSystem;

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
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.WarfareFamilyPdu = function()
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
   this.firingEntityID = new dis7.EntityID(); 

   /** ID of the entity that is being shot at */
   this.targetEntityID = new dis7.EntityID(); 

  dis7.WarfareFamilyPdu.prototype.initFromBinary = function(inputStream)
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

  dis7.WarfareFamilyPdu.prototype.encodeToBinary = function(outputStream)
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
exports.WarfareFamilyPdu = dis7.WarfareFamilyPdu;

// End of WarfareFamilyPdu class


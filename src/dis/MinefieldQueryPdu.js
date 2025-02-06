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
 var dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


/**
 * @constructor
 * @memberof dis
 */
dis.MinefieldQueryPdu = function()
{
   /**
    * The version of the protocol. 5=DIS-1995, 6=DIS-1998.
    * @type {number}
    * @instance
    */
   this.protocolVersion = 6;

   /**
    * Exercise ID
    * @type {number}
    * @instance
    */
   this.exerciseID = 0;

   /**
    * Type of pdu, unique for each PDU class
    * @type {number}
    * @instance
    */
   this.pduType = 38;

   /**
    * value that refers to the protocol family, eg SimulationManagement, et
    * @type {number}
    * @instance
    */
   this.protocolFamily = 8;

   /**
    * Timestamp value
    * @type {number}
    * @instance
    */
   this.timestamp = 0;

   /**
    * Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word
    * @type {number}
    * @instance
    */
   this.pduLength = 0;

   /**
    * zero-filled array of padding
    * @type {number}
    * @instance
    */
   this.padding = 0;

   /**
    * Minefield ID
    * @type {EntityID}
    * @instance
    */
   this.minefieldID = new dis.EntityID(); 

   /**
    * EID of entity making the request
    * @type {EntityID}
    * @instance
    */
   this.requestingEntityID = new dis.EntityID(); 

   /**
    * request ID
    * @type {number}
    * @instance
    */
   this.requestID = 0;

   /**
    * Number of perimeter points for the minefield
    * @type {number}
    * @instance
    */
   this.numberOfPerimeterPoints = 0;

   /**
    * Padding
    * @type {number}
    * @instance
    */
   this.pad2 = 0;

   /**
    * Number of sensor types
    * @type {number}
    * @instance
    */
   this.numberOfSensorTypes = 0;

   /**
    * data filter, 32 boolean fields
    * @type {number}
    * @instance
    */
   this.dataFilter = 0;

   /**
    * Entity type of mine being requested
    * @type {EntityType}
    * @instance
    */
   this.requestedMineType = new dis.EntityType(); 

   /**
    * perimeter points of request
    * @type {Array<Point>}
    * @instance
    */
    this.requestedPerimeterPoints = new Array();
 
   /**
    * Sensor types, each 16 bits long
    * @type {Array<Chunk>}
    * @instance
    */
    this.sensorTypes = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
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
           var anX = new dis.Chunk(2);
           anX.initFromBinary(inputStream);
           this.sensorTypes.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
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
        this.requestedPerimeterPoints[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.sensorTypes.length; idx++)
       {
        this.sensorTypes[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.MinefieldQueryPdu = dis.MinefieldQueryPdu;

// End of MinefieldQueryPdu class


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
 var dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


/**
 * @constructor
 * @memberof dis
 */
dis.MinefieldDataPdu = function()
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
   this.pduType = 39;

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
    * ID of entity making request
    * @type {EntityID}
    * @instance
    */
   this.requestingEntityID = new dis.EntityID(); 

   /**
    * Minefield sequence number
    * @type {number}
    * @instance
    */
   this.minefieldSequenceNumbeer = 0;

   /**
    * request ID
    * @type {number}
    * @instance
    */
   this.requestID = 0;

   /**
    * pdu sequence number
    * @type {number}
    * @instance
    */
   this.pduSequenceNumber = 0;

   /**
    * number of pdus in response
    * @type {number}
    * @instance
    */
   this.numberOfPdus = 0;

   /**
    * how many mines are in this PDU
    * @type {number}
    * @instance
    */
   this.numberOfMinesInThisPdu = 0;

   /**
    * how many sensor type are in this PDU
    * @type {number}
    * @instance
    */
   this.numberOfSensorTypes = 0;

   /**
    * padding
    * @type {number}
    * @instance
    */
   this.pad2 = 0;

   /**
    * 32 boolean fields
    * @type {number}
    * @instance
    */
   this.dataFilter = 0;

   /**
    * Mine type
    * @type {EntityType}
    * @instance
    */
   this.mineType = new dis.EntityType(); 

   /**
    * Sensor types, each 16 bits long
    * @type {Array<Chunk>}
    * @instance
    */
    this.sensorTypes = new Array();
 
   /**
    * Padding to get things 32-bit aligned. ^^^this is wrong--dyanmically sized padding needed
    * @type {number}
    * @instance
    */
   this.pad3 = 0;

   /**
    * Mine locations
    * @type {Array<Vector3Float>}
    * @instance
    */
    this.mineLocation = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
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
           var anX = new dis.Chunk(2);
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

  /**
	 * @param {OutputStream} outputStream 
	 */
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
        this.sensorTypes[idx].encodeToBinary(outputStream);
       }

       outputStream.writeUByte(this.pad3);
       for(var idx = 0; idx < this.mineLocation.length; idx++)
       {
        this.mineLocation[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.MinefieldDataPdu = dis.MinefieldDataPdu;

// End of MinefieldDataPdu class


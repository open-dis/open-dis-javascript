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
 var dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


/**
 * @constructor
 * @memberof dis
 */
dis.IntercomSignalPdu = function()
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
   this.pduType = 31;

   /**
    * value that refers to the protocol family, eg SimulationManagement, et
    * @type {number}
    * @instance
    */
   this.protocolFamily = 4;

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
    * ID of the entitythat is the source of the communication
    * @type {EntityID}
    * @instance
    */
   this.entityId = new dis.EntityID(); 

   /**
    * particular radio within an entity
    * @type {number}
    * @instance
    */
   this.communicationsDeviceID = 0;

   /**
    * encoding scheme
    * @type {number}
    * @instance
    */
   this.encodingScheme = 0;

   /**
    * tactical data link type
    * @type {number}
    * @instance
    */
   this.tdlType = 0;

   /**
    * sample rate
    * @type {number}
    * @instance
    */
   this.sampleRate = 0;

   /**
    * data length, in bits
    * @type {number}
    * @instance
    */
   this.dataLength = 0;

   /**
    * samples
    * @type {number}
    * @instance
    */
   this.samples = 0;

   /**
    * data bytes
    * @type {Array<Chunk>}
    * @instance
    */
    this.data = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
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
           var anX = new dis.Chunk(1);
           anX.initFromBinary(inputStream);
           this.data.push(anX);
       }

  };

  /**
	 * @param {OutputStream} outputStream 
	 */
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
        this.data[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.IntercomSignalPdu = dis.IntercomSignalPdu;

// End of IntercomSignalPdu class


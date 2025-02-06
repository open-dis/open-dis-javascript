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
 var dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


/**
 * @constructor
 * @memberof dis
 */
dis.SignalPdu = function()
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
   this.pduType = 26;

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
    * ID of the entity that is the source of the communication, ie contains the radio
    * @type {EntityID}
    * @instance
    */
   this.entityId = new dis.EntityID(); 

   /**
    * particular radio within an entity
    * @type {number}
    * @instance
    */
   this.radioId = 0;

   /**
    * encoding scheme used, and enumeration
    * @type {number}
    * @instance
    */
   this.encodingScheme = 0;

   /**
    * tdl type
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
    * length of data, in bits
    * @type {number}
    * @instance
    */
   this.dataLength = 0;

   /**
    * number of samples. If the PDU contains encoded audio, this should be zero.
    * @type {number}
    * @instance
    */
   this.samples = 0;

   /**
    * list of eight bit values. Must be padded to fall on a 32 bit boundary.
    * @type {Array<Chunk>}
    * @instance
    */
    this.data = new Array();
 
  /**
   * @param {InputStream} inputStream
   */
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
	try {
	       for(var idx = 0; idx < (this.dataLength / 8); idx++)
	       {
		   var anX = new dis.Chunk(1, false);
		   anX.initFromBinary(inputStream);
		   this.data.push(anX);
	       }
	} catch(e) {
		console.log('error: ' + e.message);
	}
  };

  /**
	 * @param {OutputStream} outputStream 
	 */
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
       for(var idx = 0; idx < this.samples; idx++)
       {
        this.data[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.SignalPdu = dis.SignalPdu;

// End of SignalPdu class


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
 var dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


/**
 * @constructor
 * @memberof dis
 */
dis.ReceiverPdu = function()
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
   this.pduType = 27;

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
   this.receiverState = 0;

   /**
    * padding
    * @type {number}
    * @instance
    */
   this.padding1 = 0;

   /**
    * received power
    * @type {number}
    * @instance
    */
   this.receivedPower = 0;

   /**
    * ID of transmitter
    * @type {EntityID}
    * @instance
    */
   this.transmitterEntityId = new dis.EntityID(); 

   /**
    * ID of transmitting radio
    * @type {number}
    * @instance
    */
   this.transmitterRadioId = 0;

  /**
   * @param {InputStream} inputStream
   */
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

  /**
	 * @param {OutputStream} outputStream 
	 */
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


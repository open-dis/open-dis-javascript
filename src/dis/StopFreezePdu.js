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
 var dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


/**
 * @constructor
 * @memberof dis
 */
dis.StopFreezePdu = function()
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
   this.pduType = 14;

   /**
    * value that refers to the protocol family, eg SimulationManagement, et
    * @type {number}
    * @instance
    */
   this.protocolFamily = 5;

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
    *  Entity that is sending message
    * @type {EntityID}
    * @instance
    */
   this.originatingEntityID = new dis.EntityID(); 

   /**
    *  Entity that is intended to receive message
    * @type {EntityID}
    * @instance
    */
   this.receivingEntityID = new dis.EntityID(); 

   /**
    * UTC time at which the simulation shall stop or freeze
    * @type {ClockTime}
    * @instance
    */
   this.realWorldTime = new dis.ClockTime(); 

   /**
    * Reason the simulation was stopped or frozen
    * @type {number}
    * @instance
    */
   this.reason = 0;

   /**
    * Internal behavior of the simulation and its appearance while frozento the other participants
    * @type {number}
    * @instance
    */
   this.frozenBehavior = 0;

   /**
    * padding
    * @type {number}
    * @instance
    */
   this.padding1 = 0;

   /**
    *  Request ID that is unique
    * @type {EntityID}
    * @instance
    */
   this.requestID = 0;

  /**
   * @param {InputStream} inputStream
   */
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

  /**
	 * @param {OutputStream} outputStream 
	 */
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


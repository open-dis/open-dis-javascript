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
 var dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};

/**
 * @constructor
 * @memberof dis
 */
dis.AcknowledgePdu = function()
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
   this.pduType = 15;

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
    * Entity that is sending message  
    * @type {number}
    * @instance
    */
   this.originatingEntityID = new dis.EntityID(); 

   /** 
    * Entity that is intended to receive message  
    * @type {number}
    * @instance
    */
   this.receivingEntityID = new dis.EntityID(); 

   /** 
    * type of message being acknowledged  
    * @type {number}
    * @instance
    */
   this.acknowledgeFlag = 0;

   /** 
    * Whether or not the receiving entity was able to comply with the request  
    * @type {number}
    * @instance
    */
   this.responseFlag = 0;

   /** 
    * Request ID that is unique  
    * @type {number}
    * @instance
    */
   this.requestID = 0;

  /**
   * @param {InputStream} inputStream
   */
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

  /**
	 * @param {OutputStream} outputStream 
	 */
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


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
 var dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


/**
 * @constructor
 * @memberof dis
 */
dis.StartResumePdu = function()
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
   this.pduType = 13;

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
    * UTC time at which the simulation shall start or resume
    * @type {ClockTime}
    * @instance
    */
   this.realWorldTime = new dis.ClockTime(); 

   /**
    * Simulation clock time at which the simulation shall start or resume
    * @type {ClockTime}
    * @instance
    */
   this.simulationTime = new dis.ClockTime(); 

   /**
    * Identifier for the request
    * @type {number}
    * @instance
    */
   this.requestID = 0;

  /**
   * @param {InputStream} inputStream
   */
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

  /**
	 * @param {OutputStream} outputStream 
	 */
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


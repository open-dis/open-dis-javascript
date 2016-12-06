/**
 * Section 7.5.5. Stop or freeze an enity (or exercise). COMPLETE
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
   this.originatingEntityID = new dis.EntityID(); 

   /** Entity that is intended to receive message */
   this.receivingEntityID = new dis.EntityID(); 

   /** real-world(UTC) time at which the entity shall stop or freeze in the exercise */
   this.realWorldTime = new dis.ClockTime(); 

   /** Reason the simulation was stopped or frozen (see section 7 of SISO-REF-010) represented by an 8-bit enumeration */
   this.reason = 0;

   /** Internal behavior of the entity(or simulation) and its appearance while frozen to the other participants */
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
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
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
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
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


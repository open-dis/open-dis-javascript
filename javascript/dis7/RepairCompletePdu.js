/**
 * Section 7.4.6. Service Request PDU is received and repair is complete. COMPLETE
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


dis.RepairCompletePdu = function()
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
   this.receivingEntityID = new dis.EntityID(); 

   /** Entity that is supplying.  See 6.2.28 */
   this.repairingEntityID = new dis.EntityID(); 

   /** Enumeration for type of repair.  See 6.2.74 */
   this.repair = 0;

   /** padding, number prevents conflict with superclass ivar name */
   this.padding4 = 0;

  dis.RepairCompletePdu.prototype.initFromBinary = function(inputStream)
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

  dis.RepairCompletePdu.prototype.encodeToBinary = function(outputStream)
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
exports.RepairCompletePdu = dis.RepairCompletePdu;

// End of RepairCompletePdu class


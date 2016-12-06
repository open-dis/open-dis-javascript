/**
 * Section 7.4.7. Sent after repair complete PDU. COMPLETE
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


dis.RepairResponsePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 10;

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

   /** Entity that requested repairs.  See 6.2.28 */
   this.receivingEntityID = new dis.EntityID(); 

   /** Entity that is repairing.  See 6.2.28 */
   this.repairingEntityID = new dis.EntityID(); 

   /** Result of repair operation */
   this.repairResult = 0;

   /** padding */
   this.padding1 = 0;

   /** padding */
   this.padding2 = 0;

  dis.RepairResponsePdu.prototype.initFromBinary = function(inputStream)
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
       this.repairResult = inputStream.readUByte();
       this.padding1 = inputStream.readShort();
       this.padding2 = inputStream.readByte();
  };

  dis.RepairResponsePdu.prototype.encodeToBinary = function(outputStream)
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
       outputStream.writeUByte(this.repairResult);
       outputStream.writeShort(this.padding1);
       outputStream.writeByte(this.padding2);
  };
}; // end of class

 // node.js module support
exports.RepairResponsePdu = dis.RepairResponsePdu;

// End of RepairResponsePdu class


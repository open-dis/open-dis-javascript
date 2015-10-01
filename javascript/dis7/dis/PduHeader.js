/**
 * Not used. The PDU Header Record is directly incoroporated into the PDU class. Here for completness only. Section 6.2.66
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


dis.PduHeader = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, etc */
   this.protocolFamily = 0;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word. */
   this.pduLength = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero filled array of padding */
   this.padding = 0;

  dis.PduHeader.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUByte();
       this.pduStatus = inputStream.readUShort();
       this.padding = inputStream.readUByte();
  };

  dis.PduHeader.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUByte(this.pduLength);
       outputStream.writeUShort(this.pduStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.PduHeader = dis.PduHeader;

// End of PduHeader class


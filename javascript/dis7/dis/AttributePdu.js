/**
 * Information about individual attributes for a particular entity, other object, or event may be communicated using an Attribute PDU. The Attribute PDU shall not be used to exchange data available in any other PDU except where explicitly mentioned in the PDU issuance instructions within this standard. See 5.3.6 for the information requirements and issuance and receipt rules for this PDU. Section 7.2.6. INCOMPLETE
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


dis.AttributePdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 0;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 1;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** This field shall identify the simulation issuing the Attribute PDU. It shall be represented by a Simulation Address record (see 6.2.79). */
   this.originatingSimulationAddress = new dis.SimulationAddress(); 

   /** Padding */
   this.padding1 = 0;

   /** Padding */
   this.padding2 = 0;

   /** This field shall represent the type of the PDU that is being extended or updated, if applicable. It shall be represented by an 8-bit enumeration. */
   this.attributeRecordPduType = 0;

   /** This field shall indicate the Protocol Version associated with the Attribute Record PDU Type. It shall be represented by an 8-bit enumeration. */
   this.attributeRecordProtocolVersion = 0;

   /** This field shall contain the Attribute record type of the Attribute records in the PDU if they all have the same Attribute record type. It shall be represented by a 32-bit enumeration. */
   this.masterAttributeRecordType = 0;

   /** This field shall identify the action code applicable to this Attribute PDU. The Action Code shall apply to all Attribute records contained in the PDU. It shall be represented by an 8-bit enumeration. */
   this.actionCode = 0;

   /** Padding */
   this.padding3 = 0;

   /** This field shall specify the number of Attribute Record Sets that make up the remainder of the PDU. It shall be represented by a 16-bit unsigned integer. */
   this.numberAttributeRecordSet = 0;

  dis.AttributePdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.originatingSimulationAddress.initFromBinary(inputStream);
       this.padding1 = inputStream.readInt();
       this.padding2 = inputStream.readShort();
       this.attributeRecordPduType = inputStream.readUByte();
       this.attributeRecordProtocolVersion = inputStream.readUByte();
       this.masterAttributeRecordType = inputStream.readUInt();
       this.actionCode = inputStream.readUByte();
       this.padding3 = inputStream.readByte();
       this.numberAttributeRecordSet = inputStream.readUShort();
  };

  dis.AttributePdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.originatingSimulationAddress.encodeToBinary(outputStream);
       outputStream.writeInt(this.padding1);
       outputStream.writeShort(this.padding2);
       outputStream.writeUByte(this.attributeRecordPduType);
       outputStream.writeUByte(this.attributeRecordProtocolVersion);
       outputStream.writeUInt(this.masterAttributeRecordType);
       outputStream.writeUByte(this.actionCode);
       outputStream.writeByte(this.padding3);
       outputStream.writeUShort(this.numberAttributeRecordSet);
  };
}; // end of class

 // node.js module support
exports.AttributePdu = dis.AttributePdu;

// End of AttributePdu class


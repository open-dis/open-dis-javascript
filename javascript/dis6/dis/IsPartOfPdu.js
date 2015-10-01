/**
 * Section 5.3.9.4 The joining of two or more simulation entities is communicated by this PDU. COMPLETE
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


dis.IsPartOfPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 36;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 7;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of entity originating PDU */
   this.orginatingEntityID = new dis.EntityID(); 

   /** ID of entity receiving PDU */
   this.receivingEntityID = new dis.EntityID(); 

   /** relationship of joined parts */
   this.relationship = new dis.Relationship(); 

   /** location of part; centroid of part in host's coordinate system. x=range, y=bearing, z=0 */
   this.partLocation = new dis.Vector3Float(); 

   /** named location */
   this.namedLocationID = new dis.NamedLocation(); 

   /** entity type */
   this.partEntityType = new dis.EntityType(); 

  dis.IsPartOfPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.orginatingEntityID.initFromBinary(inputStream);
       this.receivingEntityID.initFromBinary(inputStream);
       this.relationship.initFromBinary(inputStream);
       this.partLocation.initFromBinary(inputStream);
       this.namedLocationID.initFromBinary(inputStream);
       this.partEntityType.initFromBinary(inputStream);
  };

  dis.IsPartOfPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.orginatingEntityID.encodeToBinary(outputStream);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.relationship.encodeToBinary(outputStream);
       this.partLocation.encodeToBinary(outputStream);
       this.namedLocationID.encodeToBinary(outputStream);
       this.partEntityType.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.IsPartOfPdu = dis.IsPartOfPdu;

// End of IsPartOfPdu class


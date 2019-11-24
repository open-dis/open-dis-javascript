/**
 * Section 5.3.9.2 Information about a particular group of entities grouped together for the purposes of netowrk bandwidth         reduction or aggregation. Needs manual cleanup. The GED size requires a database lookup. UNFINISHED
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


dis.IsGroupOfPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 34;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 7;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of aggregated entities */
   this.groupEntityID = new dis.EntityID(); 

   /** type of entities constituting the group */
   this.groupedEntityCategory = 0;

   /** Number of individual entities constituting the group */
   this.numberOfGroupedEntities = 0;

   /** padding */
   this.pad2 = 0;

   /** latitude */
   this.latitude = 0;

   /** longitude */
   this.longitude = 0;

   /** GED records about each individual entity in the group. ^^^this is wrong--need a database lookup to find the actual size of the list elements */
    this.groupedEntityDescriptions = new Array();
 
  dis.IsGroupOfPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.groupEntityID.initFromBinary(inputStream);
       this.groupedEntityCategory = inputStream.readUByte();
       this.numberOfGroupedEntities = inputStream.readUByte();
       this.pad2 = inputStream.readUInt();
       this.latitude = inputStream.readFloat64();
       this.longitude = inputStream.readFloat64();
       for(var idx = 0; idx < this.numberOfGroupedEntities; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.groupedEntityDescriptions.push(anX);
       }

  };

  dis.IsGroupOfPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.groupEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.groupedEntityCategory);
       outputStream.writeUByte(this.numberOfGroupedEntities);
       outputStream.writeUInt(this.pad2);
       outputStream.writeFloat64(this.latitude);
       outputStream.writeFloat64(this.longitude);
       for(var idx = 0; idx < this.groupedEntityDescriptions.length; idx++)
       {
        this.groupedEntityDescriptions[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.IsGroupOfPdu = dis.IsGroupOfPdu;

// End of IsGroupOfPdu class


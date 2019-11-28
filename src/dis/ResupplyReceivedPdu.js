/**
 * Section 5.3.5.3. Receipt of supplies is communiated. COMPLETE
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


dis.ResupplyReceivedPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998. */
   this.protocolVersion = 6;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 7;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 3;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU. Changed name from length to avoid use of Hibernate QL reserved word */
   this.pduLength = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** Entity that is receiving service */
   this.receivingEntityID = new dis.EntityID(); 

   /** Entity that is supplying */
   this.supplyingEntityID = new dis.EntityID(); 

   /** how many supplies are being offered */
   this.numberOfSupplyTypes = 0;

   /** padding */
   this.padding1 = 0;

   /** padding */
   this.padding2 = 0;

    this.supplies = new Array();
 
  dis.ResupplyReceivedPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.pduLength = inputStream.readUShort();
       this.padding = inputStream.readShort();
       this.receivingEntityID.initFromBinary(inputStream);
       this.supplyingEntityID.initFromBinary(inputStream);
       this.numberOfSupplyTypes = inputStream.readUByte();
       this.padding1 = inputStream.readShort();
       this.padding2 = inputStream.readByte();
       for(var idx = 0; idx < this.numberOfSupplyTypes; idx++)
       {
           var anX = new dis.SupplyQuantity();
           anX.initFromBinary(inputStream);
           this.supplies.push(anX);
       }

  };

  dis.ResupplyReceivedPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.pduLength);
       outputStream.writeShort(this.padding);
       this.receivingEntityID.encodeToBinary(outputStream);
       this.supplyingEntityID.encodeToBinary(outputStream);
       outputStream.writeUByte(this.numberOfSupplyTypes);
       outputStream.writeShort(this.padding1);
       outputStream.writeByte(this.padding2);
       for(var idx = 0; idx < this.supplies.length; idx++)
       {
        this.supplies[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.ResupplyReceivedPdu = dis.ResupplyReceivedPdu;

// End of ResupplyReceivedPdu class


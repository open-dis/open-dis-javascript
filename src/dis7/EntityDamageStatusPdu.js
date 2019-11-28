/**
 * shall be used to communicate detailed damage information sustained by an entity regardless of the source of the damage Section 7.3.5  COMPLETE
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


dis.EntityDamageStatusPdu = function()
{
   /** The version of the protocol. 5=DIS-1995, 6=DIS-1998, 7=DIS-2009. */
   this.protocolVersion = 7;

   /** Exercise ID */
   this.exerciseID = 0;

   /** Type of pdu, unique for each PDU class */
   this.pduType = 69;

   /** value that refers to the protocol family, eg SimulationManagement, et */
   this.protocolFamily = 2;

   /** Timestamp value */
   this.timestamp = 0;

   /** Length, in bytes, of the PDU */
   this.length = 0;

   /** PDU Status Record. Described in 6.2.67. This field is not present in earlier DIS versions  */
   this.pduStatus = 0;

   /** zero-filled array of padding */
   this.padding = 0;

   /** ID of the entity that shot */
   this.firingEntityID = new dis.EntityID(); 

   /** ID of the entity that is being shot at */
   this.targetEntityID = new dis.EntityID(); 

   /** Field shall identify the damaged entity (see 6.2.28), Section 7.3.4 COMPLETE */
   this.damagedEntityID = new dis.EntityID(); 

   /** Padding. */
   this.padding1 = 0;

   /** Padding. */
   this.padding2 = 0;

   /** field shall specify the number of Damage Description records, Section 7.3.5 */
   this.numberOfDamageDescription = 0;

   /** Fields shall contain one or more Damage Description records (see 6.2.17) and may contain other Standard Variable records, Section 7.3.5 */
    this.damageDescriptionRecords = new Array();
 
  dis.EntityDamageStatusPdu.prototype.initFromBinary = function(inputStream)
  {
       this.protocolVersion = inputStream.readUByte();
       this.exerciseID = inputStream.readUByte();
       this.pduType = inputStream.readUByte();
       this.protocolFamily = inputStream.readUByte();
       this.timestamp = inputStream.readUInt();
       this.length = inputStream.readUShort();
       this.pduStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
       this.firingEntityID.initFromBinary(inputStream);
       this.targetEntityID.initFromBinary(inputStream);
       this.damagedEntityID.initFromBinary(inputStream);
       this.padding1 = inputStream.readUShort();
       this.padding2 = inputStream.readUShort();
       this.numberOfDamageDescription = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfDamageDescription; idx++)
       {
           var anX = new dis.DirectedEnergyDamage();
           anX.initFromBinary(inputStream);
           this.damageDescriptionRecords.push(anX);
       }

  };

  dis.EntityDamageStatusPdu.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.protocolVersion);
       outputStream.writeUByte(this.exerciseID);
       outputStream.writeUByte(this.pduType);
       outputStream.writeUByte(this.protocolFamily);
       outputStream.writeUInt(this.timestamp);
       outputStream.writeUShort(this.length);
       outputStream.writeUByte(this.pduStatus);
       outputStream.writeUByte(this.padding);
       this.firingEntityID.encodeToBinary(outputStream);
       this.targetEntityID.encodeToBinary(outputStream);
       this.damagedEntityID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding1);
       outputStream.writeUShort(this.padding2);
       outputStream.writeUShort(this.numberOfDamageDescription);
       for(var idx = 0; idx < this.damageDescriptionRecords.length; idx++)
       {
        this.damageDescriptionRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.EntityDamageStatusPdu = dis.EntityDamageStatusPdu;

// End of EntityDamageStatusPdu class


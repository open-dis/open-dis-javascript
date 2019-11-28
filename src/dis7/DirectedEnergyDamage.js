/**
 * Damage sustained by an entity due to directed energy. Location of the damage based on a relative x,y,z location from the center of the entity. Section 6.2.15.2
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


dis.DirectedEnergyDamage = function()
{
   /** DE Record Type. */
   this.recordType = 4500;

   /** DE Record Length (bytes). */
   this.recordLength = 40;

   /** padding. */
   this.padding = 0;

   /** location of damage, relative to center of entity */
   this.damageLocation = new dis.Vector3Float(); 

   /** Size of damaged area, in meters. */
   this.damageDiameter = 0;

   /** average temp of the damaged area, in degrees celsius. If firing entitty does not model this, use a value of -273.15 */
   this.temperature = -273.15;

   /** enumeration */
   this.componentIdentification = 0;

   /** enumeration */
   this.componentDamageStatus = 0;

   /** enumeration */
   this.componentVisualDamageStatus = 0;

   /** enumeration */
   this.componentVisualSmokeColor = 0;

   /** For any component damage resulting this field shall be set to the fire event ID from that PDU. */
   this.fireEventID = new dis.EventIdentifier(); 

   /** padding */
   this.padding2 = 0;

  dis.DirectedEnergyDamage.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.padding = inputStream.readUShort();
       this.damageLocation.initFromBinary(inputStream);
       this.damageDiameter = inputStream.readFloat32();
       this.temperature = inputStream.readFloat32();
       this.componentIdentification = inputStream.readUByte();
       this.componentDamageStatus = inputStream.readUByte();
       this.componentVisualDamageStatus = inputStream.readUByte();
       this.componentVisualSmokeColor = inputStream.readUByte();
       this.fireEventID.initFromBinary(inputStream);
       this.padding2 = inputStream.readUShort();
  };

  dis.DirectedEnergyDamage.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUShort(this.padding);
       this.damageLocation.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.damageDiameter);
       outputStream.writeFloat32(this.temperature);
       outputStream.writeUByte(this.componentIdentification);
       outputStream.writeUByte(this.componentDamageStatus);
       outputStream.writeUByte(this.componentVisualDamageStatus);
       outputStream.writeUByte(this.componentVisualSmokeColor);
       this.fireEventID.encodeToBinary(outputStream);
       outputStream.writeUShort(this.padding2);
  };
}; // end of class

 // node.js module support
exports.DirectedEnergyDamage = dis.DirectedEnergyDamage;

// End of DirectedEnergyDamage class


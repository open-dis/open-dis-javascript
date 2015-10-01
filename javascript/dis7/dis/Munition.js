/**
 * An entity's munition (e.g., bomb, missile) information shall be represented by one or more Munition records. For each type or location of munition, this record shall specify the type, location, quantity and status of munitions that an entity contains. Section 6.2.60 
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


dis.Munition = function()
{
   /**  This field shall identify the entity type of the munition. See section 6.2.30. */
   this.munitionType = new dis.EntityType(); 

   /** the station or launcher to which the munition is assigned. See Annex I */
   this.station = 0;

   /** the quantity remaining of this munition. */
   this.quantity = 0;

   /**  the status of the munition. It shall be represented by an 8-bit enumeration.  */
   this.munitionStatus = 0;

   /** padding  */
   this.padding = 0;

  dis.Munition.prototype.initFromBinary = function(inputStream)
  {
       this.munitionType.initFromBinary(inputStream);
       this.station = inputStream.readUInt();
       this.quantity = inputStream.readUShort();
       this.munitionStatus = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.Munition.prototype.encodeToBinary = function(outputStream)
  {
       this.munitionType.encodeToBinary(outputStream);
       outputStream.writeUInt(this.station);
       outputStream.writeUShort(this.quantity);
       outputStream.writeUByte(this.munitionStatus);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.Munition = dis.Munition;

// End of Munition class


/**
 * indicate weapons (munitions) previously communicated via the Munition record. Section 6.2.61 
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


dis.MunitionReload = function()
{
   /**  This field shall identify the entity type of the munition. See section 6.2.30. */
   this.munitionType = new dis.EntityType(); 

   /** the station or launcher to which the munition is assigned. See Annex I */
   this.station = 0;

   /** the standard quantity of this munition type normally loaded at this station/launcher if a station/launcher is specified. */
   this.standardQuantity = 0;

   /** the maximum quantity of this munition type that this station/launcher is capable of holding when a station/launcher is specified  */
   this.maximumQuantity = 0;

   /** numer of seconds of sim time required to reload the std qty */
   this.standardQuantityReloadTime = 0;

   /** the number of seconds of sim time required to reload the max possible quantity */
   this.maximumQuantityReloadTime = 0;

  dis.MunitionReload.prototype.initFromBinary = function(inputStream)
  {
       this.munitionType.initFromBinary(inputStream);
       this.station = inputStream.readUInt();
       this.standardQuantity = inputStream.readUShort();
       this.maximumQuantity = inputStream.readUShort();
       this.standardQuantityReloadTime = inputStream.readUInt();
       this.maximumQuantityReloadTime = inputStream.readUInt();
  };

  dis.MunitionReload.prototype.encodeToBinary = function(outputStream)
  {
       this.munitionType.encodeToBinary(outputStream);
       outputStream.writeUInt(this.station);
       outputStream.writeUShort(this.standardQuantity);
       outputStream.writeUShort(this.maximumQuantity);
       outputStream.writeUInt(this.standardQuantityReloadTime);
       outputStream.writeUInt(this.maximumQuantityReloadTime);
  };
}; // end of class

 // node.js module support
exports.MunitionReload = dis.MunitionReload;

// End of MunitionReload class


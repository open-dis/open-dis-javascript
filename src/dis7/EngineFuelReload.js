/**
 * For each type or location of engine fuell, this record specifies the type, location, fuel measurement units, and reload quantity and maximum quantity. Section 6.2.25.
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


dis.EngineFuelReload = function()
{
   /** standard quantity of fuel loaded */
   this.standardQuantity = 0;

   /** maximum quantity of fuel loaded */
   this.maximumQuantity = 0;

   /** seconds normally required to to reload standard qty */
   this.standardQuantityReloadTime = 0;

   /** seconds normally required to to reload maximum qty */
   this.maximumQuantityReloadTime = 0;

   /** Units of measure */
   this.fuelMeasurmentUnits = 0;

   /** fuel  location as related to the entity */
   this.fuelLocation = 0;

   /** padding */
   this.padding = 0;

  dis.EngineFuelReload.prototype.initFromBinary = function(inputStream)
  {
       this.standardQuantity = inputStream.readUInt();
       this.maximumQuantity = inputStream.readUInt();
       this.standardQuantityReloadTime = inputStream.readUInt();
       this.maximumQuantityReloadTime = inputStream.readUInt();
       this.fuelMeasurmentUnits = inputStream.readUByte();
       this.fuelLocation = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.EngineFuelReload.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.standardQuantity);
       outputStream.writeUInt(this.maximumQuantity);
       outputStream.writeUInt(this.standardQuantityReloadTime);
       outputStream.writeUInt(this.maximumQuantityReloadTime);
       outputStream.writeUByte(this.fuelMeasurmentUnits);
       outputStream.writeUByte(this.fuelLocation);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.EngineFuelReload = dis.EngineFuelReload;

// End of EngineFuelReload class


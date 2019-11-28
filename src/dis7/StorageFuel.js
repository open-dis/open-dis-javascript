/**
 * Information about an entity's engine fuel. Section 6.2.84.
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


dis.StorageFuel = function()
{
   /** Fuel quantity, units specified by next field */
   this.fuelQuantity = 0;

   /** Units in which the fuel is measured */
   this.fuelMeasurementUnits = 0;

   /** Type of fuel */
   this.fuelType = 0;

   /** Location of fuel as related to entity. See section 14 of EBV document */
   this.fuelLocation = 0;

   /** padding */
   this.padding = 0;

  dis.StorageFuel.prototype.initFromBinary = function(inputStream)
  {
       this.fuelQuantity = inputStream.readUInt();
       this.fuelMeasurementUnits = inputStream.readUByte();
       this.fuelType = inputStream.readUByte();
       this.fuelLocation = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.StorageFuel.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.fuelQuantity);
       outputStream.writeUByte(this.fuelMeasurementUnits);
       outputStream.writeUByte(this.fuelType);
       outputStream.writeUByte(this.fuelLocation);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.StorageFuel = dis.StorageFuel;

// End of StorageFuel class


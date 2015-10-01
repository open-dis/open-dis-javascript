/**
 * For each type or location of Storage Fuel, this record shall specify the type, location, fuel measure- ment units, reload quantity and maximum quantity for storage fuel either for the whole entity or a specific storage fuel location (tank). Section 6.2.85.
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


dis.StorageFuelReload = function()
{
   /**  the standard quantity of this fuel type normally loaded at this station/launcher if a station/launcher is specified. If the Station/Launcher field is set to zero, then this is the total quantity of this fuel type that would be present in a standard reload of all appli- cable stations/launchers associated with this entity. */
   this.standardQuantity = 0;

   /** the maximum quantity of this fuel type that this sta- tion/launcher is capable of holding when a station/launcher is specified. This would be the value used when a maximum reload was desired to be set for this station/launcher. If the Station/launcher field is set to zero, then this is the maximum quantity of this fuel type that would be present on this entity at all stations/launchers that can accept this fuel type. */
   this.maximumQuantity = 0;

   /** the seconds normally required to reload the standard quantity of this fuel type at this specific station/launcher. When the Station/Launcher field is set to zero, this shall be the time it takes to perform a standard quantity reload of this fuel type at all applicable stations/launchers for this entity. */
   this.standardQuantityReloadTime = 0;

   /** the seconds normally required to reload the maximum possible quantity of this fuel type at this station/launcher. When the Station/Launcher field is set to zero, this shall be the time it takes to perform a maximum quantity load/reload of this fuel type at all applicable stations/launchers for this entity. */
   this.maximumQuantityReloadTime = 0;

   /** the fuel measurement units. Enumeration */
   this.fuelMeasurementUnits = 0;

   /** Fuel type. Enumeration */
   this.fuelType = 0;

   /** Location of fuel as related to entity. See section 14 of EBV document */
   this.fuelLocation = 0;

   /** padding */
   this.padding = 0;

  dis.StorageFuelReload.prototype.initFromBinary = function(inputStream)
  {
       this.standardQuantity = inputStream.readUInt();
       this.maximumQuantity = inputStream.readUInt();
       this.standardQuantityReloadTime = inputStream.readUByte();
       this.maximumQuantityReloadTime = inputStream.readUByte();
       this.fuelMeasurementUnits = inputStream.readUByte();
       this.fuelType = inputStream.readUByte();
       this.fuelLocation = inputStream.readUByte();
       this.padding = inputStream.readUByte();
  };

  dis.StorageFuelReload.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.standardQuantity);
       outputStream.writeUInt(this.maximumQuantity);
       outputStream.writeUByte(this.standardQuantityReloadTime);
       outputStream.writeUByte(this.maximumQuantityReloadTime);
       outputStream.writeUByte(this.fuelMeasurementUnits);
       outputStream.writeUByte(this.fuelType);
       outputStream.writeUByte(this.fuelLocation);
       outputStream.writeUByte(this.padding);
  };
}; // end of class

 // node.js module support
exports.StorageFuelReload = dis.StorageFuelReload;

// End of StorageFuelReload class


/**
 * An entity's expendable (chaff, flares, etc) information. Section 6.2.37
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


dis.ExpendableReload = function()
{
   /** Type of expendable */
   this.expendable = new dis.EntityType(); 

   this.station = 0;

   this.standardQuantity = 0;

   this.maximumQuantity = 0;

   this.standardQuantityReloadTime = 0;

   this.maximumQuantityReloadTime = 0;

  dis.ExpendableReload.prototype.initFromBinary = function(inputStream)
  {
       this.expendable.initFromBinary(inputStream);
       this.station = inputStream.readUInt();
       this.standardQuantity = inputStream.readUShort();
       this.maximumQuantity = inputStream.readUShort();
       this.standardQuantityReloadTime = inputStream.readUInt();
       this.maximumQuantityReloadTime = inputStream.readUInt();
  };

  dis.ExpendableReload.prototype.encodeToBinary = function(outputStream)
  {
       this.expendable.encodeToBinary(outputStream);
       outputStream.writeUInt(this.station);
       outputStream.writeUShort(this.standardQuantity);
       outputStream.writeUShort(this.maximumQuantity);
       outputStream.writeUInt(this.standardQuantityReloadTime);
       outputStream.writeUInt(this.maximumQuantityReloadTime);
  };
}; // end of class

 // node.js module support
exports.ExpendableReload = dis.ExpendableReload;

// End of ExpendableReload class


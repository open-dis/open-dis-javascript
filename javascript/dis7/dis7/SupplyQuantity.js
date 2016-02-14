/**
 *  A supply, and the amount of that supply. Section 6.2.86
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.SupplyQuantity = function()
{
   /** Type of supply */
   this.supplyType = new dis7.EntityType(); 

   /** the number of units of a supply type.  */
   this.quantity = 0;

  dis7.SupplyQuantity.prototype.initFromBinary = function(inputStream)
  {
       this.supplyType.initFromBinary(inputStream);
       this.quantity = inputStream.readFloat32();
  };

  dis7.SupplyQuantity.prototype.encodeToBinary = function(outputStream)
  {
       this.supplyType.encodeToBinary(outputStream);
       outputStream.writeFloat32(this.quantity);
  };
}; // end of class

 // node.js module support
exports.SupplyQuantity = dis7.SupplyQuantity;

// End of SupplyQuantity class


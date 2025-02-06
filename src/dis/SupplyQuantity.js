/**
 * Section 5.2.30. A supply, and the amount of that supply. Similar to an entity kind but with the addition of a quantity.
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis === "undefined")
 var dis = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


/**
 * @constructor
 * @memberof dis
 */
dis.SupplyQuantity = function()
{
   /**
    * Type of supply
    * @type {EntityType}
    * @instance
    */
   this.supplyType = new dis.EntityType(); 

   /** 
    * quantity to be supplied 
    * @type {number}
    * @instance
    */
   this.quantity = 0;

  /**
   * @param {InputStream} inputStream
   */
  dis.SupplyQuantity.prototype.initFromBinary = function(inputStream)
  {
       this.supplyType.initFromBinary(inputStream);
       this.quantity = inputStream.readUByte();
  };

  /**
	 * @param {OutputStream} outputStream 
	 */
  dis.SupplyQuantity.prototype.encodeToBinary = function(outputStream)
  {
       this.supplyType.encodeToBinary(outputStream);
       outputStream.writeUByte(this.quantity);
  };
}; // end of class

 // node.js module support
exports.SupplyQuantity = dis.SupplyQuantity;

// End of SupplyQuantity class


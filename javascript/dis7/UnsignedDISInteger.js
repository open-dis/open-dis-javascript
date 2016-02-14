/**
 * container class not in specification
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof null === "undefined")
 null = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


null.UnsignedDISInteger = function()
{
   /** unsigned integer */
   this.val = 0;

  null.UnsignedDISInteger.prototype.initFromBinary = function(inputStream)
  {
       this.val = inputStream.readUInt();
  };

  null.UnsignedDISInteger.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.val);
  };
}; // end of class

 // node.js module support
exports.UnsignedDISInteger = null.UnsignedDISInteger;

// End of UnsignedDISInteger class


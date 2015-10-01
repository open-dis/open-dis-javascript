/**
 * container class not in specification
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


dis.UnsignedDISInteger = function()
{
   /** unsigned integer */
   this.val = 0;

  dis.UnsignedDISInteger.prototype.initFromBinary = function(inputStream)
  {
       this.val = inputStream.readUInt();
  };

  dis.UnsignedDISInteger.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.val);
  };
}; // end of class

 // node.js module support
exports.UnsignedDISInteger = dis.UnsignedDISInteger;

// End of UnsignedDISInteger class


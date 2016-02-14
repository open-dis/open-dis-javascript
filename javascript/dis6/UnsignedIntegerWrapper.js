/**
 * Wrapper for an unsigned 32 bit integer
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


null.UnsignedIntegerWrapper = function()
{
   /** name can't be too accurate or the generated source code will have reserved word problems */
   this.wrapper = 0;

  null.UnsignedIntegerWrapper.prototype.initFromBinary = function(inputStream)
  {
       this.wrapper = inputStream.readUInt();
  };

  null.UnsignedIntegerWrapper.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.wrapper);
  };
}; // end of class

 // node.js module support
exports.UnsignedIntegerWrapper = null.UnsignedIntegerWrapper;

// End of UnsignedIntegerWrapper class


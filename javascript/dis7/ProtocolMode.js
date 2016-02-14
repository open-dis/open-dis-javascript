/**
 * Bit field used to identify minefield data. bits 14-15 are a 2-bit enum, other bits unused. Section 6.2.69
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


null.ProtocolMode = function()
{
   /** Bitfields, 14-15 contain an enum */
   this.protocolMode = 0;

  null.ProtocolMode.prototype.initFromBinary = function(inputStream)
  {
       this.protocolMode = inputStream.readUShort();
  };

  null.ProtocolMode.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.protocolMode);
  };
}; // end of class

 // node.js module support
exports.ProtocolMode = null.ProtocolMode;

// End of ProtocolMode class


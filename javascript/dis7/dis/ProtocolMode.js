/**
 * Bit field used to identify minefield data. bits 14-15 are a 2-bit enum, other bits unused. Section 6.2.69
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


dis.ProtocolMode = function()
{
   /** Bitfields, 14-15 contain an enum */
   this.protocolMode = 0;

  dis.ProtocolMode.prototype.initFromBinary = function(inputStream)
  {
       this.protocolMode = inputStream.readUShort();
  };

  dis.ProtocolMode.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.protocolMode);
  };
}; // end of class

 // node.js module support
exports.ProtocolMode = dis.ProtocolMode;

// End of ProtocolMode class


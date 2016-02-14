/**
 * PDU Status. These are a series of bit fields. Represented here as just a byte. Section 6.2.67
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


null.PduStatus = function()
{
   /** Bit fields. The semantics of the bit fields depend on the PDU type */
   this.pduStatus = 0;

  null.PduStatus.prototype.initFromBinary = function(inputStream)
  {
       this.pduStatus = inputStream.readUByte();
  };

  null.PduStatus.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.pduStatus);
  };
}; // end of class

 // node.js module support
exports.PduStatus = null.PduStatus;

// End of PduStatus class


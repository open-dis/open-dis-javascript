/**
 * identify which of the optional data fields are contained in the Minefield Data PDU or requested in the Minefield Query PDU. This is a 32-bit record. For each field, true denotes that the data is requested or present and false denotes that the data is neither requested nor present. Section 6.2.16
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


dis.DataFilterRecord = function()
{
   /** Bitflags field */
   this.bitFlags = 0;

  dis.DataFilterRecord.prototype.initFromBinary = function(inputStream)
  {
       this.bitFlags = inputStream.readUInt();
  };

  dis.DataFilterRecord.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.bitFlags);
  };
}; // end of class

 // node.js module support
exports.DataFilterRecord = dis.DataFilterRecord;

// End of DataFilterRecord class


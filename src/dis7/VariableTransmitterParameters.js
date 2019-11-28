/**
 * Relates to radios. NOT COMPLETE. Section 6.2.94
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


dis.VariableTransmitterParameters = function()
{
   /** Type of VTP. Enumeration from EBV */
   this.recordType = 0;

   /** Length, in bytes */
   this.recordLength = 4;

  dis.VariableTransmitterParameters.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUInt();
  };

  dis.VariableTransmitterParameters.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUInt(this.recordLength);
  };
}; // end of class

 // node.js module support
exports.VariableTransmitterParameters = dis.VariableTransmitterParameters;

// End of VariableTransmitterParameters class


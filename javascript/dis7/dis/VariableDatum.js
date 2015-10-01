/**
 * the variable datum type, the datum length, and the value for that variable datum type. NOT COMPLETE. Section 6.2.93
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


dis.VariableDatum = function()
{
   /** Type of variable datum to be transmitted. 32 bit enumeration defined in EBV */
   this.variableDatumID = 0;

   /** Length, IN BITS, of the variable datum. */
   this.variableDatumLength = 0;

   /** Variable datum. This can be any number of bits long, depending on the datum. */
   this.variableDatumBits = 0;

  dis.VariableDatum.prototype.initFromBinary = function(inputStream)
  {
       this.variableDatumID = inputStream.readUInt();
       this.variableDatumLength = inputStream.readUInt();
       this.variableDatumBits = inputStream.readUInt();
  };

  dis.VariableDatum.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.variableDatumID);
       outputStream.writeUInt(this.variableDatumLength);
       outputStream.writeUInt(this.variableDatumBits);
  };
}; // end of class

 // node.js module support
exports.VariableDatum = dis.VariableDatum;

// End of VariableDatum class


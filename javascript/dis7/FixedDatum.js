/**
 * Fixed Datum Record. Section 6.2.38
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


dis.FixedDatum = function()
{
   /** ID of the fixed datum, an enumeration */
   this.fixedDatumID = 0;

   /** Value for the fixed datum */
   this.fixedDatumValue = 0;

  dis.FixedDatum.prototype.initFromBinary = function(inputStream)
  {
       this.fixedDatumID = inputStream.readUInt();
       this.fixedDatumValue = inputStream.readUInt();
  };

  dis.FixedDatum.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.fixedDatumID);
       outputStream.writeUInt(this.fixedDatumValue);
  };
}; // end of class

 // node.js module support
exports.FixedDatum = dis.FixedDatum;

// End of FixedDatum class


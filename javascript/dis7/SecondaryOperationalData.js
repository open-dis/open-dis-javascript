/**
 * Additional operational data for an IFF emitting system and the number of IFF Fundamental Parameter Data records Section 6.2.76.
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


null.SecondaryOperationalData = function()
{
   /** additional operational characteristics of the IFF emitting system. Each 8-bit field will vary depending on the system type. */
   this.operationalData1 = 0;

   /** additional operational characteristics of the IFF emitting system. Each 8-bit field will vary depending on the system type. */
   this.operationalData2 = 0;

   /** the number of IFF Fundamental Parameter Data records that follow */
   this.numberOfIFFFundamentalParameterRecords = 0;

  null.SecondaryOperationalData.prototype.initFromBinary = function(inputStream)
  {
       this.operationalData1 = inputStream.readUByte();
       this.operationalData2 = inputStream.readUByte();
       this.numberOfIFFFundamentalParameterRecords = inputStream.readUShort();
  };

  null.SecondaryOperationalData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.operationalData1);
       outputStream.writeUByte(this.operationalData2);
       outputStream.writeUShort(this.numberOfIFFFundamentalParameterRecords);
  };
}; // end of class

 // node.js module support
exports.SecondaryOperationalData = null.SecondaryOperationalData;

// End of SecondaryOperationalData class


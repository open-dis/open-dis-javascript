/**
 * Basic operational data for IFF. Section 6.2.40.
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


dis.FundamentalOperationalData = function()
{
   /** system status */
   this.systemStatus = 0;

   /** data field 1 */
   this.dataField1 = 0;

   /** eight boolean fields */
   this.informationLayers = 0;

   /** enumeration */
   this.dataField2 = 0;

   /** parameter, enumeration */
   this.parameter1 = 0;

   /** parameter, enumeration */
   this.parameter2 = 0;

   /** parameter, enumeration */
   this.parameter3 = 0;

   /** parameter, enumeration */
   this.parameter4 = 0;

   /** parameter, enumeration */
   this.parameter5 = 0;

   /** parameter, enumeration */
   this.parameter6 = 0;

  dis.FundamentalOperationalData.prototype.initFromBinary = function(inputStream)
  {
       this.systemStatus = inputStream.readUByte();
       this.dataField1 = inputStream.readUByte();
       this.informationLayers = inputStream.readUByte();
       this.dataField2 = inputStream.readUByte();
       this.parameter1 = inputStream.readUShort();
       this.parameter2 = inputStream.readUShort();
       this.parameter3 = inputStream.readUShort();
       this.parameter4 = inputStream.readUShort();
       this.parameter5 = inputStream.readUShort();
       this.parameter6 = inputStream.readUShort();
  };

  dis.FundamentalOperationalData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.systemStatus);
       outputStream.writeUByte(this.dataField1);
       outputStream.writeUByte(this.informationLayers);
       outputStream.writeUByte(this.dataField2);
       outputStream.writeUShort(this.parameter1);
       outputStream.writeUShort(this.parameter2);
       outputStream.writeUShort(this.parameter3);
       outputStream.writeUShort(this.parameter4);
       outputStream.writeUShort(this.parameter5);
       outputStream.writeUShort(this.parameter6);
  };
}; // end of class

 // node.js module support
exports.FundamentalOperationalData = dis.FundamentalOperationalData;

// End of FundamentalOperationalData class


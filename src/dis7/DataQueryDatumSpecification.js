/**
 * List of fixed and variable datum ID records. Section 6.2.17 
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


dis.DataQueryDatumSpecification = function()
{
   /** Number of fixed datum IDs */
   this.numberOfFixedDatums = 0;

   /** Number of variable datum IDs */
   this.numberOfVariableDatums = 0;

   /** variable length list fixed datum IDs */
   this.fixedDatumIDList = new dis.UnsignedDISInteger(); 

   /** variable length list variable datum IDs */
   this.variableDatumIDList = new dis.UnsignedDISInteger(); 

  dis.DataQueryDatumSpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfFixedDatums = inputStream.readUInt();
       this.numberOfVariableDatums = inputStream.readUInt();
       this.fixedDatumIDList.initFromBinary(inputStream);
       this.variableDatumIDList.initFromBinary(inputStream);
  };

  dis.DataQueryDatumSpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.numberOfFixedDatums);
       outputStream.writeUInt(this.numberOfVariableDatums);
       this.fixedDatumIDList.encodeToBinary(outputStream);
       this.variableDatumIDList.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.DataQueryDatumSpecification = dis.DataQueryDatumSpecification;

// End of DataQueryDatumSpecification class


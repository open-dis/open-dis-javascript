/**
 * List of fixed and variable datum records. Section 6.2.18 
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof dis7 === "undefined")
 dis7 = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


dis7.DatumSpecification = function()
{
   /** Number of fixed datums */
   this.numberOfFixedDatums = 0;

   /** Number of variable datums */
   this.numberOfVariableDatums = 0;

   /** variable length list fixed datums */
   this.fixedDatumList = new dis7.FixedDatum(); 

   /** variable length list variable datums. See 6.2.93 */
   this.variableDatumList = new dis7.VariableDatum(); 

  dis7.DatumSpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfFixedDatums = inputStream.readUInt();
       this.numberOfVariableDatums = inputStream.readUInt();
       this.fixedDatumList.initFromBinary(inputStream);
       this.variableDatumList.initFromBinary(inputStream);
  };

  dis7.DatumSpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.numberOfFixedDatums);
       outputStream.writeUInt(this.numberOfVariableDatums);
       this.fixedDatumList.encodeToBinary(outputStream);
       this.variableDatumList.encodeToBinary(outputStream);
  };
}; // end of class

 // node.js module support
exports.DatumSpecification = dis7.DatumSpecification;

// End of DatumSpecification class


/**
 * List of fixed and variable datum records. Section 6.2.18 
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


dis.DatumSpecification = function()
{
   /** Number of fixed datums */
   this.numberOfFixedDatums = 0;

   /** Number of variable datums */
   this.numberOfVariableDatums = 0;

   /** variable length list fixed datums */
    this.fixedDatumIDList = new Array();
 
   /** variable length list variable datums */
    this.variableDatumIDList = new Array();
 
  dis.DatumSpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfFixedDatums = inputStream.readUInt();
       this.numberOfVariableDatums = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfFixedDatums; idx++)
       {
           var anX = new dis.FixedDatum();
           anX.initFromBinary(inputStream);
           this.fixedDatumIDList.push(anX);
       }

       for(var idx = 0; idx < this.numberOfVariableDatums; idx++)
       {
           var anX = new dis.VariableDatum();
           anX.initFromBinary(inputStream);
           this.variableDatumIDList.push(anX);
       }

  };

  dis.DatumSpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.numberOfFixedDatums);
       outputStream.writeUInt(this.numberOfVariableDatums);
       for(var idx = 0; idx < this.fixedDatumIDList.length; idx++)
       {
           fixedDatumIDList[idx].encodeToBinary(outputStream);
       }

       for(var idx = 0; idx < this.variableDatumIDList.length; idx++)
       {
           variableDatumIDList[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.DatumSpecification = dis.DatumSpecification;

// End of DatumSpecification class


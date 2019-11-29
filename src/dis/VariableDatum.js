/**
 * Section 5.2.32. Variable Datum Record
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
   /** ID of the variable datum */
   this.variableDatumID = 0;

   /** length of the variable datums, in bits. Note that this is not programmatically tied to the size of the variableData. The variable data field may be 64 bits long but only 16 bits of it could actually be used. */
   this.variableDatumLength = 0;

   /** data can be any length, but must increase in 8 byte quanta. This requires some postprocessing patches. Note that setting the data allocates a new internal array to account for the possibly increased size. The default initial size is 64 bits. */
    this.variableData = new Array();
 
  dis.VariableDatum.prototype.initFromBinary = function(inputStream)
  {
       this.variableDatumID = inputStream.readUInt();
       this.variableDatumLength = inputStream.readUInt();
       for(var idx = 0; idx < this.variableDatumLength; idx++)
       {
           var anX = new dis.Chunk(1);
           anX.initFromBinary(inputStream);
           this.variableData.push(anX);
       }

  };

  dis.VariableDatum.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.variableDatumID);
       outputStream.writeUInt(this.variableDatumLength);
       for(var idx = 0; idx < this.variableData.length; idx++)
       {
        this.variableData[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.VariableDatum = dis.VariableDatum;

// End of VariableDatum class


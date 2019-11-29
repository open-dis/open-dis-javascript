/**
 * 5.2.44: Grid data record, representation 1
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


dis.GridAxisRecordRepresentation1 = function()
{
   /** type of environmental sample */
   this.sampleType = 0;

   /** value that describes data representation */
   this.dataRepresentation = 0;

   /** constant scale factor */
   this.fieldScale = 0;

   /** constant offset used to scale grid data */
   this.fieldOffset = 0;

   /** Number of data values */
   this.numberOfValues = 0;

   /** variable length list of data parameters ^^^this is wrong--need padding as well */
    this.dataValues = new Array();
 
  dis.GridAxisRecordRepresentation1.prototype.initFromBinary = function(inputStream)
  {
       this.sampleType = inputStream.readUShort();
       this.dataRepresentation = inputStream.readUShort();
       this.fieldScale = inputStream.readFloat32();
       this.fieldOffset = inputStream.readFloat32();
       this.numberOfValues = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfValues; idx++)
       {
           var anX = new dis.Chunk(2);
           anX.initFromBinary(inputStream);
           this.dataValues.push(anX);
       }

  };

  dis.GridAxisRecordRepresentation1.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.sampleType);
       outputStream.writeUShort(this.dataRepresentation);
       outputStream.writeFloat32(this.fieldScale);
       outputStream.writeFloat32(this.fieldOffset);
       outputStream.writeUShort(this.numberOfValues);
       for(var idx = 0; idx < this.dataValues.length; idx++)
       {
        this.dataValues[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.GridAxisRecordRepresentation1 = dis.GridAxisRecordRepresentation1;

// End of GridAxisRecordRepresentation1 class


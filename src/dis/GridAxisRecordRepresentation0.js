/**
 * 5.2.44: Grid data record, representation 0
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


dis.GridAxisRecordRepresentation0 = function()
{
   /** type of environmental sample */
   this.sampleType = 0;

   /** value that describes data representation */
   this.dataRepresentation = 0;

   /** number of bytes of environmental state data */
   this.numberOfBytes = 0;

   /** variable length variablelist of data parameters ^^^this is wrong--need padding as well */
    this.dataValues = new Array();
 
  dis.GridAxisRecordRepresentation0.prototype.initFromBinary = function(inputStream)
  {
       this.sampleType = inputStream.readUShort();
       this.dataRepresentation = inputStream.readUShort();
       this.numberOfBytes = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfBytes; idx++)
       {
           var anX = new dis.Chunk(1);
           anX.initFromBinary(inputStream);
           this.dataValues.push(anX);
       }

  };

  dis.GridAxisRecordRepresentation0.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.sampleType);
       outputStream.writeUShort(this.dataRepresentation);
       outputStream.writeUShort(this.numberOfBytes);
       for(var idx = 0; idx < this.dataValues.length; idx++)
       {
        this.dataValues[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.GridAxisRecordRepresentation0 = dis.GridAxisRecordRepresentation0;

// End of GridAxisRecordRepresentation0 class


/**
 * repeating element if IFF Data specification record
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


dis.IFFData = function()
{
   /** enumeration for type of record */
   this.recordType = 0;

   /** length of record. Should be padded to 32 bit boundary. */
   this.recordLength = 0;

   /** IFF data. */
    this.iffData = new Array();
 
  dis.IFFData.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       for(var idx = 0; idx < this.recordLength; idx++)
       {
           var anX = new dis.Chunk(1);
           anX.initFromBinary(inputStream);
           this.iffData.push(anX);
       }

  };

  dis.IFFData.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordType);
       outputStream.writeUShort(this.recordLength);
       for(var idx = 0; idx < this.iffData.length; idx++)
       {
        this.iffData[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.IFFData = dis.IFFData;

// End of IFFData class


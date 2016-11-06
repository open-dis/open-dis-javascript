/**
 * The identification of the records being queried 6.2.72
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


dis7.RecordQuerySpecification = function()
{
   this.numberOfRecords = 0;

   /** variable length list of 32 bit records */
    this.records = new Array();
 
  dis7.RecordQuerySpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfRecords = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfRecords; idx++)
       {
           var anX = new dis7.FourByteChunk();
           anX.initFromBinary(inputStream);
           this.records.push(anX);
       }

  };

  dis7.RecordQuerySpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.numberOfRecords);
       for(var idx = 0; idx < this.records.length; idx++)
       {
           records[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.RecordQuerySpecification = dis7.RecordQuerySpecification;

// End of RecordQuerySpecification class


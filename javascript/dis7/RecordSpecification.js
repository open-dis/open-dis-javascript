/**
 * This record shall specify the number of record sets contained in the Record Specification record and the record details. Section 6.2.73.
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


dis.RecordSpecification = function()
{
   /** The number of record sets */
   this.numberOfRecordSets = 0;

   /** variable length list record specifications. */
    this.recordSets = new Array();
 
  dis.RecordSpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfRecordSets = inputStream.readUInt();
       for(var idx = 0; idx < this.numberOfRecordSets; idx++)
       {
           var anX = new dis.RecordSpecificationElement();
           anX.initFromBinary(inputStream);
           this.recordSets.push(anX);
       }

  };

  dis.RecordSpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.numberOfRecordSets);
       for(var idx = 0; idx < this.recordSets.length; idx++)
       {
           recordSets[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.RecordSpecification = dis.RecordSpecification;

// End of RecordSpecification class


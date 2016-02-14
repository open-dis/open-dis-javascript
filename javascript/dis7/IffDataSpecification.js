/**
 * Requires hand coding to be useful. Section 6.2.43
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof null === "undefined")
 null = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


null.IffDataSpecification = function()
{
   /** Number of iff records */
   this.numberOfIffDataRecords = 0;

   /** IFF data records */
    this.iffDataRecords = new Array();
 
  null.IffDataSpecification.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfIffDataRecords = inputStream.readUShort();
       for(var idx = 0; idx < this.numberOfIffDataRecords; idx++)
       {
           var anX = new null.IFFData();
           anX.initFromBinary(inputStream);
           this.iffDataRecords.push(anX);
       }

  };

  null.IffDataSpecification.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.numberOfIffDataRecords);
       for(var idx = 0; idx < this.iffDataRecords.length; idx++)
       {
           iffDataRecords[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.IffDataSpecification = null.IffDataSpecification;

// End of IffDataSpecification class


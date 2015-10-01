/**
 * 5.2.44: Grid data record, a common abstract superclass for several subtypes 
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


dis.GridAxisRecord = function()
{
   /** type of environmental sample */
   this.sampleType = 0;

   /** value that describes data representation */
   this.dataRepresentation = 0;

  dis.GridAxisRecord.prototype.initFromBinary = function(inputStream)
  {
       this.sampleType = inputStream.readUShort();
       this.dataRepresentation = inputStream.readUShort();
  };

  dis.GridAxisRecord.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.sampleType);
       outputStream.writeUShort(this.dataRepresentation);
  };
}; // end of class

 // node.js module support
exports.GridAxisRecord = dis.GridAxisRecord;

// End of GridAxisRecord class


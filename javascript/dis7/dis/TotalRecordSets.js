/**
 * Total number of record sets contained in a logical set of one or more PDUs. Used to transfer ownership, etc Section 6.2.88
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


dis.TotalRecordSets = function()
{
   /** Total number of record sets */
   this.totalRecordSets = 0;

   /** padding */
   this.padding = 0;

  dis.TotalRecordSets.prototype.initFromBinary = function(inputStream)
  {
       this.totalRecordSets = inputStream.readUShort();
       this.padding = inputStream.readUShort();
  };

  dis.TotalRecordSets.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.totalRecordSets);
       outputStream.writeUShort(this.padding);
  };
}; // end of class

 // node.js module support
exports.TotalRecordSets = dis.TotalRecordSets;

// End of TotalRecordSets class


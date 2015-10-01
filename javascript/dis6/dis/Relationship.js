/**
 * 5.2.56. Purpose for joinging two entities
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


dis.Relationship = function()
{
   /** Nature of join */
   this.nature = 0;

   /** position of join */
   this.position = 0;

  dis.Relationship.prototype.initFromBinary = function(inputStream)
  {
       this.nature = inputStream.readUShort();
       this.position = inputStream.readUShort();
  };

  dis.Relationship.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.nature);
       outputStream.writeUShort(this.position);
  };
}; // end of class

 // node.js module support
exports.Relationship = dis.Relationship;

// End of Relationship class


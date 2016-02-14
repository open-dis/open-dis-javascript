/**
 * The relationship of the part entity to its host entity. Section 6.2.74.
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


dis7.Relationship = function()
{
   /** the nature or purpose for joining of the part entity to the host entity and shall be represented by a 16-bit enumeration */
   this.nature = 0;

   /** the position of the part entity with respect to the host entity and shall be represented by a 16-bit enumeration */
   this.position = 0;

  dis7.Relationship.prototype.initFromBinary = function(inputStream)
  {
       this.nature = inputStream.readUShort();
       this.position = inputStream.readUShort();
  };

  dis7.Relationship.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.nature);
       outputStream.writeUShort(this.position);
  };
}; // end of class

 // node.js module support
exports.Relationship = dis7.Relationship;

// End of Relationship class


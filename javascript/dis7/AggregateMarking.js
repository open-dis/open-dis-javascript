/**
 * Specifies the character set used in the first byte, followed by up to 31 characters of text data. Section 6.2.4. 
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


dis.AggregateMarking = function()
{
   /** The character set */
   this.characterSet = 0;

   /** The characters */
   this.characters = 0;

  dis.AggregateMarking.prototype.initFromBinary = function(inputStream)
  {
       this.characterSet = inputStream.readUByte();
       this.characters = inputStream.readUByte();
  };

  dis.AggregateMarking.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUByte(this.characterSet);
       outputStream.writeUByte(this.characters);
  };
}; // end of class

 // node.js module support
exports.AggregateMarking = dis.AggregateMarking;

// End of AggregateMarking class


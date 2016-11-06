/**
 * 8 bit piece of data
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


dis7.OneByteChunk = function()
{
   /** one byte of arbitrary data */
   this.otherParameters = new Array(0);

  dis7.OneByteChunk.prototype.initFromBinary = function(inputStream)
  {
       for(var idx = 0; idx < 1; idx++)
       {
          this.otherParameters[ idx ] = inputStream.readByte();
       }
  };

  dis7.OneByteChunk.prototype.encodeToBinary = function(outputStream)
  {
       for(var idx = 0; idx < 1; idx++)
       {
          outputStream.writeByte(this.otherParameters[ idx ] );
       }
  };
}; // end of class

 // node.js module support
exports.OneByteChunk = dis7.OneByteChunk;

// End of OneByteChunk class


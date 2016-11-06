/**
 * 48 bit piece of data
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


dis.SixByteChunk = function()
{
   /** six bytes of arbitrary data */
   this.otherParameters = new Array(0, 0, 0, 0, 0, 0);

  dis.SixByteChunk.prototype.initFromBinary = function(inputStream)
  {
       for(var idx = 0; idx < 6; idx++)
       {
          this.otherParameters[ idx ] = inputStream.readByte();
       }
  };

  dis.SixByteChunk.prototype.encodeToBinary = function(outputStream)
  {
       for(var idx = 0; idx < 6; idx++)
       {
          outputStream.writeByte(this.otherParameters[ idx ] );
       }
  };
}; // end of class

 // node.js module support
exports.SixByteChunk = dis.SixByteChunk;

// End of SixByteChunk class


/**
 * A monotonically increasing number inserted into all simulation managment PDUs. This should be a hand-coded thingie, maybe a singleton. Section 6.2.75
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


dis.RequestID = function()
{
   /** monotonically increasing number */
   this.requestID = 0;

  dis.RequestID.prototype.initFromBinary = function(inputStream)
  {
       this.requestID = inputStream.readUInt();
  };

  dis.RequestID.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.requestID);
  };
}; // end of class

 // node.js module support
exports.RequestID = dis.RequestID;

// End of RequestID class


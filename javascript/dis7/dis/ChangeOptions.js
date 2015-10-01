/**
 * This is wrong and breaks serialization. See section 6.2.13 aka B.2.41
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


dis.ChangeOptions = function()
{
  dis.ChangeOptions.prototype.initFromBinary = function(inputStream)
  {
  };

  dis.ChangeOptions.prototype.encodeToBinary = function(outputStream)
  {
  };
}; // end of class

 // node.js module support
exports.ChangeOptions = dis.ChangeOptions;

// End of ChangeOptions class


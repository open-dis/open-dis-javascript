/**
 * Modulation parameters associated with a specific radio system. INCOMPLETE. 6.2.58 
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


dis.ModulationParameters = function()
{
  dis.ModulationParameters.prototype.initFromBinary = function(inputStream)
  {
  };

  dis.ModulationParameters.prototype.encodeToBinary = function(outputStream)
  {
  };
}; // end of class

 // node.js module support
exports.ModulationParameters = dis.ModulationParameters;

// End of ModulationParameters class


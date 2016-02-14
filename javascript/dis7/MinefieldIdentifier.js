/**
 * The unique designation of a minefield Section 6.2.56 
 *
 * Copyright (c) 2008-2015, MOVES Institute, Naval Postgraduate School. All rights reserved.
 * This work is licensed under the BSD open source license, available at https://www.movesinstitute.org/licenses/bsd.html
 *
 * @author DMcG
 */
// On the client side, support for a  namespace.
if (typeof null === "undefined")
 null = {};


// Support for node.js style modules. Ignored if used in a client context.
// See http://howtonode.org/creating-custom-modules
if (typeof exports === "undefined")
 exports = {};


null.MinefieldIdentifier = function()
{
   /**  */
   this.simulationAddress = new null.SimulationAddress(); 

   /**  */
   this.minefieldNumber = 0;

  null.MinefieldIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.minefieldNumber = inputStream.readUShort();
  };

  null.MinefieldIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.minefieldNumber);
  };
}; // end of class

 // node.js module support
exports.MinefieldIdentifier = null.MinefieldIdentifier;

// End of MinefieldIdentifier class


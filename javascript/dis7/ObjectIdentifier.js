/**
 * The unique designation of an environmental object. Section 6.2.63
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


null.ObjectIdentifier = function()
{
   /**  Simulation Address */
   this.simulationAddress = new null.SimulationAddress(); 

   /** object number */
   this.objectNumber = 0;

  null.ObjectIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.objectNumber = inputStream.readUShort();
  };

  null.ObjectIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.objectNumber);
  };
}; // end of class

 // node.js module support
exports.ObjectIdentifier = null.ObjectIdentifier;

// End of ObjectIdentifier class


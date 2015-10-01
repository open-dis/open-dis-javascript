/**
 * The unique designation of an environmental object. Section 6.2.63
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


dis.ObjectIdentifier = function()
{
   /**  Simulation Address */
   this.simulationAddress = new dis.SimulationAddress(); 

   /** object number */
   this.objectNumber = 0;

  dis.ObjectIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.objectNumber = inputStream.readUShort();
  };

  dis.ObjectIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.objectNumber);
  };
}; // end of class

 // node.js module support
exports.ObjectIdentifier = dis.ObjectIdentifier;

// End of ObjectIdentifier class


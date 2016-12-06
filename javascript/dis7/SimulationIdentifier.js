/**
 * The unique designation of a simulation when using the 48-bit identifier format shall be specified by the Sim- ulation Identifier record. The reason that the 48-bit format is required in addition to the 32-bit simulation address format that actually identifies a specific simulation is because some 48-bit identifier fields in PDUs may contain either an Object Identifier, such as an Entity ID, or a Simulation Identifier. Section 6.2.80
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


dis.SimulationIdentifier = function()
{
   /** Simulation address  */
   this.simulationAddress = new dis.SimulationAddress(); 

   /** This field shall be set to zero as there is no reference number associated with a Simulation Identifier. */
   this.referenceNumber = 0;

  dis.SimulationIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.referenceNumber = inputStream.readUShort();
  };

  dis.SimulationIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.referenceNumber);
  };
}; // end of class

 // node.js module support
exports.SimulationIdentifier = dis.SimulationIdentifier;

// End of SimulationIdentifier class


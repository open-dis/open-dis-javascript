/**
 * The unique designation of one or more unattached radios in an event or exercise Section 6.2.91
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


dis.UnattachedIdentifier = function()
{
   /** See 6.2.79 */
   this.simulationAddress = new dis.SimulationAddress(); 

   /** Reference number */
   this.referenceNumber = 0;

  dis.UnattachedIdentifier.prototype.initFromBinary = function(inputStream)
  {
       this.simulationAddress.initFromBinary(inputStream);
       this.referenceNumber = inputStream.readUShort();
  };

  dis.UnattachedIdentifier.prototype.encodeToBinary = function(outputStream)
  {
       this.simulationAddress.encodeToBinary(outputStream);
       outputStream.writeUShort(this.referenceNumber);
  };
}; // end of class

 // node.js module support
exports.UnattachedIdentifier = dis.UnattachedIdentifier;

// End of UnattachedIdentifier class


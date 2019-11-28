/**
 * Used for XML compatability. A container that holds PDUs
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


dis.PduContainer = function()
{
   /** Number of PDUs in the container list */
   this.numberOfPdus = 0;

   /** List of PDUs */
    this.pdus = new Array();
 
  dis.PduContainer.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfPdus = inputStream.readInt();
       for(var idx = 0; idx < this.numberOfPdus; idx++)
       {
           var anX = new dis.Pdu();
           anX.initFromBinary(inputStream);
           this.pdus.push(anX);
       }

  };

  dis.PduContainer.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeInt(this.numberOfPdus);
       for(var idx = 0; idx < this.pdus.length; idx++)
       {
        this.pdus[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.PduContainer = dis.PduContainer;

// End of PduContainer class


/**
 * A container that holds PDUs
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


null.PduContainer = function()
{
   /** Number of PDUs in the container list */
   this.numberOfPdus = 0;

   /** List of PDUs */
    this.pdus = new Array();
 
  null.PduContainer.prototype.initFromBinary = function(inputStream)
  {
       this.numberOfPdus = inputStream.readInt();
       for(var idx = 0; idx < this.numberOfPdus; idx++)
       {
           var anX = new null.Pdu();
           anX.initFromBinary(inputStream);
           this.pdus.push(anX);
       }

  };

  null.PduContainer.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeInt(this.numberOfPdus);
       for(var idx = 0; idx < this.pdus.length; idx++)
       {
           pdus[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.PduContainer = null.PduContainer;

// End of PduContainer class


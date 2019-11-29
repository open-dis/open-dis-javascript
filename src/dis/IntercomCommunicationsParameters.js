/**
 * 5.2.46.  Intercom communcations parameters
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


dis.IntercomCommunicationsParameters = function()
{
   /** Type of intercom parameters record */
   this.recordType = 0;

   /** length of record-specifid field, in octets */
   this.recordLength = 0;

   /** variable length variablelist of data parameters  */
    this.parameterValues = new Array();
 
  dis.IntercomCommunicationsParameters.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUShort();
       this.recordLength = inputStream.readUShort();
       for(var idx = 0; idx < this.recordLength; idx++)
       {
           var anX = new dis.Chunk(1);
           anX.initFromBinary(inputStream);
           this.parameterValues.push(anX);
       }

  };

  dis.IntercomCommunicationsParameters.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.recordType);
       outputStream.writeUShort(this.recordLength);
       for(var idx = 0; idx < this.parameterValues.length; idx++)
       {
        this.parameterValues[idx].encodeToBinary(outputStream);
       }

  };
}; // end of class

 // node.js module support
exports.IntercomCommunicationsParameters = dis.IntercomCommunicationsParameters;

// End of IntercomCommunicationsParameters class


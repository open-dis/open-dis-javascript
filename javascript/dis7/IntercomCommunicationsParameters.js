/**
 * Intercom communcations parameters. Section 6.2.47.  This requires hand coding
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

   /** length of record */
   this.recordLength = 0;

   /** This is a placeholder. */
   this.recordSpecificField = 0;

  dis.IntercomCommunicationsParameters.prototype.initFromBinary = function(inputStream)
  {
       this.recordType = inputStream.readUShort();
       this.recordLength = inputStream.readUShort();
       this.recordSpecificField = inputStream.readUInt();
  };

  dis.IntercomCommunicationsParameters.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUShort(this.recordType);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUInt(this.recordSpecificField);
  };
}; // end of class

 // node.js module support
exports.IntercomCommunicationsParameters = dis.IntercomCommunicationsParameters;

// End of IntercomCommunicationsParameters class


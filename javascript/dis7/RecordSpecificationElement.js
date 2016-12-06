/**
 * Synthetic record, made up from section 6.2.72. This is used to acheive a repeating variable list element.
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


dis.RecordSpecificationElement = function()
{
   /** the data structure used to convey the parameter values of the record for each record. 32 bit enumeration. */
   this.recordID = 0;

   /** the serial number of the first record in the block of records */
   this.recordSetSerialNumber = 0;

   /**  the length, in bits, of the record. Note, bits, not bytes. */
   this.recordLength = 0;

   /**  the number of records included in the record set  */
   this.recordCount = 0;

   /** the concatenated records of the format specified by the Record ID field. The length of this field is the Record Length multiplied by the Record Count, in units of bits. ^^^This is wrong--variable sized data records, bit values. THis MUST be patched after generation. */
   this.recordValues = 0;

   /** Padding of 0 to 31 unused bits as required for 32-bit alignment of the Record Set field. ^^^This is wrong--variable sized padding. MUST be patched post-code generation */
   this.pad4 = 0;

  dis.RecordSpecificationElement.prototype.initFromBinary = function(inputStream)
  {
       this.recordID = inputStream.readUInt();
       this.recordSetSerialNumber = inputStream.readUInt();
       this.recordLength = inputStream.readUShort();
       this.recordCount = inputStream.readUShort();
       this.recordValues = inputStream.readUShort();
       this.pad4 = inputStream.readUByte();
  };

  dis.RecordSpecificationElement.prototype.encodeToBinary = function(outputStream)
  {
       outputStream.writeUInt(this.recordID);
       outputStream.writeUInt(this.recordSetSerialNumber);
       outputStream.writeUShort(this.recordLength);
       outputStream.writeUShort(this.recordCount);
       outputStream.writeUShort(this.recordValues);
       outputStream.writeUByte(this.pad4);
  };
}; // end of class

 // node.js module support
exports.RecordSpecificationElement = dis.RecordSpecificationElement;

// End of RecordSpecificationElement class

